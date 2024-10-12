
import {Logger, Duration, assert, Second} from "ts-xutils"
import {StmError} from "./error"

/**
 *
 * 上层的调用 Protocol 及响应 Delegate 的时序逻辑：
 *
 *                             +-----------------------------------+
 *                             |                                   |
 *                             |                                   v
 *     connect{1} --+--(true)--+---[.async]--->send{n} ------> close{1}
 *                  |          |                                   ^
 *           (false)|          |-------> onMessage                 |
 *                  |          |             |                     |
 *        <Unit>----+          |          (error) --- [.async] --->|
 *                             |                                   |
 *                             +--------> onError --- [.async] ----+
 *
 *
 *    Protocol.connect() 与 Protocol.close() 上层使用方确保只会调用 1 次
 *    Protocol.connect() 失败，不会请求/响应任何接口
 *    Protocol.send() 会异步并发地调用 n 次，Protocol.send() 执行的时长不会让调用方挂起等待
 *    在上层明确调用 Protocol.close() 后，才不会调用 Protocol.send()
 *    Delegate.onMessage() 失败 及 Delegate.onError() 会异步调用 Protocol.close()
 *
 *    连接成功后，任何不能继续通信的情况都以 Delegate.onError() 返回
 *    Delegate.close() 的调用不触发 Delegate.onError()
 *    Delegate.connect() 的错误不触发 Delegate.onError()
 *    Delegate.send() 仅返回本次 Delegate.send() 的错误，
 *       不是底层通信的错误，底层通信的错误通过 Delegate.onError() 返回
 *
 */

export class Handshake {
	HearBeatTime: Duration = Number.MAX_SAFE_INTEGER
	FrameTimeout: Duration = Number.MAX_SAFE_INTEGER // 同一帧里面的数据超时
	MaxConcurrent: number = Number.MAX_SAFE_INTEGER // 一个连接上的最大并发
	MaxBytes: number = 10 * 1024 * 1024 // 一帧数据的最大字节数
	ConnectId: string = "---no_connectId---"

	toString(): string {
		return `handshake info:{ConnectId: ${this.ConnectId}, MaxConcurrent: ${this.MaxConcurrent}, HearBeatTime: ${this.HearBeatTime}, MaxBytes/frame: ${this.MaxBytes}, FrameTimeout: ${this.FrameTimeout}`
	}

	/**
	 * ```
	 * HeartBeat_s | FrameTimeout_s | MaxConcurrent | MaxBytes | connect id
	 * HeartBeat_s: 2 bytes, net order
	 * FrameTimeout_s: 1 byte
	 * MaxConcurrent: 1 byte
	 * MaxBytes: 4 bytes, net order
	 * connect id: 8 bytes, net order
	 * ```
	 */

	static StreamLen = 2 + 1 + 1 + 4 + 8

	static Parse(buffer: ArrayBuffer): Handshake {
		assert(buffer.byteLength >= Handshake.StreamLen)

		let ret = new Handshake()
		let view = new DataView(buffer);

		ret.HearBeatTime = view.getUint16(0) * Second
		ret.FrameTimeout = view.getUint8(2) * Second
		ret.MaxConcurrent = view.getUint8(3);
		ret.MaxBytes = view.getUint32(4);
		ret.ConnectId = ("00000000" + view.getUint32(8).toString(16)).slice(-8) +
			("00000000" + view.getUint32(12).toString(16)).slice(-8);

		return ret
	}
}

export interface Protocol {
	Connect(): Promise<[Handshake, StmError|null]>
	Close(): Promise<void>
	Send(data: ArrayBuffer): Promise<StmError|null>

	logger: Logger

	// delegate
	onMessage: (data:ArrayBuffer)=>Promise<void>
	onError: (err: StmError)=>Promise<void>
}

