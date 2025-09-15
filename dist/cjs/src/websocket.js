"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProtocol = exports.AbstractWebSocketDriver = void 0;
const protocol_1 = require("./protocol");
const error_1 = require("./error");
const ts_xutils_1 = require("ts-xutils");
const ts_concurrency_1 = require("ts-concurrency");
class AbstractWebSocketDriver {
    constructor() {
        this.onclose = () => { };
        this.onerror = () => { };
        this.onmessage = () => { };
        this.onopen = () => { };
    }
}
exports.AbstractWebSocketDriver = AbstractWebSocketDriver;
class dummyWs extends AbstractWebSocketDriver {
    close() { }
    send() { }
}
class WebSocketProtocol {
    get connectID() { return this.handshake.ConnectId; }
    get logger() {
        return this.logger_;
    }
    set logger(l) {
        this.logger_ = l;
        this.logger_.w.debug(this.logger_.f.Debug(`WebSocket[${this.flag}].new`, `flag=${this.flag}`));
    }
    constructor(url, driverCreator, connectTimeout = 30 * ts_xutils_1.Second) {
        this.url = url;
        this.driverCreator = driverCreator;
        this.connectTimeout = connectTimeout;
        this.logger_ = ts_xutils_1.ConsoleLogger;
        this.onMessage = () => __awaiter(this, void 0, void 0, function* () { });
        this.onError = () => __awaiter(this, void 0, void 0, function* () { });
        this.closeBySelf = false;
        this.handshake = new protocol_1.Handshake();
        this.flag = (0, ts_xutils_1.UniqFlag)();
        this.driver = new dummyWs();
        if (url.indexOf("s://") === -1) {
            this.url = "ws://" + url;
        }
    }
    Close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.closeBySelf = true;
            this.driver.close();
            this.driver = new dummyWs();
        });
    }
    createDriver(handshakeChannel) {
        let isConnecting = true;
        this.driver = this.driverCreator(this.url);
        this.driver.onclose = (ev) => {
            if (isConnecting) {
                isConnecting = false;
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `${ev.code} ${ev.reason}`));
                    yield handshakeChannel.Send(new error_1.ElseConnErr(`closed: ${ev.code} ${ev.reason}`));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `closed by peer: ${ev.code} ${ev.reason}`));
                    yield this.onError(new error_1.ElseConnErr(`closed by peer: ${ev.code} ${ev.reason}`));
                }));
            }
        };
        this.driver.onerror = (ev) => {
            if (isConnecting) {
                isConnecting = false;
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, ev.errMsg));
                    yield handshakeChannel.Send(new error_1.ElseConnErr(ev.errMsg));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, `${ev.errMsg}`));
                    yield this.onError(new error_1.ElseConnErr(ev.errMsg));
                }));
            }
        };
        this.driver.onmessage = (ev) => {
            if (typeof ev.data == "string") {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onmessage:error`, "message type error"));
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.onError(new error_1.ElseConnErr("message type error"));
                }));
                return;
            }
            let data = ev.data;
            if (isConnecting) {
                isConnecting = false;
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield handshakeChannel.Send(data);
                }));
                return;
            }
            (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}]<${this.connectID}>.read`, `read one message`));
                yield this.onMessage(data);
            }));
        };
        this.driver.onopen = () => {
            this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onopen`, `waiting for handshake`));
        };
    }
    Connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].Connect:start`, `${this.url}#connectTimeout=${this.connectTimeout}`));
            let handshakeChannel = new ts_concurrency_1.Channel(1);
            this.createDriver(handshakeChannel);
            let handshake = yield (0, ts_concurrency_1.withTimeout)(this.connectTimeout, () => __awaiter(this, void 0, void 0, function* () {
                return yield handshakeChannel.Receive();
            }));
            if (handshake instanceof ts_concurrency_1.Timeout) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "timeout"));
                return [new protocol_1.Handshake(), new error_1.ConnTimeoutErr("timeout")];
            }
            if ((0, error_1.isStmError)(handshake)) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `${handshake}`));
                return [new protocol_1.Handshake(), handshake];
            }
            if (handshake == null) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "channel closed"));
                return [new protocol_1.Handshake(), new error_1.ElseConnErr("channel closed")];
            }
            if (handshake.byteLength != protocol_1.Handshake.StreamLen) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `handshake(${handshake.byteLength}) size error`));
                return [new protocol_1.Handshake(), new error_1.ElseConnErr(`handshake(${handshake.byteLength}) size error`)];
            }
            this.handshake = protocol_1.Handshake.Parse(handshake);
            this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}]<${(this.connectID)}>.Connect:end`, `connectID = ${(this.connectID)}`));
            return [this.handshake, null];
        });
    }
    Send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.driver.send(data);
            this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}]<${this.connectID}>.Send`, `frameBytes = ${data.byteLength}`));
            return null;
        });
    }
}
exports.WebSocketProtocol = WebSocketProtocol;
//# sourceMappingURL=websocket.js.map