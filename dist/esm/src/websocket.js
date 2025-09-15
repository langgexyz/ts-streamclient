var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Handshake } from "./protocol";
import { ConnTimeoutErr, ElseConnErr, isStmError } from "./error";
import { ConsoleLogger, Second, UniqFlag } from "ts-xutils";
import { asyncExe, Channel, Timeout, withTimeout } from "ts-concurrency";
export class AbstractWebSocketDriver {
    constructor() {
        this.onclose = () => { };
        this.onerror = () => { };
        this.onmessage = () => { };
        this.onopen = () => { };
    }
}
class dummyWs extends AbstractWebSocketDriver {
    close() { }
    send() { }
}
export class WebSocketProtocol {
    get connectID() { return this.handshake.ConnectId; }
    get logger() {
        return this.logger_;
    }
    set logger(l) {
        this.logger_ = l;
        this.logger_.w.debug(this.logger_.f.Debug(`WebSocket[${this.flag}].new`, `flag=${this.flag}`));
    }
    constructor(url, driverCreator, connectTimeout = 30 * Second) {
        this.url = url;
        this.driverCreator = driverCreator;
        this.connectTimeout = connectTimeout;
        this.logger_ = ConsoleLogger;
        this.onMessage = () => __awaiter(this, void 0, void 0, function* () { });
        this.onError = () => __awaiter(this, void 0, void 0, function* () { });
        this.closeBySelf = false;
        this.handshake = new Handshake();
        this.flag = UniqFlag();
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
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `${ev.code} ${ev.reason}`));
                    yield handshakeChannel.Send(new ElseConnErr(`closed: ${ev.code} ${ev.reason}`));
                }));
                return;
            }
            if (!this.closeBySelf) {
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `closed by peer: ${ev.code} ${ev.reason}`));
                    yield this.onError(new ElseConnErr(`closed by peer: ${ev.code} ${ev.reason}`));
                }));
            }
        };
        this.driver.onerror = (ev) => {
            if (isConnecting) {
                isConnecting = false;
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, ev.errMsg));
                    yield handshakeChannel.Send(new ElseConnErr(ev.errMsg));
                }));
                return;
            }
            if (!this.closeBySelf) {
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, `${ev.errMsg}`));
                    yield this.onError(new ElseConnErr(ev.errMsg));
                }));
            }
        };
        this.driver.onmessage = (ev) => {
            if (typeof ev.data == "string") {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onmessage:error`, "message type error"));
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.onError(new ElseConnErr("message type error"));
                }));
                return;
            }
            let data = ev.data;
            if (isConnecting) {
                isConnecting = false;
                asyncExe(() => __awaiter(this, void 0, void 0, function* () {
                    yield handshakeChannel.Send(data);
                }));
                return;
            }
            asyncExe(() => __awaiter(this, void 0, void 0, function* () {
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
            let handshakeChannel = new Channel(1);
            this.createDriver(handshakeChannel);
            let handshake = yield withTimeout(this.connectTimeout, () => __awaiter(this, void 0, void 0, function* () {
                return yield handshakeChannel.Receive();
            }));
            if (handshake instanceof Timeout) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "timeout"));
                return [new Handshake(), new ConnTimeoutErr("timeout")];
            }
            if (isStmError(handshake)) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `${handshake}`));
                return [new Handshake(), handshake];
            }
            if (handshake == null) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "channel closed"));
                return [new Handshake(), new ElseConnErr("channel closed")];
            }
            if (handshake.byteLength != Handshake.StreamLen) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `handshake(${handshake.byteLength}) size error`));
                return [new Handshake(), new ElseConnErr(`handshake(${handshake.byteLength}) size error`)];
            }
            this.handshake = Handshake.Parse(handshake);
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
//# sourceMappingURL=websocket.js.map