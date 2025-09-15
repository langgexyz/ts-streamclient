import { Logger, Duration } from "ts-xutils";
import { StmError } from "./error";
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
export declare class Handshake {
    HearBeatTime: Duration;
    FrameTimeout: Duration;
    MaxConcurrent: number;
    MaxBytes: number;
    ConnectId: string;
    toString(): string;
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
    static StreamLen: number;
    static Parse(buffer: ArrayBuffer): Handshake;
}
export interface Protocol {
    Connect(): Promise<[Handshake, StmError | null]>;
    Close(): Promise<void>;
    Send(data: ArrayBuffer): Promise<StmError | null>;
    logger: Logger;
    onMessage: (data: ArrayBuffer) => Promise<void>;
    onError: (err: StmError) => Promise<void>;
}
//# sourceMappingURL=protocol.d.ts.map