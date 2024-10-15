/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../ts-concurrency/index.ts":
/*!*************************************!*\
  !*** ../../ts-concurrency/index.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Channel": () => (/* reexport safe */ _src_channel__WEBPACK_IMPORTED_MODULE_0__.Channel),
/* harmony export */   "ChannelClosed": () => (/* reexport safe */ _src_channel__WEBPACK_IMPORTED_MODULE_0__.ChannelClosed),
/* harmony export */   "Mutex": () => (/* reexport safe */ _src_mutex__WEBPACK_IMPORTED_MODULE_2__.Mutex),
/* harmony export */   "Semaphore": () => (/* reexport safe */ _src_semaphore__WEBPACK_IMPORTED_MODULE_1__.Semaphore),
/* harmony export */   "Timeout": () => (/* reexport safe */ _src_timeout__WEBPACK_IMPORTED_MODULE_3__.Timeout),
/* harmony export */   "asyncExe": () => (/* reexport safe */ _src_asyncexe__WEBPACK_IMPORTED_MODULE_4__.asyncExe),
/* harmony export */   "withTimeout": () => (/* reexport safe */ _src_timeout__WEBPACK_IMPORTED_MODULE_3__.withTimeout)
/* harmony export */ });
/* harmony import */ var _src_channel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/channel */ "../../ts-concurrency/src/channel.ts");
/* harmony import */ var _src_semaphore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/semaphore */ "../../ts-concurrency/src/semaphore.ts");
/* harmony import */ var _src_mutex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/mutex */ "../../ts-concurrency/src/mutex.ts");
/* harmony import */ var _src_timeout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/timeout */ "../../ts-concurrency/src/timeout.ts");
/* harmony import */ var _src_asyncexe__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/asyncexe */ "../../ts-concurrency/src/asyncexe.ts");







/***/ }),

/***/ "../../ts-concurrency/src/asyncexe.ts":
/*!********************************************!*\
  !*** ../../ts-concurrency/src/asyncexe.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "asyncExe": () => (/* binding */ asyncExe)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function asyncExe(exe) {
    // ignore return
    new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        yield exe();
        resolve();
    }));
}


/***/ }),

/***/ "../../ts-concurrency/src/channel.ts":
/*!*******************************************!*\
  !*** ../../ts-concurrency/src/channel.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Channel": () => (/* binding */ Channel),
/* harmony export */   "ChannelClosed": () => (/* binding */ ChannelClosed)
/* harmony export */ });
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./queue */ "../../ts-concurrency/src/queue.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ChannelClosed {
    constructor(m) {
        this.name = "ChannelClosed";
        this.message = m;
    }
}

class Channel {
    constructor(max = 0) {
        this.data = new _queue__WEBPACK_IMPORTED_MODULE_0__.queue;
        this.sendSuspend = new _queue__WEBPACK_IMPORTED_MODULE_0__.queue();
        this.receiveSuspend = new _queue__WEBPACK_IMPORTED_MODULE_0__.queue();
        this.closed = null;
        this.max = max;
    }
    Close(reason) {
        this.closed = new ChannelClosed(reason ? reason : "");
        for (let s = this.sendSuspend.de(); s != null; s = this.sendSuspend.de()) {
            s[1](this.closed);
        }
        for (let r = this.receiveSuspend.de(); r != null; r = this.receiveSuspend.de()) {
            r(this.closed);
        }
    }
    Send(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed != null) {
                return this.closed;
            }
            let rfun = this.receiveSuspend.de();
            if (this.data.count >= this.max && rfun == null) {
                return new Promise((resolve) => {
                    this.sendSuspend.en([e, resolve]);
                });
            }
            // rfun != nil: data is empty
            if (rfun != null) {
                rfun(e);
                return null;
            }
            // rfun == nil && data.count < max: max != 0
            this.data.en(e);
            return null;
        });
    }
    ReceiveOrFailed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed != null) {
                return this.closed;
            }
            let value = this.data.de();
            let suspend = this.sendSuspend.de();
            if (value == null && suspend == null) {
                return new Promise((resolve) => {
                    this.receiveSuspend.en(resolve);
                });
            }
            // value != nil: max != 0
            if (value != null) {
                if (suspend != null) {
                    let [v, sfun] = suspend;
                    this.data.en(v);
                    sfun(null);
                }
                return value;
            }
            // value == nil && suspend != nil: max == 0
            let [v, sfun] = suspend;
            sfun(null);
            return v;
        });
    }
    Receive() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.ReceiveOrFailed();
            if (r instanceof ChannelClosed) {
                return null;
            }
            return r;
        });
    }
}


/***/ }),

/***/ "../../ts-concurrency/src/mutex.ts":
/*!*****************************************!*\
  !*** ../../ts-concurrency/src/mutex.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mutex": () => (/* binding */ Mutex)
/* harmony export */ });
/* harmony import */ var _semaphore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./semaphore */ "../../ts-concurrency/src/semaphore.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

class Mutex {
    constructor() {
        this.sem = new _semaphore__WEBPACK_IMPORTED_MODULE_0__.Semaphore(1);
    }
    Lock() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sem.Acquire();
        });
    }
    Unlock() {
        this.sem.Release();
    }
    withLock(exe) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Lock();
            try {
                return yield exe();
            }
            finally {
                this.Unlock();
            }
        });
    }
}


/***/ }),

/***/ "../../ts-concurrency/src/queue.ts":
/*!*****************************************!*\
  !*** ../../ts-concurrency/src/queue.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "node": () => (/* binding */ node),
/* harmony export */   "queue": () => (/* binding */ queue)
/* harmony export */ });
class node {
    constructor(e) {
        this.isValid = true;
        this.next = null;
        this.element = e;
    }
    inValid() {
        this.isValid = false;
    }
}
class queue {
    constructor() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }
    en(e) {
        let newNode = new node(e);
        if (this.last == null) {
            this.last = newNode;
            this.first = this.last;
            this.count += 1;
            return newNode;
        }
        this.last.next = newNode;
        this.last = this.last.next;
        this.count += 1;
        return newNode;
    }
    de() {
        while (this.first != null && !this.first.isValid) {
            this.first = this.first.next;
            this.count -= 1;
        }
        if (this.first == null) {
            return null;
        }
        let ret = this.first.element;
        this.first = this.first.next;
        if (this.first == null) {
            this.last = null;
        }
        this.count -= 1;
        return ret;
    }
}


/***/ }),

/***/ "../../ts-concurrency/src/semaphore.ts":
/*!*********************************************!*\
  !*** ../../ts-concurrency/src/semaphore.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Semaphore": () => (/* binding */ Semaphore)
/* harmony export */ });
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./queue */ "../../ts-concurrency/src/queue.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


class Semaphore {
    constructor(max) {
        this.acquiredSuspend = new _queue__WEBPACK_IMPORTED_MODULE_0__.queue;
        this.current = 0;
        this.max = max > 1 ? max : 1;
    }
    Acquire() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.current < this.max) {
                this.current += 1;
                return;
            }
            return new Promise((resolve) => {
                this.acquiredSuspend.en(resolve);
            });
        });
    }
    Release() {
        let d = this.acquiredSuspend.de();
        if (d != null) {
            d();
            return;
        }
        // de() == nil
        this.current -= 1;
        (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.assert)(this.current >= 0);
    }
    ReleaseAll() {
        for (let d = this.acquiredSuspend.de(); d != null; d = this.acquiredSuspend.de()) {
            d();
        }
        this.current = 0;
    }
}


/***/ }),

/***/ "../../ts-concurrency/src/timeout.ts":
/*!*******************************************!*\
  !*** ../../ts-concurrency/src/timeout.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Timeout": () => (/* binding */ Timeout),
/* harmony export */   "withTimeout": () => (/* binding */ withTimeout)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

class Timeout {
    constructor(d) {
        this.name = "Timeout";
        this.message = `timeout: ${d / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Millisecond}ms`;
    }
}
function withTimeout(d, exe) {
    return __awaiter(this, void 0, void 0, function* () {
        let timer;
        let timePro = new Promise((resolve) => {
            timer = setTimeout(() => {
                resolve(new Timeout(d));
            }, d / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Millisecond);
        });
        let ret = yield Promise.race([exe(), timePro]);
        clearTimeout(timer);
        return ret;
    });
}


/***/ }),

/***/ "../index.ts":
/*!*******************!*\
  !*** ../index.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractWebSocketDriver": () => (/* reexport safe */ _src_websocket__WEBPACK_IMPORTED_MODULE_1__.AbstractWebSocketDriver),
/* harmony export */   "BrowserWs": () => (/* reexport safe */ _src_browserws__WEBPACK_IMPORTED_MODULE_3__.BrowserWs),
/* harmony export */   "Client": () => (/* reexport safe */ _src_client__WEBPACK_IMPORTED_MODULE_0__.Client),
/* harmony export */   "ConnTimeoutErr": () => (/* reexport safe */ _src_error__WEBPACK_IMPORTED_MODULE_2__.ConnTimeoutErr),
/* harmony export */   "ElseConnErr": () => (/* reexport safe */ _src_error__WEBPACK_IMPORTED_MODULE_2__.ElseConnErr),
/* harmony export */   "ElseErr": () => (/* reexport safe */ _src_error__WEBPACK_IMPORTED_MODULE_2__.ElseErr),
/* harmony export */   "ElseTimeoutErr": () => (/* reexport safe */ _src_error__WEBPACK_IMPORTED_MODULE_2__.ElseTimeoutErr),
/* harmony export */   "Result": () => (/* reexport safe */ _src_client__WEBPACK_IMPORTED_MODULE_0__.Result),
/* harmony export */   "WebSocketProtocol": () => (/* reexport safe */ _src_websocket__WEBPACK_IMPORTED_MODULE_1__.WebSocketProtocol),
/* harmony export */   "withBrowser": () => (/* reexport safe */ _src_browserws__WEBPACK_IMPORTED_MODULE_3__.withBrowser)
/* harmony export */ });
/* harmony import */ var _src_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/client */ "../src/client.ts");
/* harmony import */ var _src_websocket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/websocket */ "../src/websocket.ts");
/* harmony import */ var _src_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/error */ "../src/error.ts");
/* harmony import */ var _src_browserws__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/browserws */ "../src/browserws.ts");






/***/ }),

/***/ "../node_modules/ts-json/index.ts":
/*!****************************************!*\
  !*** ../node_modules/ts-json/index.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClassArray": () => (/* reexport safe */ _src_class__WEBPACK_IMPORTED_MODULE_2__.ClassArray),
/* harmony export */   "Json": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.Json),
/* harmony export */   "JsonHas": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.JsonHas),
/* harmony export */   "JsonKey": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.JsonKey),
/* harmony export */   "RawJson": () => (/* reexport safe */ _src_coder__WEBPACK_IMPORTED_MODULE_1__.RawJson)
/* harmony export */ });
/* harmony import */ var _src_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/json */ "../node_modules/ts-json/src/json.ts");
/* harmony import */ var _src_coder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/coder */ "../node_modules/ts-json/src/coder.ts");
/* harmony import */ var _src_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/class */ "../node_modules/ts-json/src/class.ts");



// export {ProNullable, PropertyMustNullable, asNonNull} from "./type"


/***/ }),

/***/ "../node_modules/ts-json/src/class.ts":
/*!********************************************!*\
  !*** ../node_modules/ts-json/src/class.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClassArray": () => (/* binding */ ClassArray),
/* harmony export */   "canRecEmptyArray": () => (/* binding */ canRecEmptyArray),
/* harmony export */   "getArrayItemPrototype": () => (/* binding */ getArrayItemPrototype),
/* harmony export */   "isClass": () => (/* binding */ isClass),
/* harmony export */   "isClassArray": () => (/* binding */ isClassArray),
/* harmony export */   "isPrimitive": () => (/* binding */ isPrimitive),
/* harmony export */   "isPrimitiveArray": () => (/* binding */ isPrimitiveArray)
/* harmony export */ });
class ClassArray extends Array {
    constructor(prototype) {
        super();
        // tsbug: 编译为es5后，内建类型继承的原型链会发生错误改变。
        Object.setPrototypeOf(this, ClassArray.prototype);
        if (typeof prototype === "function") {
            this.itemPrototype = new prototype();
        }
        else {
            this.itemPrototype = prototype;
        }
        Object.defineProperty(this, "itemPrototype", { enumerable: false });
    }
    newItem() {
        return this.itemPrototype;
    }
}
function getArrayItemPrototype(arr) {
    if (arr instanceof ClassArray) {
        return arr.newItem();
    }
    return arr[0];
}
function isClassArray(arg) {
    return arg !== null && typeof arg === "object" && (arg instanceof ClassArray
        || arg instanceof Array && arg.length !== 0 && isClass(arg[0]));
}
function isClass(arg) {
    return arg !== null && typeof arg === "object" && !(arg instanceof Array);
}
function isPrimitive(arg) {
    return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean";
}
function canRecEmptyArray(arg) {
    return typeof arg === "object" && arg instanceof Array;
}
function isPrimitiveArray(arg) {
    return typeof arg === "object" && arg instanceof Array && !(arg instanceof ClassArray)
        && (arg.length === 0 || isPrimitive(arg[0]));
}


/***/ }),

/***/ "../node_modules/ts-json/src/coder.ts":
/*!********************************************!*\
  !*** ../node_modules/ts-json/src/coder.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RawJson": () => (/* binding */ RawJson),
/* harmony export */   "hasConstructorDecoder": () => (/* binding */ hasConstructorDecoder),
/* harmony export */   "hasConstructorEncoder": () => (/* binding */ hasConstructorEncoder),
/* harmony export */   "hasDecoder": () => (/* binding */ hasDecoder),
/* harmony export */   "hasEncoder": () => (/* binding */ hasEncoder)
/* harmony export */ });
class RawJson {
    constructor() {
        this.raw = null;
    }
    decodeJson(json) {
        this.raw = json;
        return null;
    }
    encodeJson() {
        return this.raw;
    }
}
function hasConstructorDecoder(constructor) {
    let con = constructor;
    return con.decodeJson !== undefined && typeof con.decodeJson === "function"
        && con.decodeJson.length === 1;
}
function hasConstructorEncoder(constructor) {
    let con = constructor;
    return con.encodeJson !== undefined && typeof con.encodeJson === "function"
        && con.encodeJson.length === 1;
}
function hasDecoder(self) {
    let sf = self;
    return sf.decodeJson !== undefined && typeof sf.decodeJson === "function"
        && sf.decodeJson.length === 1;
}
function hasEncoder(self) {
    let sf = self;
    return sf.encodeJson !== undefined && typeof sf.encodeJson === "function"
        && sf.encodeJson.length === 0;
}


/***/ }),

/***/ "../node_modules/ts-json/src/json.ts":
/*!*******************************************!*\
  !*** ../node_modules/ts-json/src/json.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Json": () => (/* binding */ Json),
/* harmony export */   "JsonHas": () => (/* binding */ JsonHas),
/* harmony export */   "JsonKey": () => (/* binding */ JsonKey)
/* harmony export */ });
/* harmony import */ var _class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./class */ "../node_modules/ts-json/src/class.ts");
/* harmony import */ var _coder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./coder */ "../node_modules/ts-json/src/coder.ts");
/* harmony import */ var _type__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./type */ "../node_modules/ts-json/src/type.ts");



const jsonToPropertySym = Symbol("from-json");
const propertyToJsonSym = Symbol("to-json");
// 清空原来的非对象(数组)值
// TODO: for in 目前查找的资料只是会遍历出可枚举的，同时查得对象的方法是不可枚举的，但是
// 这里出现了 for in 遍历出了对象的方法。（es5的浏览器环境出现此现象，其他编译方式与运行环境未验证）
// 所以这里加了“冗余”的条件判断
function getPropertyKeys(instance) {
    let keys = [];
    for (let p in instance) {
        if (instance.hasOwnProperty(p) && instance.propertyIsEnumerable(p)) {
            keys.push(p);
        }
    }
    return keys;
}
function isPropertyKey(instance, key) {
    return instance.hasOwnProperty(key) && instance.propertyIsEnumerable(key);
}
const has = Symbol("has");
function JsonHas(arg) {
    if (arg.hasOwnProperty(has)) {
        return arg[has];
    }
    // 仅仅是补偿性逻辑，fromJson 返回的对象都已经设置了has
    let ret = {};
    for (let p in arg) {
        ret[p] = true;
    }
    Object.defineProperty(arg, has, { enumerable: false, value: ret, writable: false });
    return ret;
}
class Json {
    constructor() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return null; };
        this.disallowNull();
    }
    ignoreNull() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return null; };
        return this;
    }
    allowNull() {
        this.nullToJson = (p, key) => { p[key] = null; };
        this.fromNullJson = (p, key) => { p[key] = null; return null; };
        return this;
    }
    disallowNull() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return Error("can not null"); };
        return this;
    }
    toJson(instance) {
        let to = this.class2json(instance);
        return JSON.stringify(to);
    }
    class2json(from) {
        if ((0,_coder__WEBPACK_IMPORTED_MODULE_1__.hasEncoder)(from)) {
            return from.encodeJson();
        }
        if ((0,_coder__WEBPACK_IMPORTED_MODULE_1__.hasConstructorEncoder)(from.constructor)) {
            return from.constructor.encodeJson(from);
        }
        let property2jsonMap = from[propertyToJsonSym] || new Map();
        let to = {};
        for (let key of getPropertyKeys(from)) {
            let toKey = property2jsonMap.get(key) || key;
            if (toKey === "-") {
                continue;
            }
            let fromV = from[key];
            if (fromV === undefined) {
                continue;
            }
            if (fromV === null) {
                this.nullToJson(to, toKey);
                continue;
            }
            if ((0,_class__WEBPACK_IMPORTED_MODULE_0__.isClass)(fromV)) {
                to[toKey] = this.class2json(fromV);
                continue;
            }
            if ((0,_class__WEBPACK_IMPORTED_MODULE_0__.isClassArray)(fromV)) {
                let arr = [];
                for (let item of fromV) {
                    arr.push(this.class2json(item));
                }
                to[toKey] = arr;
                continue;
            }
            // 基本变量赋值
            to[toKey] = fromV;
        }
        return to;
    }
    fromJson(json, prototype) {
        if (typeof prototype === "function") {
            prototype = new prototype();
        }
        let jsonObj = json;
        if (typeof json === "string") {
            let par = JSON.parse(json);
            if (par === null || typeof par !== "object" || par instanceof Array) {
                return [prototype, new Error("json string must be '{...}'")];
            }
            jsonObj = par;
        }
        return this.json2class(jsonObj, prototype, prototype.constructor.name);
    }
    json2class(from, prototype, className) {
        if ((0,_coder__WEBPACK_IMPORTED_MODULE_1__.hasDecoder)(prototype)) {
            let err = prototype.decodeJson(from);
            return [prototype, err];
        }
        if ((0,_coder__WEBPACK_IMPORTED_MODULE_1__.hasConstructorDecoder)(prototype.constructor)) {
            return prototype.constructor.decodeJson(from);
        }
        let json2PropertyMap = prototype[jsonToPropertySym] || new Map();
        let property2jsonMap = prototype[propertyToJsonSym] || new Map();
        let hasSetKey = new Set();
        let hasValue = {};
        for (let key of getPropertyKeys(from)) {
            if (key === "-") {
                continue;
            }
            let toKey = json2PropertyMap.get(key) || key;
            if (property2jsonMap.get(toKey) === "-") {
                continue;
            }
            // class对象没有这项值，就跳过
            if (!isPropertyKey(prototype, toKey)) {
                continue;
            }
            hasSetKey.add(toKey);
            hasValue[toKey] = true;
            let propertyName = className + "." + toKey.toString();
            if (from[key] === null) {
                let err = this.fromNullJson(prototype, toKey);
                if (err) {
                    return [prototype, Error(propertyName + "---" + err.message)];
                }
                continue;
            }
            let fromV = from[key];
            let keyProto = prototype[toKey];
            let err = checkType(fromV, keyProto, propertyName);
            if (err !== null) {
                return [prototype, err];
            }
            if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonObjectArray)(fromV) && (0,_class__WEBPACK_IMPORTED_MODULE_0__.isClassArray)(keyProto)) {
                let item = (0,_class__WEBPACK_IMPORTED_MODULE_0__.getArrayItemPrototype)(keyProto);
                let retArr = new Array();
                for (let i = 0; i < fromV.length; ++i) {
                    let [ret, err] = this.json2class(fromV[i], item, propertyName + `[${i}]`);
                    if (err !== null) {
                        return [prototype, err];
                    }
                    retArr.push(ret);
                }
                prototype[toKey] = retArr;
                continue;
            }
            if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonObject)(fromV) && (0,_class__WEBPACK_IMPORTED_MODULE_0__.isClass)(keyProto)) {
                [prototype[toKey], err] = this.json2class(fromV, keyProto, propertyName);
                if (err !== null) {
                    return [prototype, err];
                }
                continue;
            }
            prototype[toKey] = fromV;
        }
        for (let key of getPropertyKeys(prototype)) {
            if (!hasSetKey.has(key)) {
                // (prototype as ProNullable<typeof prototype>)[key] = null
                hasValue[key] = false;
            }
        }
        Object.defineProperty(prototype, has, { enumerable: false, value: hasValue, writable: false });
        return [prototype, null];
    }
}
// '-' : ignore
function JsonKey(jsonKey, ...jsonKeys) {
    return (target, propertyKey) => {
        let targetSym = target;
        if (!targetSym[jsonToPropertySym]) {
            targetSym[jsonToPropertySym] = new Map();
        }
        targetSym[jsonToPropertySym].set(jsonKey, propertyKey);
        for (let key of jsonKeys) {
            targetSym[jsonToPropertySym].set(key, propertyKey);
        }
        if (!targetSym[propertyToJsonSym]) {
            targetSym[propertyToJsonSym] = new Map();
        }
        targetSym[propertyToJsonSym].set(propertyKey, jsonKey);
    };
}
/*
* todo:
* 普通的类
* 数组中的值的类型必须一致
* 数组中的值不能有null
* 不能有高维数组
* 数组中可以有类
*
* */
function checkType(fromV, property, className) {
    if (fromV === null) {
        return null;
    }
    if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonObject)(fromV) /* {} */ && !(0,_class__WEBPACK_IMPORTED_MODULE_0__.isClass)(property) /* not init by new XXX(...)*/) {
        return TypeError(`the json value is '{}', but the property of ${className} is not. 
        Please init the value with "new XXX(...)"`);
    }
    if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonObjectArray)(fromV) /* [{}] */ && !(0,_class__WEBPACK_IMPORTED_MODULE_0__.isClassArray)(property) /* not init by new ClassArray*/) {
        return TypeError(`the json value is '[{}]', but the property of ${className} is not. 
        Please init the value with "new ClassArray(clazz)"`);
    }
    // todo: check array element
    if (property === null || property === undefined) {
        return null;
    }
    if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonPrimitiveArray)(fromV) && !(0,_class__WEBPACK_IMPORTED_MODULE_0__.isPrimitiveArray)(property)) {
        return TypeError(`the json value is '[number|string|boolean]', but the property of ${className} is not. 
        Please init the value with "null or [xxx]"`);
    }
    // todo: check array element
    if ((0,_type__WEBPACK_IMPORTED_MODULE_2__.isJsonEmptyArray)(fromV) && !(0,_class__WEBPACK_IMPORTED_MODULE_0__.canRecEmptyArray)(property)) {
        return TypeError(`the json value is '[]', but the property of ${className} is not array type.`);
    }
    if (typeof fromV !== typeof property) {
        return TypeError(`the json value is "<${typeof fromV}>${fromV}", but the property of ${className} is '<${typeof property}>${property}'.
        Please init the value with "null or <${typeof fromV}>"`);
    }
    return null;
}


/***/ }),

/***/ "../node_modules/ts-json/src/type.ts":
/*!*******************************************!*\
  !*** ../node_modules/ts-json/src/type.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "asNonNull": () => (/* binding */ asNonNull),
/* harmony export */   "isJsonArray": () => (/* binding */ isJsonArray),
/* harmony export */   "isJsonEmptyArray": () => (/* binding */ isJsonEmptyArray),
/* harmony export */   "isJsonObject": () => (/* binding */ isJsonObject),
/* harmony export */   "isJsonObjectArray": () => (/* binding */ isJsonObjectArray),
/* harmony export */   "isJsonPrimitive": () => (/* binding */ isJsonPrimitive),
/* harmony export */   "isJsonPrimitiveArray": () => (/* binding */ isJsonPrimitiveArray)
/* harmony export */ });
function isJsonArray(arg) {
    return arg !== null && typeof arg === "object" && arg instanceof Array;
}
function isJsonObject(arg) {
    return arg !== null && typeof arg === "object" && !(arg instanceof Array);
}
function isJsonObjectArray(arg) {
    return isJsonArray(arg) && arg.length === 1 && isJsonObject(arg[0]);
}
function isJsonPrimitive(arg) {
    return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean";
}
function isJsonEmptyArray(arg) {
    return isJsonArray(arg) && arg.length == 0;
}
function isJsonPrimitiveArray(arg) {
    return isJsonArray(arg) && arg.length !== 0 && isJsonPrimitive(arg[0]);
}
function asNonNull(arg) {
    return arg;
}


/***/ }),

/***/ "../src/browserws.ts":
/*!***************************!*\
  !*** ../src/browserws.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BrowserWs": () => (/* binding */ BrowserWs),
/* harmony export */   "withBrowser": () => (/* binding */ withBrowser)
/* harmony export */ });
/* harmony import */ var _websocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./websocket */ "../src/websocket.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");


class BrowserWs extends _websocket__WEBPACK_IMPORTED_MODULE_0__.AbstractWebSocketDriver {
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
    close(code, reason) {
        this.websocket.close(code, reason);
    }
    send(data) {
        this.websocket.send(data);
    }
}
function withBrowser(url, connectionTimeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_1__.Second) {
    return () => {
        return new _websocket__WEBPACK_IMPORTED_MODULE_0__.WebSocketProtocol(url, (url) => {
            return new BrowserWs(url);
        }, connectionTimeout);
    };
}


/***/ }),

/***/ "../src/client.ts":
/*!************************!*\
  !*** ../src/client.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Client": () => (/* binding */ Client),
/* harmony export */   "Result": () => (/* binding */ Result)
/* harmony export */ });
/* harmony import */ var _net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./net */ "../src/net.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-concurrency */ "../../ts-concurrency/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class Result {
    constructor(data = new ArrayBuffer(0)) {
        this.data = data;
    }
    toString() {
        return new ts_xutils__WEBPACK_IMPORTED_MODULE_1__.Utf8(this.data).toString();
    }
    utf8RawBuffer() {
        return this.data;
    }
}
class Client {
    constructor(protocolCreator, logger = ts_xutils__WEBPACK_IMPORTED_MODULE_1__.ConsoleLogger) {
        this.protocolCreator = protocolCreator;
        this.logger = logger;
        this.onPush = () => __awaiter(this, void 0, void 0, function* () { });
        this.onPeerClosed = () => __awaiter(this, void 0, void 0, function* () { });
        this.flag = (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.UniqFlag)();
        this.netMutex = new ts_concurrency__WEBPACK_IMPORTED_MODULE_2__.Mutex();
        logger.w.info(logger.f.Info(`Client[${this.flag}].new`, `flag=${this.flag}`));
        this.net_ = this.newNet();
    }
    newNet() {
        return new _net__WEBPACK_IMPORTED_MODULE_0__.Net(this.logger, this.protocolCreator, (err) => __awaiter(this, void 0, void 0, function* () {
            this.logger.w.warn(this.logger.f.Warn(`Client[${this.flag}].onPeerClosed`, `reason: ${err}`));
            yield this.onPeerClosed(err);
        }), (data) => __awaiter(this, void 0, void 0, function* () {
            this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].onPush`, `size: ${data.byteLength}`));
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
    Send(data, headers, timeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_1__.Second) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let sflag = (_a = headers.get(Client.reqidKey)) !== null && _a !== void 0 ? _a : (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.UniqFlag)();
            let utf8Data = new ts_xutils__WEBPACK_IMPORTED_MODULE_1__.Utf8(data);
            this.logger.w.info(this.logger.f.Info(`Client[${this.flag}].Send[${sflag}]:start`, `headers:${(0,_net__WEBPACK_IMPORTED_MODULE_0__.formatMap)(headers)}, request utf8 size = ${utf8Data.byteLength}`));
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
    SendWithReqId(data, headers, timeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_1__.Second) {
        return __awaiter(this, void 0, void 0, function* () {
            headers.set(Client.reqidKey, (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.UniqFlag)());
            return yield this.Send(data, headers, timeout);
        });
    }
}
Client.reqidKey = "X-Req-Id";


/***/ }),

/***/ "../src/error.ts":
/*!***********************!*\
  !*** ../src/error.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnTimeoutErr": () => (/* binding */ ConnTimeoutErr),
/* harmony export */   "ElseConnErr": () => (/* binding */ ElseConnErr),
/* harmony export */   "ElseErr": () => (/* binding */ ElseErr),
/* harmony export */   "ElseTimeoutErr": () => (/* binding */ ElseTimeoutErr),
/* harmony export */   "isStmError": () => (/* binding */ isStmError)
/* harmony export */ });
class StmErrorBase extends Error {
    toString() {
        return this.message;
    }
}
class ConnTimeoutErr extends StmErrorBase {
    constructor(m) {
        super();
        this.name = "ConnTimeoutErr";
        this.isConnErr = true;
        this.isTimeoutErr = true;
        this.message = m;
    }
    get toConnErr() {
        return this;
    }
}
class ElseConnErr extends StmErrorBase {
    constructor(m) {
        super();
        this.name = "ElseConnErr";
        this.isConnErr = true;
        this.isTimeoutErr = false;
        this.message = m;
    }
    get toConnErr() {
        return this;
    }
}
class ElseTimeoutErr extends StmErrorBase {
    constructor(m) {
        super();
        this.name = "ElseTimeoutErr";
        this.isConnErr = false;
        this.isTimeoutErr = true;
        this.message = m;
    }
    get toConnErr() {
        return new ElseConnErr(this.message);
    }
}
class ElseErr extends StmErrorBase {
    constructor(m, cause = null) {
        super();
        this.name = "ElseErr";
        this.isConnErr = false;
        this.isTimeoutErr = false;
        if (cause == null) {
            this.message = m;
        }
        else {
            this.message = `${m}, caused by ${cause.message}`;
        }
        this.cause = cause;
    }
    get toConnErr() {
        return new ElseConnErr(this.message);
    }
}
function isStmError(arg) {
    return arg instanceof StmErrorBase;
}


/***/ }),

/***/ "../src/fakehttp.ts":
/*!**************************!*\
  !*** ../src/fakehttp.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Request": () => (/* binding */ Request),
/* harmony export */   "Response": () => (/* binding */ Response),
/* harmony export */   "Status": () => (/* binding */ Status)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error */ "../src/error.ts");
/**

 content protocol:
   request ---
     reqid | headers | header-end-flag | data
     reqid: 4 bytes, net order;
     headers: < key-len | key | value-len | value > ... ;  [optional]
     key-len: 1 byte,  key-len = sizeof(key);
     value-len: 1 byte, value-len = sizeof(value);
     header-end-flag: 1 byte, === 0;
     data:       [optional]

      reqid = 1: client push ack to server.
            ack: no headers;
            data: pushId. 4 bytes, net order;

 ---------------------------------------------------------------------
   response ---
     reqid | status | data
     reqid: 4 bytes, net order;
     status: 1 byte, 0---success, 1---failed
     data: if status==success, data=<app data>    [optional]
     if status==failed, data=<error reason>


    reqid = 1: server push to client
        status: 0
          data: first 4 bytes --- pushId, net order;
                last --- real data

 */


class Request {
    constructor(buffer) {
        this.buffer = buffer;
    }
    get encodedData() { return this.buffer; }
    get loadLen() { return this.buffer.byteLength - 4; }
    SetReqId(id) {
        (new DataView(this.buffer)).setUint32(0, id);
    }
    static New(reqId, data, headers) {
        let len = 4;
        let headerArr = new Array();
        let err = null;
        headers.forEach((value, key, _) => {
            let utf8 = { key: new ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Utf8(key), value: new ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Utf8(value) };
            if (utf8.key.byteLength > 255 || utf8.value.byteLength > 255) {
                err = new _error__WEBPACK_IMPORTED_MODULE_1__.ElseErr(`key(${key})'s length or value(${value})'s length is more than 255`);
                return;
            }
            headerArr.push(utf8);
            len += 1 + utf8.key.byteLength + 1 + utf8.value.byteLength;
        });
        if (err != null) {
            return [new Request(new ArrayBuffer(0)), err];
        }
        let body = new ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Utf8(data);
        len += 1 + body.byteLength;
        let ret = new Request(new ArrayBuffer(len));
        ret.SetReqId(reqId);
        let pos = 4;
        for (let h of headerArr) {
            (new DataView(ret.buffer)).setUint8(pos, h.key.byteLength);
            pos++;
            (new Uint8Array(ret.buffer)).set(h.key.raw, pos);
            pos += h.key.byteLength;
            (new DataView(ret.buffer)).setUint8(pos, h.value.byteLength);
            pos++;
            (new Uint8Array(ret.buffer)).set(h.value.raw, pos);
            pos += h.value.byteLength;
        }
        (new DataView(ret.buffer)).setUint8(pos, 0);
        pos++;
        (new Uint8Array(ret.buffer)).set(body.raw, pos);
        return [ret, null];
    }
}
var Status;
(function (Status) {
    Status[Status["OK"] = 0] = "OK";
    Status[Status["Failed"] = 1] = "Failed";
})(Status || (Status = {}));
class Response {
    constructor(reqId, st, data, pushId = 0) {
        this.reqId = 0;
        this.reqId = reqId;
        this.status = st;
        this.data = data;
        this.pushId = pushId;
    }
    get isPush() {
        return this.reqId == 1;
    }
    newPushAck() {
        if (!this.isPush) {
            return [new ArrayBuffer(0), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseErr("invalid push data")];
        }
        let ret = new ArrayBuffer(4 + 1 + 4);
        let view = new DataView(ret);
        view.setUint32(0, 1);
        view.setUint8(4, 0);
        view.setUint32(5, this.pushId);
        return [ret, null];
    }
    static ZeroRes() {
        return new Response(0, Status.Failed, new ArrayBuffer(0));
    }
    static Parse(buffer) {
        if (buffer.byteLength < 5) {
            return [this.ZeroRes(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseErr("fakehttp protocol err(response.size < 5).")];
        }
        let view = new DataView(buffer);
        let reqId = view.getUint32(0);
        let status = view.getUint8(4) == 0 ? Status.OK : Status.Failed;
        let pushId = 0;
        let offset = 5;
        if (reqId == 1) {
            if (buffer.byteLength < offset + 4) {
                return [this.ZeroRes(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseErr("fakehttp protocol err(response.size of push < 9).")];
            }
            pushId = view.getUint32(offset);
            offset += 4;
        }
        let data = new ArrayBuffer(0);
        if (buffer.byteLength > offset) {
            data = new Uint8Array(buffer).slice(offset).buffer;
        }
        return [new Response(reqId, status, data, pushId), null];
    }
}
// reqid + status + pushid
Response.MaxNoLoadLen = 4 + 1 + 4;


/***/ }),

/***/ "../src/net.ts":
/*!*********************!*\
  !*** ../src/net.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Net": () => (/* binding */ Net),
/* harmony export */   "formatMap": () => (/* binding */ formatMap)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-concurrency */ "../../ts-concurrency/index.ts");
/* harmony import */ var _fakehttp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fakehttp */ "../src/fakehttp.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./error */ "../src/error.ts");
/* harmony import */ var _protocol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./protocol */ "../src/protocol.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





class SyncAllRequest {
    constructor(permits = 3) {
        this.allRequests = new Map();
        this.semaphore = new ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Semaphore(3);
        this.semaphore = new ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Semaphore(permits);
    }
    get permits() {
        return this.semaphore.max;
    }
    set permits(max) {
        this.semaphore = new ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Semaphore(max);
    }
    // channel 必须在 SyncAllRequest 的控制下，所以 Add 获取的只能 receive
    // 要 send 就必须通过 remove 获取
    Add(reqId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.semaphore.Acquire();
            let ch = new ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Channel(1);
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
    constructor(err) {
        this.err = err;
    }
    isEqual(other) {
        return other instanceof Invalidated;
    }
    isInvalidated() {
        return true;
    }
    toString() {
        return "Invalidated";
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
    constructor(logger, protoCreator, onPeerClosed, onPush) {
        this.logger = logger;
        this.onPeerClosed = onPeerClosed;
        this.onPush = onPush;
        this.handshake = new _protocol__WEBPACK_IMPORTED_MODULE_4__.Handshake();
        this.connLocker = new ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Mutex();
        this.state = new NotConnect;
        this.reqId = new ReqId();
        this.allRequests = new SyncAllRequest();
        this.flag = (0,ts_xutils__WEBPACK_IMPORTED_MODULE_0__.UniqFlag)();
        logger.w.debug(logger.f.Debug(`Net[${this.flag}].new`, `flag=${this.flag}`));
        this.proto = protoCreator();
        this.proto.logger = logger;
        this.proto.onError = (err) => __awaiter(this, void 0, void 0, function* () { yield this.onError(err); });
        this.proto.onMessage = (data) => __awaiter(this, void 0, void 0, function* () { yield this.onMessage(data); });
    }
    get connectID() {
        return this.handshake.ConnectId;
    }
    get isInvalid() {
        return this.state.isInvalidated();
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
            yield this.allRequests.ClearAllWith([_fakehttp__WEBPACK_IMPORTED_MODULE_2__.Response.ZeroRes(), err.toConnErr]);
            return old;
        });
    }
    onError(err) {
        return __awaiter(this, void 0, void 0, function* () {
            let old = yield this.closeAndOldState(err);
            if (old instanceof Connected) {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated"));
                    yield this.onPeerClosed(err);
                    yield this.proto.Close();
                }));
            }
        });
    }
    onMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let [response, err] = _fakehttp__WEBPACK_IMPORTED_MODULE_2__.Response.Parse(msg);
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
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.onPush(response.data);
                }));
                // ignore error
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
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
            (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
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
    send(data, headers, timeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second) {
        return __awaiter(this, void 0, void 0, function* () {
            // 预判断
            let ret = yield this.connLocker.withLock(() => __awaiter(this, void 0, void 0, function* () {
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:state`, `${this.state} --- headers:${formatMap(headers)}`));
                if (this.state.isInvalidated()) {
                    return this.state.err.toConnErr;
                }
                if (!(this.state instanceof Connected)) {
                    return new _error__WEBPACK_IMPORTED_MODULE_3__.ElseConnErr("not connected");
                }
                return null;
            }));
            if (ret) {
                return [new ArrayBuffer(0), ret];
            }
            let reqId = this.reqId.get();
            let [request, err] = _fakehttp__WEBPACK_IMPORTED_MODULE_2__.Request.New(reqId, data, headers);
            if (err) {
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:FakeHttpRequest`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: ${err}`));
                return [new ArrayBuffer(0), err];
            }
            if (request.loadLen > this.handshake.MaxBytes) {
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send:MaxBytes`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: data is Too Large`));
                return [new ArrayBuffer(0),
                    new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr(`request.size(${request.loadLen}) > MaxBytes(${this.handshake.MaxBytes})`)];
            }
            // 在客户端超时也认为是一个请求结束，但是真正的请求并没有结束，所以在服务器看来，仍然占用服务器的一个并发数
            // 因为网络异步的原因，客户端并发数不可能与服务器完全一样，所以这里主要是协助服务器做预控流，按照客户端的逻辑处理即可
            this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:request`, `headers:${formatMap(headers)} (reqId:${reqId})`));
            let ch = yield this.allRequests.Add(reqId);
            let ret2 = yield (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.withTimeout)(timeout, () => __awaiter(this, void 0, void 0, function* () {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let err = yield this.proto.Send(request.encodedData);
                    if (err) {
                        yield ((_a = this.allRequests.Remove(reqId)) === null || _a === void 0 ? void 0 : _a.Send([_fakehttp__WEBPACK_IMPORTED_MODULE_2__.Response.ZeroRes(), err]));
                    }
                }));
                let r = yield ch.Receive();
                if (r) {
                    return r;
                }
                return [_fakehttp__WEBPACK_IMPORTED_MODULE_2__.Response.ZeroRes(), new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr("channel is closed, exception!!!")];
            }));
            if (ret2 instanceof ts_concurrency__WEBPACK_IMPORTED_MODULE_1__.Timeout) {
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:Timeout`, `headers:${formatMap(headers)} (reqId:${reqId}) --- timeout(>${timeout / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second}s)`));
                return [new ArrayBuffer(0), new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr(`request timeout(${timeout / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second}s)`)];
            }
            if (ret2[1]) {
                return [new ArrayBuffer(0), ret2[1]];
            }
            this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:response`, `headers:${formatMap(headers)} (reqId:${reqId}) --- ${ret2[0].status}`));
            if (ret2[0].status != _fakehttp__WEBPACK_IMPORTED_MODULE_2__.Status.OK) {
                return [new ArrayBuffer(0), new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr(new ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Utf8(ret2[0].data).toString())];
            }
            yield this.allRequests.Remove(reqId);
            return [ret2[0].data, null];
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            let old = yield this.closeAndOldState(new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr("closed by self"));
            if (old instanceof Connected) {
                this.logger.w.debug(this.logger.f.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated"));
                yield this.proto.Close();
            }
        });
    }
}
function formatMap(map) {
    let ret = new Array();
    map.forEach((v, k) => {
        ret.push(k + ":" + v);
    });
    return "{" + ret.join(", ") + "}";
}


/***/ }),

/***/ "../src/protocol.ts":
/*!**************************!*\
  !*** ../src/protocol.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Handshake": () => (/* binding */ Handshake)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");

/**
 *
 * 上层的调用 Protocol 及响应 Delegate 的时序逻辑：
 *
 *                             +-----------------------------------+
 *                             |                                   |
 *                             |                                   v
 *     connect{1} --+--(true)--+---[.async]--->send{n} ------> close{1}
 *                  |          |                                   ^
 *           (false)|          |-------> onMessage                 |
 *                  |          |             |                     |
 *        <Unit>----+          |          (error) --- [.async] --->|
 *                             |                                   |
 *                             +--------> onError --- [.async] ----+
 *
 *
 *    Protocol.connect() 与 Protocol.close() 上层使用方确保只会调用 1 次
 *    Protocol.connect() 失败，不会请求/响应任何接口
 *    Protocol.send() 会异步并发地调用 n 次，Protocol.send() 执行的时长不会让调用方挂起等待
 *    在上层明确调用 Protocol.close() 后，才不会调用 Protocol.send()
 *    Delegate.onMessage() 失败 及 Delegate.onError() 会异步调用 Protocol.close()
 *
 *    连接成功后，任何不能继续通信的情况都以 Delegate.onError() 返回
 *    Delegate.close() 的调用不触发 Delegate.onError()
 *    Delegate.connect() 的错误不触发 Delegate.onError()
 *    Delegate.send() 仅返回本次 Delegate.send() 的错误，
 *       不是底层通信的错误，底层通信的错误通过 Delegate.onError() 返回
 *
 */
class Handshake {
    constructor() {
        this.HearBeatTime = Number.MAX_SAFE_INTEGER;
        this.FrameTimeout = Number.MAX_SAFE_INTEGER; // 同一帧里面的数据超时
        this.MaxConcurrent = Number.MAX_SAFE_INTEGER; // 一个连接上的最大并发
        this.MaxBytes = 10 * 1024 * 1024; // 一帧数据的最大字节数
        this.ConnectId = "---no_connectId---";
    }
    toString() {
        return `handshake info:{ConnectId: ${this.ConnectId}, MaxConcurrent: ${this.MaxConcurrent}, HearBeatTime: ${(0,ts_xutils__WEBPACK_IMPORTED_MODULE_0__.formatDuration)(this.HearBeatTime)}, MaxBytes/frame: ${this.MaxBytes}, FrameTimeout: ${(0,ts_xutils__WEBPACK_IMPORTED_MODULE_0__.formatDuration)(this.FrameTimeout)}}`;
    }
    static Parse(buffer) {
        (0,ts_xutils__WEBPACK_IMPORTED_MODULE_0__.assert)(buffer.byteLength >= Handshake.StreamLen);
        let ret = new Handshake();
        let view = new DataView(buffer);
        ret.HearBeatTime = view.getUint16(0) * ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second;
        ret.FrameTimeout = view.getUint8(2) * ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second;
        ret.MaxConcurrent = view.getUint8(3);
        ret.MaxBytes = view.getUint32(4);
        ret.ConnectId = ("00000000" + view.getUint32(8).toString(16)).slice(-8) +
            ("00000000" + view.getUint32(12).toString(16)).slice(-8);
        return ret;
    }
}
/**
 * ```
 * HeartBeat_s | FrameTimeout_s | MaxConcurrent | MaxBytes | connect id
 * HeartBeat_s: 2 bytes, net order
 * FrameTimeout_s: 1 byte
 * MaxConcurrent: 1 byte
 * MaxBytes: 4 bytes, net order
 * connect id: 8 bytes, net order
 * ```
 */
Handshake.StreamLen = 2 + 1 + 1 + 4 + 8;


/***/ }),

/***/ "../src/websocket.ts":
/*!***************************!*\
  !*** ../src/websocket.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractWebSocketDriver": () => (/* binding */ AbstractWebSocketDriver),
/* harmony export */   "WebSocketProtocol": () => (/* binding */ WebSocketProtocol)
/* harmony export */ });
/* harmony import */ var _protocol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./protocol */ "../src/protocol.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error */ "../src/error.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ts-concurrency */ "../../ts-concurrency/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class AbstractWebSocketDriver {
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
class WebSocketProtocol {
    constructor(url, driverCreator, connectTimeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_2__.Second) {
        this.url = url;
        this.driverCreator = driverCreator;
        this.connectTimeout = connectTimeout;
        this.logger_ = ts_xutils__WEBPACK_IMPORTED_MODULE_2__.ConsoleLogger;
        this.onMessage = () => __awaiter(this, void 0, void 0, function* () { });
        this.onError = () => __awaiter(this, void 0, void 0, function* () { });
        this.closeBySelf = false;
        this.handshake = new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake();
        this.flag = (0,ts_xutils__WEBPACK_IMPORTED_MODULE_2__.UniqFlag)();
        this.driver = new dummyWs();
        if (url.indexOf("s://") === -1) {
            this.url = "ws://" + url;
        }
    }
    get connectID() { return this.handshake.ConnectId; }
    get logger() {
        return this.logger_;
    }
    set logger(l) {
        this.logger_ = l;
        this.logger_.w.debug(this.logger_.f.Debug(`WebSocket[${this.flag}].new`, `flag=${this.flag}`));
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
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `${ev.code} ${ev.reason}`));
                    yield handshakeChannel.Send(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`closed: ${ev.code} ${ev.reason}`));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onclose`, `closed by peer: ${ev.code} ${ev.reason}`));
                    yield this.onError(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`closed by peer: ${ev.code} ${ev.reason}`));
                }));
            }
        };
        this.driver.onerror = (ev) => {
            if (isConnecting) {
                isConnecting = false;
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, ev.errMsg));
                    yield handshakeChannel.Send(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(ev.errMsg));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onerror`, `${ev.errMsg}`));
                    yield this.onError(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(ev.errMsg));
                }));
            }
        };
        this.driver.onmessage = (ev) => {
            if (typeof ev.data == "string") {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${this.flag}].onmessage:error`, "message type error"));
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.onError(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr("message type error"));
                }));
                return;
            }
            let data = ev.data;
            if (isConnecting) {
                isConnecting = false;
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    yield handshakeChannel.Send(data);
                }));
                return;
            }
            (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
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
            let handshakeChannel = new ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.Channel(1);
            this.createDriver(handshakeChannel);
            let handshake = yield (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.withTimeout)(this.connectTimeout, () => __awaiter(this, void 0, void 0, function* () {
                return yield handshakeChannel.Receive();
            }));
            if (handshake instanceof ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.Timeout) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "timeout"));
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ConnTimeoutErr("timeout")];
            }
            if ((0,_error__WEBPACK_IMPORTED_MODULE_1__.isStmError)(handshake)) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `${handshake}`));
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), handshake];
            }
            if (handshake == null) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, "channel closed"));
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr("channel closed")];
            }
            if (handshake.byteLength != _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake.StreamLen) {
                this.logger.w.debug(this.logger.f.Debug(`WebSocket[${(this.flag)}].Connect:error`, `handshake(${handshake.byteLength}) size error`));
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`handshake(${handshake.byteLength}) size error`)];
            }
            this.handshake = _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake.Parse(handshake);
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


/***/ }),

/***/ "../../ts-xutils/index.ts":
/*!********************************!*\
  !*** ../../ts-xutils/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AssertError": () => (/* reexport safe */ _src_assert__WEBPACK_IMPORTED_MODULE_3__.AssertError),
/* harmony export */   "ConsoleLogger": () => (/* reexport safe */ _src_logger__WEBPACK_IMPORTED_MODULE_2__.ConsoleLogger),
/* harmony export */   "Hour": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.Hour),
/* harmony export */   "Microsecond": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.Microsecond),
/* harmony export */   "Millisecond": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.Millisecond),
/* harmony export */   "Minute": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.Minute),
/* harmony export */   "RandomInt": () => (/* reexport safe */ _src_typefunc__WEBPACK_IMPORTED_MODULE_4__.RandomInt),
/* harmony export */   "Second": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.Second),
/* harmony export */   "UniqFlag": () => (/* reexport safe */ _src_typefunc__WEBPACK_IMPORTED_MODULE_4__.UniqFlag),
/* harmony export */   "Utf8": () => (/* reexport safe */ _src_utf8__WEBPACK_IMPORTED_MODULE_1__.Utf8),
/* harmony export */   "assert": () => (/* reexport safe */ _src_assert__WEBPACK_IMPORTED_MODULE_3__.assert),
/* harmony export */   "formatDuration": () => (/* reexport safe */ _src_duration__WEBPACK_IMPORTED_MODULE_0__.formatDuration)
/* harmony export */ });
/* harmony import */ var _src_duration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/duration */ "../../ts-xutils/src/duration.ts");
/* harmony import */ var _src_utf8__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/utf8 */ "../../ts-xutils/src/utf8.ts");
/* harmony import */ var _src_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/logger */ "../../ts-xutils/src/logger.ts");
/* harmony import */ var _src_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/assert */ "../../ts-xutils/src/assert.ts");
/* harmony import */ var _src_typefunc__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/typefunc */ "../../ts-xutils/src/typefunc.ts");







/***/ }),

/***/ "../../ts-xutils/src/assert.ts":
/*!*************************************!*\
  !*** ../../ts-xutils/src/assert.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AssertError": () => (/* binding */ AssertError),
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
class AssertError {
    constructor(m) {
        this.name = "AssertError";
        this.message = m;
    }
}
function assert(condition, msg = "") {
    if (!condition) {
        console.assert(condition, msg);
        throw new AssertError(msg);
    }
}


/***/ }),

/***/ "../../ts-xutils/src/duration.ts":
/*!***************************************!*\
  !*** ../../ts-xutils/src/duration.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hour": () => (/* binding */ Hour),
/* harmony export */   "Microsecond": () => (/* binding */ Microsecond),
/* harmony export */   "Millisecond": () => (/* binding */ Millisecond),
/* harmony export */   "Minute": () => (/* binding */ Minute),
/* harmony export */   "Second": () => (/* binding */ Second),
/* harmony export */   "formatDuration": () => (/* binding */ formatDuration)
/* harmony export */ });
const Microsecond = 1;
const Millisecond = 1000 * Microsecond;
const Second = 1000 * Millisecond;
const Minute = 60 * Second;
const Hour = 60 * Minute;
function formatDuration(d) {
    let ret = "";
    let left = d;
    let v = Math.floor(left / Hour);
    if (v != 0) {
        ret += `${v}h`;
        left -= v * Hour;
    }
    v = Math.floor(left / Minute);
    if (v != 0) {
        ret += `${v}min`;
        left -= v * Minute;
    }
    v = Math.floor(left / Second);
    if (v != 0) {
        ret += `${v}s`;
        left -= v * Second;
    }
    v = Math.floor(left / Millisecond);
    if (v != 0) {
        ret += `${v}ms`;
        left -= v * Millisecond;
    }
    v = Math.floor(left / Microsecond);
    if (v != 0) {
        ret += `${v}us`;
    }
    if (ret.length == 0) {
        ret = "0us";
    }
    return ret;
}


/***/ }),

/***/ "../../ts-xutils/src/logger.ts":
/*!*************************************!*\
  !*** ../../ts-xutils/src/logger.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConsoleLogger": () => (/* binding */ ConsoleLogger),
/* harmony export */   "TimeFormatter": () => (/* binding */ TimeFormatter)
/* harmony export */ });
class TimeFormatter {
    Debug(tag, msg) {
        return `${new Date().toISOString()} Debug: ${tag}  --->  ${msg}`;
    }
    Error(tag, msg) {
        return `${new Date().toISOString()} Error: ${tag}  --->  ${msg}`;
    }
    Info(tag, msg) {
        return `${new Date().toISOString()} Info: ${tag}  --->  ${msg}`;
    }
    Warn(tag, msg) {
        return `${new Date().toISOString()} Warn: ${tag}  --->  ${msg}`;
    }
}
const ConsoleLogger = {
    w: console,
    f: new TimeFormatter()
};
/**
 * 暂没有找到 console.debug/info/warn/error 类似 skip stack 的功能，无法对 console 方法做二次
 * 封装，否则 console 输出的文件名与行号都是二次封装文件的文件名与行号，不方便查看日志信息
 *  todo: 是否有其他可靠的方式做如下的替换?
 * Logger.Debug(tag, msg) => Logger.w.debug(Logger.f.Debug(tag, msg))
 *
 */


/***/ }),

/***/ "../../ts-xutils/src/typefunc.ts":
/*!***************************************!*\
  !*** ../../ts-xutils/src/typefunc.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RandomInt": () => (/* binding */ RandomInt),
/* harmony export */   "UniqFlag": () => (/* binding */ UniqFlag)
/* harmony export */ });
function RandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function UniqFlag() {
    return RandomInt(0x10000000, Number.MAX_SAFE_INTEGER).toString(16);
}


/***/ }),

/***/ "../../ts-xutils/src/utf8.ts":
/*!***********************************!*\
  !*** ../../ts-xutils/src/utf8.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Utf8": () => (/* binding */ Utf8)
/* harmony export */ });
class Utf8 {
    constructor(input) {
        this.indexes = new Array();
        if (typeof input !== "string") {
            this.raw = new Uint8Array(input);
            this.str = "";
            let utf8i = 0;
            while (utf8i < this.raw.length) {
                this.indexes.push(utf8i);
                let code = Utf8.loadUTF8CharCode(this.raw, utf8i);
                this.str += String.fromCodePoint(code);
                utf8i += Utf8.getUTF8CharLength(code);
            }
            this.indexes.push(utf8i); // end flag
        }
        else {
            this.str = input;
            let length = 0;
            for (let ch of input) {
                length += Utf8.getUTF8CharLength(ch.codePointAt(0));
            }
            this.raw = new Uint8Array(length);
            let index = 0;
            for (let ch of input) {
                this.indexes.push(index);
                index = Utf8.putUTF8CharCode(this.raw, ch.codePointAt(0), index);
            }
            this.indexes.push(index); // end flag
        }
        this.length = this.indexes.length - 1;
        this.byteLength = this.raw.byteLength;
    }
    static loadUTF8CharCode(aChars, nIdx) {
        let nLen = aChars.length, nPart = aChars[nIdx];
        return nPart > 251 && nPart < 254 && nIdx + 5 < nLen ?
            /* (nPart - 252 << 30) may be not safe in ECMAScript! So...: */
            /* six bytes */ (nPart - 252) * 1073741824 + (aChars[nIdx + 1] - 128 << 24)
                + (aChars[nIdx + 2] - 128 << 18) + (aChars[nIdx + 3] - 128 << 12)
                + (aChars[nIdx + 4] - 128 << 6) + aChars[nIdx + 5] - 128
            : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ?
                /* five bytes */ (nPart - 248 << 24) + (aChars[nIdx + 1] - 128 << 18)
                    + (aChars[nIdx + 2] - 128 << 12) + (aChars[nIdx + 3] - 128 << 6)
                    + aChars[nIdx + 4] - 128
                : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ?
                    /* four bytes */ (nPart - 240 << 18) + (aChars[nIdx + 1] - 128 << 12)
                        + (aChars[nIdx + 2] - 128 << 6) + aChars[nIdx + 3] - 128
                    : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ?
                        /* three bytes */ (nPart - 224 << 12) + (aChars[nIdx + 1] - 128 << 6)
                            + aChars[nIdx + 2] - 128
                        : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ?
                            /* two bytes */ (nPart - 192 << 6) + aChars[nIdx + 1] - 128
                            :
                                /* one byte */ nPart;
    }
    static putUTF8CharCode(aTarget, nChar, nPutAt) {
        let nIdx = nPutAt;
        if (nChar < 0x80 /* 128 */) {
            /* one byte */
            aTarget[nIdx++] = nChar;
        }
        else if (nChar < 0x800 /* 2048 */) {
            /* two bytes */
            aTarget[nIdx++] = 0xc0 /* 192 */ + (nChar >>> 6);
            aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
        }
        else if (nChar < 0x10000 /* 65536 */) {
            /* three bytes */
            aTarget[nIdx++] = 0xe0 /* 224 */ + (nChar >>> 12);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
        }
        else if (nChar < 0x200000 /* 2097152 */) {
            /* four bytes */
            aTarget[nIdx++] = 0xf0 /* 240 */ + (nChar >>> 18);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
        }
        else if (nChar < 0x4000000 /* 67108864 */) {
            /* five bytes */
            aTarget[nIdx++] = 0xf8 /* 248 */ + (nChar >>> 24);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
        }
        else /* if (nChar <= 0x7fffffff) */ { /* 2147483647 */
            /* six bytes */
            aTarget[nIdx++] = 0xfc /* 252 */ + /* (nChar >>> 30) may be not safe in ECMAScript! So...: */ (nChar / 1073741824);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 24) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
            aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
        }
        return nIdx;
    }
    ;
    static getUTF8CharLength(nChar) {
        return nChar < 0x80 ? 1 : nChar < 0x800 ? 2 : nChar < 0x10000
            ? 3 : nChar < 0x200000 ? 4 : nChar < 0x4000000 ? 5 : 6;
    }
    // private static loadUTF16CharCode(aChars: Uint16Array, nIdx: number): number {
    //
    //   /* UTF-16 to DOMString decoding algorithm */
    //   let nFrstChr = aChars[nIdx];
    //
    //   return nFrstChr > 0xD7BF /* 55231 */ && nIdx + 1 < aChars.length ?
    //     (nFrstChr - 0xD800 /* 55296 */ << 10) + aChars[nIdx + 1] + 0x2400 /* 9216 */
    //     : nFrstChr;
    // }
    //
    // private static putUTF16CharCode(aTarget: Uint16Array, nChar: number, nPutAt: number):number {
    //
    //   let nIdx = nPutAt;
    //
    //   if (nChar < 0x10000 /* 65536 */) {
    //     /* one element */
    //     aTarget[nIdx++] = nChar;
    //   } else {
    //     /* two elements */
    //     aTarget[nIdx++] = 0xD7C0 /* 55232 */ + (nChar >>> 10);
    //     aTarget[nIdx++] = 0xDC00 /* 56320 */ + (nChar & 0x3FF /* 1023 */);
    //   }
    //
    //   return nIdx;
    // }
    //
    // private static getUTF16CharLength(nChar: number): number {
    //   return nChar < 0x10000 ? 1 : 2;
    // }
    toString() {
        return this.str;
    }
    // Deprecated
    codePointAt(index) {
        return this.codeUnitAt(index);
    }
    codeUnitAt(index) {
        return this.raw.slice(this.indexes[index], this.indexes[index + 1]);
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "send": () => (/* binding */ send)
/* harmony export */ });
/* harmony import */ var ts_streamclient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-streamclient */ "../index.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "../../ts-xutils/index.ts");
/* harmony import */ var ts_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-json */ "../node_modules/ts-json/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



let client = null;
let url = "";
function headers(cache) {
    let ret = new Map();
    let key = "";
    key = $("#key1").val().trim();
    if (key !== "") {
        cache.key1 = key;
        cache.value1 = $("#value1").val().trim();
        ret.set(key, cache.value1);
    }
    else {
        cache.key1 = "";
        cache.value1 = "";
    }
    key = $("#key2").val().trim();
    if (key !== "") {
        cache.key2 = key;
        cache.value2 = $("#value2").val().trim();
        ret.set(key, cache.value2);
    }
    else {
        cache.key2 = "";
        cache.value2 = "";
    }
    key = $("#key3").val().trim();
    if (key !== "") {
        cache.key3 = key;
        cache.value3 = $("#value3").val().trim();
        ret.set(key, cache.value3);
    }
    else {
        cache.key3 = "";
        cache.value3 = "";
    }
    return ret;
}
function print(string) {
    let body = $("#output");
    body.append("<p>" + string + "</p>");
}
function printPush(string) {
    let body = $("#output");
    body.append("<p style='color: cadetblue'>" + string + "</p>");
}
function printError(string) {
    let body = $("#output");
    body.append("<p style='color: red'>" + string + "</p>");
}
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        let wss = $("#wss").val();
        if (client === null || url != wss) {
            url = wss;
            client = new ts_streamclient__WEBPACK_IMPORTED_MODULE_0__.Client((0,ts_streamclient__WEBPACK_IMPORTED_MODULE_0__.withBrowser)(url));
            client.onPush = (data) => __awaiter(this, void 0, void 0, function* () {
                printPush("push: " + data.toString());
            });
            client.onPeerClosed = (err) => __awaiter(this, void 0, void 0, function* () {
                printError(`${err}`);
            });
        }
        let cache = new Cache();
        cache.wss = url;
        cache.data = $("#post").val();
        $("#output").empty();
        let [ret, err] = yield client.SendWithReqId(cache.data, headers(cache));
        localStorage.setItem("last", JSON.stringify(cache));
        if (err !== null) {
            if (err.isConnErr) {
                printError(`conn-error: ${err}`);
            }
            else {
                printError(`resp-error: ${err}`);
            }
        }
        else {
            print("resp string: " + ret.toString() + "\n  ==>  to json: " + JSON.stringify(JSON.parse(ret.toString())));
            console.log("resp---json: ");
            console.log(JSON.parse(ret.toString()));
        }
    });
}
$("#send").on("click", () => __awaiter(void 0, void 0, void 0, function* () {
    yield send();
}));
class Cache {
    constructor() {
        this.wss = "";
        this.key1 = "";
        this.value1 = "";
        this.key2 = "";
        this.value2 = "";
        this.key3 = "";
        this.value3 = "";
        this.data = "";
    }
}
$(() => {
    let cacheS = localStorage.getItem("last");
    let cache;
    if (cacheS === null) {
        cache = new Cache();
    }
    else {
        cache = JSON.parse(cacheS);
    }
    $("#key1").attr("value", cache.key1);
    $("#value1").attr("value", cache.value1);
    $("#key2").attr("value", cache.key2);
    $("#value2").attr("value", cache.value2);
    $("#key3").attr("value", cache.key3);
    $("#value3").attr("value", cache.value3);
    $("#wss").attr("value", cache.wss);
    $("#post").val(cache.data);
});
class ReturnReq {
    constructor() {
        this.data = "";
    }
}
function initAttr() {
    $("#key1").attr("value", "api");
    $("#value1").attr("value", "");
    $("#key2").attr("value", "");
    $("#value2").attr("value", "");
    $("#key3").attr("value", "");
    $("#value3").attr("value", "");
    $("#wss").attr("value", "127.0.0.1:8001");
    $("#post").val("");
}
$("#return").on("click", () => __awaiter(void 0, void 0, void 0, function* () {
    initAttr();
    $("#value1").attr("value", "return");
    let req = new ReturnReq();
    req.data = (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.UniqFlag)();
    $("#post").val(new ts_json__WEBPACK_IMPORTED_MODULE_2__.Json().toJson(req));
}));
class PushReq {
    constructor() {
        this.times = 0;
        this.prefix = "";
    }
}
$("#push").on("click", () => __awaiter(void 0, void 0, void 0, function* () {
    initAttr();
    $("#value1").attr("value", "PushLt20Times");
    let req = new PushReq();
    req.times = 10;
    req.prefix = "this is a push test";
    $("#post").val(new ts_json__WEBPACK_IMPORTED_MODULE_2__.Json().toJson(req));
}));
$("#close").on("click", () => __awaiter(void 0, void 0, void 0, function* () {
    initAttr();
    $("#value1").attr("value", "close");
    $("#post").val("{}");
}));

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztzQkFDbkUsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztzQkFDOUQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO2dCQUN4QixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQy9DLGdCQUFnQixFQUFDLEtBQUssR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7MEJBQ2xFLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO29CQUN4RCxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQy9DLGlCQUFpQixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQzs4QkFDbkUsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO3dCQUN4QixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FB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QUFHLEdBQUcsSUFBSSxPQUFPLEVBQUU7SUFDdkIsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFO0lBQ2QsR0FBRyxDQUFDLE1BQU0sR0FBRyxxQkFBcUI7SUFDbEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlDQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxFQUFDO0FBRUYsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBUSxFQUFFO0lBQ2pDLFFBQVEsRUFBRTtJQUNWLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztJQUNuQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQUNyQixDQUFDLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLWNvbmN1cnJlbmN5L3NyYy9hc3luY2V4ZS50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvc3JjL2NoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLWNvbmN1cnJlbmN5L3NyYy9tdXRleC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvc3JjL3F1ZXVlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy1jb25jdXJyZW5jeS9zcmMvc2VtYXBob3JlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy1jb25jdXJyZW5jeS9zcmMvdGltZW91dC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9ub2RlX21vZHVsZXMvdHMtanNvbi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL3NyYy9jb2Rlci50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vbm9kZV9tb2R1bGVzL3RzLWpzb24vc3JjL2pzb24udHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL3NyYy90eXBlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvYnJvd3NlcndzLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvY2xpZW50LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvZXJyb3IudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL3NyYy9mYWtlaHR0cC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vc3JjL25ldC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vc3JjL3Byb3RvY29sLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvd2Vic29ja2V0LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLXh1dGlscy9zcmMvYXNzZXJ0LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvc3JjL2R1cmF0aW9uLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMteHV0aWxzL3NyYy90eXBlZnVuYy50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMteHV0aWxzL3NyYy91dGY4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7Q2hhbm5lbCwgQ2hhbm5lbENsb3NlZH0gZnJvbSBcIi4vc3JjL2NoYW5uZWxcIlxuZXhwb3J0IHR5cGUgeyBTZW5kQ2hhbm5lbCwgUmVjZWl2ZUNoYW5uZWwgfSBmcm9tIFwiLi9zcmMvY2hhbm5lbFwiO1xuXG5leHBvcnQge1NlbWFwaG9yZX0gZnJvbSBcIi4vc3JjL3NlbWFwaG9yZVwiXG5cbmV4cG9ydCB7TXV0ZXh9IGZyb20gXCIuL3NyYy9tdXRleFwiXG5cbmV4cG9ydCB7d2l0aFRpbWVvdXQsIFRpbWVvdXR9IGZyb20gXCIuL3NyYy90aW1lb3V0XCJcblxuZXhwb3J0IHthc3luY0V4ZX0gZnJvbSBcIi4vc3JjL2FzeW5jZXhlXCJcblxuIiwiXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNFeGUoZXhlOiAoKT0+UHJvbWlzZTx2b2lkPik6dm9pZCB7XG5cdC8vIGlnbm9yZSByZXR1cm5cblx0bmV3IFByb21pc2U8dm9pZD4oYXN5bmMgKHJlc29sdmUpID0+IHtcblx0XHRhd2FpdCBleGUoKVxuXHRcdHJlc29sdmUoKVxuXHR9KVxufVxuIiwiXG5leHBvcnQgY2xhc3MgQ2hhbm5lbENsb3NlZCBpbXBsZW1lbnRzIEVycm9yIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiQ2hhbm5lbENsb3NlZFwiXG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gbVxuXHR9XG59XG5cbmltcG9ydCB7cXVldWV9IGZyb20gXCIuL3F1ZXVlXCJcblxuZXhwb3J0IGludGVyZmFjZSBTZW5kQ2hhbm5lbDxFPiB7XG5cdFNlbmQoZTogRSk6IFByb21pc2U8Q2hhbm5lbENsb3NlZHxudWxsPlxuXHRDbG9zZShyZWFzb246IHN0cmluZyk6dm9pZFxuXHRDbG9zZSgpOnZvaWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWNlaXZlQ2hhbm5lbDxFPiB7XG5cdFJlY2VpdmVPckZhaWxlZCgpOiBQcm9taXNlPEV8Q2hhbm5lbENsb3NlZD5cblx0UmVjZWl2ZSgpOiBQcm9taXNlPEV8bnVsbD5cbn1cblxuZXhwb3J0IGNsYXNzIENoYW5uZWw8RT4gaW1wbGVtZW50cyBTZW5kQ2hhbm5lbDxFPiwgUmVjZWl2ZUNoYW5uZWw8RT4ge1xuXHRkYXRhOiBxdWV1ZTxFPiA9IG5ldyBxdWV1ZVxuXHRzZW5kU3VzcGVuZDogcXVldWU8W0UsIChyZXQ6IENoYW5uZWxDbG9zZWR8bnVsbCk9PnZvaWRdPiA9IG5ldyBxdWV1ZSgpXG5cdHJlY2VpdmVTdXNwZW5kOiBxdWV1ZTwodmFsdWU6IEV8Q2hhbm5lbENsb3NlZCk9PnZvaWQ+ID0gbmV3IHF1ZXVlKClcblx0bWF4OiBudW1iZXJcblx0Y2xvc2VkOiBDaGFubmVsQ2xvc2VkfG51bGwgPSBudWxsXG5cblx0Y29uc3RydWN0b3IobWF4OiBudW1iZXIgPSAwKSB7XG5cdFx0dGhpcy5tYXggPSBtYXhcblx0fVxuXG5cdENsb3NlKHJlYXNvbjogc3RyaW5nKTogdm9pZFxuXHRDbG9zZSgpOiB2b2lkXG5cdENsb3NlKHJlYXNvbj86IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuY2xvc2VkID0gbmV3IENoYW5uZWxDbG9zZWQocmVhc29uID8gcmVhc29uIDogXCJcIilcblx0XHRmb3IgKGxldCBzID0gdGhpcy5zZW5kU3VzcGVuZC5kZSgpOyBzICE9IG51bGw7IHMgPSB0aGlzLnNlbmRTdXNwZW5kLmRlKCkpIHtcblx0XHRcdHNbMV0odGhpcy5jbG9zZWQpXG5cdFx0fVxuXHRcdGZvciAobGV0IHIgPSB0aGlzLnJlY2VpdmVTdXNwZW5kLmRlKCk7IHIgIT0gbnVsbDsgciA9IHRoaXMucmVjZWl2ZVN1c3BlbmQuZGUoKSkge1xuXHRcdFx0cih0aGlzLmNsb3NlZClcblx0XHR9XG5cdH1cblxuXHRhc3luYyBTZW5kKGU6IEUpOiBQcm9taXNlPENoYW5uZWxDbG9zZWR8bnVsbD4ge1xuXHRcdGlmICh0aGlzLmNsb3NlZCAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9zZWRcblx0XHR9XG5cblx0XHRsZXQgcmZ1biA9IHRoaXMucmVjZWl2ZVN1c3BlbmQuZGUoKVxuXG5cdFx0aWYgKHRoaXMuZGF0YS5jb3VudCA+PSB0aGlzLm1heCAmJiByZnVuID09IG51bGwpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxDaGFubmVsQ2xvc2VkfG51bGw+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHRoaXMuc2VuZFN1c3BlbmQuZW4oW2UsIHJlc29sdmVdKVxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHQvLyByZnVuICE9IG5pbDogZGF0YSBpcyBlbXB0eVxuXHRcdGlmIChyZnVuICE9IG51bGwpIHtcblx0XHRcdHJmdW4oZSlcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Ly8gcmZ1biA9PSBuaWwgJiYgZGF0YS5jb3VudCA8IG1heDogbWF4ICE9IDBcblx0XHR0aGlzLmRhdGEuZW4oZSlcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0YXN5bmMgUmVjZWl2ZU9yRmFpbGVkKCk6IFByb21pc2U8RXxDaGFubmVsQ2xvc2VkPiB7XG5cdFx0aWYgKHRoaXMuY2xvc2VkICE9IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb3NlZFxuXHRcdH1cblxuXHRcdGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5kZSgpXG5cdFx0bGV0IHN1c3BlbmQgPSB0aGlzLnNlbmRTdXNwZW5kLmRlKClcblxuXHRcdGlmICh2YWx1ZSA9PSBudWxsICYmIHN1c3BlbmQgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPEV8Q2hhbm5lbENsb3NlZD4oKHJlc29sdmUpPT57XG5cdFx0XHRcdHRoaXMucmVjZWl2ZVN1c3BlbmQuZW4ocmVzb2x2ZSlcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Ly8gdmFsdWUgIT0gbmlsOiBtYXggIT0gMFxuXHRcdGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAoc3VzcGVuZCAhPSBudWxsKSB7XG5cdFx0XHRcdGxldCBbdiwgc2Z1bl0gPSBzdXNwZW5kXG5cdFx0XHRcdHRoaXMuZGF0YS5lbih2KVxuXHRcdFx0XHRzZnVuKG51bGwpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9XG5cblx0XHQvLyB2YWx1ZSA9PSBuaWwgJiYgc3VzcGVuZCAhPSBuaWw6IG1heCA9PSAwXG5cdFx0bGV0IFt2LCBzZnVuXSA9IHN1c3BlbmQhXG5cdFx0c2Z1bihudWxsKVxuXHRcdHJldHVybiB2XG5cdH1cblxuXHRhc3luYyBSZWNlaXZlKCk6IFByb21pc2U8RXxudWxsPiB7XG5cdFx0bGV0IHIgPSBhd2FpdCB0aGlzLlJlY2VpdmVPckZhaWxlZCgpXG5cdFx0aWYgKHIgaW5zdGFuY2VvZiBDaGFubmVsQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRyZXR1cm4gclxuXHR9XG59XG4iLCJpbXBvcnQge1NlbWFwaG9yZX0gZnJvbSBcIi4vc2VtYXBob3JlXCJcblxuXG5leHBvcnQgY2xhc3MgTXV0ZXgge1xuXHRzZW0gPSBuZXcgU2VtYXBob3JlKDEpXG5cblx0YXN5bmMgTG9jaygpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRhd2FpdCB0aGlzLnNlbS5BY3F1aXJlKClcblx0fVxuXG5cdFVubG9jaygpOiB2b2lkIHtcblx0XHR0aGlzLnNlbS5SZWxlYXNlKClcblx0fVxuXG5cdGFzeW5jIHdpdGhMb2NrPFI+KGV4ZTogKCk9PlByb21pc2U8Uj4pOiBQcm9taXNlPFI+IHtcblx0XHRhd2FpdCB0aGlzLkxvY2soKVxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgZXhlKClcblx0XHR9ZmluYWxseSB7XG5cdFx0XHR0aGlzLlVubG9jaygpXG5cdFx0fVxuXHR9XG59XG5cbiIsIlxuZXhwb3J0IGNsYXNzIG5vZGU8RT4ge1xuXHRpc1ZhbGlkOiBib29sZWFuID0gdHJ1ZVxuXHRlbGVtZW50OkVcblx0bmV4dDogbm9kZTxFPnxudWxsID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKGU6IEUpIHtcblx0XHR0aGlzLmVsZW1lbnQgPSBlXG5cdH1cblxuXHRpblZhbGlkKCkge1xuXHRcdHRoaXMuaXNWYWxpZCA9IGZhbHNlXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIHF1ZXVlPEU+IHtcblx0Zmlyc3Q6IG5vZGU8RT58bnVsbCA9IG51bGxcblx0bGFzdDogbm9kZTxFPnxudWxsID0gbnVsbFxuXHRjb3VudDogbnVtYmVyID0gMFxuXG5cdGVuKGU6IEUpOiBub2RlPEU+IHtcblx0XHRsZXQgbmV3Tm9kZSA9IG5ldyBub2RlKGUpXG5cblx0XHRpZiAodGhpcy5sYXN0ID09IG51bGwpIHtcblx0XHRcdHRoaXMubGFzdCA9IG5ld05vZGVcblx0XHRcdHRoaXMuZmlyc3QgPSB0aGlzLmxhc3Rcblx0XHRcdHRoaXMuY291bnQgKz0gMVxuXHRcdFx0cmV0dXJuIG5ld05vZGVcblx0XHR9XG5cblx0XHR0aGlzLmxhc3QubmV4dCA9IG5ld05vZGVcblx0XHR0aGlzLmxhc3QgPSB0aGlzLmxhc3QubmV4dFxuXHRcdHRoaXMuY291bnQgKz0gMVxuXHRcdHJldHVybiBuZXdOb2RlXG5cdH1cblxuXHRkZSgpOiBFfG51bGwge1xuXHRcdHdoaWxlICh0aGlzLmZpcnN0ICE9IG51bGwgJiYgIXRoaXMuZmlyc3QuaXNWYWxpZCkge1xuXHRcdFx0dGhpcy5maXJzdCA9IHRoaXMuZmlyc3QubmV4dFxuXHRcdFx0dGhpcy5jb3VudCAtPSAxXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZmlyc3QgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5maXJzdC5lbGVtZW50XG5cdFx0dGhpcy5maXJzdCA9IHRoaXMuZmlyc3QubmV4dFxuXG5cdFx0aWYgKHRoaXMuZmlyc3QgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sYXN0ID0gbnVsbFxuXHRcdH1cblxuXHRcdHRoaXMuY291bnQgLT0gMVxuXG5cdFx0cmV0dXJuIHJldFxuXHR9XG59XG5cbiIsImltcG9ydCB7cXVldWV9IGZyb20gXCIuL3F1ZXVlXCJcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwidHMteHV0aWxzXCJcblxuXG5leHBvcnQgY2xhc3MgU2VtYXBob3JlIHtcblx0YWNxdWlyZWRTdXNwZW5kOiBxdWV1ZTwoKSA9PiB2b2lkPiA9IG5ldyBxdWV1ZVxuXHRwdWJsaWMgbWF4OiBudW1iZXJcblx0cHVibGljIGN1cnJlbnQ6IG51bWJlciA9IDBcblxuXHRjb25zdHJ1Y3RvcihtYXg6IG51bWJlcikge1xuXHRcdHRoaXMubWF4ID0gbWF4ID4gMT8gbWF4IDogMVxuXHR9XG5cblx0YXN5bmMgQWNxdWlyZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5jdXJyZW50IDwgdGhpcy5tYXgpIHtcblx0XHRcdHRoaXMuY3VycmVudCArPSAxXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpPT57XG5cdFx0XHR0aGlzLmFjcXVpcmVkU3VzcGVuZC5lbihyZXNvbHZlKVxuXHRcdH0pXG5cdH1cblxuXHRSZWxlYXNlKCk6IHZvaWQge1xuXHRcdGxldCBkID0gdGhpcy5hY3F1aXJlZFN1c3BlbmQuZGUoKVxuXHRcdGlmIChkICE9IG51bGwpIHtcblx0XHRcdGQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gZGUoKSA9PSBuaWxcblx0XHR0aGlzLmN1cnJlbnQgLT0gMVxuXHRcdGFzc2VydCh0aGlzLmN1cnJlbnQgPj0gMClcblx0fVxuXG5cdFJlbGVhc2VBbGwoKTogdm9pZCB7XG5cdFx0Zm9yIChsZXQgZCA9IHRoaXMuYWNxdWlyZWRTdXNwZW5kLmRlKCk7IGQgIT0gbnVsbDsgZCA9IHRoaXMuYWNxdWlyZWRTdXNwZW5kLmRlKCkpIHtcblx0XHRcdGQoKVxuXHRcdH1cblx0XHR0aGlzLmN1cnJlbnQgPSAwXG5cdH1cbn1cblxuIiwiaW1wb3J0IHtEdXJhdGlvbiwgTWlsbGlzZWNvbmR9IGZyb20gXCJ0cy14dXRpbHNcIlxuXG5leHBvcnQgY2xhc3MgVGltZW91dCBpbXBsZW1lbnRzIEVycm9yIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiVGltZW91dFwiXG5cblx0Y29uc3RydWN0b3IoZDogRHVyYXRpb24pIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBgdGltZW91dDogJHtkL01pbGxpc2Vjb25kfW1zYFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoVGltZW91dDxSPihkOiBEdXJhdGlvbiwgZXhlOiAoKT0+UHJvbWlzZTxSPik6IFByb21pc2U8UnxUaW1lb3V0PiB7XG5cdGxldCB0aW1lclxuXHRsZXQgdGltZVBybyA9IG5ldyBQcm9taXNlPFRpbWVvdXQ+KChyZXNvbHZlKT0+e1xuXHRcdHRpbWVyID0gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0cmVzb2x2ZShuZXcgVGltZW91dChkKSlcblx0XHR9LCBkL01pbGxpc2Vjb25kKVxuXHR9KVxuXG5cdGxldCByZXQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW2V4ZSgpLCB0aW1lUHJvXSlcblx0Y2xlYXJUaW1lb3V0KHRpbWVyKVxuXHRyZXR1cm4gcmV0XG59XG5cbiIsIlxuZXhwb3J0IHtDbGllbnQsIFJlc3VsdH0gZnJvbSBcIi4vc3JjL2NsaWVudFwiXG5cbmV4cG9ydCB7QWJzdHJhY3RXZWJTb2NrZXREcml2ZXIsIFdlYlNvY2tldFByb3RvY29sfSBmcm9tIFwiLi9zcmMvd2Vic29ja2V0XCJcbmV4cG9ydCB0eXBlIHtcbiAgICBFdmVudCwgRXJyb3JFdmVudCwgQ2xvc2VFdmVudCwgTWVzc2FnZUV2ZW50LFxuICAgIFdlYlNvY2tldERyaXZlclxufSBmcm9tIFwiLi9zcmMvd2Vic29ja2V0XCJcblxuZXhwb3J0IHtFbHNlRXJyLCBFbHNlQ29ubkVyciwgQ29ublRpbWVvdXRFcnIsIEVsc2VUaW1lb3V0RXJyLCB0eXBlIFN0bUVycm9yfSBmcm9tIFwiLi9zcmMvZXJyb3JcIlxuXG5leHBvcnQge3dpdGhCcm93c2VyLCBCcm93c2VyV3N9IGZyb20gXCIuL3NyYy9icm93c2Vyd3NcIlxuXG5leHBvcnQgdHlwZSB7UHJvdG9jb2x9IGZyb20gXCIuL3NyYy9wcm90b2NvbFwiXG4iLCJcbmV4cG9ydCB7SnNvbiwgSnNvbktleSwgSnNvbkhhcywgdHlwZSBIYXN9IGZyb20gXCIuL3NyYy9qc29uXCJcblxuZXhwb3J0IHR5cGUge0pzb25EZWNvZGVyLCBKc29uRW5jb2RlLCBDb25zdHJ1Y3Rvckpzb25EZWNvZGVyLCBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyfSBmcm9tIFwiLi9zcmMvY29kZXJcIlxuXG5leHBvcnQge1Jhd0pzb259IGZyb20gXCIuL3NyYy9jb2RlclwiXG5cbmV4cG9ydCB7Q2xhc3NBcnJheX0gZnJvbSBcIi4vc3JjL2NsYXNzXCJcblxuZXhwb3J0IHR5cGUge0pzb25UeXBlLCBKc29uT2JqZWN0LCBKc29uUHJpbWl0aXZlLCBKc29uQXJyYXl9IGZyb20gXCIuL3NyYy90eXBlXCJcblxuLy8gZXhwb3J0IHtQcm9OdWxsYWJsZSwgUHJvcGVydHlNdXN0TnVsbGFibGUsIGFzTm9uTnVsbH0gZnJvbSBcIi4vdHlwZVwiXG4iLCJcbmV4cG9ydCBjbGFzcyBDbGFzc0FycmF5PFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06IFRbUF19PiBleHRlbmRzIEFycmF5PFQ+IHtcblxuICBjb25zdHJ1Y3Rvcihwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIHRzYnVnOiDnvJbor5HkuLplczXlkI7vvIzlhoXlu7rnsbvlnovnu6fmib/nmoTljp/lnovpk77kvJrlj5HnlJ/plJnor6/mlLnlj5jjgIJcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQ2xhc3NBcnJheS5wcm90b3R5cGUpO1xuXG4gICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5pdGVtUHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLml0ZW1Qcm90b3R5cGUgPSBwcm90b3R5cGVcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpdGVtUHJvdG90eXBlXCIsIHtlbnVtZXJhYmxlOiBmYWxzZX0pO1xuICB9XG5cbiAgcHVibGljIG5ld0l0ZW0oKTpUIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtUHJvdG90eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBpdGVtUHJvdG90eXBlOlQ7XG59XG5cbnR5cGUgTm90RW1wdHlBcnJheTxUPiA9IEFycmF5PFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcnJheUl0ZW1Qcm90b3R5cGU8VD4oYXJyOiBDbGFzc0FycmF5PFQ+fE5vdEVtcHR5QXJyYXk8VD4pOiBUe1xuICBpZiAoYXJyIGluc3RhbmNlb2YgQ2xhc3NBcnJheSkge1xuICAgIHJldHVybiBhcnIubmV3SXRlbSgpXG4gIH1cblxuICByZXR1cm4gYXJyWzBdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzQXJyYXk8VCBleHRlbmRzIG9iamVjdD4oYXJnOiBhbnkpOiBhcmcgaXMgQ2xhc3NBcnJheTxUPnxOb3RFbXB0eUFycmF5PFQ+IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIChhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5XG4gICAgfHwgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgYXJnLmxlbmd0aCAhPT0gMCAmJiBpc0NsYXNzKGFyZ1swXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzKGFyZzogYW55KTogYXJnIGlzIHtba2V5Om51bWJlcl06YW55fSB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnOiBhbnkpOiBhcmcgaXMgbnVtYmVyfHN0cmluZ3xib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgYXJnID09PSBcImJvb2xlYW5cIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUmVjRW1wdHlBcnJheTxUPihhcmc6IGFueSk6IGFyZyBpcyBBcnJheTxUPiB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUFycmF5PFQ+KGFyZzogYW55KTogYXJnIGlzIEFycmF5PFQ+IHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwib2JqZWN0XCIgJiYgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgIShhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5KVxuICAgICYmIChhcmcubGVuZ3RoID09PSAwIHx8IGlzUHJpbWl0aXZlKGFyZ1swXSkpXG59XG5cbiIsImltcG9ydCB7SnNvblR5cGV9IGZyb20gXCIuL3R5cGVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogW2FueSwgRXJyb3J8bnVsbF1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyIHtcbiAgZW5jb2RlSnNvbjxUPihpbnN0YW5jZTogVCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogRXJyb3J8bnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25FbmNvZGUge1xuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBjbGFzcyBSYXdKc29uIGltcGxlbWVudHMgSnNvbkRlY29kZXIsIEpzb25FbmNvZGV7XG4gIHB1YmxpYyByYXc6SnNvblR5cGUgPSBudWxsXG5cbiAgZGVjb2RlSnNvbihqc29uOiBKc29uVHlwZSk6IEVycm9yIHwgbnVsbCB7XG4gICAgdGhpcy5yYXcgPSBqc29uXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb25zdHJ1Y3RvckRlY29kZXIoY29uc3RydWN0b3I6IG9iamVjdCk6IGNvbnN0cnVjdG9yIGlzIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBsZXQgY29uID0gY29uc3RydWN0b3IgYXMgYW55IGFzIENvbnN0cnVjdG9ySnNvbkRlY29kZXJcbiAgcmV0dXJuIGNvbi5kZWNvZGVKc29uICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbi5kZWNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBjb24uZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NvbnN0cnVjdG9yRW5jb2Rlcihjb25zdHJ1Y3Rvcjogb2JqZWN0KTogY29uc3RydWN0b3IgaXMgQ29uc3RydWN0b3JKc29uRW5jb2RlciB7XG4gIGxldCBjb24gPSBjb25zdHJ1Y3RvciBhcyBhbnkgYXMgQ29uc3RydWN0b3JKc29uRW5jb2RlclxuICByZXR1cm4gY29uLmVuY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgY29uLmVuY29kZUpzb24gPT09IFwiZnVuY3Rpb25cIlxuICAgICYmIGNvbi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzRGVjb2RlcihzZWxmOiBvYmplY3QpOiBzZWxmIGlzIEpzb25EZWNvZGVyIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkRlY29kZXJcbiAgcmV0dXJuIHNmLmRlY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2YuZGVjb2RlSnNvbiA9PT0gXCJmdW5jdGlvblwiXG4gICAgJiYgc2YuZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0VuY29kZXIoc2VsZjogb2JqZWN0KTogc2VsZiBpcyBKc29uRW5jb2RlIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkVuY29kZVxuICByZXR1cm4gc2YuZW5jb2RlSnNvbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZi5lbmNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBzZi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMFxufVxuIiwiXG5cbmltcG9ydCB7XG4gIGNhblJlY0VtcHR5QXJyYXksXG4gIGdldEFycmF5SXRlbVByb3RvdHlwZSwgaXNDbGFzcywgaXNDbGFzc0FycmF5LCBpc1ByaW1pdGl2ZUFycmF5XG59IGZyb20gXCIuL2NsYXNzXCJcbmltcG9ydCB7aGFzQ29uc3RydWN0b3JEZWNvZGVyLCBoYXNDb25zdHJ1Y3RvckVuY29kZXIsIGhhc0RlY29kZXIsIGhhc0VuY29kZXJ9IGZyb20gXCIuL2NvZGVyXCJcbmltcG9ydCB7XG4gIGlzSnNvbkVtcHR5QXJyYXksXG4gIGlzSnNvbk9iamVjdCxcbiAgaXNKc29uT2JqZWN0QXJyYXksIGlzSnNvblByaW1pdGl2ZUFycmF5LFxuICBKc29uT2JqZWN0LFxuICBKc29uVHlwZSxcbn0gZnJvbSBcIi4vdHlwZVwiXG5cbmNvbnN0IGpzb25Ub1Byb3BlcnR5U3ltOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKFwiZnJvbS1qc29uXCIpO1xuY29uc3QgcHJvcGVydHlUb0pzb25TeW06IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woXCJ0by1qc29uXCIpO1xuLy8gY29uc3QganNvbkRlY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1kZWNvZGVyXCIpO1xuLy8gY29uc3QganNvbkVuY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1lbmNvZGVyXCIpO1xuXG50eXBlIEpzb25Ub1Byb3BlcnR5TWFwID0gTWFwPHN0cmluZywgc3RyaW5nfHN5bWJvbD5cbnR5cGUgUHJvcGVydHlUb0pzb25NYXAgPSBNYXA8c3RyaW5nfHN5bWJvbCwgc3RyaW5nPlxuXG5pbnRlcmZhY2UgQ29udmVydGVyTWFwIHtcbiAgW2pzb25Ub1Byb3BlcnR5U3ltXT86IEpzb25Ub1Byb3BlcnR5TWFwXG4gIFtwcm9wZXJ0eVRvSnNvblN5bV0/OiBQcm9wZXJ0eVRvSnNvbk1hcFxufVxuXG4vLyDmuIXnqbrljp/mnaXnmoTpnZ7lr7nosaEo5pWw57uEKeWAvFxuLy8gVE9ETzogZm9yIGluIOebruWJjeafpeaJvueahOi1hOaWmeWPquaYr+S8mumBjeWOhuWHuuWPr+aemuS4vueahO+8jOWQjOaXtuafpeW+l+WvueixoeeahOaWueazleaYr+S4jeWPr+aemuS4vueahO+8jOS9huaYr1xuLy8g6L+Z6YeM5Ye6546w5LqGIGZvciBpbiDpgY3ljoblh7rkuoblr7nosaHnmoTmlrnms5XjgILvvIhlczXnmoTmtY/op4jlmajnjq/looPlh7rnjrDmraTnjrDosaHvvIzlhbbku5bnvJbor5HmlrnlvI/kuI7ov5DooYznjq/looPmnKrpqozor4HvvIlcbi8vIOaJgOS7pei/memHjOWKoOS6huKAnOWGl+S9meKAneeahOadoeS7tuWIpOaWrVxuZnVuY3Rpb24gZ2V0UHJvcGVydHlLZXlzPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogKGtleW9mIFQpW117XG4gIGxldCBrZXlzOihrZXlvZiBUKVtdID0gW11cbiAgZm9yIChsZXQgcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmIChpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSAmJiBpbnN0YW5jZS5wcm9wZXJ0eUlzRW51bWVyYWJsZShwKSkge1xuICAgICAga2V5cy5wdXNoKHApXG4gICAgfVxuICB9XG4gIHJldHVybiBrZXlzXG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHlLZXk8VCBleHRlbmRzIG9iamVjdD4oaW5zdGFuY2U6IFQsIGtleTogc3RyaW5nfHN5bWJvbHxudW1iZXIpOiBrZXkgaXMga2V5b2YgVCB7XG4gIHJldHVybiBpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGluc3RhbmNlLnByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSlcbn1cblxuY29uc3QgaGFzID0gU3ltYm9sKFwiaGFzXCIpXG5cbi8vIHRvZG86IGdlbmVyaWMgZXJyb3I6IGZvciBleGFtcGxlICBjbGFzcyBhPFQ+e2Q6VH0gICAgaGFzPGE+ID89IHt9IG5vdCB7ZDpib29sZWFufVxuLy8gZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFQgYXMgKFRbUF0gZXh0ZW5kcyBGdW5jdGlvbiA/IG5ldmVyIDogUCldOiBib29sZWFufVxuZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFRdOiBib29sZWFufVxuXG5leHBvcnQgZnVuY3Rpb24gSnNvbkhhczxUIGV4dGVuZHMgb2JqZWN0Pihhcmc6IFQpOiBIYXM8VD4ge1xuICBpZiAoYXJnLmhhc093blByb3BlcnR5KGhhcykpIHtcbiAgICByZXR1cm4gKGFyZyBhcyBhbnkpW2hhc11cbiAgfVxuXG4gIC8vIOS7heS7heaYr+ihpeWBv+aAp+mAu+i+ke+8jGZyb21Kc29uIOi/lOWbnueahOWvueixoemDveW3sue7j+iuvue9ruS6hmhhc1xuICBsZXQgcmV0OntbcDogc3RyaW5nXTpib29sZWFufSA9IHt9XG4gIGZvciAobGV0IHAgaW4gYXJnKSB7XG4gICAgcmV0W3BdID0gdHJ1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyZywgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6cmV0LCB3cml0YWJsZTpmYWxzZX0pXG5cbiAgcmV0dXJuIHJldCBhcyBIYXM8VD5cbn1cblxuZXhwb3J0IGNsYXNzIEpzb24ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGlzYWxsb3dOdWxsKClcbiAgfVxuXG4gIHB1YmxpYyBpZ25vcmVOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChwLGtleSk9PnsocCBhcyBhbnkpW2tleV0gPSBudWxsfVxuICAgIHRoaXMuZnJvbU51bGxKc29uID0gKHAsa2V5KT0+eyhwIGFzIGFueSlba2V5XSA9IG51bGw7IHJldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgZGlzYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBFcnJvcihcImNhbiBub3QgbnVsbFwiKX1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHJpdmF0ZSBudWxsVG9Kc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PnZvaWQgPSAoXyxfMik9Pnt9XG4gIHByaXZhdGUgZnJvbU51bGxKc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PkVycm9yfG51bGwgPSAoXyxfMik9PntyZXR1cm4gbnVsbH1cblxuICBwdWJsaWMgdG9Kc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogc3RyaW5nIHtcblxuICAgIGxldCB0byA9IHRoaXMuY2xhc3MyanNvbihpbnN0YW5jZSk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG8pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGFzczJqc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGZyb206IFQpOiBKc29uVHlwZSB7XG4gICAgaWYgKGhhc0VuY29kZXIoZnJvbSkpIHtcbiAgICAgIHJldHVybiBmcm9tLmVuY29kZUpzb24oKVxuICAgIH1cbiAgICBpZiAoaGFzQ29uc3RydWN0b3JFbmNvZGVyKGZyb20uY29uc3RydWN0b3IpKSB7XG4gICAgICByZXR1cm4gZnJvbS5jb25zdHJ1Y3Rvci5lbmNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKGZyb20gYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuXG4gICAgbGV0IHRvOntba2V5OnN0cmluZ106YW55fSA9IHt9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gICAgICBsZXQgdG9LZXkgPSBwcm9wZXJ0eTJqc29uTWFwLmdldChrZXkgYXMgc3RyaW5nfHN5bWJvbCkgfHwga2V5IGFzIHN0cmluZztcbiAgICAgIGlmICh0b0tleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG5cbiAgICAgIGlmIChmcm9tViA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChmcm9tViA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLm51bGxUb0pzb24odG8sIHRvS2V5KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNDbGFzcyhmcm9tVikpIHtcbiAgICAgICAgdG9bdG9LZXldID0gdGhpcy5jbGFzczJqc29uKGZyb21WKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0NsYXNzQXJyYXkoZnJvbVYpKSB7XG4gICAgICAgIGxldCBhcnI6IEpzb25UeXBlW10gPSBbXVxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGZyb21WKSB7XG4gICAgICAgICAgYXJyLnB1c2godGhpcy5jbGFzczJqc29uKGl0ZW0pKVxuICAgICAgICB9XG4gICAgICAgIHRvW3RvS2V5XSA9IGFyclxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyDln7rmnKzlj5jph4/otYvlgLxcbiAgICAgIHRvW3RvS2V5XSA9IGZyb21WO1xuICAgIH1cblxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgcHVibGljIGZyb21Kc29uPFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06VFtQXX0+KGpzb246IEpzb25PYmplY3R8c3RyaW5nXG4gICAgLCBwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpOltULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwcm90b3R5cGUgPSBuZXcgcHJvdG90eXBlKCk7XG4gICAgfVxuXG4gICAgbGV0IGpzb25PYmogOkpzb25PYmplY3QgPSBqc29uIGFzIEpzb25PYmplY3RcbiAgICBpZiAodHlwZW9mIGpzb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGxldCBwYXIgPSBKU09OLnBhcnNlKGpzb24pXG4gICAgICBpZiAocGFyID09PSBudWxsIHx8IHR5cGVvZiBwYXIgIT09IFwib2JqZWN0XCIgfHwgcGFyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFtwcm90b3R5cGUsIG5ldyBFcnJvcihcImpzb24gc3RyaW5nIG11c3QgYmUgJ3suLi59J1wiKV1cbiAgICAgIH1cblxuICAgICAganNvbk9iaiA9IHBhclxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmpzb24yY2xhc3MoanNvbk9iaiwgcHJvdG90eXBlLCBwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZSlcbiAgfVxuXG4gIHByaXZhdGUganNvbjJjbGFzczxUIGV4dGVuZHMge1tuOm51bWJlcl06YW55fT4oZnJvbTogSnNvbk9iamVjdCwgcHJvdG90eXBlOiBUXG4gICAgLCBjbGFzc05hbWU6IHN0cmluZyk6IFtULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgfVxuICAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IGpzb24yUHJvcGVydHlNYXA6IEpzb25Ub1Byb3BlcnR5TWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW2pzb25Ub1Byb3BlcnR5U3ltXSB8fCBuZXcgTWFwKCk7XG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW3Byb3BlcnR5VG9Kc29uU3ltXSB8fCBuZXcgTWFwKCk7XG5cbiAgICBsZXQgaGFzU2V0S2V5ID0gbmV3IFNldDxrZXlvZiB0eXBlb2YgcHJvdG90eXBlPigpXG5cbiAgICBsZXQgaGFzVmFsdWU6e1twOiBzdHJpbmd8c3ltYm9sfG51bWJlcl06Ym9vbGVhbn0gPSB7fVxuXG4gICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhmcm9tKSkge1xuICAgICAgaWYgKGtleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuXG4gICAgICBpZiAocHJvcGVydHkyanNvbk1hcC5nZXQodG9LZXkgYXMgc3RyaW5nfHN5bWJvbCkgPT09IFwiLVwiKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGNsYXNz5a+56LGh5rKh5pyJ6L+Z6aG55YC877yM5bCx6Lez6L+HXG4gICAgICBpZiAoIWlzUHJvcGVydHlLZXkocHJvdG90eXBlLCB0b0tleSkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgICAgIGhhc1ZhbHVlW3RvS2V5XSA9IHRydWVcblxuICAgICAgbGV0IHByb3BlcnR5TmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAgICAgaWYgKGZyb21ba2V5XSA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZXJyID0gdGhpcy5mcm9tTnVsbEpzb24ocHJvdG90eXBlLCB0b0tleSlcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBFcnJvcihwcm9wZXJ0eU5hbWUgKyBcIi0tLVwiICsgZXJyLm1lc3NhZ2UpXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGxldCBmcm9tViA9IGZyb21ba2V5XVxuICAgICAgbGV0IGtleVByb3RvID0gcHJvdG90eXBlW3RvS2V5XVxuXG4gICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgcHJvcGVydHlOYW1lKVxuICAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpICYmIGlzQ2xhc3NBcnJheTx7W2tleTpudW1iZXJdOmFueX0+KGtleVByb3RvKSkge1xuICAgICAgICBsZXQgaXRlbSA9IGdldEFycmF5SXRlbVByb3RvdHlwZShrZXlQcm90bylcbiAgICAgICAgbGV0IHJldEFyciA9IG5ldyBBcnJheTx0eXBlb2YgaXRlbT4oKVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyb21WLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgbGV0IFtyZXQsIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVZbaV0sIGl0ZW0sIHByb3BlcnR5TmFtZSArIGBbJHtpfV1gKVxuICAgICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldEFyci5wdXNoKHJldClcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RvdHlwZVt0b0tleV0gPSByZXRBcnJcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBwcm9wZXJ0eU5hbWUpXG4gICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHByb3RvdHlwZVt0b0tleV0gPSBmcm9tVlxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBnZXRQcm9wZXJ0eUtleXMocHJvdG90eXBlKSkge1xuICAgICAgaWYgKCFoYXNTZXRLZXkuaGFzKGtleSkpIHtcbiAgICAgICAgLy8gKHByb3RvdHlwZSBhcyBQcm9OdWxsYWJsZTx0eXBlb2YgcHJvdG90eXBlPilba2V5XSA9IG51bGxcbiAgICAgICAgaGFzVmFsdWVba2V5XSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6aGFzVmFsdWUsIHdyaXRhYmxlOmZhbHNlfSlcblxuICAgIHJldHVybiBbcHJvdG90eXBlLCBudWxsXVxuICB9XG5cbiAgLy8gPFQgZXh0ZW5kcyBNdWxsPFQsIEV4Y2x1ZGU+LCBFeGNsdWRlID0gbmV2ZXI+XG4gIC8vIHB1YmxpYyBmcm9tSnNvbjI8VCBleHRlbmRzIHtbUCBpbiBrZXlvZiBUXTpUW1BdfT4oanNvbjogSnNvbk9iamVjdHxzdHJpbmdcbiAgLy8gICAsIHByb3RvdHlwZToge25ldyguLi5hcmdzOmFueVtdKTogVH18VCk6W1Byb051bGxhYmxlPFQ+LCBudWxsfEVycm9yXSB7XG4gIC8vXG4gIC8vICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAvLyAgICAgcHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQganNvbk9iaiA6SnNvbk9iamVjdCA9IGpzb24gYXMgSnNvbk9iamVjdFxuICAvLyAgIGlmICh0eXBlb2YganNvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgbGV0IHBhciA9IEpTT04ucGFyc2UoanNvbilcbiAgLy8gICAgIGlmIChwYXIgPT09IG51bGwgfHwgdHlwZW9mIHBhciAhPT0gXCJvYmplY3RcIiB8fCBwYXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgbmV3IEVycm9yKFwianNvbiBzdHJpbmcgbXVzdCBiZSAney4uLn0nXCIpXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAganNvbk9iaiA9IHBhclxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gdGhpcy5qc29uMmNsYXNzMihqc29uT2JqLCBwcm90b3R5cGUsIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lKVxuICAvLyB9XG4gIC8vXG4gIC8vIHByaXZhdGUganNvbjJjbGFzczI8VCBleHRlbmRzIHtbbjpudW1iZXJdOmFueX0+KGZyb206IEpzb25PYmplY3QsIHByb3RvdHlwZTogVFxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgY2xhc3NOYW1lOiBzdHJpbmcpOiBbUHJvTnVsbGFibGU8VD4sIG51bGx8RXJyb3JdIHtcbiAgLy9cbiAgLy8gICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gIC8vICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgLy8gICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gIC8vICAgfVxuICAvLyAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAvLyAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBqc29uMlByb3BlcnR5TWFwOiBKc29uVG9Qcm9wZXJ0eU1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtqc29uVG9Qcm9wZXJ0eVN5bV0gfHwgbmV3IE1hcCgpO1xuICAvLyAgIGxldCBwcm9wZXJ0eTJqc29uTWFwOiBQcm9wZXJ0eVRvSnNvbk1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuICAvL1xuICAvLyAgIGxldCBoYXNTZXRLZXkgPSBuZXcgU2V0PGtleW9mIHR5cGVvZiBwcm90b3R5cGU+KClcbiAgLy9cbiAgLy8gICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gIC8vICAgICBpZiAoa2V5ID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuICAvL1xuICAvLyAgICAgaWYgKHByb3BlcnR5Mmpzb25NYXAuZ2V0KHRvS2V5IGFzIHN0cmluZ3xzeW1ib2wpID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgLy8gY2xhc3Plr7nosaHmsqHmnInov5npobnlgLzvvIzlsLHot7Pov4dcbiAgLy8gICAgIGlmICghaXNQcm9wZXJ0eUtleShwcm90b3R5cGUsIHRvS2V5KSkge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgLy9cbiAgLy8gICAgIGlmIChmcm9tW2tleV0gPT09IG51bGwpIHtcbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IG51bGxcbiAgLy8gICAgICAgY29udGludWVcbiAgLy8gICAgIH1cbiAgLy9cbiAgLy8gICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAvL1xuICAvLyAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG4gIC8vICAgICBsZXQga2V5UHJvdG8gPSBwcm90b3R5cGVbdG9LZXldXG4gIC8vXG4gIC8vICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgY2xhc3NOYW1lKVxuICAvLyAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdEFycmF5KGZyb21WKSAmJiBpc0NsYXNzQXJyYXk8e1trZXk6bnVtYmVyXTphbnl9PihrZXlQcm90bykpIHtcbiAgLy8gICAgICAgbGV0IGl0ZW0gPSBnZXRBcnJheUl0ZW1Qcm90b3R5cGUoa2V5UHJvdG8pXG4gIC8vICAgICAgIGxldCByZXRBcnIgPSBuZXcgQXJyYXk8dHlwZW9mIGl0ZW0+KClcbiAgLy8gICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcm9tVi5sZW5ndGg7ICsraSkge1xuICAvLyAgICAgICAgIGxldCBbcmV0LCBlcnJdID0gdGhpcy5qc29uMmNsYXNzKGZyb21WW2ldLCBpdGVtLCBjbGFzc05hbWUgKyBgWyR7aX1dYClcbiAgLy8gICAgICAgICBpZiAoZXJyICE9PSBudWxsKSB7XG4gIC8vICAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgICByZXRBcnIucHVzaChyZXQpXG4gIC8vICAgICAgIH1cbiAgLy9cbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IHJldEFyclxuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgLy8gICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBjbGFzc05hbWUpXG4gIC8vICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgLy8gICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGNvbnRpbnVlXG4gIC8vICAgICB9XG4gIC8vXG4gIC8vICAgICBwcm90b3R5cGVbdG9LZXldID0gZnJvbVZcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhwcm90b3R5cGUpKSB7XG4gIC8vICAgICBpZiAoIWhhc1NldEtleS5oYXMoa2V5KSkge1xuICAvLyAgICAgICAocHJvdG90eXBlIGFzIFByb051bGxhYmxlPHR5cGVvZiBwcm90b3R5cGU+KVtrZXldID0gbnVsbFxuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gW3Byb3RvdHlwZSwgbnVsbF1cbiAgLy8gfVxufVxuXG4vLyAnLScgOiBpZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBKc29uS2V5KGpzb25LZXk6c3RyaW5nLCAuLi5qc29uS2V5czpzdHJpbmdbXSk6IFByb3BlcnR5RGVjb3JhdG9yIHtcbiAgcmV0dXJuICh0YXJnZXQ6IG9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZ3xzeW1ib2wpID0+IHtcblxuICAgIGxldCB0YXJnZXRTeW0gPSB0YXJnZXQgYXMgQ29udmVydGVyTWFwXG5cbiAgICBpZiAoIXRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0pIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0gPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGpzb25LZXksIHByb3BlcnR5S2V5KTtcbiAgICBmb3IgKGxldCBrZXkgb2YganNvbktleXMpIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGtleSwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIGlmICghdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSkge1xuICAgICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXS5zZXQocHJvcGVydHlLZXksIGpzb25LZXkpO1xuICB9XG59XG5cbi8qXG4qIHRvZG86XG4qIOaZrumAmueahOexu1xuKiDmlbDnu4TkuK3nmoTlgLznmoTnsbvlnovlv4XpobvkuIDoh7Rcbiog5pWw57uE5Lit55qE5YC85LiN6IO95pyJbnVsbFxuKiDkuI3og73mnInpq5jnu7TmlbDnu4Rcbiog5pWw57uE5Lit5Y+v5Lul5pyJ57G7XG4qXG4qICovXG5mdW5jdGlvbiBjaGVja1R5cGU8VD4oZnJvbVY6IEpzb25UeXBlXG4gICwgcHJvcGVydHk6IFRba2V5b2YgVF18bnVsbCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBFcnJvcnxudWxsIHtcblxuICBpZiAoZnJvbVYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgLyoge30gKi8gJiYgIWlzQ2xhc3MocHJvcGVydHkpIC8qIG5vdCBpbml0IGJ5IG5ldyBYWFgoLi4uKSovKSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ3t9JywgYnV0IHRoZSBwcm9wZXJ0eSBvZiAke2NsYXNzTmFtZX0gaXMgbm90LiBcbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJuZXcgWFhYKC4uLilcImApXG4gIH1cblxuICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpIC8qIFt7fV0gKi8gJiYgIWlzQ2xhc3NBcnJheShwcm9wZXJ0eSkgLyogbm90IGluaXQgYnkgbmV3IENsYXNzQXJyYXkqLyl7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ1t7fV0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm5ldyBDbGFzc0FycmF5KGNsYXp6KVwiYClcbiAgfVxuICAvLyB0b2RvOiBjaGVjayBhcnJheSBlbGVtZW50XG5cbiAgaWYgKHByb3BlcnR5ID09PSBudWxsIHx8IHByb3BlcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvblByaW1pdGl2ZUFycmF5KGZyb21WKSAmJiAhaXNQcmltaXRpdmVBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW251bWJlcnxzdHJpbmd8Ym9vbGVhbl0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm51bGwgb3IgW3h4eF1cImApXG4gIH1cbiAgLy8gdG9kbzogY2hlY2sgYXJyYXkgZWxlbWVudFxuXG4gIGlmIChpc0pzb25FbXB0eUFycmF5KGZyb21WKSAmJiAhY2FuUmVjRW1wdHlBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW10nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QgYXJyYXkgdHlwZS5gKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBmcm9tViAhPT0gdHlwZW9mIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgXCI8JHt0eXBlb2YgZnJvbVZ9PiR7ZnJvbVZ9XCIsIGJ1dCB0aGUgcHJvcGVydHkgb2YgJHtjbGFzc05hbWV9IGlzICc8JHt0eXBlb2YgcHJvcGVydHl9PiR7cHJvcGVydHl9Jy5cbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJudWxsIG9yIDwke3R5cGVvZiBmcm9tVn0+XCJgKVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuXG4iLCJpbXBvcnQge0pzb25EZWNvZGVyLCBSYXdKc29ufSBmcm9tIFwiLi9jb2RlclwiXG5cbmV4cG9ydCB0eXBlIEpzb25QcmltaXRpdmUgPSBudW1iZXJ8c3RyaW5nfGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IHtba2V5OnN0cmluZ106SnNvblR5cGV9XG5cbmV4cG9ydCB0eXBlIEpzb25BcnJheSA9IEpzb25UeXBlW11cblxuZXhwb3J0IHR5cGUgSnNvblR5cGUgPSBKc29uUHJpbWl0aXZlfEpzb25PYmplY3R8SnNvbkFycmF5fG51bGxcblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkFycmF5KGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvbkFycmF5IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0pzb25PYmplY3QoYXJnOiBKc29uVHlwZSkgOiBhcmcgaXMgSnNvbk9iamVjdCB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uT2JqZWN0QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uT2JqZWN0W10ge1xuICByZXR1cm4gIGlzSnNvbkFycmF5KGFyZykgJiYgYXJnLmxlbmd0aCA9PT0gMSAmJiBpc0pzb25PYmplY3QoYXJnWzBdKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlKGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvblByaW1pdGl2ZSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJib29sZWFuXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkVtcHR5QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBbXSB7XG4gIHJldHVybiBpc0pzb25BcnJheShhcmcpICYmIGFyZy5sZW5ndGggPT0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlQXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uUHJpbWl0aXZlW10ge1xuICByZXR1cm4gaXNKc29uQXJyYXkoYXJnKSAmJiBhcmcubGVuZ3RoICE9PSAwICYmIGlzSnNvblByaW1pdGl2ZShhcmdbMF0pXG59XG5cbmV4cG9ydCB0eXBlIEl0ZW08VHlwZT4gPSBUeXBlIGV4dGVuZHMgQXJyYXk8aW5mZXIgSXRlbT4gPyBJdGVtIDogbmV2ZXI7XG5cbnR5cGUgUHJpbWl0aXZlID0gbnVtYmVyfG51bGx8c3RyaW5nfHN5bWJvbHxib29sZWFuXG5cbnR5cGUgRmxhdHRlbjxUeXBlPiA9IFR5cGUgZXh0ZW5kcyBBcnJheTxpbmZlciBJdGVtPiA/IEl0ZW0gOiBUeXBlO1xuXG50eXBlIFJlY3Vyc2lvbkNoZWNrPFQsIEV4Y2x1ZGU+ID0gRXh0cmFjdENsYXNzPFQ+IGV4dGVuZHMgUHJvcGVydHlNdXN0TnVsbGFibGU8RXh0cmFjdENsYXNzPFQ+LCBFeGNsdWRlPiA/IFQgOiBuZXZlclxuXG50eXBlIEV4dHJhY3RDbGFzczxUPiA9IEV4Y2x1ZGU8RmxhdHRlbjxUPiwgUHJpbWl0aXZlPlxuXG50eXBlIElzRnVuY3Rpb248VD4gPSBUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSk9PmFueT8gdHJ1ZSA6IGZhbHNlXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eTxULCBFeGNsdWRlPiA9IG51bGwgZXh0ZW5kcyBUPyAoRmxhdHRlbjxUPiBleHRlbmRzIFByaW1pdGl2ZXxKc29uVHlwZXxKc29uRGVjb2Rlcj8gVFxuICAgIDogUmVjdXJzaW9uQ2hlY2s8VCwgRXhjbHVkZT4pIDogKFQgZXh0ZW5kcyBFeGNsdWRlID8gVCA6IG5ldmVyKVxuXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU11c3ROdWxsYWJsZTxULCBFeGNsdWRlID0gbmV2ZXI+ID0ge1xuICBbUCBpbiBrZXlvZiBUXTogSXNGdW5jdGlvbjxUW1BdPiBleHRlbmRzIHRydWU/IFRbUF0gOiBDaGVja1Byb3BlcnR5PFRbUF0sIEV4Y2x1ZGU+XG59XG5cbmV4cG9ydCB0eXBlIFByb051bGxhYmxlPFQ+ID0geyBbUCBpbiBrZXlvZiBUXTogVFtQXSBleHRlbmRzIEpzb25UeXBlIHwgUmF3SnNvbiA/IFRbUF18bnVsbCA6IFByb051bGxhYmxlPFRbUF0+fG51bGwgfVxuXG5leHBvcnQgZnVuY3Rpb24gYXNOb25OdWxsPFQ+KGFyZzogVCk6IE5vbk51bGxhYmxlPFQ+IHtcbiAgcmV0dXJuIGFyZyBhcyBOb25OdWxsYWJsZTxUPlxufVxuIiwiaW1wb3J0IHtBYnN0cmFjdFdlYlNvY2tldERyaXZlciwgV2ViU29ja2V0UHJvdG9jb2x9IGZyb20gXCIuL3dlYnNvY2tldFwiXG5pbXBvcnQge0R1cmF0aW9uLCBTZWNvbmR9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHtQcm90b2NvbH0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuXG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyV3MgZXh0ZW5kcyBBYnN0cmFjdFdlYlNvY2tldERyaXZlciB7XG5cdHByaXZhdGUgd2Vic29ja2V0OiBXZWJTb2NrZXQ7XG5cblx0Y2xvc2UoY29kZT86IG51bWJlciwgcmVhc29uPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy53ZWJzb2NrZXQuY2xvc2UoY29kZSwgcmVhc29uKVxuXHR9XG5cblx0c2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IHZvaWQge1xuXHRcdHRoaXMud2Vic29ja2V0LnNlbmQoZGF0YSlcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy53ZWJzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybClcblx0XHR0aGlzLndlYnNvY2tldC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiXG5cdFx0dGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IChldjogQ2xvc2VFdmVudCk9Pntcblx0XHRcdHRoaXMub25jbG9zZShldilcblx0XHR9XG5cdFx0dGhpcy53ZWJzb2NrZXQub25lcnJvciA9IChldjogRXZlbnQpPT57XG5cdFx0XHR0aGlzLm9uZXJyb3Ioe2Vyck1zZzogXCJCcm93c2VyV2ViU29ja2V0IG9uZXJyb3I6IFwiICsgZXYudG9TdHJpbmcoKX0pXG5cdFx0fVxuXHRcdHRoaXMud2Vic29ja2V0Lm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50KT0+e1xuXHRcdFx0dGhpcy5vbm1lc3NhZ2UoZXYpXG5cdFx0fVxuXHRcdHRoaXMud2Vic29ja2V0Lm9ub3BlbiA9IChldjogRXZlbnQpPT57XG5cdFx0XHR0aGlzLm9ub3Blbihldilcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCcm93c2VyKHVybDogc3RyaW5nLCBjb25uZWN0aW9uVGltZW91dDogRHVyYXRpb24gPSAzMCpTZWNvbmQpOiAoKT0+UHJvdG9jb2wge1xuXHRyZXR1cm4gKCk9Pntcblx0XHRyZXR1cm4gbmV3IFdlYlNvY2tldFByb3RvY29sKHVybCwgKHVybDpzdHJpbmcpPT57XG5cdFx0XHRyZXR1cm4gbmV3IEJyb3dzZXJXcyh1cmwpXG5cdFx0fSwgY29ubmVjdGlvblRpbWVvdXQpXG5cdH1cbn1cblxuIiwiXG5pbXBvcnQge2Zvcm1hdE1hcCwgTmV0fSBmcm9tIFwiLi9uZXRcIlxuaW1wb3J0IHtVdGY4LCBMb2dnZXIsIFVuaXFGbGFnLCBDb25zb2xlTG9nZ2VyLCBEdXJhdGlvbiwgU2Vjb25kfSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7U3RtRXJyb3J9IGZyb20gXCIuL2Vycm9yXCJcbmltcG9ydCB7UHJvdG9jb2x9IGZyb20gXCIuL3Byb3RvY29sXCJcbmltcG9ydCB7TXV0ZXh9IGZyb20gXCJ0cy1jb25jdXJyZW5jeVwiXG5cbmV4cG9ydCBjbGFzcyBSZXN1bHQge1xuICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVXRmOCh0aGlzLmRhdGEpLnRvU3RyaW5nKClcbiAgfVxuXG4gIHB1YmxpYyB1dGY4UmF3QnVmZmVyKCk6QXJyYXlCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGF0YTpBcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcigwKSkge1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDbGllbnQge1xuXHRwdWJsaWMgb25QdXNoOiAocmVzOlJlc3VsdCk9PlByb21pc2U8dm9pZD4gPSBhc3luYyAoKT0+e307XG5cdHB1YmxpYyBvblBlZXJDbG9zZWQ6IChlcnI6U3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+ID0gYXN5bmMgKCk9Pnt9O1xuXG5cdHByaXZhdGUgZmxhZyA9IFVuaXFGbGFnKClcblx0cHJpdmF0ZSBuZXRNdXRleDogTXV0ZXggPSBuZXcgTXV0ZXgoKVxuICBwcml2YXRlIG5ldF86IE5ldFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcHJvdG9jb2xDcmVhdG9yOiAoKT0+UHJvdG9jb2wsIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgPSBDb25zb2xlTG9nZ2VyKSB7XG4gICAgbG9nZ2VyLncuaW5mbyhsb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5uZXdgLCBgZmxhZz0ke3RoaXMuZmxhZ31gKSlcblx0XHR0aGlzLm5ldF8gPSB0aGlzLm5ld05ldCgpXG4gIH1cblxuXHRwcml2YXRlIG5ld05ldCgpOiBOZXQge1xuXHRcdHJldHVybiBuZXcgTmV0KHRoaXMubG9nZ2VyLCB0aGlzLnByb3RvY29sQ3JlYXRvciwgYXN5bmMgKGVycjogU3RtRXJyb3IpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci53Lndhcm4odGhpcy5sb2dnZXIuZi5XYXJuKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5vblBlZXJDbG9zZWRgLCBgcmVhc29uOiAke2Vycn1gKSlcblx0XHRcdGF3YWl0IHRoaXMub25QZWVyQ2xvc2VkKGVycilcblx0XHR9LCBhc3luYyAoZGF0YTogQXJyYXlCdWZmZXIpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci53LmluZm8odGhpcy5sb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5vblB1c2hgLCBgc2l6ZTogJHtkYXRhLmJ5dGVMZW5ndGh9YCkpXG5cdFx0XHRhd2FpdCB0aGlzLm9uUHVzaChuZXcgUmVzdWx0KGRhdGEpKVxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIG5ldCgpOiBQcm9taXNlPE5ldD4ge1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLm5ldE11dGV4LndpdGhMb2NrPE5ldD4oYXN5bmMgKCk9Pntcblx0XHRcdGlmICh0aGlzLm5ldF8uaXNJbnZhbGlkKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMubmV0Xy5jbG9zZSgpXG5cdFx0XHRcdHRoaXMubmV0XyA9IHRoaXMubmV3TmV0KClcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMubmV0X1xuXHRcdH0pXG5cdH1cblxuICBwdWJsaWMgYXN5bmMgU2VuZChkYXRhOiBBcnJheUJ1ZmZlcnxzdHJpbmcsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0LCB0aW1lb3V0OiBEdXJhdGlvbiA9IDMwKlNlY29uZCk6IFByb21pc2U8W1Jlc3VsdCwgU3RtRXJyb3IgfCBudWxsXT4ge1xuXHRcdGxldCBzZmxhZyA9IGhlYWRlcnMuZ2V0KENsaWVudC5yZXFpZEtleSkgPz8gVW5pcUZsYWcoKVxuXHRcdGxldCB1dGY4RGF0YSA9IG5ldyBVdGY4KGRhdGEpXG5cblx0XHR0aGlzLmxvZ2dlci53LmluZm8odGhpcy5sb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XTpzdGFydGBcblx0XHRcdCwgYGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9LCByZXF1ZXN0IHV0Zjggc2l6ZSA9ICR7dXRmOERhdGEuYnl0ZUxlbmd0aH1gKSlcblxuXHRcdGxldCBuZXQgPSBhd2FpdCB0aGlzLm5ldCgpXG5cdFx0bGV0IGVyciA9IGF3YWl0IG5ldC5jb25uZWN0KClcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmVycm9yKHRoaXMubG9nZ2VyLmYuRXJyb3IoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOmVycm9yYFxuXHRcdFx0XHQsIGBjb25uZWN0IGVycm9yOiAke2Vycn1gKSlcblx0XHRcdHJldHVybiBbbmV3IFJlc3VsdCgpLCBlcnJdXG5cdFx0fVxuXG5cdFx0bGV0IFtyZXQsIGVycjJdID0gYXdhaXQgbmV0LnNlbmQodXRmOERhdGEucmF3LmJ1ZmZlciwgaGVhZGVycywgdGltZW91dClcblx0XHRpZiAoZXJyMiA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmluZm8odGhpcy5sb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XShjb25uSUQ9JHtuZXQuY29ubmVjdElEfSk6ZW5kYFxuXHRcdFx0XHQsIGByZXNwb25zZSBzaXplID0gJHtyZXQuYnl0ZUxlbmd0aH1gKSlcblx0XHRcdHJldHVybiBbbmV3IFJlc3VsdChyZXQpLCBlcnIyXVxuXHRcdH1cblx0XHRpZiAoIWVycjIuaXNDb25uRXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmVycm9yKHRoaXMubG9nZ2VyLmYuRXJyb3IoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dKGNvbm5JRD0ke25ldC5jb25uZWN0SUR9KTplcnJvcmBcblx0XHRcdFx0LCBgcmVxdWVzdCBlcnJvciA9ICR7ZXJyMn1gKSlcblx0XHRcdHJldHVybiBbbmV3IFJlc3VsdChyZXQpLCBlcnIyXVxuXHRcdH1cblxuXHRcdC8vIHNlbmRpbmcgLS0tIGNvbm4gZXJyb3I6ICByZXRyeVxuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV06cmV0cnlgLCBgcmV0cnktMWApKVxuXG5cdFx0bmV0ID0gYXdhaXQgdGhpcy5uZXQoKVxuXG5cdFx0ZXJyID0gYXdhaXQgbmV0LmNvbm5lY3QoKVxuXHRcdGlmIChlcnIpIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZXJyb3IodGhpcy5sb2dnZXIuZi5FcnJvcihgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV06ZXJyb3JgLCBgY29ubmVjdCBlcnJvcjogJHtlcnJ9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQoKSwgZXJyXVxuXHRcdH1cblxuXHRcdFtyZXQsIGVycjJdID0gYXdhaXQgbmV0LnNlbmQodXRmOERhdGEucmF3LmJ1ZmZlciwgaGVhZGVycywgdGltZW91dClcblx0XHRpZiAoZXJyMiA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmluZm8odGhpcy5sb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XShjb25uSUQ9JHtuZXQuY29ubmVjdElEfSk6ZW5kYFxuXHRcdFx0XHQsIGByZXNwb25zZSBzaXplID0gJHtyZXQuYnl0ZUxlbmd0aH1gKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5lcnJvcih0aGlzLmxvZ2dlci5mLkVycm9yKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XShjb25uSUQ9JHtuZXQuY29ubmVjdElEfSk6ZXJyb3JgXG5cdFx0XHRcdCwgYHJlcXVlc3QgZXJyb3IgPSAke2VycjJ9YCkpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtuZXcgUmVzdWx0KHJldCksIGVycjJdXG4gIH1cblxuXHQvKipcblx0ICogQ2xvc2Ug5ZCO77yMQ2xpZW50IOS7jeWPr+e7p+e7reS9v+eUqO+8jOS4i+asoeWPkemAgeivt+axguaXtu+8jOS8muiHquWKqOmHjei/nlxuXHQgKiBDbG9zZSgpIOiwg+eUqOS4jeS8muinpuWPkSBvblBlZXJDbG9zZWQoKVxuXHQgKiBDbG9zZSgpIOS4jiDlhbbku5bmjqXlj6PmsqHmnInmmI7noa7nmoTml7bluo/lhbPns7vvvIxDbG9zZSgpIOiwg+eUqOWQju+8jOS5n+WPr+iDveS8muWHuueOsCBTZW5kKCkg55qE6LCD55So6L+U5ZueIOaIluiAhSBvblBlZXJDbG9zZWQoKVxuXHQgKiBcdFx05L2G5q2k5pe255qEIG9uUGVlckNsb3NlZCgpIOW5tuS4jeaYr+WboOS4uiBDbG9zZSgpIOiAjOinpuWPkeeahOOAglxuXHQgKi9cblx0cHVibGljIGFzeW5jIENsb3NlKCkge1xuXHRcdGF3YWl0IHRoaXMubmV0TXV0ZXgud2l0aExvY2s8dm9pZD4oYXN5bmMgKCk9Pntcblx0XHRcdHRoaXMubG9nZ2VyLncuaW5mbyh0aGlzLmxvZ2dlci5mLkluZm8oYENsaWVudFske3RoaXMuZmxhZ31dLmNsb3NlYCwgXCJjbG9zZWQgYnkgc2VsZlwiKSlcblx0XHRcdGF3YWl0IHRoaXMubmV0Xy5jbG9zZSgpXG5cdFx0fSlcblx0fVxuXG5cdFVwZGF0ZVByb3RvY29sKGNyZWF0b3I6ICgpPT5Qcm90b2NvbCkge1xuXHRcdHRoaXMucHJvdG9jb2xDcmVhdG9yID0gY3JlYXRvclxuXHR9XG5cbiAgcHVibGljIGFzeW5jIFJlY292ZXIoKTogUHJvbWlzZTxTdG1FcnJvcnxudWxsPiB7XG4gICAgcmV0dXJuIGF3YWl0IChhd2FpdCB0aGlzLm5ldCgpKS5jb25uZWN0KClcbiAgfVxuXG5cdHByaXZhdGUgc3RhdGljIHJlcWlkS2V5OiBzdHJpbmcgPSBcIlgtUmVxLUlkXCJcblx0cHVibGljIGFzeW5jIFNlbmRXaXRoUmVxSWQoZGF0YTogQXJyYXlCdWZmZXJ8c3RyaW5nLCBoZWFkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG5cdFx0LCB0aW1lb3V0OiBEdXJhdGlvbiA9IDMwKlNlY29uZCk6IFByb21pc2U8W1Jlc3VsdCwgU3RtRXJyb3IgfCBudWxsXT4ge1xuXHRcdGhlYWRlcnMuc2V0KENsaWVudC5yZXFpZEtleSwgVW5pcUZsYWcoKSlcblxuXHRcdHJldHVybiBhd2FpdCB0aGlzLlNlbmQoZGF0YSwgaGVhZGVycywgdGltZW91dClcblx0fVxufVxuXG5cbiIsIlxuYWJzdHJhY3QgY2xhc3MgU3RtRXJyb3JCYXNlIGV4dGVuZHMgRXJyb3Ige1xuXHRhYnN0cmFjdCBpc0Nvbm5FcnI6IGJvb2xlYW5cblx0YWJzdHJhY3QgaXNUaW1lb3V0RXJyOiBib29sZWFuXG5cdGFic3RyYWN0IGdldCB0b0Nvbm5FcnIoKTogU3RtRXJyb3JcblxuXHR0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm1lc3NhZ2Vcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgQ29ublRpbWVvdXRFcnIgZXh0ZW5kcyBTdG1FcnJvckJhc2Uge1xuXHRtZXNzYWdlOiBzdHJpbmdcblx0bmFtZTogc3RyaW5nID0gXCJDb25uVGltZW91dEVyclwiXG5cdGlzQ29ubkVycjogYm9vbGVhbiA9IHRydWVcblx0aXNUaW1lb3V0RXJyOiBib29sZWFuID0gdHJ1ZVxuXHRnZXQgdG9Db25uRXJyKCk6IFN0bUVycm9yIHtcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMubWVzc2FnZSA9IG1cblx0fVxufVxuXG5leHBvcnQgY2xhc3MgRWxzZUNvbm5FcnIgZXh0ZW5kcyBTdG1FcnJvckJhc2Uge1xuXHRtZXNzYWdlOiBzdHJpbmdcblx0bmFtZTogc3RyaW5nID0gXCJFbHNlQ29ubkVyclwiXG5cdGlzQ29ubkVycjogYm9vbGVhbiA9IHRydWVcblx0aXNUaW1lb3V0RXJyOiBib29sZWFuID0gZmFsc2Vcblx0Z2V0IHRvQ29ubkVycigpOiBTdG1FcnJvciB7XG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsc2VUaW1lb3V0RXJyIGV4dGVuZHMgU3RtRXJyb3JCYXNlIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiRWxzZVRpbWVvdXRFcnJcIlxuXHRpc0Nvbm5FcnI6IGJvb2xlYW4gPSBmYWxzZVxuXHRpc1RpbWVvdXRFcnI6IGJvb2xlYW4gPSB0cnVlXG5cdGdldCB0b0Nvbm5FcnIoKTogU3RtRXJyb3Ige1xuXHRcdHJldHVybiBuZXcgRWxzZUNvbm5FcnIodGhpcy5tZXNzYWdlKVxuXHR9XG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMubWVzc2FnZSA9IG1cblx0fVxufVxuXG5leHBvcnQgY2xhc3MgRWxzZUVyciBleHRlbmRzIFN0bUVycm9yQmFzZSB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkVsc2VFcnJcIlxuXHRjYXVzZTogRXJyb3J8bnVsbFxuXHRpc0Nvbm5FcnI6IGJvb2xlYW4gPSBmYWxzZVxuXHRpc1RpbWVvdXRFcnI6IGJvb2xlYW4gPSBmYWxzZVxuXHRnZXQgdG9Db25uRXJyKCk6IFN0bUVycm9yIHtcblx0XHRyZXR1cm4gbmV3IEVsc2VDb25uRXJyKHRoaXMubWVzc2FnZSlcblx0fVxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZywgY2F1c2U6IEVycm9yfG51bGwgPSBudWxsKSB7XG5cdFx0c3VwZXIoKVxuXHRcdGlmIChjYXVzZSA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWVzc2FnZSA9IGAke219LCBjYXVzZWQgYnkgJHtjYXVzZS5tZXNzYWdlfWBcblx0XHR9XG5cblx0XHR0aGlzLmNhdXNlID0gY2F1c2Vcblx0fVxufVxuXG5leHBvcnQgdHlwZSBTdG1FcnJvciA9IEVsc2VFcnIgfCBFbHNlVGltZW91dEVyciB8IEVsc2VDb25uRXJyIHwgQ29ublRpbWVvdXRFcnJcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RtRXJyb3IoYXJnOiBhbnkpOiBhcmcgaXMgU3RtRXJyb3Ige1xuXHRyZXR1cm4gYXJnIGluc3RhbmNlb2YgU3RtRXJyb3JCYXNlXG59XG4iLCJcbi8qKlxuXG4gY29udGVudCBwcm90b2NvbDpcbiAgIHJlcXVlc3QgLS0tXG4gICAgIHJlcWlkIHwgaGVhZGVycyB8IGhlYWRlci1lbmQtZmxhZyB8IGRhdGFcbiAgICAgcmVxaWQ6IDQgYnl0ZXMsIG5ldCBvcmRlcjtcbiAgICAgaGVhZGVyczogPCBrZXktbGVuIHwga2V5IHwgdmFsdWUtbGVuIHwgdmFsdWUgPiAuLi4gOyAgW29wdGlvbmFsXVxuICAgICBrZXktbGVuOiAxIGJ5dGUsICBrZXktbGVuID0gc2l6ZW9mKGtleSk7XG4gICAgIHZhbHVlLWxlbjogMSBieXRlLCB2YWx1ZS1sZW4gPSBzaXplb2YodmFsdWUpO1xuICAgICBoZWFkZXItZW5kLWZsYWc6IDEgYnl0ZSwgPT09IDA7XG4gICAgIGRhdGE6ICAgICAgIFtvcHRpb25hbF1cblxuICAgICAgcmVxaWQgPSAxOiBjbGllbnQgcHVzaCBhY2sgdG8gc2VydmVyLlxuICAgICAgICAgICAgYWNrOiBubyBoZWFkZXJzO1xuICAgICAgICAgICAgZGF0YTogcHVzaElkLiA0IGJ5dGVzLCBuZXQgb3JkZXI7XG5cbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIHJlc3BvbnNlIC0tLVxuICAgICByZXFpZCB8IHN0YXR1cyB8IGRhdGFcbiAgICAgcmVxaWQ6IDQgYnl0ZXMsIG5ldCBvcmRlcjtcbiAgICAgc3RhdHVzOiAxIGJ5dGUsIDAtLS1zdWNjZXNzLCAxLS0tZmFpbGVkXG4gICAgIGRhdGE6IGlmIHN0YXR1cz09c3VjY2VzcywgZGF0YT08YXBwIGRhdGE+ICAgIFtvcHRpb25hbF1cbiAgICAgaWYgc3RhdHVzPT1mYWlsZWQsIGRhdGE9PGVycm9yIHJlYXNvbj5cblxuXG4gICAgcmVxaWQgPSAxOiBzZXJ2ZXIgcHVzaCB0byBjbGllbnRcbiAgICAgICAgc3RhdHVzOiAwXG4gICAgICAgICAgZGF0YTogZmlyc3QgNCBieXRlcyAtLS0gcHVzaElkLCBuZXQgb3JkZXI7XG4gICAgICAgICAgICAgICAgbGFzdCAtLS0gcmVhbCBkYXRhXG5cbiAqL1xuXG5pbXBvcnQge1V0Zjh9IGZyb20gXCJ0cy14dXRpbHNcIjtcbmltcG9ydCB7RWxzZUVyciwgU3RtRXJyb3J9IGZyb20gXCIuL2Vycm9yXCJcblxuZXhwb3J0IGNsYXNzIFJlcXVlc3Qge1xuICBwcml2YXRlIHJlYWRvbmx5IGJ1ZmZlcjogQXJyYXlCdWZmZXI7XG5cblx0Z2V0IGVuY29kZWREYXRhKCk6IEFycmF5QnVmZmVyIHtyZXR1cm4gdGhpcy5idWZmZXJ9XG5cdGdldCBsb2FkTGVuKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoIC0gNH1cblxuXHRwdWJsaWMgU2V0UmVxSWQoaWQ6bnVtYmVyKSB7XG5cdFx0KG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcikpLnNldFVpbnQzMigwLCBpZCk7XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihidWZmZXI6IEFycmF5QnVmZmVyKSB7XG5cdFx0dGhpcy5idWZmZXIgPSBidWZmZXJcblx0fVxuXG5cdHN0YXRpYyBOZXcocmVxSWQ6IG51bWJlciwgZGF0YTogQXJyYXlCdWZmZXJ8c3RyaW5nLCBoZWFkZXJzOiBNYXA8c3RyaW5nLHN0cmluZz4pOiBbUmVxdWVzdCwgU3RtRXJyb3J8bnVsbF0ge1xuICAgIGxldCBsZW4gPSA0O1xuXG4gICAgbGV0IGhlYWRlckFyciA9IG5ldyBBcnJheTx7a2V5OlV0ZjgsIHZhbHVlOlV0Zjh9PigpO1xuXHRcdGxldCBlcnI6IFN0bUVycm9yfG51bGwgPSBudWxsXG4gICAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nLCBrZXk6IHN0cmluZywgXzogTWFwPHN0cmluZywgc3RyaW5nPik9PntcbiAgICAgIGxldCB1dGY4ID0ge2tleTogbmV3IFV0Zjgoa2V5KSwgdmFsdWU6IG5ldyBVdGY4KHZhbHVlKX07XG5cdFx0XHRpZiAodXRmOC5rZXkuYnl0ZUxlbmd0aCA+IDI1NSB8fCB1dGY4LnZhbHVlLmJ5dGVMZW5ndGggPiAyNTUpIHtcblx0XHRcdFx0ZXJyID0gbmV3IEVsc2VFcnIoYGtleSgke2tleX0pJ3MgbGVuZ3RoIG9yIHZhbHVlKCR7dmFsdWV9KSdzIGxlbmd0aCBpcyBtb3JlIHRoYW4gMjU1YClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG4gICAgICBoZWFkZXJBcnIucHVzaCh1dGY4KTtcbiAgICAgIGxlbiArPSAxICsgdXRmOC5rZXkuYnl0ZUxlbmd0aCArIDEgKyB1dGY4LnZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgfSk7XG5cdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gW25ldyBSZXF1ZXN0KG5ldyBBcnJheUJ1ZmZlcigwKSksIGVycl1cblx0XHR9XG5cbiAgICBsZXQgYm9keSA9IG5ldyBVdGY4KGRhdGEpO1xuICAgIGxlbiArPSAxICsgYm9keS5ieXRlTGVuZ3RoO1xuXG5cdFx0bGV0IHJldCA9IG5ldyBSZXF1ZXN0KG5ldyBBcnJheUJ1ZmZlcihsZW4pKVxuXHRcdHJldC5TZXRSZXFJZChyZXFJZClcblxuICAgIGxldCBwb3MgPSA0O1xuICAgIGZvciAobGV0IGggb2YgaGVhZGVyQXJyKSB7XG4gICAgICAobmV3IERhdGFWaWV3KHJldC5idWZmZXIpKS5zZXRVaW50OChwb3MsIGgua2V5LmJ5dGVMZW5ndGgpO1xuICAgICAgcG9zKys7XG4gICAgICAobmV3IFVpbnQ4QXJyYXkocmV0LmJ1ZmZlcikpLnNldChoLmtleS5yYXcsIHBvcyk7XG4gICAgICBwb3MgKz0gaC5rZXkuYnl0ZUxlbmd0aDtcbiAgICAgIChuZXcgRGF0YVZpZXcocmV0LmJ1ZmZlcikpLnNldFVpbnQ4KHBvcywgaC52YWx1ZS5ieXRlTGVuZ3RoKTtcbiAgICAgIHBvcysrO1xuICAgICAgKG5ldyBVaW50OEFycmF5KHJldC5idWZmZXIpKS5zZXQoaC52YWx1ZS5yYXcsIHBvcyk7XG4gICAgICBwb3MgKz0gaC52YWx1ZS5ieXRlTGVuZ3RoO1xuICAgIH1cbiAgICAobmV3IERhdGFWaWV3KHJldC5idWZmZXIpKS5zZXRVaW50OChwb3MsIDApO1xuICAgIHBvcysrO1xuXG4gICAgKG5ldyBVaW50OEFycmF5KHJldC5idWZmZXIpKS5zZXQoYm9keS5yYXcsIHBvcyk7XG5cblx0XHRyZXR1cm4gW3JldCwgbnVsbF1cbiAgfVxufVxuXG5leHBvcnQgZW51bSBTdGF0dXMge1xuICBPSyxcbiAgRmFpbGVkXG59XG5cbmV4cG9ydCBjbGFzcyBSZXNwb25zZSB7XG5cdC8vIHJlcWlkICsgc3RhdHVzICsgcHVzaGlkXG5cdHN0YXRpYyBNYXhOb0xvYWRMZW4gPSA0ICsgMSArIDRcblxuICBwdWJsaWMgcmVhZG9ubHkgc3RhdHVzOiBTdGF0dXM7XG5cdHB1YmxpYyByZWFkb25seSByZXFJZDogbnVtYmVyID0gMFxuXHRwdWJsaWMgcmVhZG9ubHkgZGF0YTogQXJyYXlCdWZmZXJcblx0cHVibGljIHJlYWRvbmx5IHB1c2hJZDogbnVtYmVyXG5cblx0Z2V0IGlzUHVzaCgpOmJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnJlcUlkID09IDE7XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihyZXFJZDogbnVtYmVyLCBzdDogU3RhdHVzLCBkYXRhOiBBcnJheUJ1ZmZlciwgcHVzaElkOiBudW1iZXIgPSAwKSB7XG5cdFx0dGhpcy5yZXFJZCA9IHJlcUlkXG5cdFx0dGhpcy5zdGF0dXMgPSBzdFxuXHRcdHRoaXMuZGF0YSA9IGRhdGFcblx0XHR0aGlzLnB1c2hJZCA9IHB1c2hJZFxuXHR9XG5cblx0cHVibGljIG5ld1B1c2hBY2soKTogW0FycmF5QnVmZmVyLCBTdG1FcnJvcnxudWxsXSB7XG5cdFx0aWYgKCF0aGlzLmlzUHVzaCkge1xuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIG5ldyBFbHNlRXJyKFwiaW52YWxpZCBwdXNoIGRhdGFcIildXG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IG5ldyBBcnJheUJ1ZmZlcig0ICsgMSArIDQpXG5cdFx0bGV0IHZpZXcgPSBuZXcgRGF0YVZpZXcocmV0KVxuXHRcdHZpZXcuc2V0VWludDMyKDAsIDEpXG5cdFx0dmlldy5zZXRVaW50OCg0LCAwKVxuXHRcdHZpZXcuc2V0VWludDMyKDUsIHRoaXMucHVzaElkKVxuXG5cdFx0cmV0dXJuIFtyZXQsIG51bGxdXG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIFplcm9SZXMoKTogUmVzcG9uc2Uge1xuXHRcdHJldHVybiBuZXcgUmVzcG9uc2UoMCwgU3RhdHVzLkZhaWxlZCwgbmV3IEFycmF5QnVmZmVyKDApKVxuXHR9XG5cblx0cHVibGljIHN0YXRpYyBQYXJzZShidWZmZXI6IEFycmF5QnVmZmVyKTogW1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXSB7XG5cdFx0aWYgKGJ1ZmZlci5ieXRlTGVuZ3RoIDwgNSkge1xuXHRcdFx0cmV0dXJuIFt0aGlzLlplcm9SZXMoKSwgbmV3IEVsc2VFcnIoXCJmYWtlaHR0cCBwcm90b2NvbCBlcnIocmVzcG9uc2Uuc2l6ZSA8IDUpLlwiKV1cblx0XHR9XG5cdFx0bGV0IHZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKVxuXG5cdFx0bGV0IHJlcUlkID0gdmlldy5nZXRVaW50MzIoMClcblx0XHRsZXQgc3RhdHVzID0gdmlldy5nZXRVaW50OCg0KT09MCA/IFN0YXR1cy5PSyA6IFN0YXR1cy5GYWlsZWRcblx0XHRsZXQgcHVzaElkID0gMFxuXG5cdFx0bGV0IG9mZnNldCA9IDVcblx0XHRpZiAocmVxSWQgPT0gMSkge1xuXHRcdFx0aWYgKGJ1ZmZlci5ieXRlTGVuZ3RoIDwgb2Zmc2V0KzQpIHtcblx0XHRcdFx0cmV0dXJuIFt0aGlzLlplcm9SZXMoKSwgbmV3IEVsc2VFcnIoXCJmYWtlaHR0cCBwcm90b2NvbCBlcnIocmVzcG9uc2Uuc2l6ZSBvZiBwdXNoIDwgOSkuXCIpXVxuXHRcdFx0fVxuXHRcdFx0cHVzaElkID0gdmlldy5nZXRVaW50MzIob2Zmc2V0KVxuXHRcdFx0b2Zmc2V0ICs9IDRcblx0XHR9XG5cblx0XHRsZXQgZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuXHRcdGlmIChidWZmZXIuYnl0ZUxlbmd0aCA+IG9mZnNldCkge1xuXHRcdFx0ZGF0YSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcikuc2xpY2Uob2Zmc2V0KS5idWZmZXJcblx0XHR9XG5cblx0XHRyZXR1cm4gW25ldyBSZXNwb25zZShyZXFJZCwgc3RhdHVzLCBkYXRhLCBwdXNoSWQpLCBudWxsXVxuXHR9XG59XG4iLCJpbXBvcnQge0R1cmF0aW9uLCBMb2dnZXIsIFNlY29uZCwgVW5pcUZsYWcsIFV0Zjh9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHthc3luY0V4ZSwgQ2hhbm5lbCwgTXV0ZXgsIFJlY2VpdmVDaGFubmVsLCBTZW1hcGhvcmUsIFNlbmRDaGFubmVsLCB3aXRoVGltZW91dCwgVGltZW91dH0gZnJvbSBcInRzLWNvbmN1cnJlbmN5XCJcbmltcG9ydCB7UmVzcG9uc2UsIFJlcXVlc3QsIFN0YXR1cyBhcyBSZXNTdGF0dXN9IGZyb20gXCIuL2Zha2VodHRwXCJcbmltcG9ydCB7RWxzZUNvbm5FcnIsIEVsc2VFcnIsIFN0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5pbXBvcnQge0hhbmRzaGFrZSwgUHJvdG9jb2x9IGZyb20gXCIuL3Byb3RvY29sXCJcblxuY2xhc3MgU3luY0FsbFJlcXVlc3Qge1xuXHRhbGxSZXF1ZXN0czogTWFwPG51bWJlciwgQ2hhbm5lbDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPj4gPSBuZXcgTWFwKClcblx0c2VtYXBob3JlOiBTZW1hcGhvcmUgPSBuZXcgU2VtYXBob3JlKDMpXG5cblx0Z2V0IHBlcm1pdHMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5zZW1hcGhvcmUubWF4XG5cdH1cblxuXHRzZXQgcGVybWl0cyhtYXg6IG51bWJlcikge1xuXHRcdHRoaXMuc2VtYXBob3JlID0gbmV3IFNlbWFwaG9yZShtYXgpXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwZXJtaXRzOiBudW1iZXIgPSAzKSB7XG5cdFx0dGhpcy5zZW1hcGhvcmUgPSBuZXcgU2VtYXBob3JlKHBlcm1pdHMpXG5cdH1cblxuXHQvLyBjaGFubmVsIOW/hemhu+WcqCBTeW5jQWxsUmVxdWVzdCDnmoTmjqfliLbkuIvvvIzmiYDku6UgQWRkIOiOt+WPlueahOWPquiDvSByZWNlaXZlXG4vLyDopoEgc2VuZCDlsLHlv4XpobvpgJrov4cgcmVtb3ZlIOiOt+WPllxuXG5cdGFzeW5jIEFkZChyZXFJZDogbnVtYmVyKTogUHJvbWlzZTxSZWNlaXZlQ2hhbm5lbDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPj4ge1xuXHRcdGF3YWl0IHRoaXMuc2VtYXBob3JlLkFjcXVpcmUoKVxuXHRcdGxldCBjaCA9IG5ldyBDaGFubmVsPFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0+KDEpXG5cdFx0dGhpcy5hbGxSZXF1ZXN0cy5zZXQocmVxSWQsIGNoKVxuXHRcdHJldHVybiBjaFxuXHR9XG5cblx0Ly8g5Y+v5Lul55So5ZCM5LiA5LiqIHJlcWlkIOmHjeWkjeiwg+eUqFxuXHRSZW1vdmUocmVxSWQ6IG51bWJlcik6IFNlbmRDaGFubmVsPFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0+IHwgbnVsbCB7XG5cdFx0bGV0IHJldCA9IHRoaXMuYWxsUmVxdWVzdHMuZ2V0KHJlcUlkKSA/PyBudWxsXG5cdFx0aWYgKHJldCAhPSBudWxsICYmIHRoaXMuc2VtYXBob3JlLmN1cnJlbnQgIT0gMCkge1xuXHRcdFx0dGhpcy5zZW1hcGhvcmUuUmVsZWFzZSgpXG5cdFx0fVxuXHRcdHRoaXMuYWxsUmVxdWVzdHMuZGVsZXRlKHJlcUlkKVxuXG5cdFx0cmV0dXJuIHJldFxuXHR9XG5cblx0YXN5bmMgQ2xlYXJBbGxXaXRoKHJldDogW1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXSkge1xuXHRcdGZvciAobGV0IFtfLCBjaF0gb2YgdGhpcy5hbGxSZXF1ZXN0cykge1xuXHRcdFx0YXdhaXQgY2guU2VuZChyZXQpXG5cdFx0XHRhd2FpdCBjaC5DbG9zZSgpXG5cdFx0fVxuXHRcdHRoaXMuYWxsUmVxdWVzdHMuY2xlYXIoKVxuXHRcdGF3YWl0IHRoaXMuc2VtYXBob3JlLlJlbGVhc2VBbGwoKVxuXHR9XG59XG5cbi8qKlxuICpcbiAqICAgIE5vdENvbm5lY3QgIC0tLT4gKENvbm5lY3RpbmcpICAtLS0+IENvbm5lY3RlZCAtLS0+IEludmFsaWRhdGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXlxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198XG4gKlxuICovXG5cbmludGVyZmFjZSBTdGF0ZUJhc2Uge1xuXHR0b1N0cmluZygpOnN0cmluZ1xuXHRpc0VxdWFsKG90aGVyOiBTdGF0ZUJhc2UpOiB0aGlzIGlzIEludmFsaWRhdGVkXG5cdGlzSW52YWxpZGF0ZWQoKTogYm9vbGVhblxufVxuXG5jbGFzcyBOb3RDb25uZWN0IGltcGxlbWVudHMgU3RhdGVCYXNlIHtcblx0aXNFcXVhbChvdGhlcjogU3RhdGVCYXNlKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIG90aGVyIGluc3RhbmNlb2YgTm90Q29ubmVjdFxuXHR9XG5cblx0aXNJbnZhbGlkYXRlZCgpOiB0aGlzIGlzIEludmFsaWRhdGVkIHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHRvU3RyaW5nKCk6c3RyaW5nIHtcblx0XHRyZXR1cm4gXCJOb3RDb25uZWN0XCJcblx0fVxufVxuXG5jbGFzcyBDb25uZWN0ZWQgaW1wbGVtZW50cyBTdGF0ZUJhc2Uge1xuXHRpc0VxdWFsKG90aGVyOiBTdGF0ZUJhc2UpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiBDb25uZWN0ZWRcblx0fVxuXG5cdGlzSW52YWxpZGF0ZWQoKTogdGhpcyBpcyBJbnZhbGlkYXRlZCB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHR0b1N0cmluZygpOnN0cmluZyB7XG5cdFx0cmV0dXJuIFwiQ29ubmVjdGVkXCJcblx0fVxufVxuXG5jbGFzcyBJbnZhbGlkYXRlZCBpbXBsZW1lbnRzIFN0YXRlQmFzZSB7XG5cdHB1YmxpYyBlcnI6IFN0bUVycm9yXG5cdGlzRXF1YWwob3RoZXI6IFN0YXRlQmFzZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBvdGhlciBpbnN0YW5jZW9mIEludmFsaWRhdGVkXG5cdH1cblxuXHRpc0ludmFsaWRhdGVkKCk6IHRoaXMgaXMgSW52YWxpZGF0ZWQge1xuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHR0b1N0cmluZygpOnN0cmluZyB7XG5cdFx0cmV0dXJuIFwiSW52YWxpZGF0ZWRcIlxuXHR9XG5cblx0Y29uc3RydWN0b3IoZXJyOiBTdG1FcnJvcikge1xuXHRcdHRoaXMuZXJyID0gZXJyXG5cdH1cbn1cblxudHlwZSBTdGF0ZSA9IE5vdENvbm5lY3R8Q29ubmVjdGVkfEludmFsaWRhdGVkXG5cbmNsYXNzIFJlcUlkIHtcblx0cHJpdmF0ZSBzdGF0aWMgcmVxSWRTdGFydCA9IDEwXG5cdHByaXZhdGUgdmFsdWUgPSBSZXFJZC5yZXFJZFN0YXJ0XG5cblx0Z2V0KCk6IG51bWJlciB7XG5cdFx0dGhpcy52YWx1ZSArPSAxXG5cdFx0aWYgKHRoaXMudmFsdWUgPCBSZXFJZC5yZXFJZFN0YXJ0IHx8IHRoaXMudmFsdWUgPiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikge1xuXHRcdFx0dGhpcy52YWx1ZSA9IFJlcUlkLnJlcUlkU3RhcnRcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy52YWx1ZVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXQge1xuXHRwcml2YXRlIGhhbmRzaGFrZTogSGFuZHNoYWtlID0gbmV3IEhhbmRzaGFrZSgpXG5cdHByaXZhdGUgY29ubkxvY2tlcjogTXV0ZXggPSBuZXcgTXV0ZXgoKVxuXHRwcml2YXRlIHN0YXRlOiBTdGF0ZSA9IG5ldyBOb3RDb25uZWN0XG5cdHByaXZhdGUgcHJvdG86IFByb3RvY29sXG5cblx0cHJpdmF0ZSByZXFJZDogUmVxSWQgPSBuZXcgUmVxSWQoKVxuXHRwcml2YXRlIGFsbFJlcXVlc3RzOiBTeW5jQWxsUmVxdWVzdCA9IG5ldyBTeW5jQWxsUmVxdWVzdCgpXG5cblx0cHJpdmF0ZSBmbGFnID0gVW5pcUZsYWcoKVxuXG5cdGdldCBjb25uZWN0SUQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5oYW5kc2hha2UuQ29ubmVjdElkXG5cdH1cblxuXHRnZXQgaXNJbnZhbGlkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlLmlzSW52YWxpZGF0ZWQoKVxuXHR9XG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXI6IExvZ2dlciwgcHJvdG9DcmVhdG9yOiAoKT0+UHJvdG9jb2xcblx0XHRcdFx0XHRcdFx0LCBwcml2YXRlIG9uUGVlckNsb3NlZDogKGVycjogU3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+XG5cdFx0XHRcdFx0XHRcdCwgcHJpdmF0ZSBvblB1c2g6IChkYXRhOiBBcnJheUJ1ZmZlcik9PlByb21pc2U8dm9pZD4pIHtcblx0XHRsb2dnZXIudy5kZWJ1Zyhsb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0ubmV3YCwgYGZsYWc9JHt0aGlzLmZsYWd9YCkpXG5cblx0XHR0aGlzLnByb3RvID0gcHJvdG9DcmVhdG9yKClcblx0XHR0aGlzLnByb3RvLmxvZ2dlciA9IGxvZ2dlclxuXHRcdHRoaXMucHJvdG8ub25FcnJvciA9IGFzeW5jIChlcnI6IFN0bUVycm9yKT0+e2F3YWl0IHRoaXMub25FcnJvcihlcnIpfVxuXHRcdHRoaXMucHJvdG8ub25NZXNzYWdlID0gYXN5bmMgKGRhdGE6QXJyYXlCdWZmZXIpPT57YXdhaXQgdGhpcy5vbk1lc3NhZ2UoZGF0YSl9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNsb3NlQW5kT2xkU3RhdGUoZXJyOiBTdG1FcnJvcik6IFByb21pc2U8U3RhdGU+IHtcblx0XHRsZXQgb2xkID0gYXdhaXQgdGhpcy5jb25uTG9ja2VyLndpdGhMb2NrPFN0YXRlPihhc3luYyAoKT0+e1xuXHRcdFx0bGV0IG9sZCA9IHRoaXMuc3RhdGVcblxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpKSB7XG5cdFx0XHRcdHJldHVybiBvbGRcblx0XHRcdH1cblx0XHRcdHRoaXMuc3RhdGUgPSBuZXcgSW52YWxpZGF0ZWQoZXJyKVxuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uSW52YWxpZGF0ZWRgLCBgJHtlcnJ9YCkpXG5cblx0XHRcdHJldHVybiBvbGRcblx0XHR9KVxuXG5cdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5DbGVhckFsbFdpdGgoW1Jlc3BvbnNlLlplcm9SZXMoKSwgZXJyLnRvQ29ubkVycl0pXG5cblx0XHRyZXR1cm4gb2xkXG5cdH1cblxuXHRhc3luYyBvbkVycm9yKGVycjogU3RtRXJyb3IpIHtcblx0XHRsZXQgb2xkID0gYXdhaXQgdGhpcy5jbG9zZUFuZE9sZFN0YXRlKGVycilcblx0XHRpZiAob2xkIGluc3RhbmNlb2YgQ29ubmVjdGVkKSB7XG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5jbG9zZWBcblx0XHRcdFx0XHQsIFwiY2xvc2VkLCBiZWNvbWUgaW52YWxpZGF0ZWRcIikpXG5cdFx0XHRcdGF3YWl0IHRoaXMub25QZWVyQ2xvc2VkKGVycilcblx0XHRcdFx0YXdhaXQgdGhpcy5wcm90by5DbG9zZSgpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIG9uTWVzc2FnZShtc2c6IEFycmF5QnVmZmVyKSB7XG5cdFx0bGV0IFtyZXNwb25zZSwgZXJyXSA9IFJlc3BvbnNlLlBhcnNlKG1zZylcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cGFyc2VgXG5cdFx0XHRcdCwgYGVycm9yIC0tLSAke2Vycn1gKSlcblx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihlcnIpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRpZiAocmVzcG9uc2UuaXNQdXNoKSB7XG5cdFx0XHRsZXQgW3B1c2hBY2ssIGVycl0gPSByZXNwb25zZS5uZXdQdXNoQWNrKClcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOm5ld1B1c2hBY2tgXG5cdFx0XHRcdFx0LCBgZXJyb3IgLS0tICR7ZXJyfWApKVxuXHRcdFx0XHRhd2FpdCB0aGlzLm9uRXJyb3IoZXJyKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0YXN5bmNFeGUoYXN5bmMoKT0+e1xuXHRcdFx0XHRhd2FpdCB0aGlzLm9uUHVzaChyZXNwb25zZS5kYXRhKVxuXHRcdFx0fSlcblxuXHRcdFx0Ly8gaWdub3JlIGVycm9yXG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRsZXQgZXJyID0gYXdhaXQgdGhpcy5wcm90by5TZW5kKHB1c2hBY2spXG5cdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cHVzaEFja2Bcblx0XHRcdFx0XHRcdCwgYGVycm9yIC0tLSAke2Vycn1gKSlcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cHVzaEFja2Bcblx0XHRcdFx0XHQsIGBwdXNoSUQgPSAke3Jlc3BvbnNlLnB1c2hJZH1gKSlcblx0XHRcdH0pXG5cblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGxldCBjaCA9IGF3YWl0IHRoaXMuYWxsUmVxdWVzdHMuUmVtb3ZlKHJlc3BvbnNlLnJlcUlkKVxuXHRcdGlmIChjaCA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuV2FybihgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+Lm9uTWVzc2FnZTpOb3RGaW5kYFxuXHRcdFx0XHQsIGB3YXJuaW5nOiBub3QgZmluZCByZXF1ZXN0IGZvciByZXFJZCgke3Jlc3BvbnNlLnJlcUlkfWApKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0bGV0IGNoMSA9IGNoXG5cblx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cmVzcG9uc2VgXG5cdFx0XHQsIGByZXFJZD0ke3Jlc3BvbnNlLnJlcUlkfWApKVxuXHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRhd2FpdCBjaDEuU2VuZChbcmVzcG9uc2UsIG51bGxdKVxuXHRcdH0pXG5cdH1cblxuXHQvLyDlj6/ph43lpI3osIPnlKhcblx0YXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPFN0bUVycm9yfG51bGw+IHtcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5jb25uTG9ja2VyLndpdGhMb2NrPFN0bUVycm9yfG51bGw+KGFzeW5jICgpPT57XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSBpbnN0YW5jZW9mIENvbm5lY3RlZCkge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLmNvbm5lY3Q6Q29ubmVjdGVkYCwgYGNvbm5JRD0ke3RoaXMuY29ubmVjdElEfWApKVxuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0uY29ubmVjdDwke3RoaXMuY29ubmVjdElEfT46SW52YWxpZGF0ZWRgXG5cdFx0XHRcdFx0LCBgJHt0aGlzLnN0YXRlLmVycn1gKSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUuZXJyXG5cdFx0XHR9XG5cblx0XHRcdC8vIHN0YXRlLk5vdENvbm5lY3Rcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0uY29ubmVjdDpOb3RDb25uZWN0YCwgXCJ3aWxsIGNvbm5lY3RcIikpXG5cdFx0XHRsZXQgW2hhbmRzaGFrZSwgZXJyXSA9IGF3YWl0IHRoaXMucHJvdG8uQ29ubmVjdCgpXG5cdFx0XHRpZiAoZXJyICE9IG51bGwpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IG5ldyBJbnZhbGlkYXRlZChlcnIpXG5cdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0uY29ubmVjdDplcnJvcmAsIGAke2Vycn1gKSlcblx0XHRcdFx0cmV0dXJuIGVyclxuXHRcdFx0fVxuXG5cdFx0XHQvLyBPS1xuXHRcdFx0dGhpcy5zdGF0ZSA9IG5ldyBDb25uZWN0ZWRcblx0XHRcdHRoaXMuaGFuZHNoYWtlID0gaGFuZHNoYWtlXG5cdFx0XHR0aGlzLmFsbFJlcXVlc3RzLnBlcm1pdHMgPSB0aGlzLmhhbmRzaGFrZS5NYXhDb25jdXJyZW50XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5jb25uZWN0OmhhbmRzaGFrZWBcblx0XHRcdFx0LCBgJHt0aGlzLmhhbmRzaGFrZX1gKSlcblxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9KVxuXHR9XG5cblx0Ly8g5aaC5p6c5rKh5pyJ6L+e5o6l5oiQ5Yqf77yM55u05o6l6L+U5Zue5aSx6LSlXG5cdGFzeW5jIHNlbmQoZGF0YTogQXJyYXlCdWZmZXIsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZz5cblx0XHRcdFx0XHRcdCAsIHRpbWVvdXQ6IER1cmF0aW9uID0gMzAqU2Vjb25kKTogUHJvbWlzZTxbQXJyYXlCdWZmZXIsIFN0bUVycm9yfG51bGxdPiB7XG5cdFx0Ly8g6aKE5Yik5patXG5cdFx0bGV0IHJldCA9IGF3YWl0IHRoaXMuY29ubkxvY2tlci53aXRoTG9jazxTdG1FcnJvcnxudWxsPiAoYXN5bmMgKCk9Pntcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmQ6c3RhdGVgXG5cdFx0XHRcdCwgYCR7dGhpcy5zdGF0ZX0gLS0tIGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9YCkpXG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5pc0ludmFsaWRhdGVkKCkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUuZXJyLnRvQ29ubkVyclxuXHRcdFx0fVxuXHRcdFx0aWYgKCEodGhpcy5zdGF0ZSBpbnN0YW5jZW9mIENvbm5lY3RlZCkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBFbHNlQ29ubkVycihcIm5vdCBjb25uZWN0ZWRcIilcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9KVxuXHRcdGlmIChyZXQpIHtcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCByZXRdXG5cdFx0fVxuXG5cdFx0bGV0IHJlcUlkID0gdGhpcy5yZXFJZC5nZXQoKVxuXHRcdGxldCBbcmVxdWVzdCwgZXJyXSA9IFJlcXVlc3QuTmV3KHJlcUlkLCBkYXRhLCBoZWFkZXJzKVxuXHRcdGlmIChlcnIpIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmQ6RmFrZUh0dHBSZXF1ZXN0YFxuXHRcdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSBlcnJvcjogJHtlcnJ9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgZXJyXVxuXHRcdH1cblx0XHRpZiAocmVxdWVzdC5sb2FkTGVuID4gdGhpcy5oYW5kc2hha2UuTWF4Qnl0ZXMpIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmQ6TWF4Qnl0ZXNgXG5cdFx0XHRcdCwgYGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9IChyZXFJZDoke3JlcUlkfSkgLS0tIGVycm9yOiBkYXRhIGlzIFRvbyBMYXJnZWApKVxuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMClcblx0XHRcdFx0LCBuZXcgRWxzZUVycihgcmVxdWVzdC5zaXplKCR7cmVxdWVzdC5sb2FkTGVufSkgPiBNYXhCeXRlcygke3RoaXMuaGFuZHNoYWtlLk1heEJ5dGVzfSlgKV1cblx0XHR9XG5cblx0XHQvLyDlnKjlrqLmiLfnq6/otoXml7bkuZ/orqTkuLrmmK/kuIDkuKror7fmsYLnu5PmnZ/vvIzkvYbmmK/nnJ/mraPnmoTor7fmsYLlubbmsqHmnInnu5PmnZ/vvIzmiYDku6XlnKjmnI3liqHlmajnnIvmnaXvvIzku43nhLbljaDnlKjmnI3liqHlmajnmoTkuIDkuKrlubblj5HmlbBcblx0XHQvLyDlm6DkuLrnvZHnu5zlvILmraXnmoTljp/lm6DvvIzlrqLmiLfnq6/lubblj5HmlbDkuI3lj6/og73kuI7mnI3liqHlmajlrozlhajkuIDmoLfvvIzmiYDku6Xov5nph4zkuLvopoHmmK/ljY/liqnmnI3liqHlmajlgZrpooTmjqfmtYHvvIzmjInnhaflrqLmiLfnq6/nmoTpgLvovpHlpITnkIbljbPlj69cblxuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmRbJHtyZXFJZH1dOnJlcXVlc3RgXG5cdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pYCkpXG5cblx0XHRsZXQgY2ggPSBhd2FpdCB0aGlzLmFsbFJlcXVlc3RzLkFkZChyZXFJZClcblx0XHRsZXQgcmV0MiA9IGF3YWl0IHdpdGhUaW1lb3V0PFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0+KHRpbWVvdXQsIGFzeW5jICgpPT57XG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRsZXQgZXJyID0gYXdhaXQgdGhpcy5wcm90by5TZW5kKHJlcXVlc3QuZW5jb2RlZERhdGEpXG5cdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFsbFJlcXVlc3RzLlJlbW92ZShyZXFJZCk/LlNlbmQoW1Jlc3BvbnNlLlplcm9SZXMoKSwgZXJyXSlcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHRcdFx0bGV0IHIgPSBhd2FpdCBjaC5SZWNlaXZlKClcblx0XHRcdGlmIChyKSB7XG5cdFx0XHRcdHJldHVybiByXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gW1Jlc3BvbnNlLlplcm9SZXMoKSwgbmV3IEVsc2VFcnIoXCJjaGFubmVsIGlzIGNsb3NlZCwgZXhjZXB0aW9uISEhXCIpXVxuXHRcdH0pXG5cblx0XHRpZiAocmV0MiBpbnN0YW5jZW9mIFRpbWVvdXQpIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmRbJHtyZXFJZH1dOlRpbWVvdXRgXG5cdFx0XHRcdCwgYGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9IChyZXFJZDoke3JlcUlkfSkgLS0tIHRpbWVvdXQoPiR7dGltZW91dC9TZWNvbmR9cylgKSlcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCBuZXcgRWxzZUVycihgcmVxdWVzdCB0aW1lb3V0KCR7dGltZW91dC9TZWNvbmR9cylgKV1cblx0XHR9XG5cblx0XHRpZiAocmV0MlsxXSkge1xuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIHJldDJbMV1dXG5cdFx0fVxuXG5cdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uc2VuZFske3JlcUlkfV06cmVzcG9uc2VgXG5cdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSAke3JldDJbMF0uc3RhdHVzfWApKVxuXG5cdFx0aWYgKHJldDJbMF0uc3RhdHVzICE9IFJlc1N0YXR1cy5PSykge1xuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIG5ldyBFbHNlRXJyKG5ldyBVdGY4KHJldDJbMF0uZGF0YSkudG9TdHJpbmcoKSldXG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5SZW1vdmUocmVxSWQpXG5cblx0XHRyZXR1cm4gW3JldDJbMF0uZGF0YSwgbnVsbF1cblx0fVxuXG5cdGFzeW5jIGNsb3NlKCkge1xuXHRcdGxldCBvbGQgPSBhd2FpdCB0aGlzLmNsb3NlQW5kT2xkU3RhdGUobmV3IEVsc2VFcnIoXCJjbG9zZWQgYnkgc2VsZlwiKSlcblx0XHRpZiAob2xkIGluc3RhbmNlb2YgQ29ubmVjdGVkKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5jbG9zZWBcblx0XHRcdFx0LCBcImNsb3NlZCwgYmVjb21lIGludmFsaWRhdGVkXCIpKVxuXHRcdFx0YXdhaXQgdGhpcy5wcm90by5DbG9zZSgpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNYXAobWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHtcblx0bGV0IHJldCA9IG5ldyBBcnJheTxzdHJpbmc+KClcblx0bWFwLmZvckVhY2goKHYsIGspID0+IHtcblx0XHRyZXQucHVzaChrICsgXCI6XCIgKyB2KVxuXHR9KVxuXG5cdHJldHVybiBcIntcIiArIHJldC5qb2luKFwiLCBcIikgKyBcIn1cIlxufVxuIiwiXG5pbXBvcnQge0xvZ2dlciwgRHVyYXRpb24sIGFzc2VydCwgU2Vjb25kLCBmb3JtYXREdXJhdGlvbn0gZnJvbSBcInRzLXh1dGlsc1wiXG5pbXBvcnQge1N0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5cbi8qKlxuICpcbiAqIOS4iuWxgueahOiwg+eUqCBQcm90b2NvbCDlj4rlk43lupQgRGVsZWdhdGUg55qE5pe25bqP6YC76L6R77yaXG4gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdlxuICogICAgIGNvbm5lY3R7MX0gLS0rLS0odHJ1ZSktLSstLS1bLmFzeW5jXS0tLT5zZW5ke259IC0tLS0tLT4gY2xvc2V7MX1cbiAqICAgICAgICAgICAgICAgICAgfCAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXG4gKiAgICAgICAgICAgKGZhbHNlKXwgICAgICAgICAgfC0tLS0tLS0+IG9uTWVzc2FnZSAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICB8ICAgICAgICAgIHwgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICA8VW5pdD4tLS0tKyAgICAgICAgICB8ICAgICAgICAgIChlcnJvcikgLS0tIFsuYXN5bmNdIC0tLT58XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tLT4gb25FcnJvciAtLS0gWy5hc3luY10gLS0tLStcbiAqXG4gKlxuICogICAgUHJvdG9jb2wuY29ubmVjdCgpIOS4jiBQcm90b2NvbC5jbG9zZSgpIOS4iuWxguS9v+eUqOaWueehruS/neWPquS8muiwg+eUqCAxIOasoVxuICogICAgUHJvdG9jb2wuY29ubmVjdCgpIOWksei0pe+8jOS4jeS8muivt+axgi/lk43lupTku7vkvZXmjqXlj6NcbiAqICAgIFByb3RvY29sLnNlbmQoKSDkvJrlvILmraXlubblj5HlnLDosIPnlKggbiDmrKHvvIxQcm90b2NvbC5zZW5kKCkg5omn6KGM55qE5pe26ZW/5LiN5Lya6K6p6LCD55So5pa55oyC6LW3562J5b6FXG4gKiAgICDlnKjkuIrlsYLmmI7noa7osIPnlKggUHJvdG9jb2wuY2xvc2UoKSDlkI7vvIzmiY3kuI3kvJrosIPnlKggUHJvdG9jb2wuc2VuZCgpXG4gKiAgICBEZWxlZ2F0ZS5vbk1lc3NhZ2UoKSDlpLHotKUg5Y+KIERlbGVnYXRlLm9uRXJyb3IoKSDkvJrlvILmraXosIPnlKggUHJvdG9jb2wuY2xvc2UoKVxuICpcbiAqICAgIOi/nuaOpeaIkOWKn+WQju+8jOS7u+S9leS4jeiDvee7p+e7remAmuS/oeeahOaDheWGtemDveS7pSBEZWxlZ2F0ZS5vbkVycm9yKCkg6L+U5ZueXG4gKiAgICBEZWxlZ2F0ZS5jbG9zZSgpIOeahOiwg+eUqOS4jeinpuWPkSBEZWxlZ2F0ZS5vbkVycm9yKClcbiAqICAgIERlbGVnYXRlLmNvbm5lY3QoKSDnmoTplJnor6/kuI3op6blj5EgRGVsZWdhdGUub25FcnJvcigpXG4gKiAgICBEZWxlZ2F0ZS5zZW5kKCkg5LuF6L+U5Zue5pys5qyhIERlbGVnYXRlLnNlbmQoKSDnmoTplJnor6/vvIxcbiAqICAgICAgIOS4jeaYr+W6leWxgumAmuS/oeeahOmUmeivr++8jOW6leWxgumAmuS/oeeahOmUmeivr+mAmui/hyBEZWxlZ2F0ZS5vbkVycm9yKCkg6L+U5ZueXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBIYW5kc2hha2Uge1xuXHRIZWFyQmVhdFRpbWU6IER1cmF0aW9uID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcblx0RnJhbWVUaW1lb3V0OiBEdXJhdGlvbiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIC8vIOWQjOS4gOW4p+mHjOmdoueahOaVsOaNrui2heaXtlxuXHRNYXhDb25jdXJyZW50OiBudW1iZXIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAvLyDkuIDkuKrov57mjqXkuIrnmoTmnIDlpKflubblj5Fcblx0TWF4Qnl0ZXM6IG51bWJlciA9IDEwICogMTAyNCAqIDEwMjQgLy8g5LiA5bin5pWw5o2u55qE5pyA5aSn5a2X6IqC5pWwXG5cdENvbm5lY3RJZDogc3RyaW5nID0gXCItLS1ub19jb25uZWN0SWQtLS1cIlxuXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGBoYW5kc2hha2UgaW5mbzp7Q29ubmVjdElkOiAke3RoaXMuQ29ubmVjdElkfSwgTWF4Q29uY3VycmVudDogJHt0aGlzLk1heENvbmN1cnJlbnR9LCBIZWFyQmVhdFRpbWU6ICR7Zm9ybWF0RHVyYXRpb24odGhpcy5IZWFyQmVhdFRpbWUpfSwgTWF4Qnl0ZXMvZnJhbWU6ICR7dGhpcy5NYXhCeXRlc30sIEZyYW1lVGltZW91dDogJHtmb3JtYXREdXJhdGlvbih0aGlzLkZyYW1lVGltZW91dCl9fWBcblx0fVxuXG5cdC8qKlxuXHQgKiBgYGBcblx0ICogSGVhcnRCZWF0X3MgfCBGcmFtZVRpbWVvdXRfcyB8IE1heENvbmN1cnJlbnQgfCBNYXhCeXRlcyB8IGNvbm5lY3QgaWRcblx0ICogSGVhcnRCZWF0X3M6IDIgYnl0ZXMsIG5ldCBvcmRlclxuXHQgKiBGcmFtZVRpbWVvdXRfczogMSBieXRlXG5cdCAqIE1heENvbmN1cnJlbnQ6IDEgYnl0ZVxuXHQgKiBNYXhCeXRlczogNCBieXRlcywgbmV0IG9yZGVyXG5cdCAqIGNvbm5lY3QgaWQ6IDggYnl0ZXMsIG5ldCBvcmRlclxuXHQgKiBgYGBcblx0ICovXG5cblx0c3RhdGljIFN0cmVhbUxlbiA9IDIgKyAxICsgMSArIDQgKyA4XG5cblx0c3RhdGljIFBhcnNlKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBIYW5kc2hha2Uge1xuXHRcdGFzc2VydChidWZmZXIuYnl0ZUxlbmd0aCA+PSBIYW5kc2hha2UuU3RyZWFtTGVuKVxuXG5cdFx0bGV0IHJldCA9IG5ldyBIYW5kc2hha2UoKVxuXHRcdGxldCB2aWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG5cblx0XHRyZXQuSGVhckJlYXRUaW1lID0gdmlldy5nZXRVaW50MTYoMCkgKiBTZWNvbmRcblx0XHRyZXQuRnJhbWVUaW1lb3V0ID0gdmlldy5nZXRVaW50OCgyKSAqIFNlY29uZFxuXHRcdHJldC5NYXhDb25jdXJyZW50ID0gdmlldy5nZXRVaW50OCgzKTtcblx0XHRyZXQuTWF4Qnl0ZXMgPSB2aWV3LmdldFVpbnQzMig0KTtcblx0XHRyZXQuQ29ubmVjdElkID0gKFwiMDAwMDAwMDBcIiArIHZpZXcuZ2V0VWludDMyKDgpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTgpICtcblx0XHRcdChcIjAwMDAwMDAwXCIgKyB2aWV3LmdldFVpbnQzMigxMikudG9TdHJpbmcoMTYpKS5zbGljZSgtOCk7XG5cblx0XHRyZXR1cm4gcmV0XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm90b2NvbCB7XG5cdENvbm5lY3QoKTogUHJvbWlzZTxbSGFuZHNoYWtlLCBTdG1FcnJvcnxudWxsXT5cblx0Q2xvc2UoKTogUHJvbWlzZTx2b2lkPlxuXHRTZW5kKGRhdGE6IEFycmF5QnVmZmVyKTogUHJvbWlzZTxTdG1FcnJvcnxudWxsPlxuXG5cdGxvZ2dlcjogTG9nZ2VyXG5cblx0Ly8gZGVsZWdhdGVcblx0b25NZXNzYWdlOiAoZGF0YTpBcnJheUJ1ZmZlcik9PlByb21pc2U8dm9pZD5cblx0b25FcnJvcjogKGVycjogU3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+XG59XG5cbiIsImltcG9ydCB7SGFuZHNoYWtlLCBQcm90b2NvbH0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuaW1wb3J0IHtDb25uVGltZW91dEVyciwgRWxzZUNvbm5FcnIsIGlzU3RtRXJyb3IsIFN0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5pbXBvcnQge0NvbnNvbGVMb2dnZXIsIER1cmF0aW9uLCBMb2dnZXIsIFNlY29uZCwgVW5pcUZsYWd9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHthc3luY0V4ZSwgQ2hhbm5lbCwgU2VuZENoYW5uZWwsIFRpbWVvdXQsIHdpdGhUaW1lb3V0fSBmcm9tIFwidHMtY29uY3VycmVuY3lcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVzc2FnZUV2ZW50IGV4dGVuZHMgRXZlbnR7XG5cdHJlYWRvbmx5IGRhdGE6IEFycmF5QnVmZmVyIHwgc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xvc2VFdmVudCBleHRlbmRzIEV2ZW50e1xuXHRyZWFkb25seSBjb2RlOiBudW1iZXI7XG5cdHJlYWRvbmx5IHJlYXNvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yRXZlbnQgZXh0ZW5kcyBFdmVudHtcblx0ZXJyTXNnOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXZWJTb2NrZXREcml2ZXIge1xuXHRvbmNsb3NlOiAoKGV2OiBDbG9zZUV2ZW50KSA9PiBhbnkpXG5cdG9uZXJyb3I6ICgoZXY6IEVycm9yRXZlbnQpID0+IGFueSlcblx0b25tZXNzYWdlOiAoKGV2OiBNZXNzYWdlRXZlbnQpID0+IGFueSlcblx0b25vcGVuOiAoKGV2OiBFdmVudCkgPT4gYW55KVxuXG5cdGNsb3NlKGNvZGU/OiBudW1iZXIsIHJlYXNvbj86IHN0cmluZyk6IHZvaWRcblx0c2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IHZvaWRcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0V2ViU29ja2V0RHJpdmVyIGltcGxlbWVudHMgV2ViU29ja2V0RHJpdmVye1xuXHRvbmNsb3NlOiAoKGV2OiBDbG9zZUV2ZW50KSA9PiBhbnkpID0gKCk9Pnt9XG5cdG9uZXJyb3I6ICgoZXY6IEVycm9yRXZlbnQpID0+IGFueSkgID0gKCk9Pnt9XG5cdG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50KSA9PiBhbnkpID0gKCk9Pnt9XG5cdG9ub3BlbjogKChldjogRXZlbnQpID0+IGFueSkgPSAoKT0+e31cblxuXHRhYnN0cmFjdCBjbG9zZShjb2RlPzogbnVtYmVyLCByZWFzb24/OiBzdHJpbmcpOiB2b2lkXG5cdGFic3RyYWN0IHNlbmQoZGF0YTogQXJyYXlCdWZmZXIpOiB2b2lkXG59XG5cbmNsYXNzIGR1bW15V3MgZXh0ZW5kcyBBYnN0cmFjdFdlYlNvY2tldERyaXZlciB7XG5cdGNsb3NlKCk6IHZvaWQge31cblx0c2VuZCgpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJTb2NrZXRQcm90b2NvbCBpbXBsZW1lbnRzIFByb3RvY29sIHtcblx0bG9nZ2VyXzogTG9nZ2VyID0gQ29uc29sZUxvZ2dlclxuXHRvbk1lc3NhZ2U6IChkYXRhOkFycmF5QnVmZmVyKT0+UHJvbWlzZTx2b2lkPiA9IGFzeW5jICgpPT57fVxuXHRvbkVycm9yOiAoZXJyOiBTdG1FcnJvcik9PlByb21pc2U8dm9pZD4gPSBhc3luYyAoKT0+e31cblx0Y2xvc2VCeVNlbGY6IGJvb2xlYW4gPSBmYWxzZVxuXHRoYW5kc2hha2U6IEhhbmRzaGFrZSA9IG5ldyBIYW5kc2hha2UoKVxuXG5cdGdldCBjb25uZWN0SUQoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy5oYW5kc2hha2UuQ29ubmVjdElkIH1cblx0cHJpdmF0ZSBmbGFnID0gVW5pcUZsYWcoKVxuXHRkcml2ZXI6IEFic3RyYWN0V2ViU29ja2V0RHJpdmVyID0gbmV3IGR1bW15V3MoKVxuXG5cdGdldCBsb2dnZXIoKTogTG9nZ2VyIHtcblx0XHRyZXR1cm4gdGhpcy5sb2dnZXJfXG5cdH1cblx0c2V0IGxvZ2dlcihsKSB7XG5cdFx0dGhpcy5sb2dnZXJfID0gbFxuXHRcdHRoaXMubG9nZ2VyXy53LmRlYnVnKHRoaXMubG9nZ2VyXy5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XS5uZXdgLCBgZmxhZz0ke3RoaXMuZmxhZ31gKSlcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdXJsOiBzdHJpbmcsIHByaXZhdGUgZHJpdmVyQ3JlYXRvcjogKHVybDpzdHJpbmcpPT5XZWJTb2NrZXREcml2ZXJcblx0XHRcdFx0XHRcdFx0LCBwcml2YXRlIGNvbm5lY3RUaW1lb3V0OiBEdXJhdGlvbiA9IDMwKlNlY29uZCkge1xuXHRcdGlmICh1cmwuaW5kZXhPZihcInM6Ly9cIikgPT09IC0xKSB7XG5cdFx0XHR0aGlzLnVybCA9IFwid3M6Ly9cIiArIHVybDtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBDbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLmNsb3NlQnlTZWxmID0gdHJ1ZVxuXHRcdHRoaXMuZHJpdmVyLmNsb3NlKClcblx0XHR0aGlzLmRyaXZlciA9IG5ldyBkdW1teVdzKClcblx0fVxuXG5cdGNyZWF0ZURyaXZlcihoYW5kc2hha2VDaGFubmVsOiBTZW5kQ2hhbm5lbDxBcnJheUJ1ZmZlcnxTdG1FcnJvcj4pIHtcblx0XHRsZXQgaXNDb25uZWN0aW5nID0gdHJ1ZVxuXHRcdHRoaXMuZHJpdmVyID0gdGhpcy5kcml2ZXJDcmVhdG9yKHRoaXMudXJsKVxuXHRcdHRoaXMuZHJpdmVyLm9uY2xvc2UgPSAoZXYpPT57XG5cdFx0XHRpZiAoaXNDb25uZWN0aW5nKSB7XG5cdFx0XHRcdGlzQ29ubmVjdGluZyA9IGZhbHNlXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XS5vbmNsb3NlYCwgYCR7ZXYuY29kZX0gJHtldi5yZWFzb259YCkpXG5cdFx0XHRcdFx0YXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5TZW5kKG5ldyBFbHNlQ29ubkVycihgY2xvc2VkOiAke2V2LmNvZGV9ICR7ZXYucmVhc29ufWApKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5jbG9zZUJ5U2VsZikge1xuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25jbG9zZWBcblx0XHRcdFx0XHRcdCwgYGNsb3NlZCBieSBwZWVyOiAke2V2LmNvZGV9ICR7ZXYucmVhc29ufWApKVxuXHRcdFx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihuZXcgRWxzZUNvbm5FcnIoYGNsb3NlZCBieSBwZWVyOiAke2V2LmNvZGV9ICR7ZXYucmVhc29ufWApKVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmRyaXZlci5vbmVycm9yID0gKGV2KT0+e1xuXHRcdFx0aWYgKGlzQ29ubmVjdGluZykge1xuXHRcdFx0XHRpc0Nvbm5lY3RpbmcgPSBmYWxzZVxuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25lcnJvcmAsIGV2LmVyck1zZykpXG5cdFx0XHRcdFx0YXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5TZW5kKG5ldyBFbHNlQ29ubkVycihldi5lcnJNc2cpKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5jbG9zZUJ5U2VsZikge1xuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25lcnJvcmAsIGAke2V2LmVyck1zZ31gKSlcblx0XHRcdFx0XHRhd2FpdCB0aGlzLm9uRXJyb3IobmV3IEVsc2VDb25uRXJyKGV2LmVyck1zZykpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuZHJpdmVyLm9ubWVzc2FnZSA9IChldik9Pntcblx0XHRcdGlmICh0eXBlb2YgZXYuZGF0YSA9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25tZXNzYWdlOmVycm9yYCwgXCJtZXNzYWdlIHR5cGUgZXJyb3JcIikpXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5vbkVycm9yKG5ldyBFbHNlQ29ubkVycihcIm1lc3NhZ2UgdHlwZSBlcnJvclwiKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdGxldCBkYXRhOkFycmF5QnVmZmVyID0gZXYuZGF0YVxuXG5cdFx0XHRpZiAoaXNDb25uZWN0aW5nKSB7XG5cdFx0XHRcdGlzQ29ubmVjdGluZyA9IGZhbHNlXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0YXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5TZW5kKGRhdGEpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5yZWFkYFxuXHRcdFx0XHRcdCwgYHJlYWQgb25lIG1lc3NhZ2VgKSlcblx0XHRcdFx0YXdhaXQgdGhpcy5vbk1lc3NhZ2UoZGF0YSlcblx0XHRcdH0pXG5cdFx0fVxuXHRcdHRoaXMuZHJpdmVyLm9ub3BlbiA9ICgpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9ub3BlbmAsIGB3YWl0aW5nIGZvciBoYW5kc2hha2VgKSlcblx0XHR9XG5cdH1cblxuXHRhc3luYyBDb25uZWN0KCk6IFByb21pc2U8W0hhbmRzaGFrZSwgKFN0bUVycm9yIHwgbnVsbCldPiB7XG5cdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XS5Db25uZWN0OnN0YXJ0YFxuXHRcdFx0LCBgJHt0aGlzLnVybH0jY29ubmVjdFRpbWVvdXQ9JHt0aGlzLmNvbm5lY3RUaW1lb3V0fWApKVxuXG5cdFx0bGV0IGhhbmRzaGFrZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbDxBcnJheUJ1ZmZlcnxTdG1FcnJvcj4oMSlcblx0XHR0aGlzLmNyZWF0ZURyaXZlcihoYW5kc2hha2VDaGFubmVsKVxuXG5cdFx0bGV0IGhhbmRzaGFrZSA9IGF3YWl0IHdpdGhUaW1lb3V0PEFycmF5QnVmZmVyfFN0bUVycm9yfG51bGw+KHRoaXMuY29ubmVjdFRpbWVvdXQsIGFzeW5jICgpPT57XG5cdFx0XHRyZXR1cm4gYXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5SZWNlaXZlKClcblx0XHR9KVxuXHRcdGlmIChoYW5kc2hha2UgaW5zdGFuY2VvZiBUaW1lb3V0KSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFskeyh0aGlzLmZsYWcpfV0uQ29ubmVjdDplcnJvcmAsIFwidGltZW91dFwiKSlcblx0XHRcdHJldHVybiBbbmV3IEhhbmRzaGFrZSgpLCBuZXcgQ29ublRpbWVvdXRFcnIoXCJ0aW1lb3V0XCIpXVxuXHRcdH1cblx0XHRpZiAoaXNTdG1FcnJvcihoYW5kc2hha2UpKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFskeyh0aGlzLmZsYWcpfV0uQ29ubmVjdDplcnJvcmAsIGAke2hhbmRzaGFrZX1gKSlcblx0XHRcdHJldHVybiBbbmV3IEhhbmRzaGFrZSgpLCBoYW5kc2hha2VdXG5cdFx0fVxuXHRcdGlmIChoYW5kc2hha2UgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHsodGhpcy5mbGFnKX1dLkNvbm5lY3Q6ZXJyb3JgLCBcImNoYW5uZWwgY2xvc2VkXCIpKVxuXHRcdFx0cmV0dXJuIFtuZXcgSGFuZHNoYWtlKCksIG5ldyBFbHNlQ29ubkVycihcImNoYW5uZWwgY2xvc2VkXCIpXVxuXHRcdH1cblxuXHRcdGlmIChoYW5kc2hha2UuYnl0ZUxlbmd0aCAhPSBIYW5kc2hha2UuU3RyZWFtTGVuKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFskeyh0aGlzLmZsYWcpfV0uQ29ubmVjdDplcnJvcmBcblx0XHRcdFx0LCBgaGFuZHNoYWtlKCR7aGFuZHNoYWtlLmJ5dGVMZW5ndGh9KSBzaXplIGVycm9yYCkpXG5cdFx0XHRyZXR1cm4gW25ldyBIYW5kc2hha2UoKSwgbmV3IEVsc2VDb25uRXJyKGBoYW5kc2hha2UoJHtoYW5kc2hha2UuYnl0ZUxlbmd0aH0pIHNpemUgZXJyb3JgKV1cblx0XHR9XG5cdFx0dGhpcy5oYW5kc2hha2UgPSBIYW5kc2hha2UuUGFyc2UoaGFuZHNoYWtlKVxuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XTwkeyh0aGlzLmNvbm5lY3RJRCl9Pi5Db25uZWN0OmVuZGBcblx0XHRcdCwgYGNvbm5lY3RJRCA9ICR7KHRoaXMuY29ubmVjdElEKX1gKSlcblxuXHRcdHJldHVybiBbdGhpcy5oYW5kc2hha2UsIG51bGxdXG5cdH1cblxuXHRhc3luYyBTZW5kKGRhdGE6IEFycmF5QnVmZmVyKTogUHJvbWlzZTxTdG1FcnJvciB8IG51bGw+IHtcblx0XHR0aGlzLmRyaXZlci5zZW5kKGRhdGEpXG5cdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uU2VuZGBcblx0XHRcdCwgYGZyYW1lQnl0ZXMgPSAke2RhdGEuYnl0ZUxlbmd0aH1gKSlcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG5cbiIsIlxuZXhwb3J0IHt0eXBlIER1cmF0aW9uLCBIb3VyLCBTZWNvbmQsIE1pbnV0ZSwgTWljcm9zZWNvbmQsIE1pbGxpc2Vjb25kLCBmb3JtYXREdXJhdGlvbn0gZnJvbSBcIi4vc3JjL2R1cmF0aW9uXCJcblxuZXhwb3J0IHtVdGY4fSBmcm9tIFwiLi9zcmMvdXRmOFwiXG5cbmV4cG9ydCB7dHlwZSBMb2dnZXIsIENvbnNvbGVMb2dnZXJ9IGZyb20gXCIuL3NyYy9sb2dnZXJcIlxuXG5leHBvcnQge0Fzc2VydEVycm9yLCBhc3NlcnR9IGZyb20gXCIuL3NyYy9hc3NlcnRcIlxuXG5leHBvcnQge1JhbmRvbUludCwgVW5pcUZsYWd9IGZyb20gJy4vc3JjL3R5cGVmdW5jJ1xuXG4iLCJcbmV4cG9ydCBjbGFzcyBBc3NlcnRFcnJvciBpbXBsZW1lbnRzIEVycm9yIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiQXNzZXJ0RXJyb3JcIlxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuXHRcdHRoaXMubWVzc2FnZSA9IG1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbXNnOiBzdHJpbmcgPSBcIlwiKSB7XG5cdGlmICghY29uZGl0aW9uKSB7XG5cdFx0Y29uc29sZS5hc3NlcnQoY29uZGl0aW9uLCBtc2cpXG5cdFx0dGhyb3cgbmV3IEFzc2VydEVycm9yKG1zZylcblx0fVxufVxuIiwiXG5cbmV4cG9ydCB0eXBlIER1cmF0aW9uID0gbnVtYmVyXG5cbmV4cG9ydCBjb25zdCBNaWNyb3NlY29uZCA9IDFcbmV4cG9ydCBjb25zdCBNaWxsaXNlY29uZCA9IDEwMDAgKiBNaWNyb3NlY29uZFxuZXhwb3J0IGNvbnN0IFNlY29uZCA9IDEwMDAgKiBNaWxsaXNlY29uZFxuZXhwb3J0IGNvbnN0IE1pbnV0ZSA9IDYwICogU2Vjb25kXG5leHBvcnQgY29uc3QgSG91ciA9IDYwICogTWludXRlXG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREdXJhdGlvbihkOiBEdXJhdGlvbik6IHN0cmluZyB7XG5cdGxldCByZXQgPSBcIlwiXG5cdGxldCBsZWZ0ID0gZFxuXG5cdGxldCB2ID0gTWF0aC5mbG9vcihsZWZ0L0hvdXIpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1oYFxuXHRcdGxlZnQgLT0gdiAqIEhvdXJcblx0fVxuXHR2ID0gTWF0aC5mbG9vcihsZWZ0L01pbnV0ZSlcblx0aWYgKHYgIT0gMCkge1xuXHRcdHJldCArPSBgJHt2fW1pbmBcblx0XHRsZWZ0IC09IHYgKiBNaW51dGVcblx0fVxuXHR2ID0gTWF0aC5mbG9vcihsZWZ0L1NlY29uZClcblx0aWYgKHYgIT0gMCkge1xuXHRcdHJldCArPSBgJHt2fXNgXG5cdFx0bGVmdCAtPSB2ICogU2Vjb25kXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9NaWxsaXNlY29uZClcblx0aWYgKHYgIT0gMCkge1xuXHRcdHJldCArPSBgJHt2fW1zYFxuXHRcdGxlZnQgLT0gdiAqIE1pbGxpc2Vjb25kXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9NaWNyb3NlY29uZClcblx0aWYgKHYgIT0gMCkge1xuXHRcdHJldCArPSBgJHt2fXVzYFxuXHR9XG5cblx0aWYgKHJldC5sZW5ndGggPT0gMCkge1xuXHRcdHJldCA9IFwiMHVzXCJcblx0fVxuXG5cdHJldHVybiByZXRcbn1cbiIsIlxuZXhwb3J0IGludGVyZmFjZSBMb2dXcml0ZXIge1xuXHRkZWJ1Zyhtc2c6IHN0cmluZyk6IHZvaWRcblx0aW5mbyhtc2c6IHN0cmluZyk6IHZvaWRcblx0d2Fybihtc2c6IHN0cmluZyk6IHZvaWRcblx0ZXJyb3IobXNnOiBzdHJpbmcpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nRm9ybWF0dGVyIHtcblx0RGVidWcodGFnOiBzdHJpbmcsIG1zZzogc3RyaW5nKTogc3RyaW5nXG5cdEluZm8odGFnOiBzdHJpbmcsIG1zZzogc3RyaW5nKTogc3RyaW5nXG5cdFdhcm4odGFnOiBzdHJpbmcsIG1zZzogc3RyaW5nKTogc3RyaW5nXG5cdEVycm9yKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG5cdHc6IExvZ1dyaXRlclxuXHRmOiBMb2dGb3JtYXR0ZXJcbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVGb3JtYXR0ZXIgaW1wbGVtZW50cyBMb2dGb3JtYXR0ZXIge1xuICBEZWJ1Zyh0YWc6IGFueSwgbXNnOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9IERlYnVnOiAke3RhZ30gIC0tLT4gICR7bXNnfWBcbiAgfVxuXG4gIEVycm9yKHRhZzogYW55LCBtc2c6IGFueSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gRXJyb3I6ICR7dGFnfSAgLS0tPiAgJHttc2d9YFxuICB9XG5cbiAgSW5mbyh0YWc6IGFueSwgbXNnOiBhbnkpOiBzdHJpbmcge1xuXHRcdHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9IEluZm86ICR7dGFnfSAgLS0tPiAgJHttc2d9YFxuICB9XG5cbiAgV2Fybih0YWc6IGFueSwgbXNnOiBhbnkpOiBzdHJpbmcge1xuXHRcdHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9IFdhcm46ICR7dGFnfSAgLS0tPiAgJHttc2d9YFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDb25zb2xlTG9nZ2VyOiBMb2dnZXIgPSB7XG5cdHc6IGNvbnNvbGUsXG5cdGY6IG5ldyBUaW1lRm9ybWF0dGVyKClcbn1cblxuLyoqXG4gKiDmmoLmsqHmnInmib7liLAgY29uc29sZS5kZWJ1Zy9pbmZvL3dhcm4vZXJyb3Ig57G75Ly8IHNraXAgc3RhY2sg55qE5Yqf6IO977yM5peg5rOV5a+5IGNvbnNvbGUg5pa55rOV5YGa5LqM5qyhXG4gKiDlsIHoo4XvvIzlkKbliJkgY29uc29sZSDovpPlh7rnmoTmlofku7blkI3kuI7ooYzlj7fpg73mmK/kuozmrKHlsIHoo4Xmlofku7bnmoTmlofku7blkI3kuI7ooYzlj7fvvIzkuI3mlrnkvr/mn6XnnIvml6Xlv5fkv6Hmga9cbiAqICB0b2RvOiDmmK/lkKbmnInlhbbku5blj6/pnaDnmoTmlrnlvI/lgZrlpoLkuIvnmoTmm7/mjaI/XG4gKiBMb2dnZXIuRGVidWcodGFnLCBtc2cpID0+IExvZ2dlci53LmRlYnVnKExvZ2dlci5mLkRlYnVnKHRhZywgbXNnKSlcbiAqXG4gKi9cbiIsIlxuXG5leHBvcnQgZnVuY3Rpb24gUmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XG5cdG1pbiA9IE1hdGguY2VpbChtaW4pO1xuXHRtYXggPSBNYXRoLmZsb29yKG1heCk7XG5cdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVW5pcUZsYWcoKTogc3RyaW5nIHtcblx0cmV0dXJuIFJhbmRvbUludCgweDEwMDAwMDAwLCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikudG9TdHJpbmcoMTYpXG59XG4iLCJcbmV4cG9ydCBjbGFzcyBVdGY4IHtcbiAgcHVibGljIHJlYWRvbmx5IHJhdzogVWludDhBcnJheTtcbiAgcHJpdmF0ZSByZWFkb25seSBpbmRleGVzOiBBcnJheTxudW1iZXI+O1xuICBwcml2YXRlIHJlYWRvbmx5IHN0cjpzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBieXRlTGVuZ3RoOm51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGxlbmd0aDpudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoaW5wdXQ6IEFycmF5QnVmZmVyfHN0cmluZykge1xuICAgIHRoaXMuaW5kZXhlcyA9IG5ldyBBcnJheTxudW1iZXI+KCk7XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnJhdyA9IG5ldyBVaW50OEFycmF5KGlucHV0KTtcbiAgICAgIHRoaXMuc3RyID0gXCJcIlxuICAgICAgbGV0IHV0ZjhpID0gMDtcbiAgICAgIHdoaWxlICh1dGY4aSA8IHRoaXMucmF3Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLmluZGV4ZXMucHVzaCh1dGY4aSk7XG4gICAgICAgIGxldCBjb2RlID0gVXRmOC5sb2FkVVRGOENoYXJDb2RlKHRoaXMucmF3LCB1dGY4aSk7XG4gICAgICAgIHRoaXMuc3RyICs9IFN0cmluZy5mcm9tQ29kZVBvaW50KGNvZGUpXG4gICAgICAgIHV0ZjhpICs9IFV0ZjguZ2V0VVRGOENoYXJMZW5ndGgoY29kZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmluZGV4ZXMucHVzaCh1dGY4aSk7ICAvLyBlbmQgZmxhZ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0ciA9IGlucHV0O1xuXG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGZvciAobGV0IGNoIG9mIGlucHV0KSB7XG4gICAgICAgIGxlbmd0aCArPSBVdGY4LmdldFVURjhDaGFyTGVuZ3RoKGNoLmNvZGVQb2ludEF0KDApISlcbiAgICAgIH1cbiAgICAgIHRoaXMucmF3ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcblxuICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgIGZvciAobGV0IGNoIG9mIGlucHV0KSB7XG4gICAgICAgIHRoaXMuaW5kZXhlcy5wdXNoKGluZGV4KTtcbiAgICAgICAgaW5kZXggPSBVdGY4LnB1dFVURjhDaGFyQ29kZSh0aGlzLnJhdywgY2guY29kZVBvaW50QXQoMCkhLCBpbmRleClcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5kZXhlcy5wdXNoKGluZGV4KTsgLy8gZW5kIGZsYWdcbiAgICB9XG5cbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuaW5kZXhlcy5sZW5ndGggLSAxO1xuICAgIHRoaXMuYnl0ZUxlbmd0aCA9IHRoaXMucmF3LmJ5dGVMZW5ndGg7XG5cbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGxvYWRVVEY4Q2hhckNvZGUoYUNoYXJzOiBVaW50OEFycmF5LCBuSWR4OiBudW1iZXIpOiBudW1iZXIge1xuXG4gICAgbGV0IG5MZW4gPSBhQ2hhcnMubGVuZ3RoLCBuUGFydCA9IGFDaGFyc1tuSWR4XTtcblxuICAgIHJldHVybiBuUGFydCA+IDI1MSAmJiBuUGFydCA8IDI1NCAmJiBuSWR4ICsgNSA8IG5MZW4gP1xuICAgICAgLyogKG5QYXJ0IC0gMjUyIDw8IDMwKSBtYXkgYmUgbm90IHNhZmUgaW4gRUNNQVNjcmlwdCEgU28uLi46ICovXG4gICAgICAvKiBzaXggYnl0ZXMgKi8gKG5QYXJ0IC0gMjUyKSAqIDEwNzM3NDE4MjQgKyAoYUNoYXJzW25JZHggKyAxXSAtIDEyOCA8PCAyNClcbiAgICAgICsgKGFDaGFyc1tuSWR4ICsgMl0gLSAxMjggPDwgMTgpICsgKGFDaGFyc1tuSWR4ICsgM10gLSAxMjggPDwgMTIpXG4gICAgICArIChhQ2hhcnNbbklkeCArIDRdIC0gMTI4IDw8IDYpICsgYUNoYXJzW25JZHggKyA1XSAtIDEyOFxuICAgICAgOiBuUGFydCA+IDI0NyAmJiBuUGFydCA8IDI1MiAmJiBuSWR4ICsgNCA8IG5MZW4gP1xuICAgICAgICAvKiBmaXZlIGJ5dGVzICovIChuUGFydCAtIDI0OCA8PCAyNCkgKyAoYUNoYXJzW25JZHggKyAxXSAtIDEyOCA8PCAxOClcbiAgICAgICAgKyAoYUNoYXJzW25JZHggKyAyXSAtIDEyOCA8PCAxMikgKyAoYUNoYXJzW25JZHggKyAzXSAtIDEyOCA8PCA2KVxuICAgICAgICArIGFDaGFyc1tuSWR4ICsgNF0gLSAxMjhcbiAgICAgICAgOiBuUGFydCA+IDIzOSAmJiBuUGFydCA8IDI0OCAmJiBuSWR4ICsgMyA8IG5MZW4gP1xuICAgICAgICAgIC8qIGZvdXIgYnl0ZXMgKi8oblBhcnQgLSAyNDAgPDwgMTgpICsgKGFDaGFyc1tuSWR4ICsgMV0gLSAxMjggPDwgMTIpXG4gICAgICAgICAgKyAoYUNoYXJzW25JZHggKyAyXSAtIDEyOCA8PCA2KSArIGFDaGFyc1tuSWR4ICsgM10gLSAxMjhcbiAgICAgICAgICA6IG5QYXJ0ID4gMjIzICYmIG5QYXJ0IDwgMjQwICYmIG5JZHggKyAyIDwgbkxlbiA/XG4gICAgICAgICAgICAvKiB0aHJlZSBieXRlcyAqLyAoblBhcnQgLSAyMjQgPDwgMTIpICsgKGFDaGFyc1tuSWR4ICsgMV0gLSAxMjggPDwgNilcbiAgICAgICAgICAgICsgYUNoYXJzW25JZHggKyAyXSAtIDEyOFxuICAgICAgICAgICAgOiBuUGFydCA+IDE5MSAmJiBuUGFydCA8IDIyNCAmJiBuSWR4ICsgMSA8IG5MZW4gP1xuICAgICAgICAgICAgICAvKiB0d28gYnl0ZXMgKi8gKG5QYXJ0IC0gMTkyIDw8IDYpICsgYUNoYXJzW25JZHggKyAxXSAtIDEyOFxuICAgICAgICAgICAgICA6XG4gICAgICAgICAgICAgIC8qIG9uZSBieXRlICovIG5QYXJ0O1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgcHV0VVRGOENoYXJDb2RlKGFUYXJnZXQ6IFVpbnQ4QXJyYXksIG5DaGFyOiBudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgblB1dEF0OiBudW1iZXIpOm51bWJlciB7XG5cbiAgICBsZXQgbklkeCA9IG5QdXRBdDtcblxuICAgIGlmIChuQ2hhciA8IDB4ODAgLyogMTI4ICovKSB7XG4gICAgICAvKiBvbmUgYnl0ZSAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gbkNoYXI7XG4gICAgfSBlbHNlIGlmIChuQ2hhciA8IDB4ODAwIC8qIDIwNDggKi8pIHtcbiAgICAgIC8qIHR3byBieXRlcyAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHhjMCAvKiAxOTIgKi8gKyAobkNoYXIgPj4+IDYpO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAobkNoYXIgJiAweDNmIC8qIDYzICovKTtcbiAgICB9IGVsc2UgaWYgKG5DaGFyIDwgMHgxMDAwMCAvKiA2NTUzNiAqLykge1xuICAgICAgLyogdGhyZWUgYnl0ZXMgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ZTAgLyogMjI0ICovICsgKG5DaGFyID4+PiAxMik7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDYpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArIChuQ2hhciAmIDB4M2YgLyogNjMgKi8pO1xuICAgIH0gZWxzZSBpZiAobkNoYXIgPCAweDIwMDAwMCAvKiAyMDk3MTUyICovKSB7XG4gICAgICAvKiBmb3VyIGJ5dGVzICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweGYwIC8qIDI0MCAqLyArIChuQ2hhciA+Pj4gMTgpO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAxMikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gNikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKG5DaGFyICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgfSBlbHNlIGlmIChuQ2hhciA8IDB4NDAwMDAwMCAvKiA2NzEwODg2NCAqLykge1xuICAgICAgLyogZml2ZSBieXRlcyAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHhmOCAvKiAyNDggKi8gKyAobkNoYXIgPj4+IDI0KTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMTgpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDEyKSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiA2KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAobkNoYXIgJiAweDNmIC8qIDYzICovKTtcbiAgICB9IGVsc2UgLyogaWYgKG5DaGFyIDw9IDB4N2ZmZmZmZmYpICovIHsgLyogMjE0NzQ4MzY0NyAqL1xuICAgICAgLyogc2l4IGJ5dGVzICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweGZjIC8qIDI1MiAqLyArIC8qIChuQ2hhciA+Pj4gMzApIG1heSBiZSBub3Qgc2FmZSBpbiBFQ01BU2NyaXB0ISBTby4uLjogKi8gKG5DaGFyIC8gMTA3Mzc0MTgyNCk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDI0KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAxOCkgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMTIpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDYpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArIChuQ2hhciAmIDB4M2YgLyogNjMgKi8pO1xuICAgIH1cblxuICAgIHJldHVybiBuSWR4O1xuXG4gIH07XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0VVRGOENoYXJMZW5ndGgobkNoYXI6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIG5DaGFyIDwgMHg4MCA/IDEgOiBuQ2hhciA8IDB4ODAwID8gMiA6IG5DaGFyIDwgMHgxMDAwMFxuICAgICAgPyAzIDogbkNoYXIgPCAweDIwMDAwMCA/IDQgOiBuQ2hhciA8IDB4NDAwMDAwMCA/IDUgOiA2O1xuICB9XG5cblxuICAvLyBwcml2YXRlIHN0YXRpYyBsb2FkVVRGMTZDaGFyQ29kZShhQ2hhcnM6IFVpbnQxNkFycmF5LCBuSWR4OiBudW1iZXIpOiBudW1iZXIge1xuICAvL1xuICAvLyAgIC8qIFVURi0xNiB0byBET01TdHJpbmcgZGVjb2RpbmcgYWxnb3JpdGhtICovXG4gIC8vICAgbGV0IG5GcnN0Q2hyID0gYUNoYXJzW25JZHhdO1xuICAvL1xuICAvLyAgIHJldHVybiBuRnJzdENociA+IDB4RDdCRiAvKiA1NTIzMSAqLyAmJiBuSWR4ICsgMSA8IGFDaGFycy5sZW5ndGggP1xuICAvLyAgICAgKG5GcnN0Q2hyIC0gMHhEODAwIC8qIDU1Mjk2ICovIDw8IDEwKSArIGFDaGFyc1tuSWR4ICsgMV0gKyAweDI0MDAgLyogOTIxNiAqL1xuICAvLyAgICAgOiBuRnJzdENocjtcbiAgLy8gfVxuICAvL1xuICAvLyBwcml2YXRlIHN0YXRpYyBwdXRVVEYxNkNoYXJDb2RlKGFUYXJnZXQ6IFVpbnQxNkFycmF5LCBuQ2hhcjogbnVtYmVyLCBuUHV0QXQ6IG51bWJlcik6bnVtYmVyIHtcbiAgLy9cbiAgLy8gICBsZXQgbklkeCA9IG5QdXRBdDtcbiAgLy9cbiAgLy8gICBpZiAobkNoYXIgPCAweDEwMDAwIC8qIDY1NTM2ICovKSB7XG4gIC8vICAgICAvKiBvbmUgZWxlbWVudCAqL1xuICAvLyAgICAgYVRhcmdldFtuSWR4KytdID0gbkNoYXI7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIC8qIHR3byBlbGVtZW50cyAqL1xuICAvLyAgICAgYVRhcmdldFtuSWR4KytdID0gMHhEN0MwIC8qIDU1MjMyICovICsgKG5DaGFyID4+PiAxMCk7XG4gIC8vICAgICBhVGFyZ2V0W25JZHgrK10gPSAweERDMDAgLyogNTYzMjAgKi8gKyAobkNoYXIgJiAweDNGRiAvKiAxMDIzICovKTtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgcmV0dXJuIG5JZHg7XG4gIC8vIH1cbiAgLy9cbiAgLy8gcHJpdmF0ZSBzdGF0aWMgZ2V0VVRGMTZDaGFyTGVuZ3RoKG5DaGFyOiBudW1iZXIpOiBudW1iZXIge1xuICAvLyAgIHJldHVybiBuQ2hhciA8IDB4MTAwMDAgPyAxIDogMjtcbiAgLy8gfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOnN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RyO1xuICB9XG5cbiAgLy8gRGVwcmVjYXRlZFxuICBwdWJsaWMgY29kZVBvaW50QXQoaW5kZXg6IG51bWJlcik6QXJyYXlCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmNvZGVVbml0QXQoaW5kZXgpO1xuICB9XG5cbiAgcHVibGljIGNvZGVVbml0QXQoaW5kZXg6IG51bWJlcik6QXJyYXlCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnJhdy5zbGljZSh0aGlzLmluZGV4ZXNbaW5kZXhdLCB0aGlzLmluZGV4ZXNbaW5kZXgrMV0pO1xuICB9XG5cbn1cblxuXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIlxuaW1wb3J0IHtDbGllbnQsIHdpdGhCcm93c2VyfSBmcm9tIFwidHMtc3RyZWFtY2xpZW50XCJcbmltcG9ydCB7VW5pcUZsYWd9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHtKc29ufSBmcm9tIFwidHMtanNvblwiXG5cbmxldCBjbGllbnQ6IENsaWVudHxudWxsID0gbnVsbFxubGV0IHVybCA9IFwiXCJcblxuZnVuY3Rpb24gaGVhZGVycyhjYWNoZTogQ2FjaGUpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgbGV0IHJldDpNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpXG4gIGxldCBrZXk6IHN0cmluZyA9IFwiXCJcblxuICBrZXkgPSAoJChcIiNrZXkxXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gIGlmIChrZXkgIT09IFwiXCIpIHtcbiAgICBjYWNoZS5rZXkxID0ga2V5XG4gICAgY2FjaGUudmFsdWUxID0gKCQoXCIjdmFsdWUxXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gICAgcmV0LnNldChrZXksIGNhY2hlLnZhbHVlMSlcbiAgfSBlbHNlIHtcbiAgICBjYWNoZS5rZXkxID0gXCJcIlxuICAgIGNhY2hlLnZhbHVlMSA9IFwiXCJcbiAgfVxuXG4gIGtleSA9ICgkKFwiI2tleTJcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgaWYgKGtleSAhPT0gXCJcIikge1xuICAgIGNhY2hlLmtleTIgPSBrZXlcbiAgICBjYWNoZS52YWx1ZTIgPSAoJChcIiN2YWx1ZTJcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgICByZXQuc2V0KGtleSwgY2FjaGUudmFsdWUyKVxuICB9IGVsc2Uge1xuICAgIGNhY2hlLmtleTIgPSBcIlwiXG4gICAgY2FjaGUudmFsdWUyID0gXCJcIlxuICB9XG5cbiAga2V5ID0gKCQoXCIja2V5M1wiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICBpZiAoa2V5ICE9PSBcIlwiKSB7XG4gICAgY2FjaGUua2V5MyA9IGtleVxuICAgIGNhY2hlLnZhbHVlMyA9ICgkKFwiI3ZhbHVlM1wiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICAgIHJldC5zZXQoa2V5LCBjYWNoZS52YWx1ZTMpXG4gIH0gZWxzZSB7XG4gICAgY2FjaGUua2V5MyA9IFwiXCJcbiAgICBjYWNoZS52YWx1ZTMgPSBcIlwiXG4gIH1cblxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIHByaW50KHN0cmluZzogc3RyaW5nKSB7XG4gIGxldCBib2R5ID0gJChcIiNvdXRwdXRcIik7XG4gIGJvZHkuYXBwZW5kKFwiPHA+XCIrc3RyaW5nK1wiPC9wPlwiKTtcbn1cbmZ1bmN0aW9uIHByaW50UHVzaChzdHJpbmc6IHN0cmluZykge1xuICBsZXQgYm9keSA9ICQoXCIjb3V0cHV0XCIpO1xuICBib2R5LmFwcGVuZChcIjxwIHN0eWxlPSdjb2xvcjogY2FkZXRibHVlJz5cIitzdHJpbmcrXCI8L3A+XCIpO1xufVxuZnVuY3Rpb24gcHJpbnRFcnJvcihzdHJpbmc6IHN0cmluZykge1xuICBsZXQgYm9keSA9ICQoXCIjb3V0cHV0XCIpO1xuICBib2R5LmFwcGVuZChcIjxwIHN0eWxlPSdjb2xvcjogcmVkJz5cIitzdHJpbmcrXCI8L3A+XCIpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZCgpIHtcbiAgbGV0IHdzcyA9ICQoXCIjd3NzXCIpLnZhbCgpXG4gIGlmIChjbGllbnQgPT09IG51bGwgfHwgdXJsICE9IHdzcykge1xuICAgIHVybCA9IHdzcyBhcyBzdHJpbmdcbiAgICBjbGllbnQgPSBuZXcgQ2xpZW50KHdpdGhCcm93c2VyKHVybCkpXG5cdFx0Y2xpZW50Lm9uUHVzaCA9IGFzeW5jIChkYXRhKT0+e1xuXHRcdFx0cHJpbnRQdXNoKFwicHVzaDogXCIgKyBkYXRhLnRvU3RyaW5nKCkpXG5cdFx0fVxuICAgIGNsaWVudC5vblBlZXJDbG9zZWQgPSBhc3luYyAoZXJyKT0+e1xuXHRcdFx0cHJpbnRFcnJvcihgJHtlcnJ9YClcblx0XHR9XG4gIH1cblxuICBsZXQgY2FjaGUgPSBuZXcgQ2FjaGUoKVxuICBjYWNoZS53c3MgPSB1cmxcblxuICBjYWNoZS5kYXRhID0gJChcIiNwb3N0XCIpLnZhbCgpIGFzIHN0cmluZ1xuXG5cdCQoXCIjb3V0cHV0XCIpLmVtcHR5KClcblxuICBsZXQgW3JldCwgZXJyXSA9IGF3YWl0IGNsaWVudC5TZW5kV2l0aFJlcUlkKGNhY2hlLmRhdGEsIGhlYWRlcnMoY2FjaGUpKVxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImxhc3RcIiwgSlNPTi5zdHJpbmdpZnkoY2FjaGUpKVxuXG4gIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICBpZiAoZXJyLmlzQ29ubkVycikge1xuICAgICAgcHJpbnRFcnJvcihgY29ubi1lcnJvcjogJHtlcnJ9YClcbiAgICB9IGVsc2Uge1xuICAgICAgcHJpbnRFcnJvcihgcmVzcC1lcnJvcjogJHtlcnJ9YClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcHJpbnQoXCJyZXNwIHN0cmluZzogXCIgKyByZXQudG9TdHJpbmcoKSArIFwiXFxuICA9PT4gIHRvIGpzb246IFwiICsgSlNPTi5zdHJpbmdpZnkoSlNPTi5wYXJzZShyZXQudG9TdHJpbmcoKSkpKVxuICAgIGNvbnNvbGUubG9nKFwicmVzcC0tLWpzb246IFwiKVxuICAgIGNvbnNvbGUubG9nKEpTT04ucGFyc2UocmV0LnRvU3RyaW5nKCkpKVxuICB9XG59XG5cbiQoXCIjc2VuZFwiKS5vbihcImNsaWNrXCIsIGFzeW5jICgpPT57XG4gIGF3YWl0IHNlbmQoKVxufSlcblxuY2xhc3MgQ2FjaGUge1xuICB3c3M6IHN0cmluZyA9IFwiXCJcbiAga2V5MTogc3RyaW5nID0gXCJcIlxuICB2YWx1ZTE6IHN0cmluZyA9IFwiXCJcbiAga2V5Mjogc3RyaW5nID0gXCJcIlxuICB2YWx1ZTI6IHN0cmluZyA9IFwiXCJcbiAga2V5Mzogc3RyaW5nID0gXCJcIlxuICB2YWx1ZTM6IHN0cmluZyA9IFwiXCJcbiAgZGF0YTogc3RyaW5nID0gXCJcIlxufVxuXG4kKCgpPT57XG4gIGxldCBjYWNoZVMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImxhc3RcIilcbiAgbGV0IGNhY2hlOiBDYWNoZVxuICBpZiAoY2FjaGVTID09PSBudWxsKSB7XG4gICAgY2FjaGUgPSBuZXcgQ2FjaGUoKVxuICB9IGVsc2Uge1xuICAgIGNhY2hlID0gSlNPTi5wYXJzZShjYWNoZVMpIGFzIENhY2hlXG4gIH1cblxuICAkKFwiI2tleTFcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLmtleTEpXG4gICQoXCIjdmFsdWUxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS52YWx1ZTEpXG4gICQoXCIja2V5MlwiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUua2V5MilcbiAgJChcIiN2YWx1ZTJcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLnZhbHVlMilcbiAgJChcIiNrZXkzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS5rZXkzKVxuICAkKFwiI3ZhbHVlM1wiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUudmFsdWUzKVxuICAkKFwiI3dzc1wiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUud3NzKVxuXHQkKFwiI3Bvc3RcIikudmFsKGNhY2hlLmRhdGEpXG59KVxuXG5jbGFzcyBSZXR1cm5SZXEge1xuXHRkYXRhOiBzdHJpbmcgPSBcIlwiXG59XG5cbmZ1bmN0aW9uIGluaXRBdHRyKCkge1xuXHQkKFwiI2tleTFcIikuYXR0cihcInZhbHVlXCIsIFwiYXBpXCIpXG5cdCQoXCIjdmFsdWUxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlwiKVxuXHQkKFwiI2tleTJcIikuYXR0cihcInZhbHVlXCIsIFwiXCIpXG5cdCQoXCIjdmFsdWUyXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlwiKVxuXHQkKFwiI2tleTNcIikuYXR0cihcInZhbHVlXCIsIFwiXCIpXG5cdCQoXCIjdmFsdWUzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlwiKVxuXHQkKFwiI3dzc1wiKS5hdHRyKFwidmFsdWVcIiwgXCIxMjcuMC4wLjE6ODAwMVwiKVxuXHQkKFwiI3Bvc3RcIikudmFsKFwiXCIpXG59XG5cbiQoXCIjcmV0dXJuXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKCk9Pntcblx0aW5pdEF0dHIoKVxuXHQkKFwiI3ZhbHVlMVwiKS5hdHRyKFwidmFsdWVcIiwgXCJyZXR1cm5cIilcblx0bGV0IHJlcSA9IG5ldyBSZXR1cm5SZXEoKVxuXHRyZXEuZGF0YSA9IFVuaXFGbGFnKClcblx0JChcIiNwb3N0XCIpLnZhbChuZXcgSnNvbigpLnRvSnNvbihyZXEpKVxufSlcblxuXG5jbGFzcyBQdXNoUmVxIHtcblx0dGltZXM6IG51bWJlciA9IDBcblx0cHJlZml4OiBzdHJpbmcgPSBcIlwiXG59XG5cbiQoXCIjcHVzaFwiKS5vbihcImNsaWNrXCIsIGFzeW5jICgpPT57XG5cdGluaXRBdHRyKClcblx0JChcIiN2YWx1ZTFcIikuYXR0cihcInZhbHVlXCIsIFwiUHVzaEx0MjBUaW1lc1wiKVxuXHRsZXQgcmVxID0gbmV3IFB1c2hSZXEoKVxuXHRyZXEudGltZXMgPSAxMFxuXHRyZXEucHJlZml4ID0gXCJ0aGlzIGlzIGEgcHVzaCB0ZXN0XCJcblx0JChcIiNwb3N0XCIpLnZhbChuZXcgSnNvbigpLnRvSnNvbihyZXEpKVxufSlcblxuJChcIiNjbG9zZVwiKS5vbihcImNsaWNrXCIsIGFzeW5jICgpPT57XG5cdGluaXRBdHRyKClcblx0JChcIiN2YWx1ZTFcIikuYXR0cihcInZhbHVlXCIsIFwiY2xvc2VcIilcblx0JChcIiNwb3N0XCIpLnZhbChcInt9XCIpXG59KVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9