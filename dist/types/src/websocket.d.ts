import { Handshake, Protocol } from "./protocol";
import { StmError } from "./error";
import { Duration, Logger } from "ts-xutils";
import { SendChannel } from "ts-concurrency";
export interface Event {
}
export interface MessageEvent extends Event {
    readonly data: ArrayBuffer | string;
}
export interface CloseEvent extends Event {
    readonly code: number;
    readonly reason: string;
}
export interface ErrorEvent extends Event {
    errMsg: string;
}
export interface WebSocketDriver {
    onclose: ((ev: CloseEvent) => any);
    onerror: ((ev: ErrorEvent) => any);
    onmessage: ((ev: MessageEvent) => any);
    onopen: ((ev: Event) => any);
    close(code?: number, reason?: string): void;
    send(data: ArrayBuffer): void;
}
export declare abstract class AbstractWebSocketDriver implements WebSocketDriver {
    onclose: ((ev: CloseEvent) => any);
    onerror: ((ev: ErrorEvent) => any);
    onmessage: ((ev: MessageEvent) => any);
    onopen: ((ev: Event) => any);
    abstract close(code?: number, reason?: string): void;
    abstract send(data: ArrayBuffer): void;
}
export declare class WebSocketProtocol implements Protocol {
    private readonly url;
    private driverCreator;
    private connectTimeout;
    logger_: Logger;
    onMessage: (data: ArrayBuffer) => Promise<void>;
    onError: (err: StmError) => Promise<void>;
    closeBySelf: boolean;
    handshake: Handshake;
    get connectID(): string;
    private flag;
    driver: AbstractWebSocketDriver;
    get logger(): Logger;
    set logger(l: Logger);
    constructor(url: string, driverCreator: (url: string) => WebSocketDriver, connectTimeout?: Duration);
    Close(): Promise<void>;
    createDriver(handshakeChannel: SendChannel<ArrayBuffer | StmError>): void;
    Connect(): Promise<[Handshake, (StmError | null)]>;
    Send(data: ArrayBuffer): Promise<StmError | null>;
}
//# sourceMappingURL=websocket.d.ts.map