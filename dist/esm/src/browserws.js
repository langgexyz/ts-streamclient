import { AbstractWebSocketDriver, WebSocketProtocol } from "./websocket";
import { Second } from "ts-xutils";
export class BrowserWs extends AbstractWebSocketDriver {
    close(code, reason) {
        this.websocket.close(code, reason);
    }
    send(data) {
        this.websocket.send(data);
    }
    constructor(url) {
        super();
        this.websocket = new WebSocket(url);
        this.websocket.binaryType = "arraybuffer";
        this.websocket.onclose = (ev) => {
            this.onclose(ev);
        };
        this.websocket.onerror = (ev) => {
            this.onerror({ errMsg: "BrowserWebSocket onerror: " + ev.toString() });
        };
        this.websocket.onmessage = (ev) => {
            this.onmessage(ev);
        };
        this.websocket.onopen = (ev) => {
            this.onopen(ev);
        };
    }
}
export function withBrowser(url, connectionTimeout = 30 * Second) {
    return () => {
        return new WebSocketProtocol(url, (url) => {
            return new BrowserWs(url);
        }, connectionTimeout);
    };
}
//# sourceMappingURL=browserws.js.map