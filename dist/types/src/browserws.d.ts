import { AbstractWebSocketDriver } from "./websocket";
import { Duration } from "ts-xutils";
import { Protocol } from "./protocol";
export declare class BrowserWs extends AbstractWebSocketDriver {
    private websocket;
    close(code?: number, reason?: string): void;
    send(data: ArrayBuffer): void;
    constructor(url: string);
}
export declare function withBrowser(url: string, connectionTimeout?: Duration): () => Protocol;
//# sourceMappingURL=browserws.d.ts.map