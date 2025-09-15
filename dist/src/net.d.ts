import { Duration, Logger } from "ts-xutils";
import { StmError } from "./error";
import { Protocol } from "./protocol";
export declare class Net {
    private logger;
    private onPeerClosed;
    private onPush;
    private handshake;
    private connLocker;
    private state;
    private proto;
    private reqId;
    private allRequests;
    private flag;
    get connectID(): string;
    get isInvalid(): boolean;
    constructor(logger: Logger, protoCreator: () => Protocol, onPeerClosed: (err: StmError) => Promise<void>, onPush: (data: ArrayBuffer) => Promise<void>);
    private closeAndOldState;
    onError(err: StmError): Promise<void>;
    onMessage(msg: ArrayBuffer): Promise<void>;
    connect(): Promise<StmError | null>;
    send(data: ArrayBuffer, headers: Map<string, string>, timeout?: Duration): Promise<[ArrayBuffer, StmError | null]>;
    close(): Promise<void>;
}
export declare function formatMap(map: Map<string, string>): string;
//# sourceMappingURL=net.d.ts.map