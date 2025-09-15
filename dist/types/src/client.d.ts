import { Logger, Duration } from "ts-xutils";
import { StmError } from "./error";
import { Protocol } from "./protocol";
export declare class Result {
    private data;
    toString(): string;
    utf8RawBuffer(): ArrayBuffer;
    constructor(data?: ArrayBuffer);
}
export declare class Client {
    private protocolCreator;
    private logger;
    onPush: (res: Result) => Promise<void>;
    onPeerClosed: (err: StmError) => Promise<void>;
    private flag;
    private netMutex;
    private net_;
    constructor(protocolCreator: () => Protocol, logger?: Logger);
    private newNet;
    private net;
    Send(data: ArrayBuffer | string, headers: Map<string, string>, timeout?: Duration): Promise<[Result, StmError | null]>;
    /**
     * Close 后，Client 仍可继续使用，下次发送请求时，会自动重连
     * Close() 调用不会触发 onPeerClosed()
     * Close() 与 其他接口没有明确的时序关系，Close() 调用后，也可能会出现 Send() 的调用返回 或者 onPeerClosed()
     * 		但此时的 onPeerClosed() 并不是因为 Close() 而触发的。
     */
    Close(): Promise<void>;
    UpdateProtocol(creator: () => Protocol): void;
    Recover(): Promise<StmError | null>;
    private static reqidKey;
    SendWithReqId(data: ArrayBuffer | string, headers: Map<string, string>, timeout?: Duration): Promise<[Result, StmError | null]>;
}
//# sourceMappingURL=client.d.ts.map