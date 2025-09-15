import {Duration, Logger, Second, UniqFlag, Utf8} from "ts-xutils"
import {asyncExe, Channel, Mutex, ReceiveChannel, Semaphore, SendChannel, withTimeout, Timeout} from "ts-concurrency"
import {Response, Request, Status as ResStatus} from "./fakehttp"
import {ElseConnErr, ElseErr, StmError} from "./error"
import {Handshake, Protocol} from "./protocol"

class SyncAllRequest {
	allRequests: Map<number, Channel<[Response, StmError|null]>> = new Map()
	semaphore: Semaphore = new Semaphore(3)

	get permits(): number {
		return this.semaphore.max
	}

	set permits(max: number) {
		this.semaphore = new Semaphore(max)
	}

	constructor(permits: number = 3) {
		this.semaphore = new Semaphore(permits)
	}

	// channel 必须在 SyncAllRequest 的控制下，所以 Add 获取的只能 receive
// 要 send 就必须通过 remove 获取

	async Add(reqId: number): Promise<ReceiveChannel<[Response, StmError|null]>> {
		await this.semaphore.Acquire()
		let ch = new Channel<[Response, StmError|null]>(1)
		this.allRequests.set(reqId, ch)
		return ch
	}

	// 可以用同一个 reqid 重复调用
	Remove(reqId: number): SendChannel<[Response, StmError|null]> | null {
		let ret = this.allRequests.get(reqId) ?? null
		if (ret != null && this.semaphore.current != 0) {
			this.semaphore.Release()
		}
		this.allRequests.delete(reqId)

		return ret
	}

	async ClearAllWith(ret: [Response, StmError|null]) {
		for (let [_, ch] of this.allRequests) {
			await ch.Send(ret)
			await ch.Close()
		}
		this.allRequests.clear()
		await this.semaphore.ReleaseAll()
	}
}

/**
 *
 *    NotConnect  ---> (Connecting)  ---> Connected ---> Invalidated
 *                          |                                ^
 *                          |                                |
 *                          |________________________________|
 *
 */

interface StateBase {
	toString():string
	isEqual(other: StateBase): this is Invalidated
	isInvalidated(): boolean
}

class NotConnect implements StateBase {
	isEqual(other: StateBase): this is Invalidated {
		return other instanceof NotConnect
	}

	isInvalidated(): this is Invalidated {
		return false
	}

	toString():string {
		return "NotConnect"
	}
}

class Connected implements StateBase {
	isEqual(other: StateBase): this is Invalidated {
		return other instanceof Connected
	}

	isInvalidated(): this is Invalidated {
		return false
	}

	toString():string {
		return "Connected"
	}
}

class Invalidated implements StateBase {
	public err: StmError
	isEqual(other: StateBase): this is Invalidated {
		return other instanceof Invalidated
	}

	isInvalidated(): this is Invalidated {
		return true
	}

	toString():string {
		return "Invalidated"
	}

	constructor(err: StmError) {
		this.err = err
	}
}

type State = NotConnect|Connected|Invalidated

class ReqId {
	private static reqIdStart = 10
	private value = ReqId.reqIdStart

	get(): number {
		this.value += 1
		if (this.value < ReqId.reqIdStart || this.value > Number.MAX_SAFE_INTEGER) {
			this.value = ReqId.reqIdStart
		}

		return this.value
	}
}

export class Net {
	private handshake: Handshake = new Handshake()
	private connLocker: Mutex = new Mutex()
	private state: State = new NotConnect
	private proto: Protocol

	private reqId: ReqId = new ReqId()
	private allRequests: SyncAllRequest = new SyncAllRequest()

	private flag = UniqFlag()

	get connectID(): string {
		return this.handshake.ConnectId
	}

	get isInvalid(): boolean {
		return this.state.isInvalidated()
	}

	constructor(private logger: Logger, protoCreator: ()=>Protocol
							, private onPeerClosed: (err: StmError)=>Promise<void>
							, private onPush: (data: ArrayBuffer)=>Promise<void>) {
		logger.w.debug(logger.f.Debug(`Net[${this.flag}].new`, `flag=${this.flag}`))

		this.proto = protoCreator()
		this.proto.logger = logger
		this.proto.onError = async (err: StmError)=>{await this.onError(err)}
		this.proto.onMessage = async (data:ArrayBuffer)=>{await this.onMessage(data)}
	}

	private async closeAndOldState(err: StmError): Promise<State> {
		let old = await this.connLocker.withLock<State>(async ()=>{
			let old = this.state

			if (this.state.isInvalidated()) {
				return old
			}
			this.state = new Invalidated(err)
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.Invalidated`, `${err}`))

			return old
		})

		await this.allRequests.ClearAllWith([Response.ZeroRes(), err.toConnErr])

		return old
	}

	async onError(err: StmError) {
		let old = await this.closeAndOldState(err)
		if (old instanceof Connected) {
			asyncExe(async ()=>{
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`
					, "closed, become invalidated"))
				await this.onPeerClosed(err)
				await this.proto.Close()
			})
		}
	}

	async onMessage(msg: ArrayBuffer) {
		let [response, err] = Response.Parse(msg)
		if (err) {
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:parse`
				, `error --- ${err}`))
			await this.onError(err)
			return
		}

		if (response.isPush) {
			let [pushAck, err] = response.newPushAck()
			if (err) {
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:newPushAck`
					, `error --- ${err}`))
				await this.onError(err)
				return
			}

			asyncExe(async()=>{
				await this.onPush(response.data)
			})

			// ignore error
			asyncExe(async ()=>{
				let err = await this.proto.Send(pushAck)
				if (err) {
					this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`
						, `error --- ${err}`))
				}
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`
					, `pushID = ${response.pushId}`))
			})

			return
		}

		let ch = await this.allRequests.Remove(response.reqId)
		if (ch == null) {
			this.logger.w.debug(this.logger.f.Warn(`Net[${this.flag}]<${this.connectID}>.onMessage:NotFind`
				, `warning: not find request for reqId(${response.reqId}`))
			return
		}

		let ch1 = ch

		this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:response`
			, `reqId=${response.reqId}`))
		asyncExe(async ()=>{
			await ch1.Send([response, null])
		})
	}

	// 可重复调用
	async connect(): Promise<StmError|null> {
		return await this.connLocker.withLock<StmError|null>(async ()=>{
			if (this.state instanceof Connected) {
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:Connected`, `connID=${this.connectID}`))
				return null
			}
			if (this.state.isInvalidated()) {
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect<${this.connectID}>:Invalidated`
					, `${this.state.err}`))
				return this.state.err
			}

			// state.NotConnect
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:NotConnect`, "will connect"))
			let [handshake, err] = await this.proto.Connect()
			if (err != null) {
				this.state = new Invalidated(err)
				this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:error`, `${err}`))
				return err
			}

			// OK
			this.state = new Connected
			this.handshake = handshake
			this.allRequests.permits = this.handshake.MaxConcurrent
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.connect:handshake`
				, `${this.handshake}`))

			return null
		})
	}

	// 如果没有连接成功，直接返回失败
	async send(data: ArrayBuffer, headers: Map<string, string>
						 , timeout: Duration = 30*Second): Promise<[ArrayBuffer, StmError|null]> {
		// 预判断
		let ret = await this.connLocker.withLock<StmError|null> (async ()=>{
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:state`
				, `${this.state} --- headers:${formatMap(headers)}`))
			if (this.state.isInvalidated()) {
				return this.state.err.toConnErr
			}
			if (!(this.state instanceof Connected)) {
				return new ElseConnErr("not connected")
			}

			return null
		})
		if (ret) {
			return [new ArrayBuffer(0), ret]
		}

		let reqId = this.reqId.get()
		let [request, err] = Request.New(reqId, data, headers)
		if (err) {
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:FakeHttpRequest`
				, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: ${err}`))
			return [new ArrayBuffer(0), err]
		}
		if (request.loadLen > this.handshake.MaxBytes) {
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:MaxBytes`
				, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: data is Too Large`))
			return [new ArrayBuffer(0)
				, new ElseErr(`request.size(${request.loadLen}) > MaxBytes(${this.handshake.MaxBytes})`)]
		}

		// 在客户端超时也认为是一个请求结束，但是真正的请求并没有结束，所以在服务器看来，仍然占用服务器的一个并发数
		// 因为网络异步的原因，客户端并发数不可能与服务器完全一样，所以这里主要是协助服务器做预控流，按照客户端的逻辑处理即可

		this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:request`
			, `headers:${formatMap(headers)} (reqId:${reqId})`))

		let ch = await this.allRequests.Add(reqId)
		let ret2 = await withTimeout<[Response, StmError|null]>(timeout, async ()=>{
			asyncExe(async ()=>{
				let err = await this.proto.Send(request.encodedData)
				if (err) {
					await this.allRequests.Remove(reqId)?.Send([Response.ZeroRes(), err])
				}
			})

			let r = await ch.Receive()
			if (r) {
				return r
			}
			return [Response.ZeroRes(), new ElseErr("channel is closed, exception!!!")]
		})

		if (ret2 instanceof Timeout) {
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:Timeout`
				, `headers:${formatMap(headers)} (reqId:${reqId}) --- timeout(>${timeout/Second}s)`))
			return [new ArrayBuffer(0), new ElseErr(`request timeout(${timeout/Second}s)`)]
		}

		if (ret2[1]) {
			return [new ArrayBuffer(0), ret2[1]]
		}

		this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:response`
			, `headers:${formatMap(headers)} (reqId:${reqId}) --- ${ret2[0].status}`))

		if (ret2[0].status != ResStatus.OK) {
			return [new ArrayBuffer(0), new ElseErr(new Utf8(ret2[0].data).toString())]
		}

		await this.allRequests.Remove(reqId)

		return [ret2[0].data, null]
	}

	async close() {
		let old = await this.closeAndOldState(new ElseErr("closed by self"))
		if (old instanceof Connected) {
			this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`
				, "closed, become invalidated"))
			await this.proto.Close()
		}
	}
}

export function formatMap(map: Map<string, string>): string {
	let ret = new Array<string>()
	map.forEach((v, k) => {
		ret.push(k + ":" + v)
	})

	return "{" + ret.join(", ") + "}"
}
