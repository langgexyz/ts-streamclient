
import {formatMap, Net} from "./net"
import {Utf8, Logger, UniqFlag, ConsoleLogger, Duration, Second} from "ts-xutils"
import {StmError} from "./error"
import {Protocol} from "./protocol"
import {Mutex} from "ts-concurrency"

export class Result {
  public toString():string {
    return new Utf8(this.data).toString()
  }

  public utf8RawBuffer():ArrayBuffer {
    return this.data
  }

  constructor(private data:ArrayBuffer = new ArrayBuffer(0)) {
  }
}

export class Client {
	public onPush: (res:Result)=>Promise<void> = async ()=>{};
	public onPeerClosed: (err:StmError)=>Promise<void> = async ()=>{};

	private flag = UniqFlag()
	private netMutex: Mutex = new Mutex()
  private net_: Net

  constructor(private protocolCreator: ()=>Protocol, private logger: Logger = ConsoleLogger) {
    logger.w.info(logger.f.Info(`Client[${this.flag}].new`, `flag=${this.flag}`))
		this.net_ = this.newNet()
  }

	private newNet(): Net {
		return new Net(this.logger, this.protocolCreator, async (err: StmError)=>{
			this.logger.w.warn(this.logger.f.Warn(`Client[${this.flag}].onPeerClosed`, `reason: ${err}`))
			await this.onPeerClosed(err)
		}, async (data: ArrayBuffer)=>{
			this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].onPush`, `size: ${data.byteLength}`))
			await this.onPush(new Result(data))
		})
	}

	private async net(): Promise<Net> {
		return await this.netMutex.withLock<Net>(async ()=>{
			if (this.net_.isInvalid) {
				await this.net_.close()
				this.net_ = this.newNet()
			}

			return this.net_
		})
	}

  public async Send(data: ArrayBuffer|string, headers: Map<string, string>
										, timeout: Duration = 30*Second): Promise<[Result, StmError | null]> {
		let sflag = headers.get(Client.reqidKey) ?? UniqFlag()
		let utf8Data = new Utf8(data)

		this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}]:start`
			, `headers:${formatMap(headers)}, request utf8 size = ${utf8Data.byteLength}`))

		let net = await this.net()
		let err = await net.connect()
		if (err) {
			this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}]:error`
				, `connect error: ${err}`))
			return [new Result(), err]
		}

		let [ret, err2] = await net.send(utf8Data.raw.buffer, headers, timeout)
		if (err2 == null) {
			this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`
				, `response size = ${ret.byteLength}`))
			return [new Result(ret), err2]
		}
		if (!err2.isConnErr) {
			this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`
				, `request error = ${err2}`))
			return [new Result(ret), err2]
		}

		// sending --- conn error:  retry
		this.logger.w.debug(this.logger.f.Debug(`Client[${this.flag}].Send[${sflag}]:retry`, `retry-1`))

		net = await this.net()

		err = await net.connect()
		if (err) {
			this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}]:error`, `connect error: ${err}`))
			return [new Result(), err]
		}

		[ret, err2] = await net.send(utf8Data.raw.buffer, headers, timeout)
		if (err2 == null) {
			this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`
				, `response size = ${ret.byteLength}`))
		} else {
			this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`
				, `request error = ${err2}`))
		}

		return [new Result(ret), err2]
  }

	/**
	 * Close 后，Client 仍可继续使用，下次发送请求时，会自动重连
	 * Close() 调用不会触发 onPeerClosed()
	 * Close() 与 其他接口没有明确的时序关系，Close() 调用后，也可能会出现 Send() 的调用返回 或者 onPeerClosed()
	 * 		但此时的 onPeerClosed() 并不是因为 Close() 而触发的。
	 */
	public async Close() {
		await this.netMutex.withLock<void>(async ()=>{
			this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].close`, "closed by self"))
			await this.net_.close()
		})
	}

	UpdateProtocol(creator: ()=>Protocol) {
		this.protocolCreator = creator
	}

  public async Recover(): Promise<StmError|null> {
    return await (await this.net()).connect()
  }

	private static reqidKey: string = "X-Req-Id"
	public async SendWithReqId(data: ArrayBuffer|string, headers: Map<string, string>
		, timeout: Duration = 30*Second): Promise<[Result, StmError | null]> {
		headers.set(Client.reqidKey, UniqFlag())

		return await this.Send(data, headers, timeout)
	}
}


