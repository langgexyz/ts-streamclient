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
    constructor(protocolCreator, logger = new ts_xutils__WEBPACK_IMPORTED_MODULE_1__.ConsoleLogger()) {
        this.protocolCreator = protocolCreator;
        this.logger = logger;
        this.onPush = () => __awaiter(this, void 0, void 0, function* () { });
        this.onPeerClosed = () => __awaiter(this, void 0, void 0, function* () { });
        this.flag = (0,ts_xutils__WEBPACK_IMPORTED_MODULE_1__.UniqFlag)();
        this.netMutex = new ts_concurrency__WEBPACK_IMPORTED_MODULE_2__.Mutex();
        logger.Info(`Client[${this.flag}].new`, `flag=${this.flag}`);
        this.net_ = this.newNet();
    }
    newNet() {
        return new _net__WEBPACK_IMPORTED_MODULE_0__.Net(this.logger, this.protocolCreator, (err) => __awaiter(this, void 0, void 0, function* () {
            this.logger.Warning(`Client[${this.flag}].onPeerClosed`, `reason: ${err}`);
            yield this.onPeerClosed(err);
        }), (data) => __awaiter(this, void 0, void 0, function* () {
            this.logger.Info(`Client[${this.flag}].onPush`, `size: ${data.byteLength}`);
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
            this.logger.Info(`Client[${this.flag}].Send[${sflag}]:start`, `headers:${(0,_net__WEBPACK_IMPORTED_MODULE_0__.formatMap)(headers)}, request utf8 size = ${utf8Data.byteLength}`);
            let net = yield this.net();
            let err = yield net.connect();
            if (err) {
                this.logger.Error(`Client[${this.flag}].Send[${sflag}]:error`, `connect error: ${err}`);
                return [new Result(), err];
            }
            let [ret, err2] = yield net.send(utf8Data.raw.buffer, headers, timeout);
            if (err2 == null) {
                this.logger.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`, `response size = ${ret.byteLength}`);
                return [new Result(ret), err2];
            }
            if (!err2.isConnErr) {
                this.logger.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`, `request error = ${err2}`);
                return [new Result(ret), err2];
            }
            // sending --- conn error:  retry
            this.logger.Debug(`Client[${this.flag}].Send[${sflag}]:retry`, `retry-1`);
            net = yield this.net();
            err = yield net.connect();
            if (err) {
                this.logger.Error(`Client[${this.flag}].Send[${sflag}]:error`, `connect error: ${err}`);
                return [new Result(), err];
            }
            [ret, err2] = yield net.send(utf8Data.raw.buffer, headers, timeout);
            if (err2 == null) {
                this.logger.Info(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):end`, `response size = ${ret.byteLength}`);
            }
            else {
                this.logger.Error(`Client[${this.flag}].Send[${sflag}](connID=${net.connectID}):error`, `request error = ${err2}`);
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
                this.logger.Info(`Client[${this.flag}].close`, "closed by self");
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
        logger.Debug(`Net[${this.flag}].new`, `flag=${this.flag}`);
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
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.Invalidated`, `${err}`);
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
                    this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated");
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
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:parse`, `error --- ${err}`);
                yield this.onError(err);
                return;
            }
            if (response.isPush) {
                let [pushAck, err] = response.newPushAck();
                if (err) {
                    this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:newPushAck`, `error --- ${err}`);
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
                        this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`, `error --- ${err}`);
                    }
                    this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:pushAck`, `pushID = ${response.pushId}`);
                }));
                return;
            }
            let ch = yield this.allRequests.Remove(response.reqId);
            if (ch == null) {
                this.logger.Warning(`Net[${this.flag}]<${this.connectID}>.onMessage:NotFind`, `warning: not find request for reqId(${response.reqId}`);
                return;
            }
            let ch1 = ch;
            this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.onMessage:response`, `reqId=${response.reqId}`);
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
                    this.logger.Debug(`Net[${this.flag}].connect:Connected`, `connID=${this.connectID}`);
                    return null;
                }
                if (this.state.isInvalidated()) {
                    this.logger.Debug(`Net[${this.flag}].connect<${this.connectID}>:Invalidated`, `${this.state.err}`);
                    return this.state.err;
                }
                // state.NotConnect
                this.logger.Debug(`Net[${this.flag}].connect:NotConnect`, "will connect");
                let [handshake, err] = yield this.proto.Connect();
                if (err != null) {
                    this.state = new Invalidated(err);
                    this.logger.Debug(`Net[${this.flag}].connect:error`, `${err}`);
                    return err;
                }
                // OK
                this.state = new Connected;
                this.handshake = handshake;
                this.allRequests.permits = this.handshake.MaxConcurrent;
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.connect:handshake`, `${this.handshake}`);
                return null;
            }));
        });
    }
    // 如果没有连接成功，直接返回失败
    send(data, headers, timeout = 30 * ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second) {
        return __awaiter(this, void 0, void 0, function* () {
            // 预判断
            let ret = yield this.connLocker.withLock(() => __awaiter(this, void 0, void 0, function* () {
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send:state`, `${this.state} --- headers:${formatMap(headers)}`);
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
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send:FakeHttpRequest`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: ${err}`);
                return [new ArrayBuffer(0), err];
            }
            if (request.loadLen > this.handshake.MaxBytes) {
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send:MaxBytes`, `headers:${formatMap(headers)} (reqId:${reqId}) --- error: data is Too Large`);
                return [new ArrayBuffer(0),
                    new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr(`request.size(${request.loadLen}) > MaxBytes(${this.handshake.MaxBytes})`)];
            }
            // 在客户端超时也认为是一个请求结束，但是真正的请求并没有结束，所以在服务器看来，仍然占用服务器的一个并发数
            // 因为网络异步的原因，客户端并发数不可能与服务器完全一样，所以这里主要是协助服务器做预控流，按照客户端的逻辑处理即可
            this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:request`, `headers:${formatMap(headers)} (reqId:${reqId})`);
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
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:Timeout`, `headers:${formatMap(headers)} (reqId:${reqId}) --- timeout(>${timeout / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second}s)`);
                return [new ArrayBuffer(0), new _error__WEBPACK_IMPORTED_MODULE_3__.ElseErr(`request timeout(${timeout / ts_xutils__WEBPACK_IMPORTED_MODULE_0__.Second}s)`)];
            }
            if (ret2[1]) {
                return [new ArrayBuffer(0), ret2[1]];
            }
            this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.send[${reqId}]:response`, `headers:${formatMap(headers)} (reqId:${reqId}) --- ${ret2[0].status}`);
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
                this.logger.Debug(`Net[${this.flag}]<${this.connectID}>.close`, "closed, become invalidated");
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
        this.logger_ = new ts_xutils__WEBPACK_IMPORTED_MODULE_2__.ConsoleLogger();
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
        this.logger_.Debug(`WebSocket[${this.flag}].new`, `flag=${this.flag}`);
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
                    this.logger.Debug(`WebSocket[${this.flag}].onclose`, `${ev.code} ${ev.reason}`);
                    yield handshakeChannel.Send(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`closed: ${ev.code} ${ev.reason}`));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.Debug(`WebSocket[${this.flag}].onclose`, `closed by peer: ${ev.code} ${ev.reason}`);
                    yield this.onError(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`closed by peer: ${ev.code} ${ev.reason}`));
                }));
            }
        };
        this.driver.onerror = (ev) => {
            if (isConnecting) {
                isConnecting = false;
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.Debug(`WebSocket[${this.flag}].onerror`, ev.errMsg);
                    yield handshakeChannel.Send(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(ev.errMsg));
                }));
                return;
            }
            if (!this.closeBySelf) {
                (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.asyncExe)(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.Debug(`WebSocket[${this.flag}].onerror`, `${ev.errMsg}`);
                    yield this.onError(new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(ev.errMsg));
                }));
            }
        };
        this.driver.onmessage = (ev) => {
            if (typeof ev.data == "string") {
                this.logger.Debug(`WebSocket[${this.flag}].onmessage:error`, "message type error");
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
                this.logger.Debug(`WebSocket[${this.flag}]<${this.connectID}>.read`, `read one message`);
                yield this.onMessage(data);
            }));
        };
        this.driver.onopen = () => {
            this.logger.Debug(`WebSocket[${this.flag}].onopen`, `waiting for handshake`);
        };
    }
    Connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Debug(`WebSocket[${this.flag}].Connect:start`, `${this.url}#connectTimeout=${this.connectTimeout}`);
            let handshakeChannel = new ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.Channel(1);
            this.createDriver(handshakeChannel);
            let handshake = yield (0,ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.withTimeout)(this.connectTimeout, () => __awaiter(this, void 0, void 0, function* () {
                return yield handshakeChannel.Receive();
            }));
            if (handshake instanceof ts_concurrency__WEBPACK_IMPORTED_MODULE_3__.Timeout) {
                this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, "timeout");
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ConnTimeoutErr("timeout")];
            }
            if ((0,_error__WEBPACK_IMPORTED_MODULE_1__.isStmError)(handshake)) {
                this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, `${handshake}`);
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), handshake];
            }
            if (handshake == null) {
                this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, "channel closed");
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr("channel closed")];
            }
            if (handshake.byteLength != _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake.StreamLen) {
                this.logger.Debug(`WebSocket[${(this.flag)}].Connect:error`, `handshake(${handshake.byteLength}) size error`);
                return [new _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake(), new _error__WEBPACK_IMPORTED_MODULE_1__.ElseConnErr(`handshake(${handshake.byteLength}) size error`)];
            }
            this.handshake = _protocol__WEBPACK_IMPORTED_MODULE_0__.Handshake.Parse(handshake);
            this.logger.Debug(`WebSocket[${(this.flag)}]<${(this.connectID)}>.Connect:end`, `connectID = ${(this.connectID)}`);
            return [this.handshake, null];
        });
    }
    Send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.driver.send(data);
            this.logger.Debug(`WebSocket[${this.flag}]<${this.connectID}>.Send`, `frameBytes = ${data.byteLength}`);
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
/* harmony export */   "ConsoleLogger": () => (/* binding */ ConsoleLogger)
/* harmony export */ });
class ConsoleLogger {
    Debug(tag, msg) {
        console.debug(`${new Date().toISOString()} Debug: ${tag}  --->  ${msg}`);
    }
    Error(tag, msg) {
        console.error(`${new Date().toISOString()} Error: ${tag}  --->  ${msg}`);
    }
    Info(tag, msg) {
        console.info(`${new Date().toISOString()} Info: ${tag}  --->  ${msg}`);
    }
    Warning(tag, msg) {
        console.warn(`${new Date().toISOString()} Warning: ${tag}  --->  ${msg}`);
    }
}


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTdCLElBQUksR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBRWpCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLEtBQUssSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFO1lBQ3ZCLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNELEdBQUcsRUFBRSxDQUFDO1lBQ04sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakQsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQ3hCLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdELEdBQUcsRUFBRSxDQUFDO1lBQ04sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1NBQzNCO1FBQ0QsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVDLEdBQUcsRUFBRSxDQUFDO1FBRU4sQ0FBQyxJQUFJ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LEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLGdCQUFnQixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztzQkFDbkUsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztzQkFDOUQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO2dCQUN4QixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQy9DLGdCQUFnQixFQUFDLEtBQUssR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7MEJBQ2xFLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO29CQUN4RCxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQy9DLGlCQUFpQixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQzs4QkFDbkUsTUFBTSxDQUFDLElBQUks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QUU7SUFDVixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7SUFDM0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxPQUFPLEVBQUU7SUFDdkIsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFO0lBQ2QsR0FBRyxDQUFDLE1BQU0sR0FBRyxxQkFBcUI7SUFDbEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlDQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxFQUFDO0FBRUYsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBUSxFQUFFO0lBQ2pDLFFBQVEsRUFBRTtJQUNWLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztJQUNuQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQUNyQixDQUFDLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLWNvbmN1cnJlbmN5L3NyYy9hc3luY2V4ZS50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvc3JjL2NoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLWNvbmN1cnJlbmN5L3NyYy9tdXRleC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMtY29uY3VycmVuY3kvc3JjL3F1ZXVlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy1jb25jdXJyZW5jeS9zcmMvc2VtYXBob3JlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy1jb25jdXJyZW5jeS9zcmMvdGltZW91dC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9ub2RlX21vZHVsZXMvdHMtanNvbi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL3NyYy9jb2Rlci50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vbm9kZV9tb2R1bGVzL3RzLWpzb24vc3JjL2pzb24udHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL25vZGVfbW9kdWxlcy90cy1qc29uL3NyYy90eXBlLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvYnJvd3NlcndzLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvY2xpZW50LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvZXJyb3IudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uL3NyYy9mYWtlaHR0cC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vc3JjL25ldC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vc3JjL3Byb3RvY29sLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi9zcmMvd2Vic29ja2V0LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4uLy4uL3RzLXh1dGlscy9zcmMvYXNzZXJ0LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvc3JjL2R1cmF0aW9uLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uLi8uLi90cy14dXRpbHMvc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMteHV0aWxzL3NyYy90eXBlZnVuYy50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi4vLi4vdHMteHV0aWxzL3NyYy91dGY4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7Q2hhbm5lbCwgQ2hhbm5lbENsb3NlZH0gZnJvbSBcIi4vc3JjL2NoYW5uZWxcIlxuZXhwb3J0IHR5cGUgeyBTZW5kQ2hhbm5lbCwgUmVjZWl2ZUNoYW5uZWwgfSBmcm9tIFwiLi9zcmMvY2hhbm5lbFwiO1xuXG5leHBvcnQge1NlbWFwaG9yZX0gZnJvbSBcIi4vc3JjL3NlbWFwaG9yZVwiXG5cbmV4cG9ydCB7TXV0ZXh9IGZyb20gXCIuL3NyYy9tdXRleFwiXG5cbmV4cG9ydCB7d2l0aFRpbWVvdXQsIFRpbWVvdXR9IGZyb20gXCIuL3NyYy90aW1lb3V0XCJcblxuZXhwb3J0IHthc3luY0V4ZX0gZnJvbSBcIi4vc3JjL2FzeW5jZXhlXCJcblxuIiwiXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNFeGUoZXhlOiAoKT0+UHJvbWlzZTx2b2lkPik6dm9pZCB7XG5cdC8vIGlnbm9yZSByZXR1cm5cblx0bmV3IFByb21pc2U8dm9pZD4oYXN5bmMgKHJlc29sdmUpID0+IHtcblx0XHRhd2FpdCBleGUoKVxuXHRcdHJlc29sdmUoKVxuXHR9KVxufVxuIiwiXG5leHBvcnQgY2xhc3MgQ2hhbm5lbENsb3NlZCBpbXBsZW1lbnRzIEVycm9yIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiQ2hhbm5lbENsb3NlZFwiXG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gbVxuXHR9XG59XG5cbmltcG9ydCB7cXVldWV9IGZyb20gXCIuL3F1ZXVlXCJcblxuZXhwb3J0IGludGVyZmFjZSBTZW5kQ2hhbm5lbDxFPiB7XG5cdFNlbmQoZTogRSk6IFByb21pc2U8Q2hhbm5lbENsb3NlZHxudWxsPlxuXHRDbG9zZShyZWFzb246IHN0cmluZyk6dm9pZFxuXHRDbG9zZSgpOnZvaWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWNlaXZlQ2hhbm5lbDxFPiB7XG5cdFJlY2VpdmVPckZhaWxlZCgpOiBQcm9taXNlPEV8Q2hhbm5lbENsb3NlZD5cblx0UmVjZWl2ZSgpOiBQcm9taXNlPEV8bnVsbD5cbn1cblxuZXhwb3J0IGNsYXNzIENoYW5uZWw8RT4gaW1wbGVtZW50cyBTZW5kQ2hhbm5lbDxFPiwgUmVjZWl2ZUNoYW5uZWw8RT4ge1xuXHRkYXRhOiBxdWV1ZTxFPiA9IG5ldyBxdWV1ZVxuXHRzZW5kU3VzcGVuZDogcXVldWU8W0UsIChyZXQ6IENoYW5uZWxDbG9zZWR8bnVsbCk9PnZvaWRdPiA9IG5ldyBxdWV1ZSgpXG5cdHJlY2VpdmVTdXNwZW5kOiBxdWV1ZTwodmFsdWU6IEV8Q2hhbm5lbENsb3NlZCk9PnZvaWQ+ID0gbmV3IHF1ZXVlKClcblx0bWF4OiBudW1iZXJcblx0Y2xvc2VkOiBDaGFubmVsQ2xvc2VkfG51bGwgPSBudWxsXG5cblx0Y29uc3RydWN0b3IobWF4OiBudW1iZXIgPSAwKSB7XG5cdFx0dGhpcy5tYXggPSBtYXhcblx0fVxuXG5cdENsb3NlKHJlYXNvbjogc3RyaW5nKTogdm9pZFxuXHRDbG9zZSgpOiB2b2lkXG5cdENsb3NlKHJlYXNvbj86IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuY2xvc2VkID0gbmV3IENoYW5uZWxDbG9zZWQocmVhc29uID8gcmVhc29uIDogXCJcIilcblx0XHRmb3IgKGxldCBzID0gdGhpcy5zZW5kU3VzcGVuZC5kZSgpOyBzICE9IG51bGw7IHMgPSB0aGlzLnNlbmRTdXNwZW5kLmRlKCkpIHtcblx0XHRcdHNbMV0odGhpcy5jbG9zZWQpXG5cdFx0fVxuXHRcdGZvciAobGV0IHIgPSB0aGlzLnJlY2VpdmVTdXNwZW5kLmRlKCk7IHIgIT0gbnVsbDsgciA9IHRoaXMucmVjZWl2ZVN1c3BlbmQuZGUoKSkge1xuXHRcdFx0cih0aGlzLmNsb3NlZClcblx0XHR9XG5cdH1cblxuXHRhc3luYyBTZW5kKGU6IEUpOiBQcm9taXNlPENoYW5uZWxDbG9zZWR8bnVsbD4ge1xuXHRcdGlmICh0aGlzLmNsb3NlZCAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9zZWRcblx0XHR9XG5cblx0XHRsZXQgcmZ1biA9IHRoaXMucmVjZWl2ZVN1c3BlbmQuZGUoKVxuXG5cdFx0aWYgKHRoaXMuZGF0YS5jb3VudCA+PSB0aGlzLm1heCAmJiByZnVuID09IG51bGwpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxDaGFubmVsQ2xvc2VkfG51bGw+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHRoaXMuc2VuZFN1c3BlbmQuZW4oW2UsIHJlc29sdmVdKVxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHQvLyByZnVuICE9IG5pbDogZGF0YSBpcyBlbXB0eVxuXHRcdGlmIChyZnVuICE9IG51bGwpIHtcblx0XHRcdHJmdW4oZSlcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Ly8gcmZ1biA9PSBuaWwgJiYgZGF0YS5jb3VudCA8IG1heDogbWF4ICE9IDBcblx0XHR0aGlzLmRhdGEuZW4oZSlcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0YXN5bmMgUmVjZWl2ZU9yRmFpbGVkKCk6IFByb21pc2U8RXxDaGFubmVsQ2xvc2VkPiB7XG5cdFx0aWYgKHRoaXMuY2xvc2VkICE9IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb3NlZFxuXHRcdH1cblxuXHRcdGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5kZSgpXG5cdFx0bGV0IHN1c3BlbmQgPSB0aGlzLnNlbmRTdXNwZW5kLmRlKClcblxuXHRcdGlmICh2YWx1ZSA9PSBudWxsICYmIHN1c3BlbmQgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPEV8Q2hhbm5lbENsb3NlZD4oKHJlc29sdmUpPT57XG5cdFx0XHRcdHRoaXMucmVjZWl2ZVN1c3BlbmQuZW4ocmVzb2x2ZSlcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Ly8gdmFsdWUgIT0gbmlsOiBtYXggIT0gMFxuXHRcdGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAoc3VzcGVuZCAhPSBudWxsKSB7XG5cdFx0XHRcdGxldCBbdiwgc2Z1bl0gPSBzdXNwZW5kXG5cdFx0XHRcdHRoaXMuZGF0YS5lbih2KVxuXHRcdFx0XHRzZnVuKG51bGwpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9XG5cblx0XHQvLyB2YWx1ZSA9PSBuaWwgJiYgc3VzcGVuZCAhPSBuaWw6IG1heCA9PSAwXG5cdFx0bGV0IFt2LCBzZnVuXSA9IHN1c3BlbmQhXG5cdFx0c2Z1bihudWxsKVxuXHRcdHJldHVybiB2XG5cdH1cblxuXHRhc3luYyBSZWNlaXZlKCk6IFByb21pc2U8RXxudWxsPiB7XG5cdFx0bGV0IHIgPSBhd2FpdCB0aGlzLlJlY2VpdmVPckZhaWxlZCgpXG5cdFx0aWYgKHIgaW5zdGFuY2VvZiBDaGFubmVsQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRyZXR1cm4gclxuXHR9XG59XG4iLCJpbXBvcnQge1NlbWFwaG9yZX0gZnJvbSBcIi4vc2VtYXBob3JlXCJcblxuXG5leHBvcnQgY2xhc3MgTXV0ZXgge1xuXHRzZW0gPSBuZXcgU2VtYXBob3JlKDEpXG5cblx0YXN5bmMgTG9jaygpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRhd2FpdCB0aGlzLnNlbS5BY3F1aXJlKClcblx0fVxuXG5cdFVubG9jaygpOiB2b2lkIHtcblx0XHR0aGlzLnNlbS5SZWxlYXNlKClcblx0fVxuXG5cdGFzeW5jIHdpdGhMb2NrPFI+KGV4ZTogKCk9PlByb21pc2U8Uj4pOiBQcm9taXNlPFI+IHtcblx0XHRhd2FpdCB0aGlzLkxvY2soKVxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgZXhlKClcblx0XHR9ZmluYWxseSB7XG5cdFx0XHR0aGlzLlVubG9jaygpXG5cdFx0fVxuXHR9XG59XG5cbiIsIlxuZXhwb3J0IGNsYXNzIG5vZGU8RT4ge1xuXHRpc1ZhbGlkOiBib29sZWFuID0gdHJ1ZVxuXHRlbGVtZW50OkVcblx0bmV4dDogbm9kZTxFPnxudWxsID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKGU6IEUpIHtcblx0XHR0aGlzLmVsZW1lbnQgPSBlXG5cdH1cblxuXHRpblZhbGlkKCkge1xuXHRcdHRoaXMuaXNWYWxpZCA9IGZhbHNlXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIHF1ZXVlPEU+IHtcblx0Zmlyc3Q6IG5vZGU8RT58bnVsbCA9IG51bGxcblx0bGFzdDogbm9kZTxFPnxudWxsID0gbnVsbFxuXHRjb3VudDogbnVtYmVyID0gMFxuXG5cdGVuKGU6IEUpOiBub2RlPEU+IHtcblx0XHRsZXQgbmV3Tm9kZSA9IG5ldyBub2RlKGUpXG5cblx0XHRpZiAodGhpcy5sYXN0ID09IG51bGwpIHtcblx0XHRcdHRoaXMubGFzdCA9IG5ld05vZGVcblx0XHRcdHRoaXMuZmlyc3QgPSB0aGlzLmxhc3Rcblx0XHRcdHRoaXMuY291bnQgKz0gMVxuXHRcdFx0cmV0dXJuIG5ld05vZGVcblx0XHR9XG5cblx0XHR0aGlzLmxhc3QubmV4dCA9IG5ld05vZGVcblx0XHR0aGlzLmxhc3QgPSB0aGlzLmxhc3QubmV4dFxuXHRcdHRoaXMuY291bnQgKz0gMVxuXHRcdHJldHVybiBuZXdOb2RlXG5cdH1cblxuXHRkZSgpOiBFfG51bGwge1xuXHRcdHdoaWxlICh0aGlzLmZpcnN0ICE9IG51bGwgJiYgIXRoaXMuZmlyc3QuaXNWYWxpZCkge1xuXHRcdFx0dGhpcy5maXJzdCA9IHRoaXMuZmlyc3QubmV4dFxuXHRcdFx0dGhpcy5jb3VudCAtPSAxXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZmlyc3QgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5maXJzdC5lbGVtZW50XG5cdFx0dGhpcy5maXJzdCA9IHRoaXMuZmlyc3QubmV4dFxuXG5cdFx0aWYgKHRoaXMuZmlyc3QgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sYXN0ID0gbnVsbFxuXHRcdH1cblxuXHRcdHRoaXMuY291bnQgLT0gMVxuXG5cdFx0cmV0dXJuIHJldFxuXHR9XG59XG5cbiIsImltcG9ydCB7cXVldWV9IGZyb20gXCIuL3F1ZXVlXCJcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwidHMteHV0aWxzXCJcblxuXG5leHBvcnQgY2xhc3MgU2VtYXBob3JlIHtcblx0YWNxdWlyZWRTdXNwZW5kOiBxdWV1ZTwoKSA9PiB2b2lkPiA9IG5ldyBxdWV1ZVxuXHRwdWJsaWMgbWF4OiBudW1iZXJcblx0cHVibGljIGN1cnJlbnQ6IG51bWJlciA9IDBcblxuXHRjb25zdHJ1Y3RvcihtYXg6IG51bWJlcikge1xuXHRcdHRoaXMubWF4ID0gbWF4ID4gMT8gbWF4IDogMVxuXHR9XG5cblx0YXN5bmMgQWNxdWlyZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5jdXJyZW50IDwgdGhpcy5tYXgpIHtcblx0XHRcdHRoaXMuY3VycmVudCArPSAxXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpPT57XG5cdFx0XHR0aGlzLmFjcXVpcmVkU3VzcGVuZC5lbihyZXNvbHZlKVxuXHRcdH0pXG5cdH1cblxuXHRSZWxlYXNlKCk6IHZvaWQge1xuXHRcdGxldCBkID0gdGhpcy5hY3F1aXJlZFN1c3BlbmQuZGUoKVxuXHRcdGlmIChkICE9IG51bGwpIHtcblx0XHRcdGQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gZGUoKSA9PSBuaWxcblx0XHR0aGlzLmN1cnJlbnQgLT0gMVxuXHRcdGFzc2VydCh0aGlzLmN1cnJlbnQgPj0gMClcblx0fVxuXG5cdFJlbGVhc2VBbGwoKTogdm9pZCB7XG5cdFx0Zm9yIChsZXQgZCA9IHRoaXMuYWNxdWlyZWRTdXNwZW5kLmRlKCk7IGQgIT0gbnVsbDsgZCA9IHRoaXMuYWNxdWlyZWRTdXNwZW5kLmRlKCkpIHtcblx0XHRcdGQoKVxuXHRcdH1cblx0XHR0aGlzLmN1cnJlbnQgPSAwXG5cdH1cbn1cblxuIiwiaW1wb3J0IHtEdXJhdGlvbiwgTWlsbGlzZWNvbmR9IGZyb20gXCJ0cy14dXRpbHNcIlxuXG5leHBvcnQgY2xhc3MgVGltZW91dCBpbXBsZW1lbnRzIEVycm9yIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiVGltZW91dFwiXG5cblx0Y29uc3RydWN0b3IoZDogRHVyYXRpb24pIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBgdGltZW91dDogJHtkL01pbGxpc2Vjb25kfW1zYFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoVGltZW91dDxSPihkOiBEdXJhdGlvbiwgZXhlOiAoKT0+UHJvbWlzZTxSPik6IFByb21pc2U8UnxUaW1lb3V0PiB7XG5cdGxldCB0aW1lclxuXHRsZXQgdGltZVBybyA9IG5ldyBQcm9taXNlPFRpbWVvdXQ+KChyZXNvbHZlKT0+e1xuXHRcdHRpbWVyID0gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0cmVzb2x2ZShuZXcgVGltZW91dChkKSlcblx0XHR9LCBkL01pbGxpc2Vjb25kKVxuXHR9KVxuXG5cdGxldCByZXQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW2V4ZSgpLCB0aW1lUHJvXSlcblx0Y2xlYXJUaW1lb3V0KHRpbWVyKVxuXHRyZXR1cm4gcmV0XG59XG5cbiIsIlxuZXhwb3J0IHtDbGllbnQsIFJlc3VsdH0gZnJvbSBcIi4vc3JjL2NsaWVudFwiXG5cbmV4cG9ydCB7QWJzdHJhY3RXZWJTb2NrZXREcml2ZXIsIFdlYlNvY2tldFByb3RvY29sfSBmcm9tIFwiLi9zcmMvd2Vic29ja2V0XCJcbmV4cG9ydCB0eXBlIHtcbiAgICBFdmVudCwgRXJyb3JFdmVudCwgQ2xvc2VFdmVudCwgTWVzc2FnZUV2ZW50LFxuICAgIFdlYlNvY2tldERyaXZlclxufSBmcm9tIFwiLi9zcmMvd2Vic29ja2V0XCJcblxuZXhwb3J0IHtFbHNlRXJyLCBFbHNlQ29ubkVyciwgQ29ublRpbWVvdXRFcnIsIEVsc2VUaW1lb3V0RXJyLCB0eXBlIFN0bUVycm9yfSBmcm9tIFwiLi9zcmMvZXJyb3JcIlxuXG5leHBvcnQge3dpdGhCcm93c2VyLCBCcm93c2VyV3N9IGZyb20gXCIuL3NyYy9icm93c2Vyd3NcIlxuXG5leHBvcnQgdHlwZSB7UHJvdG9jb2x9IGZyb20gXCIuL3NyYy9wcm90b2NvbFwiXG4iLCJcbmV4cG9ydCB7SnNvbiwgSnNvbktleSwgSnNvbkhhcywgdHlwZSBIYXN9IGZyb20gXCIuL3NyYy9qc29uXCJcblxuZXhwb3J0IHR5cGUge0pzb25EZWNvZGVyLCBKc29uRW5jb2RlLCBDb25zdHJ1Y3Rvckpzb25EZWNvZGVyLCBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyfSBmcm9tIFwiLi9zcmMvY29kZXJcIlxuXG5leHBvcnQge1Jhd0pzb259IGZyb20gXCIuL3NyYy9jb2RlclwiXG5cbmV4cG9ydCB7Q2xhc3NBcnJheX0gZnJvbSBcIi4vc3JjL2NsYXNzXCJcblxuZXhwb3J0IHR5cGUge0pzb25UeXBlLCBKc29uT2JqZWN0LCBKc29uUHJpbWl0aXZlLCBKc29uQXJyYXl9IGZyb20gXCIuL3NyYy90eXBlXCJcblxuLy8gZXhwb3J0IHtQcm9OdWxsYWJsZSwgUHJvcGVydHlNdXN0TnVsbGFibGUsIGFzTm9uTnVsbH0gZnJvbSBcIi4vdHlwZVwiXG4iLCJcbmV4cG9ydCBjbGFzcyBDbGFzc0FycmF5PFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06IFRbUF19PiBleHRlbmRzIEFycmF5PFQ+IHtcblxuICBjb25zdHJ1Y3Rvcihwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIHRzYnVnOiDnvJbor5HkuLplczXlkI7vvIzlhoXlu7rnsbvlnovnu6fmib/nmoTljp/lnovpk77kvJrlj5HnlJ/plJnor6/mlLnlj5jjgIJcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQ2xhc3NBcnJheS5wcm90b3R5cGUpO1xuXG4gICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5pdGVtUHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLml0ZW1Qcm90b3R5cGUgPSBwcm90b3R5cGVcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpdGVtUHJvdG90eXBlXCIsIHtlbnVtZXJhYmxlOiBmYWxzZX0pO1xuICB9XG5cbiAgcHVibGljIG5ld0l0ZW0oKTpUIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtUHJvdG90eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBpdGVtUHJvdG90eXBlOlQ7XG59XG5cbnR5cGUgTm90RW1wdHlBcnJheTxUPiA9IEFycmF5PFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcnJheUl0ZW1Qcm90b3R5cGU8VD4oYXJyOiBDbGFzc0FycmF5PFQ+fE5vdEVtcHR5QXJyYXk8VD4pOiBUe1xuICBpZiAoYXJyIGluc3RhbmNlb2YgQ2xhc3NBcnJheSkge1xuICAgIHJldHVybiBhcnIubmV3SXRlbSgpXG4gIH1cblxuICByZXR1cm4gYXJyWzBdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzQXJyYXk8VCBleHRlbmRzIG9iamVjdD4oYXJnOiBhbnkpOiBhcmcgaXMgQ2xhc3NBcnJheTxUPnxOb3RFbXB0eUFycmF5PFQ+IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIChhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5XG4gICAgfHwgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgYXJnLmxlbmd0aCAhPT0gMCAmJiBpc0NsYXNzKGFyZ1swXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzKGFyZzogYW55KTogYXJnIGlzIHtba2V5Om51bWJlcl06YW55fSB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnOiBhbnkpOiBhcmcgaXMgbnVtYmVyfHN0cmluZ3xib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgYXJnID09PSBcImJvb2xlYW5cIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUmVjRW1wdHlBcnJheTxUPihhcmc6IGFueSk6IGFyZyBpcyBBcnJheTxUPiB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUFycmF5PFQ+KGFyZzogYW55KTogYXJnIGlzIEFycmF5PFQ+IHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwib2JqZWN0XCIgJiYgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgIShhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5KVxuICAgICYmIChhcmcubGVuZ3RoID09PSAwIHx8IGlzUHJpbWl0aXZlKGFyZ1swXSkpXG59XG5cbiIsImltcG9ydCB7SnNvblR5cGV9IGZyb20gXCIuL3R5cGVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogW2FueSwgRXJyb3J8bnVsbF1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyIHtcbiAgZW5jb2RlSnNvbjxUPihpbnN0YW5jZTogVCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogRXJyb3J8bnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25FbmNvZGUge1xuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBjbGFzcyBSYXdKc29uIGltcGxlbWVudHMgSnNvbkRlY29kZXIsIEpzb25FbmNvZGV7XG4gIHB1YmxpYyByYXc6SnNvblR5cGUgPSBudWxsXG5cbiAgZGVjb2RlSnNvbihqc29uOiBKc29uVHlwZSk6IEVycm9yIHwgbnVsbCB7XG4gICAgdGhpcy5yYXcgPSBqc29uXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb25zdHJ1Y3RvckRlY29kZXIoY29uc3RydWN0b3I6IG9iamVjdCk6IGNvbnN0cnVjdG9yIGlzIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBsZXQgY29uID0gY29uc3RydWN0b3IgYXMgYW55IGFzIENvbnN0cnVjdG9ySnNvbkRlY29kZXJcbiAgcmV0dXJuIGNvbi5kZWNvZGVKc29uICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbi5kZWNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBjb24uZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NvbnN0cnVjdG9yRW5jb2Rlcihjb25zdHJ1Y3Rvcjogb2JqZWN0KTogY29uc3RydWN0b3IgaXMgQ29uc3RydWN0b3JKc29uRW5jb2RlciB7XG4gIGxldCBjb24gPSBjb25zdHJ1Y3RvciBhcyBhbnkgYXMgQ29uc3RydWN0b3JKc29uRW5jb2RlclxuICByZXR1cm4gY29uLmVuY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgY29uLmVuY29kZUpzb24gPT09IFwiZnVuY3Rpb25cIlxuICAgICYmIGNvbi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzRGVjb2RlcihzZWxmOiBvYmplY3QpOiBzZWxmIGlzIEpzb25EZWNvZGVyIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkRlY29kZXJcbiAgcmV0dXJuIHNmLmRlY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2YuZGVjb2RlSnNvbiA9PT0gXCJmdW5jdGlvblwiXG4gICAgJiYgc2YuZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0VuY29kZXIoc2VsZjogb2JqZWN0KTogc2VsZiBpcyBKc29uRW5jb2RlIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkVuY29kZVxuICByZXR1cm4gc2YuZW5jb2RlSnNvbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZi5lbmNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBzZi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMFxufVxuIiwiXG5cbmltcG9ydCB7XG4gIGNhblJlY0VtcHR5QXJyYXksXG4gIGdldEFycmF5SXRlbVByb3RvdHlwZSwgaXNDbGFzcywgaXNDbGFzc0FycmF5LCBpc1ByaW1pdGl2ZUFycmF5XG59IGZyb20gXCIuL2NsYXNzXCJcbmltcG9ydCB7aGFzQ29uc3RydWN0b3JEZWNvZGVyLCBoYXNDb25zdHJ1Y3RvckVuY29kZXIsIGhhc0RlY29kZXIsIGhhc0VuY29kZXJ9IGZyb20gXCIuL2NvZGVyXCJcbmltcG9ydCB7XG4gIGlzSnNvbkVtcHR5QXJyYXksXG4gIGlzSnNvbk9iamVjdCxcbiAgaXNKc29uT2JqZWN0QXJyYXksIGlzSnNvblByaW1pdGl2ZUFycmF5LFxuICBKc29uT2JqZWN0LFxuICBKc29uVHlwZSxcbn0gZnJvbSBcIi4vdHlwZVwiXG5cbmNvbnN0IGpzb25Ub1Byb3BlcnR5U3ltOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKFwiZnJvbS1qc29uXCIpO1xuY29uc3QgcHJvcGVydHlUb0pzb25TeW06IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woXCJ0by1qc29uXCIpO1xuLy8gY29uc3QganNvbkRlY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1kZWNvZGVyXCIpO1xuLy8gY29uc3QganNvbkVuY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1lbmNvZGVyXCIpO1xuXG50eXBlIEpzb25Ub1Byb3BlcnR5TWFwID0gTWFwPHN0cmluZywgc3RyaW5nfHN5bWJvbD5cbnR5cGUgUHJvcGVydHlUb0pzb25NYXAgPSBNYXA8c3RyaW5nfHN5bWJvbCwgc3RyaW5nPlxuXG5pbnRlcmZhY2UgQ29udmVydGVyTWFwIHtcbiAgW2pzb25Ub1Byb3BlcnR5U3ltXT86IEpzb25Ub1Byb3BlcnR5TWFwXG4gIFtwcm9wZXJ0eVRvSnNvblN5bV0/OiBQcm9wZXJ0eVRvSnNvbk1hcFxufVxuXG4vLyDmuIXnqbrljp/mnaXnmoTpnZ7lr7nosaEo5pWw57uEKeWAvFxuLy8gVE9ETzogZm9yIGluIOebruWJjeafpeaJvueahOi1hOaWmeWPquaYr+S8mumBjeWOhuWHuuWPr+aemuS4vueahO+8jOWQjOaXtuafpeW+l+WvueixoeeahOaWueazleaYr+S4jeWPr+aemuS4vueahO+8jOS9huaYr1xuLy8g6L+Z6YeM5Ye6546w5LqGIGZvciBpbiDpgY3ljoblh7rkuoblr7nosaHnmoTmlrnms5XjgILvvIhlczXnmoTmtY/op4jlmajnjq/looPlh7rnjrDmraTnjrDosaHvvIzlhbbku5bnvJbor5HmlrnlvI/kuI7ov5DooYznjq/looPmnKrpqozor4HvvIlcbi8vIOaJgOS7pei/memHjOWKoOS6huKAnOWGl+S9meKAneeahOadoeS7tuWIpOaWrVxuZnVuY3Rpb24gZ2V0UHJvcGVydHlLZXlzPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogKGtleW9mIFQpW117XG4gIGxldCBrZXlzOihrZXlvZiBUKVtdID0gW11cbiAgZm9yIChsZXQgcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmIChpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSAmJiBpbnN0YW5jZS5wcm9wZXJ0eUlzRW51bWVyYWJsZShwKSkge1xuICAgICAga2V5cy5wdXNoKHApXG4gICAgfVxuICB9XG4gIHJldHVybiBrZXlzXG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHlLZXk8VCBleHRlbmRzIG9iamVjdD4oaW5zdGFuY2U6IFQsIGtleTogc3RyaW5nfHN5bWJvbHxudW1iZXIpOiBrZXkgaXMga2V5b2YgVCB7XG4gIHJldHVybiBpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGluc3RhbmNlLnByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSlcbn1cblxuY29uc3QgaGFzID0gU3ltYm9sKFwiaGFzXCIpXG5cbi8vIHRvZG86IGdlbmVyaWMgZXJyb3I6IGZvciBleGFtcGxlICBjbGFzcyBhPFQ+e2Q6VH0gICAgaGFzPGE+ID89IHt9IG5vdCB7ZDpib29sZWFufVxuLy8gZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFQgYXMgKFRbUF0gZXh0ZW5kcyBGdW5jdGlvbiA/IG5ldmVyIDogUCldOiBib29sZWFufVxuZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFRdOiBib29sZWFufVxuXG5leHBvcnQgZnVuY3Rpb24gSnNvbkhhczxUIGV4dGVuZHMgb2JqZWN0Pihhcmc6IFQpOiBIYXM8VD4ge1xuICBpZiAoYXJnLmhhc093blByb3BlcnR5KGhhcykpIHtcbiAgICByZXR1cm4gKGFyZyBhcyBhbnkpW2hhc11cbiAgfVxuXG4gIC8vIOS7heS7heaYr+ihpeWBv+aAp+mAu+i+ke+8jGZyb21Kc29uIOi/lOWbnueahOWvueixoemDveW3sue7j+iuvue9ruS6hmhhc1xuICBsZXQgcmV0OntbcDogc3RyaW5nXTpib29sZWFufSA9IHt9XG4gIGZvciAobGV0IHAgaW4gYXJnKSB7XG4gICAgcmV0W3BdID0gdHJ1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyZywgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6cmV0LCB3cml0YWJsZTpmYWxzZX0pXG5cbiAgcmV0dXJuIHJldCBhcyBIYXM8VD5cbn1cblxuZXhwb3J0IGNsYXNzIEpzb24ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGlzYWxsb3dOdWxsKClcbiAgfVxuXG4gIHB1YmxpYyBpZ25vcmVOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChwLGtleSk9PnsocCBhcyBhbnkpW2tleV0gPSBudWxsfVxuICAgIHRoaXMuZnJvbU51bGxKc29uID0gKHAsa2V5KT0+eyhwIGFzIGFueSlba2V5XSA9IG51bGw7IHJldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgZGlzYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBFcnJvcihcImNhbiBub3QgbnVsbFwiKX1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHJpdmF0ZSBudWxsVG9Kc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PnZvaWQgPSAoXyxfMik9Pnt9XG4gIHByaXZhdGUgZnJvbU51bGxKc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PkVycm9yfG51bGwgPSAoXyxfMik9PntyZXR1cm4gbnVsbH1cblxuICBwdWJsaWMgdG9Kc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogc3RyaW5nIHtcblxuICAgIGxldCB0byA9IHRoaXMuY2xhc3MyanNvbihpbnN0YW5jZSk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG8pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGFzczJqc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGZyb206IFQpOiBKc29uVHlwZSB7XG4gICAgaWYgKGhhc0VuY29kZXIoZnJvbSkpIHtcbiAgICAgIHJldHVybiBmcm9tLmVuY29kZUpzb24oKVxuICAgIH1cbiAgICBpZiAoaGFzQ29uc3RydWN0b3JFbmNvZGVyKGZyb20uY29uc3RydWN0b3IpKSB7XG4gICAgICByZXR1cm4gZnJvbS5jb25zdHJ1Y3Rvci5lbmNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKGZyb20gYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuXG4gICAgbGV0IHRvOntba2V5OnN0cmluZ106YW55fSA9IHt9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gICAgICBsZXQgdG9LZXkgPSBwcm9wZXJ0eTJqc29uTWFwLmdldChrZXkgYXMgc3RyaW5nfHN5bWJvbCkgfHwga2V5IGFzIHN0cmluZztcbiAgICAgIGlmICh0b0tleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG5cbiAgICAgIGlmIChmcm9tViA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChmcm9tViA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLm51bGxUb0pzb24odG8sIHRvS2V5KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNDbGFzcyhmcm9tVikpIHtcbiAgICAgICAgdG9bdG9LZXldID0gdGhpcy5jbGFzczJqc29uKGZyb21WKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0NsYXNzQXJyYXkoZnJvbVYpKSB7XG4gICAgICAgIGxldCBhcnI6IEpzb25UeXBlW10gPSBbXVxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGZyb21WKSB7XG4gICAgICAgICAgYXJyLnB1c2godGhpcy5jbGFzczJqc29uKGl0ZW0pKVxuICAgICAgICB9XG4gICAgICAgIHRvW3RvS2V5XSA9IGFyclxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyDln7rmnKzlj5jph4/otYvlgLxcbiAgICAgIHRvW3RvS2V5XSA9IGZyb21WO1xuICAgIH1cblxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgcHVibGljIGZyb21Kc29uPFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06VFtQXX0+KGpzb246IEpzb25PYmplY3R8c3RyaW5nXG4gICAgLCBwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpOltULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwcm90b3R5cGUgPSBuZXcgcHJvdG90eXBlKCk7XG4gICAgfVxuXG4gICAgbGV0IGpzb25PYmogOkpzb25PYmplY3QgPSBqc29uIGFzIEpzb25PYmplY3RcbiAgICBpZiAodHlwZW9mIGpzb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGxldCBwYXIgPSBKU09OLnBhcnNlKGpzb24pXG4gICAgICBpZiAocGFyID09PSBudWxsIHx8IHR5cGVvZiBwYXIgIT09IFwib2JqZWN0XCIgfHwgcGFyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFtwcm90b3R5cGUsIG5ldyBFcnJvcihcImpzb24gc3RyaW5nIG11c3QgYmUgJ3suLi59J1wiKV1cbiAgICAgIH1cblxuICAgICAganNvbk9iaiA9IHBhclxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmpzb24yY2xhc3MoanNvbk9iaiwgcHJvdG90eXBlLCBwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZSlcbiAgfVxuXG4gIHByaXZhdGUganNvbjJjbGFzczxUIGV4dGVuZHMge1tuOm51bWJlcl06YW55fT4oZnJvbTogSnNvbk9iamVjdCwgcHJvdG90eXBlOiBUXG4gICAgLCBjbGFzc05hbWU6IHN0cmluZyk6IFtULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgfVxuICAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IGpzb24yUHJvcGVydHlNYXA6IEpzb25Ub1Byb3BlcnR5TWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW2pzb25Ub1Byb3BlcnR5U3ltXSB8fCBuZXcgTWFwKCk7XG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW3Byb3BlcnR5VG9Kc29uU3ltXSB8fCBuZXcgTWFwKCk7XG5cbiAgICBsZXQgaGFzU2V0S2V5ID0gbmV3IFNldDxrZXlvZiB0eXBlb2YgcHJvdG90eXBlPigpXG5cbiAgICBsZXQgaGFzVmFsdWU6e1twOiBzdHJpbmd8c3ltYm9sfG51bWJlcl06Ym9vbGVhbn0gPSB7fVxuXG4gICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhmcm9tKSkge1xuICAgICAgaWYgKGtleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuXG4gICAgICBpZiAocHJvcGVydHkyanNvbk1hcC5nZXQodG9LZXkgYXMgc3RyaW5nfHN5bWJvbCkgPT09IFwiLVwiKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGNsYXNz5a+56LGh5rKh5pyJ6L+Z6aG55YC877yM5bCx6Lez6L+HXG4gICAgICBpZiAoIWlzUHJvcGVydHlLZXkocHJvdG90eXBlLCB0b0tleSkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgICAgIGhhc1ZhbHVlW3RvS2V5XSA9IHRydWVcblxuICAgICAgbGV0IHByb3BlcnR5TmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAgICAgaWYgKGZyb21ba2V5XSA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZXJyID0gdGhpcy5mcm9tTnVsbEpzb24ocHJvdG90eXBlLCB0b0tleSlcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBFcnJvcihwcm9wZXJ0eU5hbWUgKyBcIi0tLVwiICsgZXJyLm1lc3NhZ2UpXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGxldCBmcm9tViA9IGZyb21ba2V5XVxuICAgICAgbGV0IGtleVByb3RvID0gcHJvdG90eXBlW3RvS2V5XVxuXG4gICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgcHJvcGVydHlOYW1lKVxuICAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpICYmIGlzQ2xhc3NBcnJheTx7W2tleTpudW1iZXJdOmFueX0+KGtleVByb3RvKSkge1xuICAgICAgICBsZXQgaXRlbSA9IGdldEFycmF5SXRlbVByb3RvdHlwZShrZXlQcm90bylcbiAgICAgICAgbGV0IHJldEFyciA9IG5ldyBBcnJheTx0eXBlb2YgaXRlbT4oKVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyb21WLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgbGV0IFtyZXQsIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVZbaV0sIGl0ZW0sIHByb3BlcnR5TmFtZSArIGBbJHtpfV1gKVxuICAgICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldEFyci5wdXNoKHJldClcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RvdHlwZVt0b0tleV0gPSByZXRBcnJcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBwcm9wZXJ0eU5hbWUpXG4gICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHByb3RvdHlwZVt0b0tleV0gPSBmcm9tVlxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBnZXRQcm9wZXJ0eUtleXMocHJvdG90eXBlKSkge1xuICAgICAgaWYgKCFoYXNTZXRLZXkuaGFzKGtleSkpIHtcbiAgICAgICAgLy8gKHByb3RvdHlwZSBhcyBQcm9OdWxsYWJsZTx0eXBlb2YgcHJvdG90eXBlPilba2V5XSA9IG51bGxcbiAgICAgICAgaGFzVmFsdWVba2V5XSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6aGFzVmFsdWUsIHdyaXRhYmxlOmZhbHNlfSlcblxuICAgIHJldHVybiBbcHJvdG90eXBlLCBudWxsXVxuICB9XG5cbiAgLy8gPFQgZXh0ZW5kcyBNdWxsPFQsIEV4Y2x1ZGU+LCBFeGNsdWRlID0gbmV2ZXI+XG4gIC8vIHB1YmxpYyBmcm9tSnNvbjI8VCBleHRlbmRzIHtbUCBpbiBrZXlvZiBUXTpUW1BdfT4oanNvbjogSnNvbk9iamVjdHxzdHJpbmdcbiAgLy8gICAsIHByb3RvdHlwZToge25ldyguLi5hcmdzOmFueVtdKTogVH18VCk6W1Byb051bGxhYmxlPFQ+LCBudWxsfEVycm9yXSB7XG4gIC8vXG4gIC8vICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAvLyAgICAgcHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQganNvbk9iaiA6SnNvbk9iamVjdCA9IGpzb24gYXMgSnNvbk9iamVjdFxuICAvLyAgIGlmICh0eXBlb2YganNvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgbGV0IHBhciA9IEpTT04ucGFyc2UoanNvbilcbiAgLy8gICAgIGlmIChwYXIgPT09IG51bGwgfHwgdHlwZW9mIHBhciAhPT0gXCJvYmplY3RcIiB8fCBwYXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgbmV3IEVycm9yKFwianNvbiBzdHJpbmcgbXVzdCBiZSAney4uLn0nXCIpXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAganNvbk9iaiA9IHBhclxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gdGhpcy5qc29uMmNsYXNzMihqc29uT2JqLCBwcm90b3R5cGUsIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lKVxuICAvLyB9XG4gIC8vXG4gIC8vIHByaXZhdGUganNvbjJjbGFzczI8VCBleHRlbmRzIHtbbjpudW1iZXJdOmFueX0+KGZyb206IEpzb25PYmplY3QsIHByb3RvdHlwZTogVFxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgY2xhc3NOYW1lOiBzdHJpbmcpOiBbUHJvTnVsbGFibGU8VD4sIG51bGx8RXJyb3JdIHtcbiAgLy9cbiAgLy8gICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gIC8vICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgLy8gICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gIC8vICAgfVxuICAvLyAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAvLyAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBqc29uMlByb3BlcnR5TWFwOiBKc29uVG9Qcm9wZXJ0eU1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtqc29uVG9Qcm9wZXJ0eVN5bV0gfHwgbmV3IE1hcCgpO1xuICAvLyAgIGxldCBwcm9wZXJ0eTJqc29uTWFwOiBQcm9wZXJ0eVRvSnNvbk1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuICAvL1xuICAvLyAgIGxldCBoYXNTZXRLZXkgPSBuZXcgU2V0PGtleW9mIHR5cGVvZiBwcm90b3R5cGU+KClcbiAgLy9cbiAgLy8gICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gIC8vICAgICBpZiAoa2V5ID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuICAvL1xuICAvLyAgICAgaWYgKHByb3BlcnR5Mmpzb25NYXAuZ2V0KHRvS2V5IGFzIHN0cmluZ3xzeW1ib2wpID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgLy8gY2xhc3Plr7nosaHmsqHmnInov5npobnlgLzvvIzlsLHot7Pov4dcbiAgLy8gICAgIGlmICghaXNQcm9wZXJ0eUtleShwcm90b3R5cGUsIHRvS2V5KSkge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgLy9cbiAgLy8gICAgIGlmIChmcm9tW2tleV0gPT09IG51bGwpIHtcbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IG51bGxcbiAgLy8gICAgICAgY29udGludWVcbiAgLy8gICAgIH1cbiAgLy9cbiAgLy8gICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAvL1xuICAvLyAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG4gIC8vICAgICBsZXQga2V5UHJvdG8gPSBwcm90b3R5cGVbdG9LZXldXG4gIC8vXG4gIC8vICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgY2xhc3NOYW1lKVxuICAvLyAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdEFycmF5KGZyb21WKSAmJiBpc0NsYXNzQXJyYXk8e1trZXk6bnVtYmVyXTphbnl9PihrZXlQcm90bykpIHtcbiAgLy8gICAgICAgbGV0IGl0ZW0gPSBnZXRBcnJheUl0ZW1Qcm90b3R5cGUoa2V5UHJvdG8pXG4gIC8vICAgICAgIGxldCByZXRBcnIgPSBuZXcgQXJyYXk8dHlwZW9mIGl0ZW0+KClcbiAgLy8gICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcm9tVi5sZW5ndGg7ICsraSkge1xuICAvLyAgICAgICAgIGxldCBbcmV0LCBlcnJdID0gdGhpcy5qc29uMmNsYXNzKGZyb21WW2ldLCBpdGVtLCBjbGFzc05hbWUgKyBgWyR7aX1dYClcbiAgLy8gICAgICAgICBpZiAoZXJyICE9PSBudWxsKSB7XG4gIC8vICAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgICByZXRBcnIucHVzaChyZXQpXG4gIC8vICAgICAgIH1cbiAgLy9cbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IHJldEFyclxuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgLy8gICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBjbGFzc05hbWUpXG4gIC8vICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgLy8gICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGNvbnRpbnVlXG4gIC8vICAgICB9XG4gIC8vXG4gIC8vICAgICBwcm90b3R5cGVbdG9LZXldID0gZnJvbVZcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhwcm90b3R5cGUpKSB7XG4gIC8vICAgICBpZiAoIWhhc1NldEtleS5oYXMoa2V5KSkge1xuICAvLyAgICAgICAocHJvdG90eXBlIGFzIFByb051bGxhYmxlPHR5cGVvZiBwcm90b3R5cGU+KVtrZXldID0gbnVsbFxuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gW3Byb3RvdHlwZSwgbnVsbF1cbiAgLy8gfVxufVxuXG4vLyAnLScgOiBpZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBKc29uS2V5KGpzb25LZXk6c3RyaW5nLCAuLi5qc29uS2V5czpzdHJpbmdbXSk6IFByb3BlcnR5RGVjb3JhdG9yIHtcbiAgcmV0dXJuICh0YXJnZXQ6IG9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZ3xzeW1ib2wpID0+IHtcblxuICAgIGxldCB0YXJnZXRTeW0gPSB0YXJnZXQgYXMgQ29udmVydGVyTWFwXG5cbiAgICBpZiAoIXRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0pIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0gPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGpzb25LZXksIHByb3BlcnR5S2V5KTtcbiAgICBmb3IgKGxldCBrZXkgb2YganNvbktleXMpIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGtleSwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIGlmICghdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSkge1xuICAgICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXS5zZXQocHJvcGVydHlLZXksIGpzb25LZXkpO1xuICB9XG59XG5cbi8qXG4qIHRvZG86XG4qIOaZrumAmueahOexu1xuKiDmlbDnu4TkuK3nmoTlgLznmoTnsbvlnovlv4XpobvkuIDoh7Rcbiog5pWw57uE5Lit55qE5YC85LiN6IO95pyJbnVsbFxuKiDkuI3og73mnInpq5jnu7TmlbDnu4Rcbiog5pWw57uE5Lit5Y+v5Lul5pyJ57G7XG4qXG4qICovXG5mdW5jdGlvbiBjaGVja1R5cGU8VD4oZnJvbVY6IEpzb25UeXBlXG4gICwgcHJvcGVydHk6IFRba2V5b2YgVF18bnVsbCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBFcnJvcnxudWxsIHtcblxuICBpZiAoZnJvbVYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgLyoge30gKi8gJiYgIWlzQ2xhc3MocHJvcGVydHkpIC8qIG5vdCBpbml0IGJ5IG5ldyBYWFgoLi4uKSovKSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ3t9JywgYnV0IHRoZSBwcm9wZXJ0eSBvZiAke2NsYXNzTmFtZX0gaXMgbm90LiBcbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJuZXcgWFhYKC4uLilcImApXG4gIH1cblxuICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpIC8qIFt7fV0gKi8gJiYgIWlzQ2xhc3NBcnJheShwcm9wZXJ0eSkgLyogbm90IGluaXQgYnkgbmV3IENsYXNzQXJyYXkqLyl7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ1t7fV0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm5ldyBDbGFzc0FycmF5KGNsYXp6KVwiYClcbiAgfVxuICAvLyB0b2RvOiBjaGVjayBhcnJheSBlbGVtZW50XG5cbiAgaWYgKHByb3BlcnR5ID09PSBudWxsIHx8IHByb3BlcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvblByaW1pdGl2ZUFycmF5KGZyb21WKSAmJiAhaXNQcmltaXRpdmVBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW251bWJlcnxzdHJpbmd8Ym9vbGVhbl0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm51bGwgb3IgW3h4eF1cImApXG4gIH1cbiAgLy8gdG9kbzogY2hlY2sgYXJyYXkgZWxlbWVudFxuXG4gIGlmIChpc0pzb25FbXB0eUFycmF5KGZyb21WKSAmJiAhY2FuUmVjRW1wdHlBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW10nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QgYXJyYXkgdHlwZS5gKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBmcm9tViAhPT0gdHlwZW9mIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgXCI8JHt0eXBlb2YgZnJvbVZ9PiR7ZnJvbVZ9XCIsIGJ1dCB0aGUgcHJvcGVydHkgb2YgJHtjbGFzc05hbWV9IGlzICc8JHt0eXBlb2YgcHJvcGVydHl9PiR7cHJvcGVydHl9Jy5cbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJudWxsIG9yIDwke3R5cGVvZiBmcm9tVn0+XCJgKVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuXG4iLCJpbXBvcnQge0pzb25EZWNvZGVyLCBSYXdKc29ufSBmcm9tIFwiLi9jb2RlclwiXG5cbmV4cG9ydCB0eXBlIEpzb25QcmltaXRpdmUgPSBudW1iZXJ8c3RyaW5nfGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IHtba2V5OnN0cmluZ106SnNvblR5cGV9XG5cbmV4cG9ydCB0eXBlIEpzb25BcnJheSA9IEpzb25UeXBlW11cblxuZXhwb3J0IHR5cGUgSnNvblR5cGUgPSBKc29uUHJpbWl0aXZlfEpzb25PYmplY3R8SnNvbkFycmF5fG51bGxcblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkFycmF5KGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvbkFycmF5IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0pzb25PYmplY3QoYXJnOiBKc29uVHlwZSkgOiBhcmcgaXMgSnNvbk9iamVjdCB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uT2JqZWN0QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uT2JqZWN0W10ge1xuICByZXR1cm4gIGlzSnNvbkFycmF5KGFyZykgJiYgYXJnLmxlbmd0aCA9PT0gMSAmJiBpc0pzb25PYmplY3QoYXJnWzBdKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlKGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvblByaW1pdGl2ZSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJib29sZWFuXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkVtcHR5QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBbXSB7XG4gIHJldHVybiBpc0pzb25BcnJheShhcmcpICYmIGFyZy5sZW5ndGggPT0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlQXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uUHJpbWl0aXZlW10ge1xuICByZXR1cm4gaXNKc29uQXJyYXkoYXJnKSAmJiBhcmcubGVuZ3RoICE9PSAwICYmIGlzSnNvblByaW1pdGl2ZShhcmdbMF0pXG59XG5cbmV4cG9ydCB0eXBlIEl0ZW08VHlwZT4gPSBUeXBlIGV4dGVuZHMgQXJyYXk8aW5mZXIgSXRlbT4gPyBJdGVtIDogbmV2ZXI7XG5cbnR5cGUgUHJpbWl0aXZlID0gbnVtYmVyfG51bGx8c3RyaW5nfHN5bWJvbHxib29sZWFuXG5cbnR5cGUgRmxhdHRlbjxUeXBlPiA9IFR5cGUgZXh0ZW5kcyBBcnJheTxpbmZlciBJdGVtPiA/IEl0ZW0gOiBUeXBlO1xuXG50eXBlIFJlY3Vyc2lvbkNoZWNrPFQsIEV4Y2x1ZGU+ID0gRXh0cmFjdENsYXNzPFQ+IGV4dGVuZHMgUHJvcGVydHlNdXN0TnVsbGFibGU8RXh0cmFjdENsYXNzPFQ+LCBFeGNsdWRlPiA/IFQgOiBuZXZlclxuXG50eXBlIEV4dHJhY3RDbGFzczxUPiA9IEV4Y2x1ZGU8RmxhdHRlbjxUPiwgUHJpbWl0aXZlPlxuXG50eXBlIElzRnVuY3Rpb248VD4gPSBUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSk9PmFueT8gdHJ1ZSA6IGZhbHNlXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eTxULCBFeGNsdWRlPiA9IG51bGwgZXh0ZW5kcyBUPyAoRmxhdHRlbjxUPiBleHRlbmRzIFByaW1pdGl2ZXxKc29uVHlwZXxKc29uRGVjb2Rlcj8gVFxuICAgIDogUmVjdXJzaW9uQ2hlY2s8VCwgRXhjbHVkZT4pIDogKFQgZXh0ZW5kcyBFeGNsdWRlID8gVCA6IG5ldmVyKVxuXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU11c3ROdWxsYWJsZTxULCBFeGNsdWRlID0gbmV2ZXI+ID0ge1xuICBbUCBpbiBrZXlvZiBUXTogSXNGdW5jdGlvbjxUW1BdPiBleHRlbmRzIHRydWU/IFRbUF0gOiBDaGVja1Byb3BlcnR5PFRbUF0sIEV4Y2x1ZGU+XG59XG5cbmV4cG9ydCB0eXBlIFByb051bGxhYmxlPFQ+ID0geyBbUCBpbiBrZXlvZiBUXTogVFtQXSBleHRlbmRzIEpzb25UeXBlIHwgUmF3SnNvbiA/IFRbUF18bnVsbCA6IFByb051bGxhYmxlPFRbUF0+fG51bGwgfVxuXG5leHBvcnQgZnVuY3Rpb24gYXNOb25OdWxsPFQ+KGFyZzogVCk6IE5vbk51bGxhYmxlPFQ+IHtcbiAgcmV0dXJuIGFyZyBhcyBOb25OdWxsYWJsZTxUPlxufVxuIiwiaW1wb3J0IHtBYnN0cmFjdFdlYlNvY2tldERyaXZlciwgV2ViU29ja2V0UHJvdG9jb2x9IGZyb20gXCIuL3dlYnNvY2tldFwiXG5pbXBvcnQge0R1cmF0aW9uLCBTZWNvbmR9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHtQcm90b2NvbH0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuXG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyV3MgZXh0ZW5kcyBBYnN0cmFjdFdlYlNvY2tldERyaXZlciB7XG5cdHByaXZhdGUgd2Vic29ja2V0OiBXZWJTb2NrZXQ7XG5cblx0Y2xvc2UoY29kZT86IG51bWJlciwgcmVhc29uPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy53ZWJzb2NrZXQuY2xvc2UoY29kZSwgcmVhc29uKVxuXHR9XG5cblx0c2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IHZvaWQge1xuXHRcdHRoaXMud2Vic29ja2V0LnNlbmQoZGF0YSlcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy53ZWJzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybClcblx0XHR0aGlzLndlYnNvY2tldC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiXG5cdFx0dGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IChldjogQ2xvc2VFdmVudCk9Pntcblx0XHRcdHRoaXMub25jbG9zZShldilcblx0XHR9XG5cdFx0dGhpcy53ZWJzb2NrZXQub25lcnJvciA9IChldjogRXZlbnQpPT57XG5cdFx0XHR0aGlzLm9uZXJyb3Ioe2Vyck1zZzogXCJCcm93c2VyV2ViU29ja2V0IG9uZXJyb3I6IFwiICsgZXYudG9TdHJpbmcoKX0pXG5cdFx0fVxuXHRcdHRoaXMud2Vic29ja2V0Lm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50KT0+e1xuXHRcdFx0dGhpcy5vbm1lc3NhZ2UoZXYpXG5cdFx0fVxuXHRcdHRoaXMud2Vic29ja2V0Lm9ub3BlbiA9IChldjogRXZlbnQpPT57XG5cdFx0XHR0aGlzLm9ub3Blbihldilcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCcm93c2VyKHVybDogc3RyaW5nLCBjb25uZWN0aW9uVGltZW91dDogRHVyYXRpb24gPSAzMCpTZWNvbmQpOiAoKT0+UHJvdG9jb2wge1xuXHRyZXR1cm4gKCk9Pntcblx0XHRyZXR1cm4gbmV3IFdlYlNvY2tldFByb3RvY29sKHVybCwgKHVybDpzdHJpbmcpPT57XG5cdFx0XHRyZXR1cm4gbmV3IEJyb3dzZXJXcyh1cmwpXG5cdFx0fSwgY29ubmVjdGlvblRpbWVvdXQpXG5cdH1cbn1cblxuIiwiXG5pbXBvcnQge2Zvcm1hdE1hcCwgTmV0fSBmcm9tIFwiLi9uZXRcIlxuaW1wb3J0IHtVdGY4LCBMb2dnZXIsIFVuaXFGbGFnLCBDb25zb2xlTG9nZ2VyLCBEdXJhdGlvbiwgU2Vjb25kfSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7U3RtRXJyb3J9IGZyb20gXCIuL2Vycm9yXCJcbmltcG9ydCB7UHJvdG9jb2x9IGZyb20gXCIuL3Byb3RvY29sXCJcbmltcG9ydCB7TXV0ZXh9IGZyb20gXCJ0cy1jb25jdXJyZW5jeVwiXG5cbmV4cG9ydCBjbGFzcyBSZXN1bHQge1xuICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVXRmOCh0aGlzLmRhdGEpLnRvU3RyaW5nKClcbiAgfVxuXG4gIHB1YmxpYyB1dGY4UmF3QnVmZmVyKCk6QXJyYXlCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGF0YTpBcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcigwKSkge1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDbGllbnQge1xuXHRwdWJsaWMgb25QdXNoOiAocmVzOlJlc3VsdCk9PlByb21pc2U8dm9pZD4gPSBhc3luYyAoKT0+e307XG5cdHB1YmxpYyBvblBlZXJDbG9zZWQ6IChlcnI6U3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+ID0gYXN5bmMgKCk9Pnt9O1xuXG5cdHByaXZhdGUgZmxhZyA9IFVuaXFGbGFnKClcblx0cHJpdmF0ZSBuZXRNdXRleDogTXV0ZXggPSBuZXcgTXV0ZXgoKVxuICBwcml2YXRlIG5ldF86IE5ldFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcHJvdG9jb2xDcmVhdG9yOiAoKT0+UHJvdG9jb2wsIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgPSBuZXcgQ29uc29sZUxvZ2dlcigpKSB7XG4gICAgbG9nZ2VyLkluZm8oYENsaWVudFske3RoaXMuZmxhZ31dLm5ld2AsIGBmbGFnPSR7dGhpcy5mbGFnfWApXG5cdFx0dGhpcy5uZXRfID0gdGhpcy5uZXdOZXQoKVxuICB9XG5cblx0cHJpdmF0ZSBuZXdOZXQoKTogTmV0IHtcblx0XHRyZXR1cm4gbmV3IE5ldCh0aGlzLmxvZ2dlciwgdGhpcy5wcm90b2NvbENyZWF0b3IsIGFzeW5jIChlcnI6IFN0bUVycm9yKT0+e1xuXHRcdFx0dGhpcy5sb2dnZXIuV2FybmluZyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0ub25QZWVyQ2xvc2VkYCwgYHJlYXNvbjogJHtlcnJ9YClcblx0XHRcdGF3YWl0IHRoaXMub25QZWVyQ2xvc2VkKGVycilcblx0XHR9LCBhc3luYyAoZGF0YTogQXJyYXlCdWZmZXIpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5vblB1c2hgLCBgc2l6ZTogJHtkYXRhLmJ5dGVMZW5ndGh9YClcblx0XHRcdGF3YWl0IHRoaXMub25QdXNoKG5ldyBSZXN1bHQoZGF0YSkpXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbmV0KCk6IFByb21pc2U8TmV0PiB7XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMubmV0TXV0ZXgud2l0aExvY2s8TmV0Pihhc3luYyAoKT0+e1xuXHRcdFx0aWYgKHRoaXMubmV0Xy5pc0ludmFsaWQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5uZXRfLmNsb3NlKClcblx0XHRcdFx0dGhpcy5uZXRfID0gdGhpcy5uZXdOZXQoKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5uZXRfXG5cdFx0fSlcblx0fVxuXG4gIHB1YmxpYyBhc3luYyBTZW5kKGRhdGE6IEFycmF5QnVmZmVyfHN0cmluZywgaGVhZGVyczogTWFwPHN0cmluZywgc3RyaW5nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQsIHRpbWVvdXQ6IER1cmF0aW9uID0gMzAqU2Vjb25kKTogUHJvbWlzZTxbUmVzdWx0LCBTdG1FcnJvciB8IG51bGxdPiB7XG5cdFx0bGV0IHNmbGFnID0gaGVhZGVycy5nZXQoQ2xpZW50LnJlcWlkS2V5KSA/PyBVbmlxRmxhZygpXG5cdFx0bGV0IHV0ZjhEYXRhID0gbmV3IFV0ZjgoZGF0YSlcblxuXHRcdHRoaXMubG9nZ2VyLkluZm8oYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOnN0YXJ0YFxuXHRcdFx0LCBgaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX0sIHJlcXVlc3QgdXRmOCBzaXplID0gJHt1dGY4RGF0YS5ieXRlTGVuZ3RofWApXG5cblx0XHRsZXQgbmV0ID0gYXdhaXQgdGhpcy5uZXQoKVxuXHRcdGxldCBlcnIgPSBhd2FpdCBuZXQuY29ubmVjdCgpXG5cdFx0aWYgKGVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIuRXJyb3IoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOmVycm9yYCwgYGNvbm5lY3QgZXJyb3I6ICR7ZXJyfWApXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQoKSwgZXJyXVxuXHRcdH1cblxuXHRcdGxldCBbcmV0LCBlcnIyXSA9IGF3YWl0IG5ldC5zZW5kKHV0ZjhEYXRhLnJhdy5idWZmZXIsIGhlYWRlcnMsIHRpbWVvdXQpXG5cdFx0aWYgKGVycjIgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sb2dnZXIuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVuZGBcblx0XHRcdFx0LCBgcmVzcG9uc2Ugc2l6ZSA9ICR7cmV0LmJ5dGVMZW5ndGh9YClcblx0XHRcdHJldHVybiBbbmV3IFJlc3VsdChyZXQpLCBlcnIyXVxuXHRcdH1cblx0XHRpZiAoIWVycjIuaXNDb25uRXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5FcnJvcihgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVycm9yYFxuXHRcdFx0XHQsIGByZXF1ZXN0IGVycm9yID0gJHtlcnIyfWApXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQocmV0KSwgZXJyMl1cblx0XHR9XG5cblx0XHQvLyBzZW5kaW5nIC0tLSBjb25uIGVycm9yOiAgcmV0cnlcblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV06cmV0cnlgLCBgcmV0cnktMWApXG5cblx0XHRuZXQgPSBhd2FpdCB0aGlzLm5ldCgpXG5cblx0XHRlcnIgPSBhd2FpdCBuZXQuY29ubmVjdCgpXG5cdFx0aWYgKGVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIuRXJyb3IoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOmVycm9yYCwgYGNvbm5lY3QgZXJyb3I6ICR7ZXJyfWApXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQoKSwgZXJyXVxuXHRcdH1cblxuXHRcdFtyZXQsIGVycjJdID0gYXdhaXQgbmV0LnNlbmQodXRmOERhdGEucmF3LmJ1ZmZlciwgaGVhZGVycywgdGltZW91dClcblx0XHRpZiAoZXJyMiA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XShjb25uSUQ9JHtuZXQuY29ubmVjdElEfSk6ZW5kYFxuXHRcdFx0XHQsIGByZXNwb25zZSBzaXplID0gJHtyZXQuYnl0ZUxlbmd0aH1gKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5FcnJvcihgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVycm9yYFxuXHRcdFx0XHQsIGByZXF1ZXN0IGVycm9yID0gJHtlcnIyfWApXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtuZXcgUmVzdWx0KHJldCksIGVycjJdXG4gIH1cblxuXHQvKipcblx0ICogQ2xvc2Ug5ZCO77yMQ2xpZW50IOS7jeWPr+e7p+e7reS9v+eUqO+8jOS4i+asoeWPkemAgeivt+axguaXtu+8jOS8muiHquWKqOmHjei/nlxuXHQgKiBDbG9zZSgpIOiwg+eUqOS4jeS8muinpuWPkSBvblBlZXJDbG9zZWQoKVxuXHQgKiBDbG9zZSgpIOS4jiDlhbbku5bmjqXlj6PmsqHmnInmmI7noa7nmoTml7bluo/lhbPns7vvvIxDbG9zZSgpIOiwg+eUqOWQju+8jOS5n+WPr+iDveS8muWHuueOsCBTZW5kKCkg55qE6LCD55So6L+U5ZueIOaIluiAhSBvblBlZXJDbG9zZWQoKVxuXHQgKiBcdFx05L2G5q2k5pe255qEIG9uUGVlckNsb3NlZCgpIOW5tuS4jeaYr+WboOS4uiBDbG9zZSgpIOiAjOinpuWPkeeahOOAglxuXHQgKi9cblx0cHVibGljIGFzeW5jIENsb3NlKCkge1xuXHRcdGF3YWl0IHRoaXMubmV0TXV0ZXgud2l0aExvY2s8dm9pZD4oYXN5bmMgKCk9Pntcblx0XHRcdHRoaXMubG9nZ2VyLkluZm8oYENsaWVudFske3RoaXMuZmxhZ31dLmNsb3NlYCwgXCJjbG9zZWQgYnkgc2VsZlwiKVxuXHRcdFx0YXdhaXQgdGhpcy5uZXRfLmNsb3NlKClcblx0XHR9KVxuXHR9XG5cblx0VXBkYXRlUHJvdG9jb2woY3JlYXRvcjogKCk9PlByb3RvY29sKSB7XG5cdFx0dGhpcy5wcm90b2NvbENyZWF0b3IgPSBjcmVhdG9yXG5cdH1cblxuICBwdWJsaWMgYXN5bmMgUmVjb3ZlcigpOiBQcm9taXNlPFN0bUVycm9yfG51bGw+IHtcbiAgICByZXR1cm4gYXdhaXQgKGF3YWl0IHRoaXMubmV0KCkpLmNvbm5lY3QoKVxuICB9XG5cblx0cHJpdmF0ZSBzdGF0aWMgcmVxaWRLZXk6IHN0cmluZyA9IFwiWC1SZXEtSWRcIlxuXHRwdWJsaWMgYXN5bmMgU2VuZFdpdGhSZXFJZChkYXRhOiBBcnJheUJ1ZmZlcnxzdHJpbmcsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZz5cblx0XHQsIHRpbWVvdXQ6IER1cmF0aW9uID0gMzAqU2Vjb25kKTogUHJvbWlzZTxbUmVzdWx0LCBTdG1FcnJvciB8IG51bGxdPiB7XG5cdFx0aGVhZGVycy5zZXQoQ2xpZW50LnJlcWlkS2V5LCBVbmlxRmxhZygpKVxuXG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMuU2VuZChkYXRhLCBoZWFkZXJzLCB0aW1lb3V0KVxuXHR9XG59XG5cblxuIiwiXG5hYnN0cmFjdCBjbGFzcyBTdG1FcnJvckJhc2UgZXh0ZW5kcyBFcnJvciB7XG5cdGFic3RyYWN0IGlzQ29ubkVycjogYm9vbGVhblxuXHRhYnN0cmFjdCBpc1RpbWVvdXRFcnI6IGJvb2xlYW5cblx0YWJzdHJhY3QgZ2V0IHRvQ29ubkVycigpOiBTdG1FcnJvclxuXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMubWVzc2FnZVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25uVGltZW91dEVyciBleHRlbmRzIFN0bUVycm9yQmFzZSB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkNvbm5UaW1lb3V0RXJyXCJcblx0aXNDb25uRXJyOiBib29sZWFuID0gdHJ1ZVxuXHRpc1RpbWVvdXRFcnI6IGJvb2xlYW4gPSB0cnVlXG5cdGdldCB0b0Nvbm5FcnIoKTogU3RtRXJyb3Ige1xuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5tZXNzYWdlID0gbVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBFbHNlQ29ubkVyciBleHRlbmRzIFN0bUVycm9yQmFzZSB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkVsc2VDb25uRXJyXCJcblx0aXNDb25uRXJyOiBib29sZWFuID0gdHJ1ZVxuXHRpc1RpbWVvdXRFcnI6IGJvb2xlYW4gPSBmYWxzZVxuXHRnZXQgdG9Db25uRXJyKCk6IFN0bUVycm9yIHtcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMubWVzc2FnZSA9IG1cblx0fVxufVxuXG5leHBvcnQgY2xhc3MgRWxzZVRpbWVvdXRFcnIgZXh0ZW5kcyBTdG1FcnJvckJhc2Uge1xuXHRtZXNzYWdlOiBzdHJpbmdcblx0bmFtZTogc3RyaW5nID0gXCJFbHNlVGltZW91dEVyclwiXG5cdGlzQ29ubkVycjogYm9vbGVhbiA9IGZhbHNlXG5cdGlzVGltZW91dEVycjogYm9vbGVhbiA9IHRydWVcblx0Z2V0IHRvQ29ubkVycigpOiBTdG1FcnJvciB7XG5cdFx0cmV0dXJuIG5ldyBFbHNlQ29ubkVycih0aGlzLm1lc3NhZ2UpXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5tZXNzYWdlID0gbVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBFbHNlRXJyIGV4dGVuZHMgU3RtRXJyb3JCYXNlIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiRWxzZUVyclwiXG5cdGNhdXNlOiBFcnJvcnxudWxsXG5cdGlzQ29ubkVycjogYm9vbGVhbiA9IGZhbHNlXG5cdGlzVGltZW91dEVycjogYm9vbGVhbiA9IGZhbHNlXG5cdGdldCB0b0Nvbm5FcnIoKTogU3RtRXJyb3Ige1xuXHRcdHJldHVybiBuZXcgRWxzZUNvbm5FcnIodGhpcy5tZXNzYWdlKVxuXHR9XG5cblx0Y29uc3RydWN0b3IobTogc3RyaW5nLCBjYXVzZTogRXJyb3J8bnVsbCA9IG51bGwpIHtcblx0XHRzdXBlcigpXG5cdFx0aWYgKGNhdXNlID09IG51bGwpIHtcblx0XHRcdHRoaXMubWVzc2FnZSA9IG1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gYCR7bX0sIGNhdXNlZCBieSAke2NhdXNlLm1lc3NhZ2V9YFxuXHRcdH1cblxuXHRcdHRoaXMuY2F1c2UgPSBjYXVzZVxuXHR9XG59XG5cbmV4cG9ydCB0eXBlIFN0bUVycm9yID0gRWxzZUVyciB8IEVsc2VUaW1lb3V0RXJyIHwgRWxzZUNvbm5FcnIgfCBDb25uVGltZW91dEVyclxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdG1FcnJvcihhcmc6IGFueSk6IGFyZyBpcyBTdG1FcnJvciB7XG5cdHJldHVybiBhcmcgaW5zdGFuY2VvZiBTdG1FcnJvckJhc2Vcbn1cbiIsIlxuLyoqXG5cbiBjb250ZW50IHByb3RvY29sOlxuICAgcmVxdWVzdCAtLS1cbiAgICAgcmVxaWQgfCBoZWFkZXJzIHwgaGVhZGVyLWVuZC1mbGFnIHwgZGF0YVxuICAgICByZXFpZDogNCBieXRlcywgbmV0IG9yZGVyO1xuICAgICBoZWFkZXJzOiA8IGtleS1sZW4gfCBrZXkgfCB2YWx1ZS1sZW4gfCB2YWx1ZSA+IC4uLiA7ICBbb3B0aW9uYWxdXG4gICAgIGtleS1sZW46IDEgYnl0ZSwgIGtleS1sZW4gPSBzaXplb2Yoa2V5KTtcbiAgICAgdmFsdWUtbGVuOiAxIGJ5dGUsIHZhbHVlLWxlbiA9IHNpemVvZih2YWx1ZSk7XG4gICAgIGhlYWRlci1lbmQtZmxhZzogMSBieXRlLCA9PT0gMDtcbiAgICAgZGF0YTogICAgICAgW29wdGlvbmFsXVxuXG4gICAgICByZXFpZCA9IDE6IGNsaWVudCBwdXNoIGFjayB0byBzZXJ2ZXIuXG4gICAgICAgICAgICBhY2s6IG5vIGhlYWRlcnM7XG4gICAgICAgICAgICBkYXRhOiBwdXNoSWQuIDQgYnl0ZXMsIG5ldCBvcmRlcjtcblxuIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgcmVzcG9uc2UgLS0tXG4gICAgIHJlcWlkIHwgc3RhdHVzIHwgZGF0YVxuICAgICByZXFpZDogNCBieXRlcywgbmV0IG9yZGVyO1xuICAgICBzdGF0dXM6IDEgYnl0ZSwgMC0tLXN1Y2Nlc3MsIDEtLS1mYWlsZWRcbiAgICAgZGF0YTogaWYgc3RhdHVzPT1zdWNjZXNzLCBkYXRhPTxhcHAgZGF0YT4gICAgW29wdGlvbmFsXVxuICAgICBpZiBzdGF0dXM9PWZhaWxlZCwgZGF0YT08ZXJyb3IgcmVhc29uPlxuXG5cbiAgICByZXFpZCA9IDE6IHNlcnZlciBwdXNoIHRvIGNsaWVudFxuICAgICAgICBzdGF0dXM6IDBcbiAgICAgICAgICBkYXRhOiBmaXJzdCA0IGJ5dGVzIC0tLSBwdXNoSWQsIG5ldCBvcmRlcjtcbiAgICAgICAgICAgICAgICBsYXN0IC0tLSByZWFsIGRhdGFcblxuICovXG5cbmltcG9ydCB7VXRmOH0gZnJvbSBcInRzLXh1dGlsc1wiO1xuaW1wb3J0IHtFbHNlRXJyLCBTdG1FcnJvcn0gZnJvbSBcIi4vZXJyb3JcIlxuXG5leHBvcnQgY2xhc3MgUmVxdWVzdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgYnVmZmVyOiBBcnJheUJ1ZmZlcjtcblxuXHRnZXQgZW5jb2RlZERhdGEoKTogQXJyYXlCdWZmZXIge3JldHVybiB0aGlzLmJ1ZmZlcn1cblx0Z2V0IGxvYWRMZW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGggLSA0fVxuXG5cdHB1YmxpYyBTZXRSZXFJZChpZDpudW1iZXIpIHtcblx0XHQobmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyKSkuc2V0VWludDMyKDAsIGlkKTtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKGJ1ZmZlcjogQXJyYXlCdWZmZXIpIHtcblx0XHR0aGlzLmJ1ZmZlciA9IGJ1ZmZlclxuXHR9XG5cblx0c3RhdGljIE5ldyhyZXFJZDogbnVtYmVyLCBkYXRhOiBBcnJheUJ1ZmZlcnxzdHJpbmcsIGhlYWRlcnM6IE1hcDxzdHJpbmcsc3RyaW5nPik6IFtSZXF1ZXN0LCBTdG1FcnJvcnxudWxsXSB7XG4gICAgbGV0IGxlbiA9IDQ7XG5cbiAgICBsZXQgaGVhZGVyQXJyID0gbmV3IEFycmF5PHtrZXk6VXRmOCwgdmFsdWU6VXRmOH0+KCk7XG5cdFx0bGV0IGVycjogU3RtRXJyb3J8bnVsbCA9IG51bGxcbiAgICBoZWFkZXJzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcsIGtleTogc3RyaW5nLCBfOiBNYXA8c3RyaW5nLCBzdHJpbmc+KT0+e1xuICAgICAgbGV0IHV0ZjggPSB7a2V5OiBuZXcgVXRmOChrZXkpLCB2YWx1ZTogbmV3IFV0ZjgodmFsdWUpfTtcblx0XHRcdGlmICh1dGY4LmtleS5ieXRlTGVuZ3RoID4gMjU1IHx8IHV0ZjgudmFsdWUuYnl0ZUxlbmd0aCA+IDI1NSkge1xuXHRcdFx0XHRlcnIgPSBuZXcgRWxzZUVycihga2V5KCR7a2V5fSkncyBsZW5ndGggb3IgdmFsdWUoJHt2YWx1ZX0pJ3MgbGVuZ3RoIGlzIG1vcmUgdGhhbiAyNTVgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cbiAgICAgIGhlYWRlckFyci5wdXNoKHV0ZjgpO1xuICAgICAgbGVuICs9IDEgKyB1dGY4LmtleS5ieXRlTGVuZ3RoICsgMSArIHV0ZjgudmFsdWUuYnl0ZUxlbmd0aDtcbiAgICB9KTtcblx0XHRpZiAoZXJyICE9IG51bGwpIHtcblx0XHRcdHJldHVybiBbbmV3IFJlcXVlc3QobmV3IEFycmF5QnVmZmVyKDApKSwgZXJyXVxuXHRcdH1cblxuICAgIGxldCBib2R5ID0gbmV3IFV0ZjgoZGF0YSk7XG4gICAgbGVuICs9IDEgKyBib2R5LmJ5dGVMZW5ndGg7XG5cblx0XHRsZXQgcmV0ID0gbmV3IFJlcXVlc3QobmV3IEFycmF5QnVmZmVyKGxlbikpXG5cdFx0cmV0LlNldFJlcUlkKHJlcUlkKVxuXG4gICAgbGV0IHBvcyA9IDQ7XG4gICAgZm9yIChsZXQgaCBvZiBoZWFkZXJBcnIpIHtcbiAgICAgIChuZXcgRGF0YVZpZXcocmV0LmJ1ZmZlcikpLnNldFVpbnQ4KHBvcywgaC5rZXkuYnl0ZUxlbmd0aCk7XG4gICAgICBwb3MrKztcbiAgICAgIChuZXcgVWludDhBcnJheShyZXQuYnVmZmVyKSkuc2V0KGgua2V5LnJhdywgcG9zKTtcbiAgICAgIHBvcyArPSBoLmtleS5ieXRlTGVuZ3RoO1xuICAgICAgKG5ldyBEYXRhVmlldyhyZXQuYnVmZmVyKSkuc2V0VWludDgocG9zLCBoLnZhbHVlLmJ5dGVMZW5ndGgpO1xuICAgICAgcG9zKys7XG4gICAgICAobmV3IFVpbnQ4QXJyYXkocmV0LmJ1ZmZlcikpLnNldChoLnZhbHVlLnJhdywgcG9zKTtcbiAgICAgIHBvcyArPSBoLnZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgfVxuICAgIChuZXcgRGF0YVZpZXcocmV0LmJ1ZmZlcikpLnNldFVpbnQ4KHBvcywgMCk7XG4gICAgcG9zKys7XG5cbiAgICAobmV3IFVpbnQ4QXJyYXkocmV0LmJ1ZmZlcikpLnNldChib2R5LnJhdywgcG9zKTtcblxuXHRcdHJldHVybiBbcmV0LCBudWxsXVxuICB9XG59XG5cbmV4cG9ydCBlbnVtIFN0YXR1cyB7XG4gIE9LLFxuICBGYWlsZWRcbn1cblxuZXhwb3J0IGNsYXNzIFJlc3BvbnNlIHtcblx0Ly8gcmVxaWQgKyBzdGF0dXMgKyBwdXNoaWRcblx0c3RhdGljIE1heE5vTG9hZExlbiA9IDQgKyAxICsgNFxuXG4gIHB1YmxpYyByZWFkb25seSBzdGF0dXM6IFN0YXR1cztcblx0cHVibGljIHJlYWRvbmx5IHJlcUlkOiBudW1iZXIgPSAwXG5cdHB1YmxpYyByZWFkb25seSBkYXRhOiBBcnJheUJ1ZmZlclxuXHRwdWJsaWMgcmVhZG9ubHkgcHVzaElkOiBudW1iZXJcblxuXHRnZXQgaXNQdXNoKCk6Ym9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMucmVxSWQgPT0gMTtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHJlcUlkOiBudW1iZXIsIHN0OiBTdGF0dXMsIGRhdGE6IEFycmF5QnVmZmVyLCBwdXNoSWQ6IG51bWJlciA9IDApIHtcblx0XHR0aGlzLnJlcUlkID0gcmVxSWRcblx0XHR0aGlzLnN0YXR1cyA9IHN0XG5cdFx0dGhpcy5kYXRhID0gZGF0YVxuXHRcdHRoaXMucHVzaElkID0gcHVzaElkXG5cdH1cblxuXHRwdWJsaWMgbmV3UHVzaEFjaygpOiBbQXJyYXlCdWZmZXIsIFN0bUVycm9yfG51bGxdIHtcblx0XHRpZiAoIXRoaXMuaXNQdXNoKSB7XG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgbmV3IEVsc2VFcnIoXCJpbnZhbGlkIHB1c2ggZGF0YVwiKV1cblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gbmV3IEFycmF5QnVmZmVyKDQgKyAxICsgNClcblx0XHRsZXQgdmlldyA9IG5ldyBEYXRhVmlldyhyZXQpXG5cdFx0dmlldy5zZXRVaW50MzIoMCwgMSlcblx0XHR2aWV3LnNldFVpbnQ4KDQsIDApXG5cdFx0dmlldy5zZXRVaW50MzIoNSwgdGhpcy5wdXNoSWQpXG5cblx0XHRyZXR1cm4gW3JldCwgbnVsbF1cblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgWmVyb1JlcygpOiBSZXNwb25zZSB7XG5cdFx0cmV0dXJuIG5ldyBSZXNwb25zZSgwLCBTdGF0dXMuRmFpbGVkLCBuZXcgQXJyYXlCdWZmZXIoMCkpXG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIFBhcnNlKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdIHtcblx0XHRpZiAoYnVmZmVyLmJ5dGVMZW5ndGggPCA1KSB7XG5cdFx0XHRyZXR1cm4gW3RoaXMuWmVyb1JlcygpLCBuZXcgRWxzZUVycihcImZha2VodHRwIHByb3RvY29sIGVycihyZXNwb25zZS5zaXplIDwgNSkuXCIpXVxuXHRcdH1cblx0XHRsZXQgdmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpXG5cblx0XHRsZXQgcmVxSWQgPSB2aWV3LmdldFVpbnQzMigwKVxuXHRcdGxldCBzdGF0dXMgPSB2aWV3LmdldFVpbnQ4KDQpPT0wID8gU3RhdHVzLk9LIDogU3RhdHVzLkZhaWxlZFxuXHRcdGxldCBwdXNoSWQgPSAwXG5cblx0XHRsZXQgb2Zmc2V0ID0gNVxuXHRcdGlmIChyZXFJZCA9PSAxKSB7XG5cdFx0XHRpZiAoYnVmZmVyLmJ5dGVMZW5ndGggPCBvZmZzZXQrNCkge1xuXHRcdFx0XHRyZXR1cm4gW3RoaXMuWmVyb1JlcygpLCBuZXcgRWxzZUVycihcImZha2VodHRwIHByb3RvY29sIGVycihyZXNwb25zZS5zaXplIG9mIHB1c2ggPCA5KS5cIildXG5cdFx0XHR9XG5cdFx0XHRwdXNoSWQgPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpXG5cdFx0XHRvZmZzZXQgKz0gNFxuXHRcdH1cblxuXHRcdGxldCBkYXRhID0gbmV3IEFycmF5QnVmZmVyKDApXG5cdFx0aWYgKGJ1ZmZlci5ieXRlTGVuZ3RoID4gb2Zmc2V0KSB7XG5cdFx0XHRkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKS5zbGljZShvZmZzZXQpLmJ1ZmZlclxuXHRcdH1cblxuXHRcdHJldHVybiBbbmV3IFJlc3BvbnNlKHJlcUlkLCBzdGF0dXMsIGRhdGEsIHB1c2hJZCksIG51bGxdXG5cdH1cbn1cbiIsImltcG9ydCB7RHVyYXRpb24sIExvZ2dlciwgU2Vjb25kLCBVbmlxRmxhZywgVXRmOH0gZnJvbSBcInRzLXh1dGlsc1wiXG5pbXBvcnQge2FzeW5jRXhlLCBDaGFubmVsLCBNdXRleCwgUmVjZWl2ZUNoYW5uZWwsIFNlbWFwaG9yZSwgU2VuZENoYW5uZWwsIHdpdGhUaW1lb3V0LCBUaW1lb3V0fSBmcm9tIFwidHMtY29uY3VycmVuY3lcIlxuaW1wb3J0IHtSZXNwb25zZSwgUmVxdWVzdCwgU3RhdHVzIGFzIFJlc1N0YXR1c30gZnJvbSBcIi4vZmFrZWh0dHBcIlxuaW1wb3J0IHtFbHNlQ29ubkVyciwgRWxzZUVyciwgU3RtRXJyb3J9IGZyb20gXCIuL2Vycm9yXCJcbmltcG9ydCB7SGFuZHNoYWtlLCBQcm90b2NvbH0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuXG5jbGFzcyBTeW5jQWxsUmVxdWVzdCB7XG5cdGFsbFJlcXVlc3RzOiBNYXA8bnVtYmVyLCBDaGFubmVsPFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0+PiA9IG5ldyBNYXAoKVxuXHRzZW1hcGhvcmU6IFNlbWFwaG9yZSA9IG5ldyBTZW1hcGhvcmUoMylcblxuXHRnZXQgcGVybWl0cygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnNlbWFwaG9yZS5tYXhcblx0fVxuXG5cdHNldCBwZXJtaXRzKG1heDogbnVtYmVyKSB7XG5cdFx0dGhpcy5zZW1hcGhvcmUgPSBuZXcgU2VtYXBob3JlKG1heClcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHBlcm1pdHM6IG51bWJlciA9IDMpIHtcblx0XHR0aGlzLnNlbWFwaG9yZSA9IG5ldyBTZW1hcGhvcmUocGVybWl0cylcblx0fVxuXG5cdC8vIGNoYW5uZWwg5b+F6aG75ZyoIFN5bmNBbGxSZXF1ZXN0IOeahOaOp+WItuS4i++8jOaJgOS7pSBBZGQg6I635Y+W55qE5Y+q6IO9IHJlY2VpdmVcbi8vIOimgSBzZW5kIOWwseW/hemhu+mAmui/hyByZW1vdmUg6I635Y+WXG5cblx0YXN5bmMgQWRkKHJlcUlkOiBudW1iZXIpOiBQcm9taXNlPFJlY2VpdmVDaGFubmVsPFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0+PiB7XG5cdFx0YXdhaXQgdGhpcy5zZW1hcGhvcmUuQWNxdWlyZSgpXG5cdFx0bGV0IGNoID0gbmV3IENoYW5uZWw8W1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXT4oMSlcblx0XHR0aGlzLmFsbFJlcXVlc3RzLnNldChyZXFJZCwgY2gpXG5cdFx0cmV0dXJuIGNoXG5cdH1cblxuXHQvLyDlj6/ku6XnlKjlkIzkuIDkuKogcmVxaWQg6YeN5aSN6LCD55SoXG5cdFJlbW92ZShyZXFJZDogbnVtYmVyKTogU2VuZENoYW5uZWw8W1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXT4gfCBudWxsIHtcblx0XHRsZXQgcmV0ID0gdGhpcy5hbGxSZXF1ZXN0cy5nZXQocmVxSWQpID8/IG51bGxcblx0XHRpZiAocmV0ICE9IG51bGwgJiYgdGhpcy5zZW1hcGhvcmUuY3VycmVudCAhPSAwKSB7XG5cdFx0XHR0aGlzLnNlbWFwaG9yZS5SZWxlYXNlKClcblx0XHR9XG5cdFx0dGhpcy5hbGxSZXF1ZXN0cy5kZWxldGUocmVxSWQpXG5cblx0XHRyZXR1cm4gcmV0XG5cdH1cblxuXHRhc3luYyBDbGVhckFsbFdpdGgocmV0OiBbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdKSB7XG5cdFx0Zm9yIChsZXQgW18sIGNoXSBvZiB0aGlzLmFsbFJlcXVlc3RzKSB7XG5cdFx0XHRhd2FpdCBjaC5TZW5kKHJldClcblx0XHRcdGF3YWl0IGNoLkNsb3NlKClcblx0XHR9XG5cdFx0dGhpcy5hbGxSZXF1ZXN0cy5jbGVhcigpXG5cdFx0YXdhaXQgdGhpcy5zZW1hcGhvcmUuUmVsZWFzZUFsbCgpXG5cdH1cbn1cblxuLyoqXG4gKlxuICogICAgTm90Q29ubmVjdCAgLS0tPiAoQ29ubmVjdGluZykgIC0tLT4gQ29ubmVjdGVkIC0tLT4gSW52YWxpZGF0ZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHxfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3xcbiAqXG4gKi9cblxuaW50ZXJmYWNlIFN0YXRlQmFzZSB7XG5cdHRvU3RyaW5nKCk6c3RyaW5nXG5cdGlzRXF1YWwob3RoZXI6IFN0YXRlQmFzZSk6IHRoaXMgaXMgSW52YWxpZGF0ZWRcblx0aXNJbnZhbGlkYXRlZCgpOiBib29sZWFuXG59XG5cbmNsYXNzIE5vdENvbm5lY3QgaW1wbGVtZW50cyBTdGF0ZUJhc2Uge1xuXHRpc0VxdWFsKG90aGVyOiBTdGF0ZUJhc2UpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiBOb3RDb25uZWN0XG5cdH1cblxuXHRpc0ludmFsaWRhdGVkKCk6IHRoaXMgaXMgSW52YWxpZGF0ZWQge1xuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0dG9TdHJpbmcoKTpzdHJpbmcge1xuXHRcdHJldHVybiBcIk5vdENvbm5lY3RcIlxuXHR9XG59XG5cbmNsYXNzIENvbm5lY3RlZCBpbXBsZW1lbnRzIFN0YXRlQmFzZSB7XG5cdGlzRXF1YWwob3RoZXI6IFN0YXRlQmFzZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBvdGhlciBpbnN0YW5jZW9mIENvbm5lY3RlZFxuXHR9XG5cblx0aXNJbnZhbGlkYXRlZCgpOiB0aGlzIGlzIEludmFsaWRhdGVkIHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHRvU3RyaW5nKCk6c3RyaW5nIHtcblx0XHRyZXR1cm4gXCJDb25uZWN0ZWRcIlxuXHR9XG59XG5cbmNsYXNzIEludmFsaWRhdGVkIGltcGxlbWVudHMgU3RhdGVCYXNlIHtcblx0cHVibGljIGVycjogU3RtRXJyb3Jcblx0aXNFcXVhbChvdGhlcjogU3RhdGVCYXNlKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIG90aGVyIGluc3RhbmNlb2YgSW52YWxpZGF0ZWRcblx0fVxuXG5cdGlzSW52YWxpZGF0ZWQoKTogdGhpcyBpcyBJbnZhbGlkYXRlZCB7XG5cdFx0cmV0dXJuIHRydWVcblx0fVxuXG5cdHRvU3RyaW5nKCk6c3RyaW5nIHtcblx0XHRyZXR1cm4gXCJJbnZhbGlkYXRlZFwiXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihlcnI6IFN0bUVycm9yKSB7XG5cdFx0dGhpcy5lcnIgPSBlcnJcblx0fVxufVxuXG50eXBlIFN0YXRlID0gTm90Q29ubmVjdHxDb25uZWN0ZWR8SW52YWxpZGF0ZWRcblxuY2xhc3MgUmVxSWQge1xuXHRwcml2YXRlIHN0YXRpYyByZXFJZFN0YXJ0ID0gMTBcblx0cHJpdmF0ZSB2YWx1ZSA9IFJlcUlkLnJlcUlkU3RhcnRcblxuXHRnZXQoKTogbnVtYmVyIHtcblx0XHR0aGlzLnZhbHVlICs9IDFcblx0XHRpZiAodGhpcy52YWx1ZSA8IFJlcUlkLnJlcUlkU3RhcnQgfHwgdGhpcy52YWx1ZSA+IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB7XG5cdFx0XHR0aGlzLnZhbHVlID0gUmVxSWQucmVxSWRTdGFydFxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnZhbHVlXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE5ldCB7XG5cdHByaXZhdGUgaGFuZHNoYWtlOiBIYW5kc2hha2UgPSBuZXcgSGFuZHNoYWtlKClcblx0cHJpdmF0ZSBjb25uTG9ja2VyOiBNdXRleCA9IG5ldyBNdXRleCgpXG5cdHByaXZhdGUgc3RhdGU6IFN0YXRlID0gbmV3IE5vdENvbm5lY3Rcblx0cHJpdmF0ZSBwcm90bzogUHJvdG9jb2xcblxuXHRwcml2YXRlIHJlcUlkOiBSZXFJZCA9IG5ldyBSZXFJZCgpXG5cdHByaXZhdGUgYWxsUmVxdWVzdHM6IFN5bmNBbGxSZXF1ZXN0ID0gbmV3IFN5bmNBbGxSZXF1ZXN0KClcblxuXHRwcml2YXRlIGZsYWcgPSBVbmlxRmxhZygpXG5cblx0Z2V0IGNvbm5lY3RJRCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmhhbmRzaGFrZS5Db25uZWN0SWRcblx0fVxuXG5cdGdldCBpc0ludmFsaWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpXG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLCBwcm90b0NyZWF0b3I6ICgpPT5Qcm90b2NvbFxuXHRcdFx0XHRcdFx0XHQsIHByaXZhdGUgb25QZWVyQ2xvc2VkOiAoZXJyOiBTdG1FcnJvcik9PlByb21pc2U8dm9pZD5cblx0XHRcdFx0XHRcdFx0LCBwcml2YXRlIG9uUHVzaDogKGRhdGE6IEFycmF5QnVmZmVyKT0+UHJvbWlzZTx2b2lkPikge1xuXHRcdGxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0ubmV3YCwgYGZsYWc9JHt0aGlzLmZsYWd9YClcblxuXHRcdHRoaXMucHJvdG8gPSBwcm90b0NyZWF0b3IoKVxuXHRcdHRoaXMucHJvdG8ubG9nZ2VyID0gbG9nZ2VyXG5cdFx0dGhpcy5wcm90by5vbkVycm9yID0gYXN5bmMgKGVycjogU3RtRXJyb3IpPT57YXdhaXQgdGhpcy5vbkVycm9yKGVycil9XG5cdFx0dGhpcy5wcm90by5vbk1lc3NhZ2UgPSBhc3luYyAoZGF0YTpBcnJheUJ1ZmZlcik9Pnthd2FpdCB0aGlzLm9uTWVzc2FnZShkYXRhKX1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgY2xvc2VBbmRPbGRTdGF0ZShlcnI6IFN0bUVycm9yKTogUHJvbWlzZTxTdGF0ZT4ge1xuXHRcdGxldCBvbGQgPSBhd2FpdCB0aGlzLmNvbm5Mb2NrZXIud2l0aExvY2s8U3RhdGU+KGFzeW5jICgpPT57XG5cdFx0XHRsZXQgb2xkID0gdGhpcy5zdGF0ZVxuXG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5pc0ludmFsaWRhdGVkKCkpIHtcblx0XHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zdGF0ZSA9IG5ldyBJbnZhbGlkYXRlZChlcnIpXG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LkludmFsaWRhdGVkYCwgYCR7ZXJyfWApXG5cblx0XHRcdHJldHVybiBvbGRcblx0XHR9KVxuXG5cdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5DbGVhckFsbFdpdGgoW1Jlc3BvbnNlLlplcm9SZXMoKSwgZXJyLnRvQ29ubkVycl0pXG5cblx0XHRyZXR1cm4gb2xkXG5cdH1cblxuXHRhc3luYyBvbkVycm9yKGVycjogU3RtRXJyb3IpIHtcblx0XHRsZXQgb2xkID0gYXdhaXQgdGhpcy5jbG9zZUFuZE9sZFN0YXRlKGVycilcblx0XHRpZiAob2xkIGluc3RhbmNlb2YgQ29ubmVjdGVkKSB7XG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LmNsb3NlYCwgXCJjbG9zZWQsIGJlY29tZSBpbnZhbGlkYXRlZFwiKVxuXHRcdFx0XHRhd2FpdCB0aGlzLm9uUGVlckNsb3NlZChlcnIpXG5cdFx0XHRcdGF3YWl0IHRoaXMucHJvdG8uQ2xvc2UoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRhc3luYyBvbk1lc3NhZ2UobXNnOiBBcnJheUJ1ZmZlcikge1xuXHRcdGxldCBbcmVzcG9uc2UsIGVycl0gPSBSZXNwb25zZS5QYXJzZShtc2cpXG5cdFx0aWYgKGVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cGFyc2VgLCBgZXJyb3IgLS0tICR7ZXJyfWApXG5cdFx0XHRhd2FpdCB0aGlzLm9uRXJyb3IoZXJyKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHJlc3BvbnNlLmlzUHVzaCkge1xuXHRcdFx0bGV0IFtwdXNoQWNrLCBlcnJdID0gcmVzcG9uc2UubmV3UHVzaEFjaygpXG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOm5ld1B1c2hBY2tgLCBgZXJyb3IgLS0tICR7ZXJyfWApXG5cdFx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihlcnIpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRhc3luY0V4ZShhc3luYygpPT57XG5cdFx0XHRcdGF3YWl0IHRoaXMub25QdXNoKHJlc3BvbnNlLmRhdGEpXG5cdFx0XHR9KVxuXG5cdFx0XHQvLyBpZ25vcmUgZXJyb3Jcblx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdGxldCBlcnIgPSBhd2FpdCB0aGlzLnByb3RvLlNlbmQocHVzaEFjaylcblx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOnB1c2hBY2tgLCBgZXJyb3IgLS0tICR7ZXJyfWApXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6cHVzaEFja2Bcblx0XHRcdFx0XHQsIGBwdXNoSUQgPSAke3Jlc3BvbnNlLnB1c2hJZH1gKVxuXHRcdFx0fSlcblxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0bGV0IGNoID0gYXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5SZW1vdmUocmVzcG9uc2UucmVxSWQpXG5cdFx0aWYgKGNoID09IG51bGwpIHtcblx0XHRcdHRoaXMubG9nZ2VyLldhcm5pbmcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6Tm90RmluZGBcblx0XHRcdFx0LCBgd2FybmluZzogbm90IGZpbmQgcmVxdWVzdCBmb3IgcmVxSWQoJHtyZXNwb25zZS5yZXFJZH1gKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0bGV0IGNoMSA9IGNoXG5cblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+Lm9uTWVzc2FnZTpyZXNwb25zZWAsIGByZXFJZD0ke3Jlc3BvbnNlLnJlcUlkfWApXG5cdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdGF3YWl0IGNoMS5TZW5kKFtyZXNwb25zZSwgbnVsbF0pXG5cdFx0fSlcblx0fVxuXG5cdC8vIOWPr+mHjeWkjeiwg+eUqFxuXHRhc3luYyBjb25uZWN0KCk6IFByb21pc2U8U3RtRXJyb3J8bnVsbD4ge1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLmNvbm5Mb2NrZXIud2l0aExvY2s8U3RtRXJyb3J8bnVsbD4oYXN5bmMgKCk9Pntcblx0XHRcdGlmICh0aGlzLnN0YXRlIGluc3RhbmNlb2YgQ29ubmVjdGVkKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XS5jb25uZWN0OkNvbm5lY3RlZGAsIGBjb25uSUQ9JHt0aGlzLmNvbm5lY3RJRH1gKVxuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XS5jb25uZWN0PCR7dGhpcy5jb25uZWN0SUR9PjpJbnZhbGlkYXRlZGAsIGAke3RoaXMuc3RhdGUuZXJyfWApXG5cdFx0XHRcdHJldHVybiB0aGlzLnN0YXRlLmVyclxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzdGF0ZS5Ob3RDb25uZWN0XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV0uY29ubmVjdDpOb3RDb25uZWN0YCwgXCJ3aWxsIGNvbm5lY3RcIilcblx0XHRcdGxldCBbaGFuZHNoYWtlLCBlcnJdID0gYXdhaXQgdGhpcy5wcm90by5Db25uZWN0KClcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gbmV3IEludmFsaWRhdGVkKGVycilcblx0XHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLmNvbm5lY3Q6ZXJyb3JgLCBgJHtlcnJ9YClcblx0XHRcdFx0cmV0dXJuIGVyclxuXHRcdFx0fVxuXG5cdFx0XHQvLyBPS1xuXHRcdFx0dGhpcy5zdGF0ZSA9IG5ldyBDb25uZWN0ZWRcblx0XHRcdHRoaXMuaGFuZHNoYWtlID0gaGFuZHNoYWtlXG5cdFx0XHR0aGlzLmFsbFJlcXVlc3RzLnBlcm1pdHMgPSB0aGlzLmhhbmRzaGFrZS5NYXhDb25jdXJyZW50XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LmNvbm5lY3Q6aGFuZHNoYWtlYCwgYCR7dGhpcy5oYW5kc2hha2V9YClcblxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9KVxuXHR9XG5cblx0Ly8g5aaC5p6c5rKh5pyJ6L+e5o6l5oiQ5Yqf77yM55u05o6l6L+U5Zue5aSx6LSlXG5cdGFzeW5jIHNlbmQoZGF0YTogQXJyYXlCdWZmZXIsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZz5cblx0XHRcdFx0XHRcdCAsIHRpbWVvdXQ6IER1cmF0aW9uID0gMzAqU2Vjb25kKTogUHJvbWlzZTxbQXJyYXlCdWZmZXIsIFN0bUVycm9yfG51bGxdPiB7XG5cdFx0Ly8g6aKE5Yik5patXG5cdFx0bGV0IHJldCA9IGF3YWl0IHRoaXMuY29ubkxvY2tlci53aXRoTG9jazxTdG1FcnJvcnxudWxsPiAoYXN5bmMgKCk9Pntcblx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uc2VuZDpzdGF0ZWBcblx0XHRcdFx0LCBgJHt0aGlzLnN0YXRlfSAtLS0gaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX1gKVxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnN0YXRlLmVyci50b0Nvbm5FcnJcblx0XHRcdH1cblx0XHRcdGlmICghKHRoaXMuc3RhdGUgaW5zdGFuY2VvZiBDb25uZWN0ZWQpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgRWxzZUNvbm5FcnIoXCJub3QgY29ubmVjdGVkXCIpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSlcblx0XHRpZiAocmV0KSB7XG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgcmV0XVxuXHRcdH1cblxuXHRcdGxldCByZXFJZCA9IHRoaXMucmVxSWQuZ2V0KClcblx0XHRsZXQgW3JlcXVlc3QsIGVycl0gPSBSZXF1ZXN0Lk5ldyhyZXFJZCwgZGF0YSwgaGVhZGVycylcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmQ6RmFrZUh0dHBSZXF1ZXN0YFxuXHRcdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSBlcnJvcjogJHtlcnJ9YClcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCBlcnJdXG5cdFx0fVxuXHRcdGlmIChyZXF1ZXN0LmxvYWRMZW4gPiB0aGlzLmhhbmRzaGFrZS5NYXhCeXRlcykge1xuXHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kOk1heEJ5dGVzYFxuXHRcdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSBlcnJvcjogZGF0YSBpcyBUb28gTGFyZ2VgKVxuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMClcblx0XHRcdFx0LCBuZXcgRWxzZUVycihgcmVxdWVzdC5zaXplKCR7cmVxdWVzdC5sb2FkTGVufSkgPiBNYXhCeXRlcygke3RoaXMuaGFuZHNoYWtlLk1heEJ5dGVzfSlgKV1cblx0XHR9XG5cblx0XHQvLyDlnKjlrqLmiLfnq6/otoXml7bkuZ/orqTkuLrmmK/kuIDkuKror7fmsYLnu5PmnZ/vvIzkvYbmmK/nnJ/mraPnmoTor7fmsYLlubbmsqHmnInnu5PmnZ/vvIzmiYDku6XlnKjmnI3liqHlmajnnIvmnaXvvIzku43nhLbljaDnlKjmnI3liqHlmajnmoTkuIDkuKrlubblj5HmlbBcblx0XHQvLyDlm6DkuLrnvZHnu5zlvILmraXnmoTljp/lm6DvvIzlrqLmiLfnq6/lubblj5HmlbDkuI3lj6/og73kuI7mnI3liqHlmajlrozlhajkuIDmoLfvvIzmiYDku6Xov5nph4zkuLvopoHmmK/ljY/liqnmnI3liqHlmajlgZrpooTmjqfmtYHvvIzmjInnhaflrqLmiLfnq6/nmoTpgLvovpHlpITnkIbljbPlj69cblxuXHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uc2VuZFske3JlcUlkfV06cmVxdWVzdGBcblx0XHRcdCwgYGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9IChyZXFJZDoke3JlcUlkfSlgKVxuXG5cdFx0bGV0IGNoID0gYXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5BZGQocmVxSWQpXG5cdFx0bGV0IHJldDIgPSBhd2FpdCB3aXRoVGltZW91dDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPih0aW1lb3V0LCBhc3luYyAoKT0+e1xuXHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0bGV0IGVyciA9IGF3YWl0IHRoaXMucHJvdG8uU2VuZChyZXF1ZXN0LmVuY29kZWREYXRhKVxuXHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5SZW1vdmUocmVxSWQpPy5TZW5kKFtSZXNwb25zZS5aZXJvUmVzKCksIGVycl0pXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHRcdGxldCByID0gYXdhaXQgY2guUmVjZWl2ZSgpXG5cdFx0XHRpZiAocikge1xuXHRcdFx0XHRyZXR1cm4gclxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFtSZXNwb25zZS5aZXJvUmVzKCksIG5ldyBFbHNlRXJyKFwiY2hhbm5lbCBpcyBjbG9zZWQsIGV4Y2VwdGlvbiEhIVwiKV1cblx0XHR9KVxuXG5cdFx0aWYgKHJldDIgaW5zdGFuY2VvZiBUaW1lb3V0KSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmRbJHtyZXFJZH1dOlRpbWVvdXRgXG5cdFx0XHRcdCwgYGhlYWRlcnM6JHtmb3JtYXRNYXAoaGVhZGVycyl9IChyZXFJZDoke3JlcUlkfSkgLS0tIHRpbWVvdXQoPiR7dGltZW91dC9TZWNvbmR9cylgKVxuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIG5ldyBFbHNlRXJyKGByZXF1ZXN0IHRpbWVvdXQoJHt0aW1lb3V0L1NlY29uZH1zKWApXVxuXHRcdH1cblxuXHRcdGlmIChyZXQyWzFdKSB7XG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgcmV0MlsxXV1cblx0XHR9XG5cblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmRbJHtyZXFJZH1dOnJlc3BvbnNlYFxuXHRcdFx0LCBgaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX0gKHJlcUlkOiR7cmVxSWR9KSAtLS0gJHtyZXQyWzBdLnN0YXR1c31gKVxuXG5cdFx0aWYgKHJldDJbMF0uc3RhdHVzICE9IFJlc1N0YXR1cy5PSykge1xuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIG5ldyBFbHNlRXJyKG5ldyBVdGY4KHJldDJbMF0uZGF0YSkudG9TdHJpbmcoKSldXG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5SZW1vdmUocmVxSWQpXG5cblx0XHRyZXR1cm4gW3JldDJbMF0uZGF0YSwgbnVsbF1cblx0fVxuXG5cdGFzeW5jIGNsb3NlKCkge1xuXHRcdGxldCBvbGQgPSBhd2FpdCB0aGlzLmNsb3NlQW5kT2xkU3RhdGUobmV3IEVsc2VFcnIoXCJjbG9zZWQgYnkgc2VsZlwiKSlcblx0XHRpZiAob2xkIGluc3RhbmNlb2YgQ29ubmVjdGVkKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LmNsb3NlYCwgXCJjbG9zZWQsIGJlY29tZSBpbnZhbGlkYXRlZFwiKVxuXHRcdFx0YXdhaXQgdGhpcy5wcm90by5DbG9zZSgpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNYXAobWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHtcblx0bGV0IHJldCA9IG5ldyBBcnJheTxzdHJpbmc+KClcblx0bWFwLmZvckVhY2goKHYsIGspID0+IHtcblx0XHRyZXQucHVzaChrICsgXCI6XCIgKyB2KVxuXHR9KVxuXG5cdHJldHVybiBcIntcIiArIHJldC5qb2luKFwiLCBcIikgKyBcIn1cIlxufVxuIiwiXG5pbXBvcnQge0xvZ2dlciwgRHVyYXRpb24sIGFzc2VydCwgU2Vjb25kLCBmb3JtYXREdXJhdGlvbn0gZnJvbSBcInRzLXh1dGlsc1wiXG5pbXBvcnQge1N0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5cbi8qKlxuICpcbiAqIOS4iuWxgueahOiwg+eUqCBQcm90b2NvbCDlj4rlk43lupQgRGVsZWdhdGUg55qE5pe25bqP6YC76L6R77yaXG4gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdlxuICogICAgIGNvbm5lY3R7MX0gLS0rLS0odHJ1ZSktLSstLS1bLmFzeW5jXS0tLT5zZW5ke259IC0tLS0tLT4gY2xvc2V7MX1cbiAqICAgICAgICAgICAgICAgICAgfCAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXG4gKiAgICAgICAgICAgKGZhbHNlKXwgICAgICAgICAgfC0tLS0tLS0+IG9uTWVzc2FnZSAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICB8ICAgICAgICAgIHwgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICA8VW5pdD4tLS0tKyAgICAgICAgICB8ICAgICAgICAgIChlcnJvcikgLS0tIFsuYXN5bmNdIC0tLT58XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tLT4gb25FcnJvciAtLS0gWy5hc3luY10gLS0tLStcbiAqXG4gKlxuICogICAgUHJvdG9jb2wuY29ubmVjdCgpIOS4jiBQcm90b2NvbC5jbG9zZSgpIOS4iuWxguS9v+eUqOaWueehruS/neWPquS8muiwg+eUqCAxIOasoVxuICogICAgUHJvdG9jb2wuY29ubmVjdCgpIOWksei0pe+8jOS4jeS8muivt+axgi/lk43lupTku7vkvZXmjqXlj6NcbiAqICAgIFByb3RvY29sLnNlbmQoKSDkvJrlvILmraXlubblj5HlnLDosIPnlKggbiDmrKHvvIxQcm90b2NvbC5zZW5kKCkg5omn6KGM55qE5pe26ZW/5LiN5Lya6K6p6LCD55So5pa55oyC6LW3562J5b6FXG4gKiAgICDlnKjkuIrlsYLmmI7noa7osIPnlKggUHJvdG9jb2wuY2xvc2UoKSDlkI7vvIzmiY3kuI3kvJrosIPnlKggUHJvdG9jb2wuc2VuZCgpXG4gKiAgICBEZWxlZ2F0ZS5vbk1lc3NhZ2UoKSDlpLHotKUg5Y+KIERlbGVnYXRlLm9uRXJyb3IoKSDkvJrlvILmraXosIPnlKggUHJvdG9jb2wuY2xvc2UoKVxuICpcbiAqICAgIOi/nuaOpeaIkOWKn+WQju+8jOS7u+S9leS4jeiDvee7p+e7remAmuS/oeeahOaDheWGtemDveS7pSBEZWxlZ2F0ZS5vbkVycm9yKCkg6L+U5ZueXG4gKiAgICBEZWxlZ2F0ZS5jbG9zZSgpIOeahOiwg+eUqOS4jeinpuWPkSBEZWxlZ2F0ZS5vbkVycm9yKClcbiAqICAgIERlbGVnYXRlLmNvbm5lY3QoKSDnmoTplJnor6/kuI3op6blj5EgRGVsZWdhdGUub25FcnJvcigpXG4gKiAgICBEZWxlZ2F0ZS5zZW5kKCkg5LuF6L+U5Zue5pys5qyhIERlbGVnYXRlLnNlbmQoKSDnmoTplJnor6/vvIxcbiAqICAgICAgIOS4jeaYr+W6leWxgumAmuS/oeeahOmUmeivr++8jOW6leWxgumAmuS/oeeahOmUmeivr+mAmui/hyBEZWxlZ2F0ZS5vbkVycm9yKCkg6L+U5ZueXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBIYW5kc2hha2Uge1xuXHRIZWFyQmVhdFRpbWU6IER1cmF0aW9uID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcblx0RnJhbWVUaW1lb3V0OiBEdXJhdGlvbiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIC8vIOWQjOS4gOW4p+mHjOmdoueahOaVsOaNrui2heaXtlxuXHRNYXhDb25jdXJyZW50OiBudW1iZXIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAvLyDkuIDkuKrov57mjqXkuIrnmoTmnIDlpKflubblj5Fcblx0TWF4Qnl0ZXM6IG51bWJlciA9IDEwICogMTAyNCAqIDEwMjQgLy8g5LiA5bin5pWw5o2u55qE5pyA5aSn5a2X6IqC5pWwXG5cdENvbm5lY3RJZDogc3RyaW5nID0gXCItLS1ub19jb25uZWN0SWQtLS1cIlxuXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGBoYW5kc2hha2UgaW5mbzp7Q29ubmVjdElkOiAke3RoaXMuQ29ubmVjdElkfSwgTWF4Q29uY3VycmVudDogJHt0aGlzLk1heENvbmN1cnJlbnR9LCBIZWFyQmVhdFRpbWU6ICR7Zm9ybWF0RHVyYXRpb24odGhpcy5IZWFyQmVhdFRpbWUpfSwgTWF4Qnl0ZXMvZnJhbWU6ICR7dGhpcy5NYXhCeXRlc30sIEZyYW1lVGltZW91dDogJHtmb3JtYXREdXJhdGlvbih0aGlzLkZyYW1lVGltZW91dCl9fWBcblx0fVxuXG5cdC8qKlxuXHQgKiBgYGBcblx0ICogSGVhcnRCZWF0X3MgfCBGcmFtZVRpbWVvdXRfcyB8IE1heENvbmN1cnJlbnQgfCBNYXhCeXRlcyB8IGNvbm5lY3QgaWRcblx0ICogSGVhcnRCZWF0X3M6IDIgYnl0ZXMsIG5ldCBvcmRlclxuXHQgKiBGcmFtZVRpbWVvdXRfczogMSBieXRlXG5cdCAqIE1heENvbmN1cnJlbnQ6IDEgYnl0ZVxuXHQgKiBNYXhCeXRlczogNCBieXRlcywgbmV0IG9yZGVyXG5cdCAqIGNvbm5lY3QgaWQ6IDggYnl0ZXMsIG5ldCBvcmRlclxuXHQgKiBgYGBcblx0ICovXG5cblx0c3RhdGljIFN0cmVhbUxlbiA9IDIgKyAxICsgMSArIDQgKyA4XG5cblx0c3RhdGljIFBhcnNlKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBIYW5kc2hha2Uge1xuXHRcdGFzc2VydChidWZmZXIuYnl0ZUxlbmd0aCA+PSBIYW5kc2hha2UuU3RyZWFtTGVuKVxuXG5cdFx0bGV0IHJldCA9IG5ldyBIYW5kc2hha2UoKVxuXHRcdGxldCB2aWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG5cblx0XHRyZXQuSGVhckJlYXRUaW1lID0gdmlldy5nZXRVaW50MTYoMCkgKiBTZWNvbmRcblx0XHRyZXQuRnJhbWVUaW1lb3V0ID0gdmlldy5nZXRVaW50OCgyKSAqIFNlY29uZFxuXHRcdHJldC5NYXhDb25jdXJyZW50ID0gdmlldy5nZXRVaW50OCgzKTtcblx0XHRyZXQuTWF4Qnl0ZXMgPSB2aWV3LmdldFVpbnQzMig0KTtcblx0XHRyZXQuQ29ubmVjdElkID0gKFwiMDAwMDAwMDBcIiArIHZpZXcuZ2V0VWludDMyKDgpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTgpICtcblx0XHRcdChcIjAwMDAwMDAwXCIgKyB2aWV3LmdldFVpbnQzMigxMikudG9TdHJpbmcoMTYpKS5zbGljZSgtOCk7XG5cblx0XHRyZXR1cm4gcmV0XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm90b2NvbCB7XG5cdENvbm5lY3QoKTogUHJvbWlzZTxbSGFuZHNoYWtlLCBTdG1FcnJvcnxudWxsXT5cblx0Q2xvc2UoKTogUHJvbWlzZTx2b2lkPlxuXHRTZW5kKGRhdGE6IEFycmF5QnVmZmVyKTogUHJvbWlzZTxTdG1FcnJvcnxudWxsPlxuXG5cdGxvZ2dlcjogTG9nZ2VyXG5cblx0Ly8gZGVsZWdhdGVcblx0b25NZXNzYWdlOiAoZGF0YTpBcnJheUJ1ZmZlcik9PlByb21pc2U8dm9pZD5cblx0b25FcnJvcjogKGVycjogU3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+XG59XG5cbiIsImltcG9ydCB7SGFuZHNoYWtlLCBQcm90b2NvbH0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuaW1wb3J0IHtDb25uVGltZW91dEVyciwgRWxzZUNvbm5FcnIsIGlzU3RtRXJyb3IsIFN0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5pbXBvcnQge0NvbnNvbGVMb2dnZXIsIER1cmF0aW9uLCBMb2dnZXIsIFNlY29uZCwgVW5pcUZsYWd9IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHthc3luY0V4ZSwgQ2hhbm5lbCwgU2VuZENoYW5uZWwsIFRpbWVvdXQsIHdpdGhUaW1lb3V0fSBmcm9tIFwidHMtY29uY3VycmVuY3lcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVzc2FnZUV2ZW50IGV4dGVuZHMgRXZlbnR7XG5cdHJlYWRvbmx5IGRhdGE6IEFycmF5QnVmZmVyIHwgc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xvc2VFdmVudCBleHRlbmRzIEV2ZW50e1xuXHRyZWFkb25seSBjb2RlOiBudW1iZXI7XG5cdHJlYWRvbmx5IHJlYXNvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yRXZlbnQgZXh0ZW5kcyBFdmVudHtcblx0ZXJyTXNnOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXZWJTb2NrZXREcml2ZXIge1xuXHRvbmNsb3NlOiAoKGV2OiBDbG9zZUV2ZW50KSA9PiBhbnkpXG5cdG9uZXJyb3I6ICgoZXY6IEVycm9yRXZlbnQpID0+IGFueSlcblx0b25tZXNzYWdlOiAoKGV2OiBNZXNzYWdlRXZlbnQpID0+IGFueSlcblx0b25vcGVuOiAoKGV2OiBFdmVudCkgPT4gYW55KVxuXG5cdGNsb3NlKGNvZGU/OiBudW1iZXIsIHJlYXNvbj86IHN0cmluZyk6IHZvaWRcblx0c2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IHZvaWRcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0V2ViU29ja2V0RHJpdmVyIGltcGxlbWVudHMgV2ViU29ja2V0RHJpdmVye1xuXHRvbmNsb3NlOiAoKGV2OiBDbG9zZUV2ZW50KSA9PiBhbnkpID0gKCk9Pnt9XG5cdG9uZXJyb3I6ICgoZXY6IEVycm9yRXZlbnQpID0+IGFueSkgID0gKCk9Pnt9XG5cdG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50KSA9PiBhbnkpID0gKCk9Pnt9XG5cdG9ub3BlbjogKChldjogRXZlbnQpID0+IGFueSkgPSAoKT0+e31cblxuXHRhYnN0cmFjdCBjbG9zZShjb2RlPzogbnVtYmVyLCByZWFzb24/OiBzdHJpbmcpOiB2b2lkXG5cdGFic3RyYWN0IHNlbmQoZGF0YTogQXJyYXlCdWZmZXIpOiB2b2lkXG59XG5cbmNsYXNzIGR1bW15V3MgZXh0ZW5kcyBBYnN0cmFjdFdlYlNvY2tldERyaXZlciB7XG5cdGNsb3NlKCk6IHZvaWQge31cblx0c2VuZCgpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJTb2NrZXRQcm90b2NvbCBpbXBsZW1lbnRzIFByb3RvY29sIHtcblx0bG9nZ2VyXzogTG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKVxuXHRvbk1lc3NhZ2U6IChkYXRhOkFycmF5QnVmZmVyKT0+UHJvbWlzZTx2b2lkPiA9IGFzeW5jICgpPT57fVxuXHRvbkVycm9yOiAoZXJyOiBTdG1FcnJvcik9PlByb21pc2U8dm9pZD4gPSBhc3luYyAoKT0+e31cblx0Y2xvc2VCeVNlbGY6IGJvb2xlYW4gPSBmYWxzZVxuXHRoYW5kc2hha2U6IEhhbmRzaGFrZSA9IG5ldyBIYW5kc2hha2UoKVxuXG5cdGdldCBjb25uZWN0SUQoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy5oYW5kc2hha2UuQ29ubmVjdElkIH1cblx0cHJpdmF0ZSBmbGFnID0gVW5pcUZsYWcoKVxuXHRkcml2ZXI6IEFic3RyYWN0V2ViU29ja2V0RHJpdmVyID0gbmV3IGR1bW15V3MoKVxuXG5cdGdldCBsb2dnZXIoKTogTG9nZ2VyIHtcblx0XHRyZXR1cm4gdGhpcy5sb2dnZXJfXG5cdH1cblx0c2V0IGxvZ2dlcihsKSB7XG5cdFx0dGhpcy5sb2dnZXJfID0gbFxuXHRcdHRoaXMubG9nZ2VyXy5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ubmV3YCwgYGZsYWc9JHt0aGlzLmZsYWd9YClcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdXJsOiBzdHJpbmcsIHByaXZhdGUgZHJpdmVyQ3JlYXRvcjogKHVybDpzdHJpbmcpPT5XZWJTb2NrZXREcml2ZXJcblx0XHRcdFx0XHRcdFx0LCBwcml2YXRlIGNvbm5lY3RUaW1lb3V0OiBEdXJhdGlvbiA9IDMwKlNlY29uZCkge1xuXHRcdGlmICh1cmwuaW5kZXhPZihcInM6Ly9cIikgPT09IC0xKSB7XG5cdFx0XHR0aGlzLnVybCA9IFwid3M6Ly9cIiArIHVybDtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBDbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLmNsb3NlQnlTZWxmID0gdHJ1ZVxuXHRcdHRoaXMuZHJpdmVyLmNsb3NlKClcblx0XHR0aGlzLmRyaXZlciA9IG5ldyBkdW1teVdzKClcblx0fVxuXG5cdGNyZWF0ZURyaXZlcihoYW5kc2hha2VDaGFubmVsOiBTZW5kQ2hhbm5lbDxBcnJheUJ1ZmZlcnxTdG1FcnJvcj4pIHtcblx0XHRsZXQgaXNDb25uZWN0aW5nID0gdHJ1ZVxuXHRcdHRoaXMuZHJpdmVyID0gdGhpcy5kcml2ZXJDcmVhdG9yKHRoaXMudXJsKVxuXHRcdHRoaXMuZHJpdmVyLm9uY2xvc2UgPSAoZXYpPT57XG5cdFx0XHRpZiAoaXNDb25uZWN0aW5nKSB7XG5cdFx0XHRcdGlzQ29ubmVjdGluZyA9IGZhbHNlXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9uY2xvc2VgLCBgJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKVxuXHRcdFx0XHRcdGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuU2VuZChuZXcgRWxzZUNvbm5FcnIoYGNsb3NlZDogJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuY2xvc2VCeVNlbGYpIHtcblx0XHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25jbG9zZWAsIGBjbG9zZWQgYnkgcGVlcjogJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKVxuXHRcdFx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihuZXcgRWxzZUNvbm5FcnIoYGNsb3NlZCBieSBwZWVyOiAke2V2LmNvZGV9ICR7ZXYucmVhc29ufWApKVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmRyaXZlci5vbmVycm9yID0gKGV2KT0+e1xuXHRcdFx0aWYgKGlzQ29ubmVjdGluZykge1xuXHRcdFx0XHRpc0Nvbm5lY3RpbmcgPSBmYWxzZVxuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XS5vbmVycm9yYCwgZXYuZXJyTXNnKVxuXHRcdFx0XHRcdGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuU2VuZChuZXcgRWxzZUNvbm5FcnIoZXYuZXJyTXNnKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuY2xvc2VCeVNlbGYpIHtcblx0XHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25lcnJvcmAsIGAke2V2LmVyck1zZ31gKVxuXHRcdFx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihuZXcgRWxzZUNvbm5FcnIoZXYuZXJyTXNnKSlcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5kcml2ZXIub25tZXNzYWdlID0gKGV2KT0+e1xuXHRcdFx0aWYgKHR5cGVvZiBldi5kYXRhID09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9ubWVzc2FnZTplcnJvcmAsIFwibWVzc2FnZSB0eXBlIGVycm9yXCIpXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5vbkVycm9yKG5ldyBFbHNlQ29ubkVycihcIm1lc3NhZ2UgdHlwZSBlcnJvclwiKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdGxldCBkYXRhOkFycmF5QnVmZmVyID0gZXYuZGF0YVxuXG5cdFx0XHRpZiAoaXNDb25uZWN0aW5nKSB7XG5cdFx0XHRcdGlzQ29ubmVjdGluZyA9IGZhbHNlXG5cdFx0XHRcdGFzeW5jRXhlKGFzeW5jICgpPT57XG5cdFx0XHRcdFx0YXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5TZW5kKGRhdGEpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnJlYWRgLCBgcmVhZCBvbmUgbWVzc2FnZWApXG5cdFx0XHRcdGF3YWl0IHRoaXMub25NZXNzYWdlKGRhdGEpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHR0aGlzLmRyaXZlci5vbm9wZW4gPSAoKT0+e1xuXHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9ub3BlbmAsIGB3YWl0aW5nIGZvciBoYW5kc2hha2VgKVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIENvbm5lY3QoKTogUHJvbWlzZTxbSGFuZHNoYWtlLCAoU3RtRXJyb3IgfCBudWxsKV0+IHtcblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0uQ29ubmVjdDpzdGFydGBcblx0XHRcdCwgYCR7dGhpcy51cmx9I2Nvbm5lY3RUaW1lb3V0PSR7dGhpcy5jb25uZWN0VGltZW91dH1gKVxuXG5cdFx0bGV0IGhhbmRzaGFrZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbDxBcnJheUJ1ZmZlcnxTdG1FcnJvcj4oMSlcblx0XHR0aGlzLmNyZWF0ZURyaXZlcihoYW5kc2hha2VDaGFubmVsKVxuXG5cdFx0bGV0IGhhbmRzaGFrZSA9IGF3YWl0IHdpdGhUaW1lb3V0PEFycmF5QnVmZmVyfFN0bUVycm9yfG51bGw+KHRoaXMuY29ubmVjdFRpbWVvdXQsIGFzeW5jICgpPT57XG5cdFx0XHRyZXR1cm4gYXdhaXQgaGFuZHNoYWtlQ2hhbm5lbC5SZWNlaXZlKClcblx0XHR9KVxuXHRcdGlmIChoYW5kc2hha2UgaW5zdGFuY2VvZiBUaW1lb3V0KSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XS5Db25uZWN0OmVycm9yYCwgXCJ0aW1lb3V0XCIpXG5cdFx0XHRyZXR1cm4gW25ldyBIYW5kc2hha2UoKSwgbmV3IENvbm5UaW1lb3V0RXJyKFwidGltZW91dFwiKV1cblx0XHR9XG5cdFx0aWYgKGlzU3RtRXJyb3IoaGFuZHNoYWtlKSkge1xuXHRcdFx0dGhpcy5sb2dnZXIuRGVidWcoYFdlYlNvY2tldFskeyh0aGlzLmZsYWcpfV0uQ29ubmVjdDplcnJvcmAsIGAke2hhbmRzaGFrZX1gKVxuXHRcdFx0cmV0dXJuIFtuZXcgSGFuZHNoYWtlKCksIGhhbmRzaGFrZV1cblx0XHR9XG5cdFx0aWYgKGhhbmRzaGFrZSA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XS5Db25uZWN0OmVycm9yYCwgXCJjaGFubmVsIGNsb3NlZFwiKVxuXHRcdFx0cmV0dXJuIFtuZXcgSGFuZHNoYWtlKCksIG5ldyBFbHNlQ29ubkVycihcImNoYW5uZWwgY2xvc2VkXCIpXVxuXHRcdH1cblxuXHRcdGlmIChoYW5kc2hha2UuYnl0ZUxlbmd0aCAhPSBIYW5kc2hha2UuU3RyZWFtTGVuKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XS5Db25uZWN0OmVycm9yYFxuXHRcdFx0XHQsIGBoYW5kc2hha2UoJHtoYW5kc2hha2UuYnl0ZUxlbmd0aH0pIHNpemUgZXJyb3JgKVxuXHRcdFx0cmV0dXJuIFtuZXcgSGFuZHNoYWtlKCksIG5ldyBFbHNlQ29ubkVycihgaGFuZHNoYWtlKCR7aGFuZHNoYWtlLmJ5dGVMZW5ndGh9KSBzaXplIGVycm9yYCldXG5cdFx0fVxuXHRcdHRoaXMuaGFuZHNoYWtlID0gSGFuZHNoYWtlLlBhcnNlKGhhbmRzaGFrZSlcblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XTwkeyh0aGlzLmNvbm5lY3RJRCl9Pi5Db25uZWN0OmVuZGBcblx0XHRcdCwgYGNvbm5lY3RJRCA9ICR7KHRoaXMuY29ubmVjdElEKX1gKVxuXG5cdFx0cmV0dXJuIFt0aGlzLmhhbmRzaGFrZSwgbnVsbF1cblx0fVxuXG5cdGFzeW5jIFNlbmQoZGF0YTogQXJyYXlCdWZmZXIpOiBQcm9taXNlPFN0bUVycm9yIHwgbnVsbD4ge1xuXHRcdHRoaXMuZHJpdmVyLnNlbmQoZGF0YSlcblx0XHR0aGlzLmxvZ2dlci5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LlNlbmRgLCBgZnJhbWVCeXRlcyA9ICR7ZGF0YS5ieXRlTGVuZ3RofWApXG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4iLCJcbmV4cG9ydCB7dHlwZSBEdXJhdGlvbiwgSG91ciwgU2Vjb25kLCBNaW51dGUsIE1pY3Jvc2Vjb25kLCBNaWxsaXNlY29uZCwgZm9ybWF0RHVyYXRpb259IGZyb20gXCIuL3NyYy9kdXJhdGlvblwiXG5cbmV4cG9ydCB7VXRmOH0gZnJvbSBcIi4vc3JjL3V0ZjhcIlxuXG5leHBvcnQge3R5cGUgTG9nZ2VyLCBDb25zb2xlTG9nZ2VyfSBmcm9tIFwiLi9zcmMvbG9nZ2VyXCJcblxuZXhwb3J0IHtBc3NlcnRFcnJvciwgYXNzZXJ0fSBmcm9tIFwiLi9zcmMvYXNzZXJ0XCJcblxuZXhwb3J0IHtSYW5kb21JbnQsIFVuaXFGbGFnfSBmcm9tICcuL3NyYy90eXBlZnVuYydcblxuIiwiXG5leHBvcnQgY2xhc3MgQXNzZXJ0RXJyb3IgaW1wbGVtZW50cyBFcnJvciB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkFzc2VydEVycm9yXCJcblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGJvb2xlYW4sIG1zZzogc3RyaW5nID0gXCJcIikge1xuXHRpZiAoIWNvbmRpdGlvbikge1xuXHRcdGNvbnNvbGUuYXNzZXJ0KGNvbmRpdGlvbiwgbXNnKVxuXHRcdHRocm93IG5ldyBBc3NlcnRFcnJvcihtc2cpXG5cdH1cbn1cbiIsIlxuXG5leHBvcnQgdHlwZSBEdXJhdGlvbiA9IG51bWJlclxuXG5leHBvcnQgY29uc3QgTWljcm9zZWNvbmQgPSAxXG5leHBvcnQgY29uc3QgTWlsbGlzZWNvbmQgPSAxMDAwICogTWljcm9zZWNvbmRcbmV4cG9ydCBjb25zdCBTZWNvbmQgPSAxMDAwICogTWlsbGlzZWNvbmRcbmV4cG9ydCBjb25zdCBNaW51dGUgPSA2MCAqIFNlY29uZFxuZXhwb3J0IGNvbnN0IEhvdXIgPSA2MCAqIE1pbnV0ZVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RHVyYXRpb24oZDogRHVyYXRpb24pOiBzdHJpbmcge1xuXHRsZXQgcmV0ID0gXCJcIlxuXHRsZXQgbGVmdCA9IGRcblxuXHRsZXQgdiA9IE1hdGguZmxvb3IobGVmdC9Ib3VyKVxuXHRpZiAodiAhPSAwKSB7XG5cdFx0cmV0ICs9IGAke3Z9aGBcblx0XHRsZWZ0IC09IHYgKiBIb3VyXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9NaW51dGUpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1taW5gXG5cdFx0bGVmdCAtPSB2ICogTWludXRlXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9TZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1zYFxuXHRcdGxlZnQgLT0gdiAqIFNlY29uZFxuXHR9XG5cdHYgPSBNYXRoLmZsb29yKGxlZnQvTWlsbGlzZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1tc2Bcblx0XHRsZWZ0IC09IHYgKiBNaWxsaXNlY29uZFxuXHR9XG5cdHYgPSBNYXRoLmZsb29yKGxlZnQvTWljcm9zZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn11c2Bcblx0fVxuXG5cdGlmIChyZXQubGVuZ3RoID09IDApIHtcblx0XHRyZXQgPSBcIjB1c1wiXG5cdH1cblxuXHRyZXR1cm4gcmV0XG59XG4iLCJcbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgRGVidWcodGFnOiBzdHJpbmcsIG1zZzogc3RyaW5nKTogdm9pZFxuICBJbmZvKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHZvaWRcbiAgV2FybmluZyh0YWc6IHN0cmluZywgbXNnOiBzdHJpbmcpOiB2b2lkXG4gIEVycm9yKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHZvaWRcbn1cblxuZXhwb3J0IGNsYXNzIENvbnNvbGVMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBEZWJ1Zyh0YWc6IGFueSwgbXNnOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zb2xlLmRlYnVnKGAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gRGVidWc6ICR7dGFnfSAgLS0tPiAgJHttc2d9YClcbiAgfVxuXG4gIEVycm9yKHRhZzogYW55LCBtc2c6IGFueSk6IHZvaWQge1xuICAgIGNvbnNvbGUuZXJyb3IoYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSBFcnJvcjogJHt0YWd9ICAtLS0+ICAke21zZ31gKVxuICB9XG5cbiAgSW5mbyh0YWc6IGFueSwgbXNnOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zb2xlLmluZm8oYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSBJbmZvOiAke3RhZ30gIC0tLT4gICR7bXNnfWApXG4gIH1cblxuICBXYXJuaW5nKHRhZzogYW55LCBtc2c6IGFueSk6IHZvaWQge1xuICAgIGNvbnNvbGUud2FybihgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9IFdhcm5pbmc6ICR7dGFnfSAgLS0tPiAgJHttc2d9YClcbiAgfVxuXG59IiwiXG5cbmV4cG9ydCBmdW5jdGlvbiBSYW5kb21JbnQobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcblx0bWluID0gTWF0aC5jZWlsKG1pbik7XG5cdG1heCA9IE1hdGguZmxvb3IobWF4KTtcblx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVbmlxRmxhZygpOiBzdHJpbmcge1xuXHRyZXR1cm4gUmFuZG9tSW50KDB4MTAwMDAwMDAsIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKS50b1N0cmluZygxNilcbn1cbiIsIlxuZXhwb3J0IGNsYXNzIFV0Zjgge1xuICBwdWJsaWMgcmVhZG9ubHkgcmF3OiBVaW50OEFycmF5O1xuICBwcml2YXRlIHJlYWRvbmx5IGluZGV4ZXM6IEFycmF5PG51bWJlcj47XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RyOnN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGJ5dGVMZW5ndGg6bnVtYmVyO1xuICBwdWJsaWMgcmVhZG9ubHkgbGVuZ3RoOm51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihpbnB1dDogQXJyYXlCdWZmZXJ8c3RyaW5nKSB7XG4gICAgdGhpcy5pbmRleGVzID0gbmV3IEFycmF5PG51bWJlcj4oKTtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMucmF3ID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpO1xuICAgICAgdGhpcy5zdHIgPSBcIlwiXG4gICAgICBsZXQgdXRmOGkgPSAwO1xuICAgICAgd2hpbGUgKHV0ZjhpIDwgdGhpcy5yYXcubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuaW5kZXhlcy5wdXNoKHV0ZjhpKTtcbiAgICAgICAgbGV0IGNvZGUgPSBVdGY4LmxvYWRVVEY4Q2hhckNvZGUodGhpcy5yYXcsIHV0ZjhpKTtcbiAgICAgICAgdGhpcy5zdHIgKz0gU3RyaW5nLmZyb21Db2RlUG9pbnQoY29kZSlcbiAgICAgICAgdXRmOGkgKz0gVXRmOC5nZXRVVEY4Q2hhckxlbmd0aChjb2RlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5kZXhlcy5wdXNoKHV0ZjhpKTsgIC8vIGVuZCBmbGFnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RyID0gaW5wdXQ7XG5cbiAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgZm9yIChsZXQgY2ggb2YgaW5wdXQpIHtcbiAgICAgICAgbGVuZ3RoICs9IFV0ZjguZ2V0VVRGOENoYXJMZW5ndGgoY2guY29kZVBvaW50QXQoMCkhKVxuICAgICAgfVxuICAgICAgdGhpcy5yYXcgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuXG4gICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgZm9yIChsZXQgY2ggb2YgaW5wdXQpIHtcbiAgICAgICAgdGhpcy5pbmRleGVzLnB1c2goaW5kZXgpO1xuICAgICAgICBpbmRleCA9IFV0ZjgucHV0VVRGOENoYXJDb2RlKHRoaXMucmF3LCBjaC5jb2RlUG9pbnRBdCgwKSEsIGluZGV4KVxuICAgICAgfVxuICAgICAgdGhpcy5pbmRleGVzLnB1c2goaW5kZXgpOyAvLyBlbmQgZmxhZ1xuICAgIH1cblxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5pbmRleGVzLmxlbmd0aCAtIDE7XG4gICAgdGhpcy5ieXRlTGVuZ3RoID0gdGhpcy5yYXcuYnl0ZUxlbmd0aDtcblxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgbG9hZFVURjhDaGFyQ29kZShhQ2hhcnM6IFVpbnQ4QXJyYXksIG5JZHg6IG51bWJlcik6IG51bWJlciB7XG5cbiAgICBsZXQgbkxlbiA9IGFDaGFycy5sZW5ndGgsIG5QYXJ0ID0gYUNoYXJzW25JZHhdO1xuXG4gICAgcmV0dXJuIG5QYXJ0ID4gMjUxICYmIG5QYXJ0IDwgMjU0ICYmIG5JZHggKyA1IDwgbkxlbiA/XG4gICAgICAvKiAoblBhcnQgLSAyNTIgPDwgMzApIG1heSBiZSBub3Qgc2FmZSBpbiBFQ01BU2NyaXB0ISBTby4uLjogKi9cbiAgICAgIC8qIHNpeCBieXRlcyAqLyAoblBhcnQgLSAyNTIpICogMTA3Mzc0MTgyNCArIChhQ2hhcnNbbklkeCArIDFdIC0gMTI4IDw8IDI0KVxuICAgICAgKyAoYUNoYXJzW25JZHggKyAyXSAtIDEyOCA8PCAxOCkgKyAoYUNoYXJzW25JZHggKyAzXSAtIDEyOCA8PCAxMilcbiAgICAgICsgKGFDaGFyc1tuSWR4ICsgNF0gLSAxMjggPDwgNikgKyBhQ2hhcnNbbklkeCArIDVdIC0gMTI4XG4gICAgICA6IG5QYXJ0ID4gMjQ3ICYmIG5QYXJ0IDwgMjUyICYmIG5JZHggKyA0IDwgbkxlbiA/XG4gICAgICAgIC8qIGZpdmUgYnl0ZXMgKi8gKG5QYXJ0IC0gMjQ4IDw8IDI0KSArIChhQ2hhcnNbbklkeCArIDFdIC0gMTI4IDw8IDE4KVxuICAgICAgICArIChhQ2hhcnNbbklkeCArIDJdIC0gMTI4IDw8IDEyKSArIChhQ2hhcnNbbklkeCArIDNdIC0gMTI4IDw8IDYpXG4gICAgICAgICsgYUNoYXJzW25JZHggKyA0XSAtIDEyOFxuICAgICAgICA6IG5QYXJ0ID4gMjM5ICYmIG5QYXJ0IDwgMjQ4ICYmIG5JZHggKyAzIDwgbkxlbiA/XG4gICAgICAgICAgLyogZm91ciBieXRlcyAqLyhuUGFydCAtIDI0MCA8PCAxOCkgKyAoYUNoYXJzW25JZHggKyAxXSAtIDEyOCA8PCAxMilcbiAgICAgICAgICArIChhQ2hhcnNbbklkeCArIDJdIC0gMTI4IDw8IDYpICsgYUNoYXJzW25JZHggKyAzXSAtIDEyOFxuICAgICAgICAgIDogblBhcnQgPiAyMjMgJiYgblBhcnQgPCAyNDAgJiYgbklkeCArIDIgPCBuTGVuID9cbiAgICAgICAgICAgIC8qIHRocmVlIGJ5dGVzICovIChuUGFydCAtIDIyNCA8PCAxMikgKyAoYUNoYXJzW25JZHggKyAxXSAtIDEyOCA8PCA2KVxuICAgICAgICAgICAgKyBhQ2hhcnNbbklkeCArIDJdIC0gMTI4XG4gICAgICAgICAgICA6IG5QYXJ0ID4gMTkxICYmIG5QYXJ0IDwgMjI0ICYmIG5JZHggKyAxIDwgbkxlbiA/XG4gICAgICAgICAgICAgIC8qIHR3byBieXRlcyAqLyAoblBhcnQgLSAxOTIgPDwgNikgKyBhQ2hhcnNbbklkeCArIDFdIC0gMTI4XG4gICAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgLyogb25lIGJ5dGUgKi8gblBhcnQ7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBwdXRVVEY4Q2hhckNvZGUoYVRhcmdldDogVWludDhBcnJheSwgbkNoYXI6IG51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBuUHV0QXQ6IG51bWJlcik6bnVtYmVyIHtcblxuICAgIGxldCBuSWR4ID0gblB1dEF0O1xuXG4gICAgaWYgKG5DaGFyIDwgMHg4MCAvKiAxMjggKi8pIHtcbiAgICAgIC8qIG9uZSBieXRlICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSBuQ2hhcjtcbiAgICB9IGVsc2UgaWYgKG5DaGFyIDwgMHg4MDAgLyogMjA0OCAqLykge1xuICAgICAgLyogdHdvIGJ5dGVzICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweGMwIC8qIDE5MiAqLyArIChuQ2hhciA+Pj4gNik7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArIChuQ2hhciAmIDB4M2YgLyogNjMgKi8pO1xuICAgIH0gZWxzZSBpZiAobkNoYXIgPCAweDEwMDAwIC8qIDY1NTM2ICovKSB7XG4gICAgICAvKiB0aHJlZSBieXRlcyAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHhlMCAvKiAyMjQgKi8gKyAobkNoYXIgPj4+IDEyKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gNikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKG5DaGFyICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgfSBlbHNlIGlmIChuQ2hhciA8IDB4MjAwMDAwIC8qIDIwOTcxNTIgKi8pIHtcbiAgICAgIC8qIGZvdXIgYnl0ZXMgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ZjAgLyogMjQwICovICsgKG5DaGFyID4+PiAxOCk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDEyKSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiA2KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAobkNoYXIgJiAweDNmIC8qIDYzICovKTtcbiAgICB9IGVsc2UgaWYgKG5DaGFyIDwgMHg0MDAwMDAwIC8qIDY3MTA4ODY0ICovKSB7XG4gICAgICAvKiBmaXZlIGJ5dGVzICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweGY4IC8qIDI0OCAqLyArIChuQ2hhciA+Pj4gMjQpO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAxOCkgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMTIpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDYpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArIChuQ2hhciAmIDB4M2YgLyogNjMgKi8pO1xuICAgIH0gZWxzZSAvKiBpZiAobkNoYXIgPD0gMHg3ZmZmZmZmZikgKi8geyAvKiAyMTQ3NDgzNjQ3ICovXG4gICAgICAvKiBzaXggYnl0ZXMgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ZmMgLyogMjUyICovICsgLyogKG5DaGFyID4+PiAzMCkgbWF5IGJlIG5vdCBzYWZlIGluIEVDTUFTY3JpcHQhIFNvLi4uOiAqLyAobkNoYXIgLyAxMDczNzQxODI0KTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMjQpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDE4KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAxMikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gNikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKG5DaGFyICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5JZHg7XG5cbiAgfTtcblxuICBwcml2YXRlIHN0YXRpYyBnZXRVVEY4Q2hhckxlbmd0aChuQ2hhcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gbkNoYXIgPCAweDgwID8gMSA6IG5DaGFyIDwgMHg4MDAgPyAyIDogbkNoYXIgPCAweDEwMDAwXG4gICAgICA/IDMgOiBuQ2hhciA8IDB4MjAwMDAwID8gNCA6IG5DaGFyIDwgMHg0MDAwMDAwID8gNSA6IDY7XG4gIH1cblxuXG4gIC8vIHByaXZhdGUgc3RhdGljIGxvYWRVVEYxNkNoYXJDb2RlKGFDaGFyczogVWludDE2QXJyYXksIG5JZHg6IG51bWJlcik6IG51bWJlciB7XG4gIC8vXG4gIC8vICAgLyogVVRGLTE2IHRvIERPTVN0cmluZyBkZWNvZGluZyBhbGdvcml0aG0gKi9cbiAgLy8gICBsZXQgbkZyc3RDaHIgPSBhQ2hhcnNbbklkeF07XG4gIC8vXG4gIC8vICAgcmV0dXJuIG5GcnN0Q2hyID4gMHhEN0JGIC8qIDU1MjMxICovICYmIG5JZHggKyAxIDwgYUNoYXJzLmxlbmd0aCA/XG4gIC8vICAgICAobkZyc3RDaHIgLSAweEQ4MDAgLyogNTUyOTYgKi8gPDwgMTApICsgYUNoYXJzW25JZHggKyAxXSArIDB4MjQwMCAvKiA5MjE2ICovXG4gIC8vICAgICA6IG5GcnN0Q2hyO1xuICAvLyB9XG4gIC8vXG4gIC8vIHByaXZhdGUgc3RhdGljIHB1dFVURjE2Q2hhckNvZGUoYVRhcmdldDogVWludDE2QXJyYXksIG5DaGFyOiBudW1iZXIsIG5QdXRBdDogbnVtYmVyKTpudW1iZXIge1xuICAvL1xuICAvLyAgIGxldCBuSWR4ID0gblB1dEF0O1xuICAvL1xuICAvLyAgIGlmIChuQ2hhciA8IDB4MTAwMDAgLyogNjU1MzYgKi8pIHtcbiAgLy8gICAgIC8qIG9uZSBlbGVtZW50ICovXG4gIC8vICAgICBhVGFyZ2V0W25JZHgrK10gPSBuQ2hhcjtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgLyogdHdvIGVsZW1lbnRzICovXG4gIC8vICAgICBhVGFyZ2V0W25JZHgrK10gPSAweEQ3QzAgLyogNTUyMzIgKi8gKyAobkNoYXIgPj4+IDEwKTtcbiAgLy8gICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4REMwMCAvKiA1NjMyMCAqLyArIChuQ2hhciAmIDB4M0ZGIC8qIDEwMjMgKi8pO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gbklkeDtcbiAgLy8gfVxuICAvL1xuICAvLyBwcml2YXRlIHN0YXRpYyBnZXRVVEYxNkNoYXJMZW5ndGgobkNoYXI6IG51bWJlcik6IG51bWJlciB7XG4gIC8vICAgcmV0dXJuIG5DaGFyIDwgMHgxMDAwMCA/IDEgOiAyO1xuICAvLyB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdHI7XG4gIH1cblxuICAvLyBEZXByZWNhdGVkXG4gIHB1YmxpYyBjb2RlUG9pbnRBdChpbmRleDogbnVtYmVyKTpBcnJheUJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuY29kZVVuaXRBdChpbmRleCk7XG4gIH1cblxuICBwdWJsaWMgY29kZVVuaXRBdChpbmRleDogbnVtYmVyKTpBcnJheUJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucmF3LnNsaWNlKHRoaXMuaW5kZXhlc1tpbmRleF0sIHRoaXMuaW5kZXhlc1tpbmRleCsxXSk7XG4gIH1cblxufVxuXG5cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG5pbXBvcnQge0NsaWVudCwgd2l0aEJyb3dzZXJ9IGZyb20gXCJ0cy1zdHJlYW1jbGllbnRcIlxuaW1wb3J0IHtVbmlxRmxhZ30gZnJvbSBcInRzLXh1dGlsc1wiXG5pbXBvcnQge0pzb259IGZyb20gXCJ0cy1qc29uXCJcblxubGV0IGNsaWVudDogQ2xpZW50fG51bGwgPSBudWxsXG5sZXQgdXJsID0gXCJcIlxuXG5mdW5jdGlvbiBoZWFkZXJzKGNhY2hlOiBDYWNoZSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICBsZXQgcmV0Ok1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKClcbiAgbGV0IGtleTogc3RyaW5nID0gXCJcIlxuXG4gIGtleSA9ICgkKFwiI2tleTFcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgaWYgKGtleSAhPT0gXCJcIikge1xuICAgIGNhY2hlLmtleTEgPSBrZXlcbiAgICBjYWNoZS52YWx1ZTEgPSAoJChcIiN2YWx1ZTFcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgICByZXQuc2V0KGtleSwgY2FjaGUudmFsdWUxKVxuICB9IGVsc2Uge1xuICAgIGNhY2hlLmtleTEgPSBcIlwiXG4gICAgY2FjaGUudmFsdWUxID0gXCJcIlxuICB9XG5cbiAga2V5ID0gKCQoXCIja2V5MlwiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICBpZiAoa2V5ICE9PSBcIlwiKSB7XG4gICAgY2FjaGUua2V5MiA9IGtleVxuICAgIGNhY2hlLnZhbHVlMiA9ICgkKFwiI3ZhbHVlMlwiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICAgIHJldC5zZXQoa2V5LCBjYWNoZS52YWx1ZTIpXG4gIH0gZWxzZSB7XG4gICAgY2FjaGUua2V5MiA9IFwiXCJcbiAgICBjYWNoZS52YWx1ZTIgPSBcIlwiXG4gIH1cblxuICBrZXkgPSAoJChcIiNrZXkzXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gIGlmIChrZXkgIT09IFwiXCIpIHtcbiAgICBjYWNoZS5rZXkzID0ga2V5XG4gICAgY2FjaGUudmFsdWUzID0gKCQoXCIjdmFsdWUzXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gICAgcmV0LnNldChrZXksIGNhY2hlLnZhbHVlMylcbiAgfSBlbHNlIHtcbiAgICBjYWNoZS5rZXkzID0gXCJcIlxuICAgIGNhY2hlLnZhbHVlMyA9IFwiXCJcbiAgfVxuXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gcHJpbnQoc3RyaW5nOiBzdHJpbmcpIHtcbiAgbGV0IGJvZHkgPSAkKFwiI291dHB1dFwiKTtcbiAgYm9keS5hcHBlbmQoXCI8cD5cIitzdHJpbmcrXCI8L3A+XCIpO1xufVxuZnVuY3Rpb24gcHJpbnRQdXNoKHN0cmluZzogc3RyaW5nKSB7XG4gIGxldCBib2R5ID0gJChcIiNvdXRwdXRcIik7XG4gIGJvZHkuYXBwZW5kKFwiPHAgc3R5bGU9J2NvbG9yOiBjYWRldGJsdWUnPlwiK3N0cmluZytcIjwvcD5cIik7XG59XG5mdW5jdGlvbiBwcmludEVycm9yKHN0cmluZzogc3RyaW5nKSB7XG4gIGxldCBib2R5ID0gJChcIiNvdXRwdXRcIik7XG4gIGJvZHkuYXBwZW5kKFwiPHAgc3R5bGU9J2NvbG9yOiByZWQnPlwiK3N0cmluZytcIjwvcD5cIik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kKCkge1xuICBsZXQgd3NzID0gJChcIiN3c3NcIikudmFsKClcbiAgaWYgKGNsaWVudCA9PT0gbnVsbCB8fCB1cmwgIT0gd3NzKSB7XG4gICAgdXJsID0gd3NzIGFzIHN0cmluZ1xuICAgIGNsaWVudCA9IG5ldyBDbGllbnQod2l0aEJyb3dzZXIodXJsKSlcblx0XHRjbGllbnQub25QdXNoID0gYXN5bmMgKGRhdGEpPT57XG5cdFx0XHRwcmludFB1c2goXCJwdXNoOiBcIiArIGRhdGEudG9TdHJpbmcoKSlcblx0XHR9XG4gICAgY2xpZW50Lm9uUGVlckNsb3NlZCA9IGFzeW5jIChlcnIpPT57XG5cdFx0XHRwcmludEVycm9yKGAke2Vycn1gKVxuXHRcdH1cbiAgfVxuXG4gIGxldCBjYWNoZSA9IG5ldyBDYWNoZSgpXG4gIGNhY2hlLndzcyA9IHVybFxuXG4gIGNhY2hlLmRhdGEgPSAkKFwiI3Bvc3RcIikudmFsKCkgYXMgc3RyaW5nXG5cblx0JChcIiNvdXRwdXRcIikuZW1wdHkoKVxuXG4gIGxldCBbcmV0LCBlcnJdID0gYXdhaXQgY2xpZW50LlNlbmRXaXRoUmVxSWQoY2FjaGUuZGF0YSwgaGVhZGVycyhjYWNoZSkpXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibGFzdFwiLCBKU09OLnN0cmluZ2lmeShjYWNoZSkpXG5cbiAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgIGlmIChlcnIuaXNDb25uRXJyKSB7XG4gICAgICBwcmludEVycm9yKGBjb25uLWVycm9yOiAke2Vycn1gKVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmludEVycm9yKGByZXNwLWVycm9yOiAke2Vycn1gKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwcmludChcInJlc3Agc3RyaW5nOiBcIiArIHJldC50b1N0cmluZygpICsgXCJcXG4gID09PiAgdG8ganNvbjogXCIgKyBKU09OLnN0cmluZ2lmeShKU09OLnBhcnNlKHJldC50b1N0cmluZygpKSkpXG4gICAgY29uc29sZS5sb2coXCJyZXNwLS0tanNvbjogXCIpXG4gICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShyZXQudG9TdHJpbmcoKSkpXG4gIH1cbn1cblxuJChcIiNzZW5kXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKCk9PntcbiAgYXdhaXQgc2VuZCgpXG59KVxuXG5jbGFzcyBDYWNoZSB7XG4gIHdzczogc3RyaW5nID0gXCJcIlxuICBrZXkxOiBzdHJpbmcgPSBcIlwiXG4gIHZhbHVlMTogc3RyaW5nID0gXCJcIlxuICBrZXkyOiBzdHJpbmcgPSBcIlwiXG4gIHZhbHVlMjogc3RyaW5nID0gXCJcIlxuICBrZXkzOiBzdHJpbmcgPSBcIlwiXG4gIHZhbHVlMzogc3RyaW5nID0gXCJcIlxuICBkYXRhOiBzdHJpbmcgPSBcIlwiXG59XG5cbiQoKCk9PntcbiAgbGV0IGNhY2hlUyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGFzdFwiKVxuICBsZXQgY2FjaGU6IENhY2hlXG4gIGlmIChjYWNoZVMgPT09IG51bGwpIHtcbiAgICBjYWNoZSA9IG5ldyBDYWNoZSgpXG4gIH0gZWxzZSB7XG4gICAgY2FjaGUgPSBKU09OLnBhcnNlKGNhY2hlUykgYXMgQ2FjaGVcbiAgfVxuXG4gICQoXCIja2V5MVwiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUua2V5MSlcbiAgJChcIiN2YWx1ZTFcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLnZhbHVlMSlcbiAgJChcIiNrZXkyXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS5rZXkyKVxuICAkKFwiI3ZhbHVlMlwiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUudmFsdWUyKVxuICAkKFwiI2tleTNcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLmtleTMpXG4gICQoXCIjdmFsdWUzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS52YWx1ZTMpXG4gICQoXCIjd3NzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS53c3MpXG5cdCQoXCIjcG9zdFwiKS52YWwoY2FjaGUuZGF0YSlcbn0pXG5cbmNsYXNzIFJldHVyblJlcSB7XG5cdGRhdGE6IHN0cmluZyA9IFwiXCJcbn1cblxuZnVuY3Rpb24gaW5pdEF0dHIoKSB7XG5cdCQoXCIja2V5MVwiKS5hdHRyKFwidmFsdWVcIiwgXCJhcGlcIilcblx0JChcIiN2YWx1ZTFcIikuYXR0cihcInZhbHVlXCIsIFwiXCIpXG5cdCQoXCIja2V5MlwiKS5hdHRyKFwidmFsdWVcIiwgXCJcIilcblx0JChcIiN2YWx1ZTJcIikuYXR0cihcInZhbHVlXCIsIFwiXCIpXG5cdCQoXCIja2V5M1wiKS5hdHRyKFwidmFsdWVcIiwgXCJcIilcblx0JChcIiN2YWx1ZTNcIikuYXR0cihcInZhbHVlXCIsIFwiXCIpXG5cdCQoXCIjd3NzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIjEyNy4wLjAuMTo4MDAxXCIpXG5cdCQoXCIjcG9zdFwiKS52YWwoXCJcIilcbn1cblxuJChcIiNyZXR1cm5cIikub24oXCJjbGlja1wiLCBhc3luYyAoKT0+e1xuXHRpbml0QXR0cigpXG5cdCQoXCIjdmFsdWUxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcInJldHVyblwiKVxuXHRsZXQgcmVxID0gbmV3IFJldHVyblJlcSgpXG5cdHJlcS5kYXRhID0gVW5pcUZsYWcoKVxuXHQkKFwiI3Bvc3RcIikudmFsKG5ldyBKc29uKCkudG9Kc29uKHJlcSkpXG59KVxuXG5cbmNsYXNzIFB1c2hSZXEge1xuXHR0aW1lczogbnVtYmVyID0gMFxuXHRwcmVmaXg6IHN0cmluZyA9IFwiXCJcbn1cblxuJChcIiNwdXNoXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKCk9Pntcblx0aW5pdEF0dHIoKVxuXHQkKFwiI3ZhbHVlMVwiKS5hdHRyKFwidmFsdWVcIiwgXCJQdXNoTHQyMFRpbWVzXCIpXG5cdGxldCByZXEgPSBuZXcgUHVzaFJlcSgpXG5cdHJlcS50aW1lcyA9IDEwXG5cdHJlcS5wcmVmaXggPSBcInRoaXMgaXMgYSBwdXNoIHRlc3RcIlxuXHQkKFwiI3Bvc3RcIikudmFsKG5ldyBKc29uKCkudG9Kc29uKHJlcSkpXG59KVxuXG4kKFwiI2Nsb3NlXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKCk9Pntcblx0aW5pdEF0dHIoKVxuXHQkKFwiI3ZhbHVlMVwiKS5hdHRyKFwidmFsdWVcIiwgXCJjbG9zZVwiKVxuXHQkKFwiI3Bvc3RcIikudmFsKFwie31cIilcbn0pXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=