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
exports.Client = exports.Result = void 0;
const net_1 = require("./net");
const ts_xutils_1 = require("ts-xutils");
const ts_concurrency_1 = require("ts-concurrency");
class Result {
    toString() {
        return new ts_xutils_1.Utf8(this.data).toString();
    }
    utf8RawBuffer() {
        return this.data;
    }
    constructor(data = new ArrayBuffer(0)) {
        this.data = data;
    }
}
exports.Result = Result;
class Client {
    constructor(protocolCreator, logger = ts_xutils_1.ConsoleLogger) {
        this.protocolCreator = protocolCreator;
        this.logger = logger;
        this.onPush = () => __awaiter(this, void 0, void 0, function* () { });
        this.onPeerClosed = () => __awaiter(this, void 0, void 0, function* () { });
        this.flag = (0, ts_xutils_1.UniqFlag)();
        this.netMutex = new ts_concurrency_1.Mutex();
        logger.w.info(logger.f.Info(`Client[${this.flag}].new`, `flag=${this.flag}`));
        this.net_ = this.newNet();
    }
    newNet() {
        return new net_1.Net(this.logger, this.protocolCreator, (err) => __awaiter(this, void 0, void 0, function* () {
            this.logger.w.warn(this.logger.f.Warn(`Client[${this.flag}].onPeerClosed`, `reason: ${err}`));
            yield this.onPeerClosed(err);
        }), (data) => __awaiter(this, void 0, void 0, function* () {
            this.logger.w.debug(this.logger.f.Debug(`Client[${this.flag}].onPush`, `size: ${data.byteLength}`));
            yield this.onPush(new Result(data));
        }));
    }
    net() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.netMutex.withLock(() => __awaiter(this, void 0, void 0, function* () {
                if (this.net_.isInvalid) {
                    yield this.net_.close();
                    this.net_ = this.newNet();
                }
                return this.net_;
            }));
        });
    }
    Send(data_1, headers_1) {
        return __awaiter(this, arguments, void 0, function* (data, headers, timeout = 30 * ts_xutils_1.Second) {
            var _a;
            let sflag = (_a = headers.get(Client.reqidKey)) !== null && _a !== void 0 ? _a : (0, ts_xutils_1.UniqFlag)();
            let utf8Data = new ts_xutils_1.Utf8(data);
            this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}]:start`, `headers:${(0, net_1.formatMap)(headers)}, request utf8 size = ${utf8Data.byteLength}`));
            let net = yield this.net();
            let err = yield net.connect();
            if (err) {
                this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}]:error`, `connect error: ${err}`));
                return [new Result(), err];
            }
            let [ret, err2] = yield net.send(utf8Data.raw.buffer, headers, timeout);
            if (err2 == null) {
                this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`, `response size = ${ret.byteLength}`));
                return [new Result(ret), err2];
            }
            if (!err2.isConnErr) {
                this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`, `request error = ${err2}`));
                return [new Result(ret), err2];
            }
            // sending --- conn error:  retry
            this.logger.w.debug(this.logger.f.Debug(`Client[${this.flag}].Send[${sflag}]:retry`, `retry-1`));
            net = yield this.net();
            err = yield net.connect();
            if (err) {
                this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}]:error`, `connect error: ${err}`));
                return [new Result(), err];
            }
            [ret, err2] = yield net.send(utf8Data.raw.buffer, headers, timeout);
            if (err2 == null) {
                this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`, `response size = ${ret.byteLength}`));
            }
            else {
                this.logger.w.error(this.logger.f.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`, `request error = ${err2}`));
            }
            return [new Result(ret), err2];
        });
    }
    /**
     * Close 后，Client 仍可继续使用，下次发送请求时，会自动重连
     * Close() 调用不会触发 onPeerClosed()
     * Close() 与 其他接口没有明确的时序关系，Close() 调用后，也可能会出现 Send() 的调用返回 或者 onPeerClosed()
     * 		但此时的 onPeerClosed() 并不是因为 Close() 而触发的。
     */
    Close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.netMutex.withLock(() => __awaiter(this, void 0, void 0, function* () {
                this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].close`, "closed by self"));
                yield this.net_.close();
            }));
        });
    }
    UpdateProtocol(creator) {
        this.protocolCreator = creator;
    }
    Recover() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.net()).connect();
        });
    }
    SendWithReqId(data_1, headers_1) {
        return __awaiter(this, arguments, void 0, function* (data, headers, timeout = 30 * ts_xutils_1.Second) {
            headers.set(Client.reqidKey, (0, ts_xutils_1.UniqFlag)());
            return yield this.Send(data, headers, timeout);
        });
    }
}
exports.Client = Client;
Client.reqidKey = "X-Req-Id";
//# sourceMappingURL=client.js.map