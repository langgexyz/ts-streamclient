(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/client", "./src/websocket", "./src/error", "./src/browserws"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWs = exports.withBrowser = exports.ElseTimeoutErr = exports.ConnTimeoutErr = exports.ElseConnErr = exports.ElseErr = exports.WebSocketProtocol = exports.AbstractWebSocketDriver = exports.Result = exports.Client = void 0;
    var client_1 = require("./src/client");
    Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return client_1.Client; } });
    Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return client_1.Result; } });
    var websocket_1 = require("./src/websocket");
    Object.defineProperty(exports, "AbstractWebSocketDriver", { enumerable: true, get: function () { return websocket_1.AbstractWebSocketDriver; } });
    Object.defineProperty(exports, "WebSocketProtocol", { enumerable: true, get: function () { return websocket_1.WebSocketProtocol; } });
    var error_1 = require("./src/error");
    Object.defineProperty(exports, "ElseErr", { enumerable: true, get: function () { return error_1.ElseErr; } });
    Object.defineProperty(exports, "ElseConnErr", { enumerable: true, get: function () { return error_1.ElseConnErr; } });
    Object.defineProperty(exports, "ConnTimeoutErr", { enumerable: true, get: function () { return error_1.ConnTimeoutErr; } });
    Object.defineProperty(exports, "ElseTimeoutErr", { enumerable: true, get: function () { return error_1.ElseTimeoutErr; } });
    var browserws_1 = require("./src/browserws");
    Object.defineProperty(exports, "withBrowser", { enumerable: true, get: function () { return browserws_1.withBrowser; } });
    Object.defineProperty(exports, "BrowserWs", { enumerable: true, get: function () { return browserws_1.BrowserWs; } });
});
//# sourceMappingURL=index.js.map