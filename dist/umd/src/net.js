var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ts-xutils", "ts-concurrency", "./fakehttp", "./error", "./protocol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Net = void 0;
    exports.formatMap = formatMap;
    const ts_xutils_1 = require("ts-xutils");
    const ts_concurrency_1 = require("ts-concurrency");
    const fakehttp_1 = require("./fakehttp");
    const error_1 = require("./error");
    const protocol_1 = require("./protocol");
    class SyncAllRequest {
        get permits() {
            return this.semaphore.max;
        }
        set permits(max) {
            this.semaphore = new ts_concurrency_1.Semaphore(max);
        }
        constructor(permits = 3) {
            this.allRequests = new Map();
            this.semaphore = new ts_concurrency_1.Semaphore(3);
            this.semaphore = new ts_concurrency_1.Semaphore(permits);
        }
        // channel 必须在 SyncAllRequest 的控制下，所以 Add 获取的只能 receive
        // 要 send 就必须通过 remove 获取
        Add(reqId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.semaphore.Acquire();
                let ch = new ts_concurrency_1.Channel(1);
                this.allRequests.set(reqId, ch);
                return ch;
            });
        }
        // 可以用同一个 reqid 重复调用
        Remove(reqId) {
            var _a;
            let ret = (_a = this.allRequests.get(reqId)) !== null && _a !== void 0 ? _a : null;
            if (ret != null && this.semaphore.current != 0) {
                this.semaphore.Release();
            }
            this.allRequests.delete(reqId);
            return ret;
        }
        ClearAllWith(ret) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let [_, ch] of this.allRequests) {
                    yield ch.Send(ret);
                    yield ch.Close();
                }
                this.allRequests.clear();
                yield this.semaphore.ReleaseAll();
            });
        }
    }
    class NotConnect {
        isEqual(other) {
            return other instanceof NotConnect;
        }
        isInvalidated() {
            return false;
        }
        toString() {
            return "NotConnect";
        }
    }
    class Connected {
        isEqual(other) {
            return other instanceof Connected;
        }
        isInvalidated() {
            return false;
        }
        toString() {
            return "Connected";
        }
    }
    class Invalidated {
        isEqual(other) {
            return other instanceof Invalidated;
        }
        isInvalidated() {
            return true;
        }
        toString() {
            return "Invalidated";
        }
        constructor(err) {
            this.err = err;
        }
    }
    class ReqId {
        constructor() {
            this.value = ReqId.reqIdStart;
        }
        get() {
            this.value += 1;
            if (this.value < ReqId.reqIdStart || this.value > Number.MAX_SAFE_INTEGER) {
                this.value = ReqId.reqIdStart;
            }
            return this.value;
        }
    }
    ReqId.reqIdStart = 10;
    class Net {
        get connectID() {
            return this.handshake.ConnectId;
        }
        get isInvalid() {
            return this.state.isInvalidated();
        }
        constructor(logger, protoCreator, onPeerClosed, onPush) {
            this.logger = logger;
            this.onPeerClosed = onPeerClosed;
            this.onPush = onPush;
            this.handshake = new protocol_1.Handshake();
            this.connLocker = new ts_concurrency_1.Mutex();
            this.state = new NotConnect;
            this.reqId = new ReqId();
            this.allRequests = new SyncAllRequest();
            this.flag = (0, ts_xutils_1.UniqFlag)();
            logger.w.debug(logger.f.Debug(`Net[${this.flag}].new`, `flag=${this.flag}`));
            this.proto = protoCreator();
            this.proto.logger = logger;
            this.proto.onError = (err) => __awaiter(this, void 0, void 0, function* () { yield this.onError(err); });
            this.proto.onMessage = (data) => __awaiter(this, void 0, void 0, function* () { yield this.onMessage(data); });
        }
        closeAndOldState(err) {
            return __awaiter(this, void 0, void 0, function* () {
                let old = yield this.connLocker.withLock(() => __awaiter(this, void 0, void 0, function* () {
                    let old = this.state;
                    if (this.state.isInvalidated()) {
                        return old;
                    }
                    this.state = new Invalidated(err);
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.Invalidated`, `${err}`));
                    return old;
                }));
                yield this.allRequests.ClearAllWith([fakehttp_1.Response.ZeroRes(), err.toConnErr]);
                return old;
            });
        }
        onError(err) {
            return __awaiter(this, void 0, void 0, function* () {
                let old = yield this.closeAndOldState(err);
                if (old instanceof Connected) {
                    (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated"));
                        yield this.onPeerClosed(err);
                        yield this.proto.Close();
                    }));
                }
            });
        }
        onMessage(msg) {
            return __awaiter(this, void 0, void 0, function* () {
                let [response, err] = fakehttp_1.Response.Parse(msg);
                if (err) {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:parse`, `error --- ${err}`));
                    yield this.onError(err);
                    return;
                }
                if (response.isPush) {
                    let [pushAck, err] = response.newPushAck();
                    if (err) {
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:newPushAck`, `error --- ${err}`));
                        yield this.onError(err);
                        return;
                    }
                    (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.onPush(response.data);
                    }));
                    // ignore error
                    (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                        let err = yield this.proto.Send(pushAck);
                        if (err) {
                            this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`, `error --- ${err}`));
                        }
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`, `pushID = ${response.pushId}`));
                    }));
                    return;
                }
                let ch = yield this.allRequests.Remove(response.reqId);
                if (ch == null) {
                    this.logger.w.debug(this.logger.f.Warn(`Net[${this.flag}]<${this.connectID}>.onMessage:NotFind`, `warning: not find request for reqId(${response.reqId}`));
                    return;
                }
                let ch1 = ch;
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:response`, `reqId=${response.reqId}`));
                (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield ch1.Send([response, null]);
                }));
            });
        }
        // 可重复调用
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.connLocker.withLock(() => __awaiter(this, void 0, void 0, function* () {
                    if (this.state instanceof Connected) {
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:Connected`, `connID=${this.connectID}`));
                        return null;
                    }
                    if (this.state.isInvalidated()) {
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect<${this.connectID}>:Invalidated`, `${this.state.err}`));
                        return this.state.err;
                    }
                    // state.NotConnect
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:NotConnect`, "will connect"));
                    let [handshake, err] = yield this.proto.Connect();
                    if (err != null) {
                        this.state = new Invalidated(err);
                        this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}].connect:error`, `${err}`));
                        return err;
                    }
                    // OK
                    this.state = new Connected;
                    this.handshake = handshake;
                    this.allRequests.permits = this.handshake.MaxConcurrent;
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.connect:handshake`, `${this.handshake}`));
                    return null;
                }));
            });
        }
        // 如果没有连接成功，直接返回失败
        send(data_1, headers_1) {
            return __awaiter(this, arguments, void 0, function* (data, headers, timeout = 30 * ts_xutils_1.Second) {
                // 预判断
                let ret = yield this.connLocker.withLock(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:state`, `${this.state} --- headers:${formatMap(headers)}`));
                    if (this.state.isInvalidated()) {
                        return this.state.err.toConnErr;
                    }
                    if (!(this.state instanceof Connected)) {
                        return new error_1.ElseConnErr("not connected");
                    }
                    return null;
                }));
                if (ret) {
                    return [new ArrayBuffer(0), ret];
                }
                let reqId = this.reqId.get();
                let [request, err] = fakehttp_1.Request.New(reqId, data, headers);
                if (err) {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:FakeHttpRequest`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: ${err}`));
                    return [new ArrayBuffer(0), err];
                }
                if (request.loadLen > this.handshake.MaxBytes) {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:MaxBytes`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: data is Too Large`));
                    return [new ArrayBuffer(0),
                        new error_1.ElseErr(`request.size(${request.loadLen}) > MaxBytes(${this.handshake.MaxBytes})`)];
                }
                // 在客户端超时也认为是一个请求结束，但是真正的请求并没有结束，所以在服务器看来，仍然占用服务器的一个并发数
                // 因为网络异步的原因，客户端并发数不可能与服务器完全一样，所以这里主要是协助服务器做预控流，按照客户端的逻辑处理即可
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:request`, `headers:${formatMap(headers)} (reqId:${reqId})`));
                let ch = yield this.allRequests.Add(reqId);
                let ret2 = yield (0, ts_concurrency_1.withTimeout)(timeout, () => __awaiter(this, void 0, void 0, function* () {
                    (0, ts_concurrency_1.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        let err = yield this.proto.Send(request.encodedData);
                        if (err) {
                            yield ((_a = this.allRequests.Remove(reqId)) === null || _a === void 0 ? void 0 : _a.Send([fakehttp_1.Response.ZeroRes(), err]));
                        }
                    }));
                    let r = yield ch.Receive();
                    if (r) {
                        return r;
                    }
                    return [fakehttp_1.Response.ZeroRes(), new error_1.ElseErr("channel is closed, exception!!!")];
                }));
                if (ret2 instanceof ts_concurrency_1.Timeout) {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:Timeout`, `headers:${formatMap(headers)} (reqId:${reqId}) --- timeout(>${timeout / ts_xutils_1.Second}s)`));
                    return [new ArrayBuffer(0), new error_1.ElseErr(`request timeout(${timeout / ts_xutils_1.Second}s)`)];
                }
                if (ret2[1]) {
                    return [new ArrayBuffer(0), ret2[1]];
                }
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:response`, `headers:${formatMap(headers)} (reqId:${reqId}) --- ${ret2[0].status}`));
                if (ret2[0].status != fakehttp_1.Status.OK) {
                    return [new ArrayBuffer(0), new error_1.ElseErr(new ts_xutils_1.Utf8(ret2[0].data).toString())];
                }
                yield this.allRequests.Remove(reqId);
                return [ret2[0].data, null];
            });
        }
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                let old = yield this.closeAndOldState(new error_1.ElseErr("closed by self"));
                if (old instanceof Connected) {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated"));
                    yield this.proto.Close();
                }
            });
        }
    }
    exports.Net = Net;
    function formatMap(map) {
        let ret = new Array();
        map.forEach((v, k) => {
            ret.push(k + ":" + v);
        });
        return "{" + ret.join(", ") + "}";
    }
});
//# sourceMappingURL=net.js.map