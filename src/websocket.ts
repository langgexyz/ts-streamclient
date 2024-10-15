import {Handshake, Protocol} from "./protocol"
import {ConnTimeoutErr, ElseConnErr, isStmError, StmError} from "./error"
import {ConsoleLogger, Duration, Logger, Second, UniqFlag} from "ts-xutils"
import {asyncExe, Channel, SendChannel, Timeout, withTimeout} from "ts-concurrency"

export interface Event {}

export interface MessageEvent extends Event{
	readonly data: ArrayBuffer | string
}

export interface CloseEvent extends Event{
	readonly code: number;
	readonly reason: string;
}

export interface ErrorEvent extends Event{
	errMsg: string
}

export interface WebSocketDriver {
	onclose: ((ev: CloseEvent) => any)
	onerror: ((ev: ErrorEvent) => any)
	onmessage: ((ev: MessageEvent) => any)
	onopen: ((ev: Event) => any)

	close(code?: number, reason?: string): void
	send(data: ArrayBuffer): void
}

export abstract class AbstractWebSocketDriver implements WebSocketDriver{
	onclose: ((ev: CloseEvent) => any) = ()=>{}
	onerror: ((ev: ErrorEvent) => any)  = ()=>{}
	onmessage: ((ev: MessageEvent) => any) = ()=>{}
	onopen: ((ev: Event) => any) = ()=>{}

	abstract close(code?: number, reason?: string): void
	abstract send(data: ArrayBuffer): void
}

class dummyWs extends AbstractWebSocketDriver {
	close(): void {}
	send(): void {}
}

export class WebSocketProtocol implements Protocol {
	logger_: Logger = new ConsoleLogger()
	onMessage: (data:ArrayBuffer)=>Promise<void> = async ()=>{}
	onError: (err: StmError)=>Promise<void> = async ()=>{}
	closeBySelf: boolean = false
	handshake: Handshake = new Handshake()

	get connectID():string { return this.handshake.ConnectId }
	private flag = UniqFlag()
	driver: AbstractWebSocketDriver = new dummyWs()

	get logger(): Logger {
		return this.logger_
	}
	set logger(l) {
		this.logger_ = l
		this.logger_.Debug(`WebSocket[${this.flag}].new`, `flag=${this.flag}`)
	}

	constructor(private readonly url: string, private driverCreator: (url:string)=>WebSocketDriver
							, private connectTimeout: Duration = 30*Second) {
		if (url.indexOf("s://") === -1) {
			this.url = "ws://" + url;
		}
	}

	async Close(): Promise<void> {
		this.closeBySelf = true
		this.driver.close()
		this.driver = new dummyWs()
	}

	createDriver(handshakeChannel: SendChannel<ArrayBuffer|StmError>) {
		let isConnecting = true
		this.driver = this.driverCreator(this.url)
		this.driver.onclose = (ev)=>{
			if (isConnecting) {
				isConnecting = false
				asyncExe(async ()=>{
					this.logger.Debug(`WebSocket[${this.flag}].onclose`, `${ev.code} ${ev.reason}`)
					await handshakeChannel.Send(new ElseConnErr(`closed: ${ev.code} ${ev.reason}`))
				})
				return
			}
			if (!this.closeBySelf) {
				asyncExe(async ()=>{
					this.logger.Debug(`WebSocket[${this.flag}].onclose`, `closed by peer: ${ev.code} ${ev.reason}`)
					await this.onError(new ElseConnErr(`closed by peer: ${ev.code} ${ev.reason}`))
				})
			}
		}
		this.driver.onerror = (ev)=>{
			if (isConnecting) {
				isConnecting = false
				asyncExe(async ()=>{
					this.logger.Debug(`WebSocket[${this.flag}].onerror`, ev.errMsg)
					await handshakeChannel.Send(new ElseConnErr(ev.errMsg))
				})
				return
			}
			if (!this.closeBySelf) {
				asyncExe(async ()=>{
					this.logger.Debug(`WebSocket[${this.flag}].onerror`, `${ev.errMsg}`)
					await this.onError(new ElseConnErr(ev.errMsg))
				})
			}
		}
		this.driver.onmessage = (ev)=>{
			if (typeof ev.data == "string") {
				this.logger.Debug(`WebSocket[${this.flag}].onmessage:error`, "message type error")
				asyncExe(async ()=>{
					await this.onError(new ElseConnErr("message type error"))
				})
				return
			}

			let data:ArrayBuffer = ev.data

			if (isConnecting) {
				isConnecting = false
				asyncExe(async ()=>{
					await handshakeChannel.Send(data)
				})
				return
			}

			asyncExe(async ()=>{
				this.logger.Debug(`WebSocket[${this.flag}]<${this.connectID}>.read`, `read one message`)
				await this.onMessage(data)
			})
		}
		this.driver.onopen = ()=>{
			this.logger.Debug(`WebSocket[${this.flag}].onopen`, `waiting for handshake`)
		}
	}

	async Connect(): Promise<[Handshake, (StmError | null)]> {
		this.logger.Debug(`WebSocket[${this.flag}].Connect:start`
			, `${this.url}#connectTimeout=${this.connectTimeout}`)

		let handshakeChannel = new Channel<ArrayBuffer|StmError>(1)
		this.createDriver(handshakeChannel)

		let handshake = await withTimeout<ArrayBuffer|StmError|null>(this.connectTimeout, async ()=>{
			return await handshakeChannel.Receive()
		})
		if (handshake instanceof Timeout) {
			this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, "timeout")
			return [new Handshake(), new ConnTimeoutErr("timeout")]
		}
		if (isStmError(handshake)) {
			this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, `${handshake}`)
			return [new Handshake(), handshake]
		}
		if (handshake == null) {
			this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, "channel closed")
			return [new Handshake(), new ElseConnErr("channel closed")]
		}

		if (handshake.byteLength != Handshake.StreamLen) {
			this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`
				, `handshake(${handshake.byteLength}) size error`)
			return [new Handshake(), new ElseConnErr(`handshake(${handshake.byteLength}) size error`)]
		}
		this.handshake = Handshake.Parse(handshake)
		this.logger.Debug(`WebSocket[${(this.flag)}]<${(this.connectID)}>.Connect:end`
			, `connectID = ${(this.connectID)}`)

		return [this.handshake, null]
	}

	async Send(data: ArrayBuffer): Promise<StmError | null> {
		this.driver.send(data)
		this.logger.Debug(`WebSocket[${this.flag}]<${this.connectID}>.Send`, `frameBytes = ${data.byteLength}`)
		return null
	}
}

