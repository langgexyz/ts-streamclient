(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./websocket", "ts-xutils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWs = void 0;
    exports.withBrowser = withBrowser;
    const websocket_1 = require("./websocket");
    const ts_xutils_1 = require("ts-xutils");
    class BrowserWs extends websocket_1.AbstractWebSocketDriver {
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
    exports.BrowserWs = BrowserWs;
    function withBrowser(url, connectionTimeout = 30 * ts_xutils_1.Second) {
        return () => {
            return new websocket_1.WebSocketProtocol(url, (url) => {
                return new BrowserWs(url);
            }, connectionTimeout);
        };
    }
});
//# sourceMappingURL=browserws.js.map