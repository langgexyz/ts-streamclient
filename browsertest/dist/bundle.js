/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ts-concurrency/index.ts":
/*!**********************************************!*\
  !*** ./node_modules/ts-concurrency/index.ts ***!
  \**********************************************/
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
/* harmony import */ var _src_channel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/channel */ "./node_modules/ts-concurrency/src/channel.ts");
/* harmony import */ var _src_semaphore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/semaphore */ "./node_modules/ts-concurrency/src/semaphore.ts");
/* harmony import */ var _src_mutex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/mutex */ "./node_modules/ts-concurrency/src/mutex.ts");
/* harmony import */ var _src_timeout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/timeout */ "./node_modules/ts-concurrency/src/timeout.ts");
/* harmony import */ var _src_asyncexe__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/asyncexe */ "./node_modules/ts-concurrency/src/asyncexe.ts");







/***/ }),

/***/ "./node_modules/ts-concurrency/src/asyncexe.ts":
/*!*****************************************************!*\
  !*** ./node_modules/ts-concurrency/src/asyncexe.ts ***!
  \*****************************************************/
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

/***/ "./node_modules/ts-concurrency/src/channel.ts":
/*!****************************************************!*\
  !*** ./node_modules/ts-concurrency/src/channel.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Channel": () => (/* binding */ Channel),
/* harmony export */   "ChannelClosed": () => (/* binding */ ChannelClosed)
/* harmony export */ });
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./queue */ "./node_modules/ts-concurrency/src/queue.ts");
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

/***/ "./node_modules/ts-concurrency/src/mutex.ts":
/*!**************************************************!*\
  !*** ./node_modules/ts-concurrency/src/mutex.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mutex": () => (/* binding */ Mutex)
/* harmony export */ });
/* harmony import */ var _semaphore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./semaphore */ "./node_modules/ts-concurrency/src/semaphore.ts");
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

/***/ "./node_modules/ts-concurrency/src/queue.ts":
/*!**************************************************!*\
  !*** ./node_modules/ts-concurrency/src/queue.ts ***!
  \**************************************************/
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

/***/ "./node_modules/ts-concurrency/src/semaphore.ts":
/*!******************************************************!*\
  !*** ./node_modules/ts-concurrency/src/semaphore.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Semaphore": () => (/* binding */ Semaphore)
/* harmony export */ });
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./queue */ "./node_modules/ts-concurrency/src/queue.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
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

/***/ "./node_modules/ts-concurrency/src/timeout.ts":
/*!****************************************************!*\
  !*** ./node_modules/ts-concurrency/src/timeout.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Timeout": () => (/* binding */ Timeout),
/* harmony export */   "withTimeout": () => (/* binding */ withTimeout)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
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

/***/ "./node_modules/ts-json/index.ts":
/*!***************************************!*\
  !*** ./node_modules/ts-json/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClassArray": () => (/* reexport safe */ _src_class__WEBPACK_IMPORTED_MODULE_2__.ClassArray),
/* harmony export */   "Json": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.Json),
/* harmony export */   "JsonHas": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.JsonHas),
/* harmony export */   "JsonKey": () => (/* reexport safe */ _src_json__WEBPACK_IMPORTED_MODULE_0__.JsonKey),
/* harmony export */   "RawJson": () => (/* reexport safe */ _src_coder__WEBPACK_IMPORTED_MODULE_1__.RawJson)
/* harmony export */ });
/* harmony import */ var _src_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/json */ "./node_modules/ts-json/src/json.ts");
/* harmony import */ var _src_coder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/coder */ "./node_modules/ts-json/src/coder.ts");
/* harmony import */ var _src_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/class */ "./node_modules/ts-json/src/class.ts");



// export {ProNullable, PropertyMustNullable, asNonNull} from "./type"


/***/ }),

/***/ "./node_modules/ts-json/src/class.ts":
/*!*******************************************!*\
  !*** ./node_modules/ts-json/src/class.ts ***!
  \*******************************************/
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

/***/ "./node_modules/ts-json/src/coder.ts":
/*!*******************************************!*\
  !*** ./node_modules/ts-json/src/coder.ts ***!
  \*******************************************/
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

/***/ "./node_modules/ts-json/src/json.ts":
/*!******************************************!*\
  !*** ./node_modules/ts-json/src/json.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Json": () => (/* binding */ Json),
/* harmony export */   "JsonHas": () => (/* binding */ JsonHas),
/* harmony export */   "JsonKey": () => (/* binding */ JsonKey)
/* harmony export */ });
/* harmony import */ var _class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./class */ "./node_modules/ts-json/src/class.ts");
/* harmony import */ var _coder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./coder */ "./node_modules/ts-json/src/coder.ts");
/* harmony import */ var _type__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./type */ "./node_modules/ts-json/src/type.ts");



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

/***/ "./node_modules/ts-json/src/type.ts":
/*!******************************************!*\
  !*** ./node_modules/ts-json/src/type.ts ***!
  \******************************************/
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

/***/ "./node_modules/ts-streamclient/index.ts":
/*!***********************************************!*\
  !*** ./node_modules/ts-streamclient/index.ts ***!
  \***********************************************/
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
/* harmony import */ var _src_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/client */ "./node_modules/ts-streamclient/src/client.ts");
/* harmony import */ var _src_websocket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/websocket */ "./node_modules/ts-streamclient/src/websocket.ts");
/* harmony import */ var _src_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/error */ "./node_modules/ts-streamclient/src/error.ts");
/* harmony import */ var _src_browserws__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/browserws */ "./node_modules/ts-streamclient/src/browserws.ts");






/***/ }),

/***/ "./node_modules/ts-streamclient/src/browserws.ts":
/*!*******************************************************!*\
  !*** ./node_modules/ts-streamclient/src/browserws.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BrowserWs": () => (/* binding */ BrowserWs),
/* harmony export */   "withBrowser": () => (/* binding */ withBrowser)
/* harmony export */ });
/* harmony import */ var _websocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./websocket */ "./node_modules/ts-streamclient/src/websocket.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");


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

/***/ "./node_modules/ts-streamclient/src/client.ts":
/*!****************************************************!*\
  !*** ./node_modules/ts-streamclient/src/client.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Client": () => (/* binding */ Client),
/* harmony export */   "Result": () => (/* binding */ Result)
/* harmony export */ });
/* harmony import */ var _net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./net */ "./node_modules/ts-streamclient/src/net.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-concurrency */ "./node_modules/ts-concurrency/index.ts");
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

/***/ "./node_modules/ts-streamclient/src/error.ts":
/*!***************************************************!*\
  !*** ./node_modules/ts-streamclient/src/error.ts ***!
  \***************************************************/
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

/***/ "./node_modules/ts-streamclient/src/fakehttp.ts":
/*!******************************************************!*\
  !*** ./node_modules/ts-streamclient/src/fakehttp.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Request": () => (/* binding */ Request),
/* harmony export */   "Response": () => (/* binding */ Response),
/* harmony export */   "Status": () => (/* binding */ Status)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error */ "./node_modules/ts-streamclient/src/error.ts");
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

/***/ "./node_modules/ts-streamclient/src/net.ts":
/*!*************************************************!*\
  !*** ./node_modules/ts-streamclient/src/net.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Net": () => (/* binding */ Net),
/* harmony export */   "formatMap": () => (/* binding */ formatMap)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-concurrency */ "./node_modules/ts-concurrency/index.ts");
/* harmony import */ var _fakehttp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fakehttp */ "./node_modules/ts-streamclient/src/fakehttp.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./error */ "./node_modules/ts-streamclient/src/error.ts");
/* harmony import */ var _protocol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./protocol */ "./node_modules/ts-streamclient/src/protocol.ts");
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

/***/ "./node_modules/ts-streamclient/src/protocol.ts":
/*!******************************************************!*\
  !*** ./node_modules/ts-streamclient/src/protocol.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Handshake": () => (/* binding */ Handshake)
/* harmony export */ });
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");

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

/***/ "./node_modules/ts-streamclient/src/websocket.ts":
/*!*******************************************************!*\
  !*** ./node_modules/ts-streamclient/src/websocket.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractWebSocketDriver": () => (/* binding */ AbstractWebSocketDriver),
/* harmony export */   "WebSocketProtocol": () => (/* binding */ WebSocketProtocol)
/* harmony export */ });
/* harmony import */ var _protocol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./protocol */ "./node_modules/ts-streamclient/src/protocol.ts");
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error */ "./node_modules/ts-streamclient/src/error.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
/* harmony import */ var ts_concurrency__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ts-concurrency */ "./node_modules/ts-concurrency/index.ts");
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

/***/ "./node_modules/ts-xutils/index.ts":
/*!*****************************************!*\
  !*** ./node_modules/ts-xutils/index.ts ***!
  \*****************************************/
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
/* harmony import */ var _src_duration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/duration */ "./node_modules/ts-xutils/src/duration.ts");
/* harmony import */ var _src_utf8__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/utf8 */ "./node_modules/ts-xutils/src/utf8.ts");
/* harmony import */ var _src_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/logger */ "./node_modules/ts-xutils/src/logger.ts");
/* harmony import */ var _src_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/assert */ "./node_modules/ts-xutils/src/assert.ts");
/* harmony import */ var _src_typefunc__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/typefunc */ "./node_modules/ts-xutils/src/typefunc.ts");







/***/ }),

/***/ "./node_modules/ts-xutils/src/assert.ts":
/*!**********************************************!*\
  !*** ./node_modules/ts-xutils/src/assert.ts ***!
  \**********************************************/
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

/***/ "./node_modules/ts-xutils/src/duration.ts":
/*!************************************************!*\
  !*** ./node_modules/ts-xutils/src/duration.ts ***!
  \************************************************/
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

/***/ "./node_modules/ts-xutils/src/logger.ts":
/*!**********************************************!*\
  !*** ./node_modules/ts-xutils/src/logger.ts ***!
  \**********************************************/
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

/***/ "./node_modules/ts-xutils/src/typefunc.ts":
/*!************************************************!*\
  !*** ./node_modules/ts-xutils/src/typefunc.ts ***!
  \************************************************/
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

/***/ "./node_modules/ts-xutils/src/utf8.ts":
/*!********************************************!*\
  !*** ./node_modules/ts-xutils/src/utf8.ts ***!
  \********************************************/
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
/* harmony import */ var ts_streamclient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-streamclient */ "./node_modules/ts-streamclient/index.ts");
/* harmony import */ var ts_xutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ts-xutils */ "./node_modules/ts-xutils/index.ts");
/* harmony import */ var ts_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ts-json */ "./node_modules/ts-json/index.ts");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxHQUFHLElBQUksT0FBTyxFQUFFO0lBQ3ZCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRTtJQUNkLEdBQUcsQ0FBQyxNQUFNLEdBQUcscUJBQXFCO0lBQ2xDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSx5Q0FBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsRUFBQztBQUVGLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQVEsRUFBRTtJQUNqQyxRQUFRLEVBQUU7SUFDVixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7SUFDbkMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDckIsQ0FBQyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLWNvbmN1cnJlbmN5L2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1jb25jdXJyZW5jeS9zcmMvYXN5bmNleGUudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLWNvbmN1cnJlbmN5L3NyYy9jaGFubmVsLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1jb25jdXJyZW5jeS9zcmMvbXV0ZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLWNvbmN1cnJlbmN5L3NyYy9xdWV1ZS50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtY29uY3VycmVuY3kvc3JjL3NlbWFwaG9yZS50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtY29uY3VycmVuY3kvc3JjL3RpbWVvdXQudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLWpzb24vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLWpzb24vc3JjL2NsYXNzLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1qc29uL3NyYy9jb2Rlci50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtanNvbi9zcmMvanNvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtanNvbi9zcmMvdHlwZS50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtc3RyZWFtY2xpZW50L2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1zdHJlYW1jbGllbnQvc3JjL2Jyb3dzZXJ3cy50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMtc3RyZWFtY2xpZW50L3NyYy9jbGllbnQudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLXN0cmVhbWNsaWVudC9zcmMvZXJyb3IudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLXN0cmVhbWNsaWVudC9zcmMvZmFrZWh0dHAudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLXN0cmVhbWNsaWVudC9zcmMvbmV0LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1zdHJlYW1jbGllbnQvc3JjL3Byb3RvY29sLnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy1zdHJlYW1jbGllbnQvc3JjL3dlYnNvY2tldC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMteHV0aWxzL2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXJfdGVzdC8uL25vZGVfbW9kdWxlcy90cy14dXRpbHMvc3JjL2Fzc2VydC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMteHV0aWxzL3NyYy9kdXJhdGlvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9ub2RlX21vZHVsZXMvdHMteHV0aWxzL3NyYy9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLXh1dGlscy9zcmMvdHlwZWZ1bmMudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0Ly4vbm9kZV9tb2R1bGVzL3RzLXh1dGlscy9zcmMvdXRmOC50cyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYnJvd3Nlcl90ZXN0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3Qvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9icm93c2VyX3Rlc3QvLi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQge0NoYW5uZWwsIENoYW5uZWxDbG9zZWR9IGZyb20gXCIuL3NyYy9jaGFubmVsXCJcbmV4cG9ydCB0eXBlIHsgU2VuZENoYW5uZWwsIFJlY2VpdmVDaGFubmVsIH0gZnJvbSBcIi4vc3JjL2NoYW5uZWxcIjtcblxuZXhwb3J0IHtTZW1hcGhvcmV9IGZyb20gXCIuL3NyYy9zZW1hcGhvcmVcIlxuXG5leHBvcnQge011dGV4fSBmcm9tIFwiLi9zcmMvbXV0ZXhcIlxuXG5leHBvcnQge3dpdGhUaW1lb3V0LCBUaW1lb3V0fSBmcm9tIFwiLi9zcmMvdGltZW91dFwiXG5cbmV4cG9ydCB7YXN5bmNFeGV9IGZyb20gXCIuL3NyYy9hc3luY2V4ZVwiXG5cbiIsIlxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jRXhlKGV4ZTogKCk9PlByb21pc2U8dm9pZD4pOnZvaWQge1xuXHQvLyBpZ25vcmUgcmV0dXJuXG5cdG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cdFx0YXdhaXQgZXhlKClcblx0XHRyZXNvbHZlKClcblx0fSlcbn1cbiIsIlxuZXhwb3J0IGNsYXNzIENoYW5uZWxDbG9zZWQgaW1wbGVtZW50cyBFcnJvciB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkNoYW5uZWxDbG9zZWRcIlxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuXHRcdHRoaXMubWVzc2FnZSA9IG1cblx0fVxufVxuXG5pbXBvcnQge3F1ZXVlfSBmcm9tIFwiLi9xdWV1ZVwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VuZENoYW5uZWw8RT4ge1xuXHRTZW5kKGU6IEUpOiBQcm9taXNlPENoYW5uZWxDbG9zZWR8bnVsbD5cblx0Q2xvc2UocmVhc29uOiBzdHJpbmcpOnZvaWRcblx0Q2xvc2UoKTp2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZWl2ZUNoYW5uZWw8RT4ge1xuXHRSZWNlaXZlT3JGYWlsZWQoKTogUHJvbWlzZTxFfENoYW5uZWxDbG9zZWQ+XG5cdFJlY2VpdmUoKTogUHJvbWlzZTxFfG51bGw+XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFubmVsPEU+IGltcGxlbWVudHMgU2VuZENoYW5uZWw8RT4sIFJlY2VpdmVDaGFubmVsPEU+IHtcblx0ZGF0YTogcXVldWU8RT4gPSBuZXcgcXVldWVcblx0c2VuZFN1c3BlbmQ6IHF1ZXVlPFtFLCAocmV0OiBDaGFubmVsQ2xvc2VkfG51bGwpPT52b2lkXT4gPSBuZXcgcXVldWUoKVxuXHRyZWNlaXZlU3VzcGVuZDogcXVldWU8KHZhbHVlOiBFfENoYW5uZWxDbG9zZWQpPT52b2lkPiA9IG5ldyBxdWV1ZSgpXG5cdG1heDogbnVtYmVyXG5cdGNsb3NlZDogQ2hhbm5lbENsb3NlZHxudWxsID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKG1heDogbnVtYmVyID0gMCkge1xuXHRcdHRoaXMubWF4ID0gbWF4XG5cdH1cblxuXHRDbG9zZShyZWFzb246IHN0cmluZyk6IHZvaWRcblx0Q2xvc2UoKTogdm9pZFxuXHRDbG9zZShyZWFzb24/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLmNsb3NlZCA9IG5ldyBDaGFubmVsQ2xvc2VkKHJlYXNvbiA/IHJlYXNvbiA6IFwiXCIpXG5cdFx0Zm9yIChsZXQgcyA9IHRoaXMuc2VuZFN1c3BlbmQuZGUoKTsgcyAhPSBudWxsOyBzID0gdGhpcy5zZW5kU3VzcGVuZC5kZSgpKSB7XG5cdFx0XHRzWzFdKHRoaXMuY2xvc2VkKVxuXHRcdH1cblx0XHRmb3IgKGxldCByID0gdGhpcy5yZWNlaXZlU3VzcGVuZC5kZSgpOyByICE9IG51bGw7IHIgPSB0aGlzLnJlY2VpdmVTdXNwZW5kLmRlKCkpIHtcblx0XHRcdHIodGhpcy5jbG9zZWQpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgU2VuZChlOiBFKTogUHJvbWlzZTxDaGFubmVsQ2xvc2VkfG51bGw+IHtcblx0XHRpZiAodGhpcy5jbG9zZWQgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvc2VkXG5cdFx0fVxuXG5cdFx0bGV0IHJmdW4gPSB0aGlzLnJlY2VpdmVTdXNwZW5kLmRlKClcblxuXHRcdGlmICh0aGlzLmRhdGEuY291bnQgPj0gdGhpcy5tYXggJiYgcmZ1biA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8Q2hhbm5lbENsb3NlZHxudWxsPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnNlbmRTdXNwZW5kLmVuKFtlLCByZXNvbHZlXSlcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Ly8gcmZ1biAhPSBuaWw6IGRhdGEgaXMgZW1wdHlcblx0XHRpZiAocmZ1biAhPSBudWxsKSB7XG5cdFx0XHRyZnVuKGUpXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblxuXHRcdC8vIHJmdW4gPT0gbmlsICYmIGRhdGEuY291bnQgPCBtYXg6IG1heCAhPSAwXG5cdFx0dGhpcy5kYXRhLmVuKGUpXG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXG5cdGFzeW5jIFJlY2VpdmVPckZhaWxlZCgpOiBQcm9taXNlPEV8Q2hhbm5lbENsb3NlZD4ge1xuXHRcdGlmICh0aGlzLmNsb3NlZCAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9zZWRcblx0XHR9XG5cblx0XHRsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZGUoKVxuXHRcdGxldCBzdXNwZW5kID0gdGhpcy5zZW5kU3VzcGVuZC5kZSgpXG5cblx0XHRpZiAodmFsdWUgPT0gbnVsbCAmJiBzdXNwZW5kID09IG51bGwpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxFfENoYW5uZWxDbG9zZWQ+KChyZXNvbHZlKT0+e1xuXHRcdFx0XHR0aGlzLnJlY2VpdmVTdXNwZW5kLmVuKHJlc29sdmUpXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdC8vIHZhbHVlICE9IG5pbDogbWF4ICE9IDBcblx0XHRpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHN1c3BlbmQgIT0gbnVsbCkge1xuXHRcdFx0XHRsZXQgW3YsIHNmdW5dID0gc3VzcGVuZFxuXHRcdFx0XHR0aGlzLmRhdGEuZW4odilcblx0XHRcdFx0c2Z1bihudWxsKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXG5cdFx0Ly8gdmFsdWUgPT0gbmlsICYmIHN1c3BlbmQgIT0gbmlsOiBtYXggPT0gMFxuXHRcdGxldCBbdiwgc2Z1bl0gPSBzdXNwZW5kIVxuXHRcdHNmdW4obnVsbClcblx0XHRyZXR1cm4gdlxuXHR9XG5cblx0YXN5bmMgUmVjZWl2ZSgpOiBQcm9taXNlPEV8bnVsbD4ge1xuXHRcdGxldCByID0gYXdhaXQgdGhpcy5SZWNlaXZlT3JGYWlsZWQoKVxuXHRcdGlmIChyIGluc3RhbmNlb2YgQ2hhbm5lbENsb3NlZCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdFx0cmV0dXJuIHJcblx0fVxufVxuIiwiaW1wb3J0IHtTZW1hcGhvcmV9IGZyb20gXCIuL3NlbWFwaG9yZVwiXG5cblxuZXhwb3J0IGNsYXNzIE11dGV4IHtcblx0c2VtID0gbmV3IFNlbWFwaG9yZSgxKVxuXG5cdGFzeW5jIExvY2soKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgdGhpcy5zZW0uQWNxdWlyZSgpXG5cdH1cblxuXHRVbmxvY2soKTogdm9pZCB7XG5cdFx0dGhpcy5zZW0uUmVsZWFzZSgpXG5cdH1cblxuXHRhc3luYyB3aXRoTG9jazxSPihleGU6ICgpPT5Qcm9taXNlPFI+KTogUHJvbWlzZTxSPiB7XG5cdFx0YXdhaXQgdGhpcy5Mb2NrKClcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIGF3YWl0IGV4ZSgpXG5cdFx0fWZpbmFsbHkge1xuXHRcdFx0dGhpcy5VbmxvY2soKVxuXHRcdH1cblx0fVxufVxuXG4iLCJcbmV4cG9ydCBjbGFzcyBub2RlPEU+IHtcblx0aXNWYWxpZDogYm9vbGVhbiA9IHRydWVcblx0ZWxlbWVudDpFXG5cdG5leHQ6IG5vZGU8RT58bnVsbCA9IG51bGxcblxuXHRjb25zdHJ1Y3RvcihlOiBFKSB7XG5cdFx0dGhpcy5lbGVtZW50ID0gZVxuXHR9XG5cblx0aW5WYWxpZCgpIHtcblx0XHR0aGlzLmlzVmFsaWQgPSBmYWxzZVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBxdWV1ZTxFPiB7XG5cdGZpcnN0OiBub2RlPEU+fG51bGwgPSBudWxsXG5cdGxhc3Q6IG5vZGU8RT58bnVsbCA9IG51bGxcblx0Y291bnQ6IG51bWJlciA9IDBcblxuXHRlbihlOiBFKTogbm9kZTxFPiB7XG5cdFx0bGV0IG5ld05vZGUgPSBuZXcgbm9kZShlKVxuXG5cdFx0aWYgKHRoaXMubGFzdCA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmxhc3QgPSBuZXdOb2RlXG5cdFx0XHR0aGlzLmZpcnN0ID0gdGhpcy5sYXN0XG5cdFx0XHR0aGlzLmNvdW50ICs9IDFcblx0XHRcdHJldHVybiBuZXdOb2RlXG5cdFx0fVxuXG5cdFx0dGhpcy5sYXN0Lm5leHQgPSBuZXdOb2RlXG5cdFx0dGhpcy5sYXN0ID0gdGhpcy5sYXN0Lm5leHRcblx0XHR0aGlzLmNvdW50ICs9IDFcblx0XHRyZXR1cm4gbmV3Tm9kZVxuXHR9XG5cblx0ZGUoKTogRXxudWxsIHtcblx0XHR3aGlsZSAodGhpcy5maXJzdCAhPSBudWxsICYmICF0aGlzLmZpcnN0LmlzVmFsaWQpIHtcblx0XHRcdHRoaXMuZmlyc3QgPSB0aGlzLmZpcnN0Lm5leHRcblx0XHRcdHRoaXMuY291bnQgLT0gMVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLmZpcnN0ID09IG51bGwpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMuZmlyc3QuZWxlbWVudFxuXHRcdHRoaXMuZmlyc3QgPSB0aGlzLmZpcnN0Lm5leHRcblxuXHRcdGlmICh0aGlzLmZpcnN0ID09IG51bGwpIHtcblx0XHRcdHRoaXMubGFzdCA9IG51bGxcblx0XHR9XG5cblx0XHR0aGlzLmNvdW50IC09IDFcblxuXHRcdHJldHVybiByZXRcblx0fVxufVxuXG4iLCJpbXBvcnQge3F1ZXVlfSBmcm9tIFwiLi9xdWV1ZVwiXG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcInRzLXh1dGlsc1wiXG5cblxuZXhwb3J0IGNsYXNzIFNlbWFwaG9yZSB7XG5cdGFjcXVpcmVkU3VzcGVuZDogcXVldWU8KCkgPT4gdm9pZD4gPSBuZXcgcXVldWVcblx0cHVibGljIG1heDogbnVtYmVyXG5cdHB1YmxpYyBjdXJyZW50OiBudW1iZXIgPSAwXG5cblx0Y29uc3RydWN0b3IobWF4OiBudW1iZXIpIHtcblx0XHR0aGlzLm1heCA9IG1heCA+IDE/IG1heCA6IDFcblx0fVxuXG5cdGFzeW5jIEFjcXVpcmUoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKHRoaXMuY3VycmVudCA8IHRoaXMubWF4KSB7XG5cdFx0XHR0aGlzLmN1cnJlbnQgKz0gMVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKT0+e1xuXHRcdFx0dGhpcy5hY3F1aXJlZFN1c3BlbmQuZW4ocmVzb2x2ZSlcblx0XHR9KVxuXHR9XG5cblx0UmVsZWFzZSgpOiB2b2lkIHtcblx0XHRsZXQgZCA9IHRoaXMuYWNxdWlyZWRTdXNwZW5kLmRlKClcblx0XHRpZiAoZCAhPSBudWxsKSB7XG5cdFx0XHRkKClcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdC8vIGRlKCkgPT0gbmlsXG5cdFx0dGhpcy5jdXJyZW50IC09IDFcblx0XHRhc3NlcnQodGhpcy5jdXJyZW50ID49IDApXG5cdH1cblxuXHRSZWxlYXNlQWxsKCk6IHZvaWQge1xuXHRcdGZvciAobGV0IGQgPSB0aGlzLmFjcXVpcmVkU3VzcGVuZC5kZSgpOyBkICE9IG51bGw7IGQgPSB0aGlzLmFjcXVpcmVkU3VzcGVuZC5kZSgpKSB7XG5cdFx0XHRkKClcblx0XHR9XG5cdFx0dGhpcy5jdXJyZW50ID0gMFxuXHR9XG59XG5cbiIsImltcG9ydCB7RHVyYXRpb24sIE1pbGxpc2Vjb25kfSBmcm9tIFwidHMteHV0aWxzXCJcblxuZXhwb3J0IGNsYXNzIFRpbWVvdXQgaW1wbGVtZW50cyBFcnJvciB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIlRpbWVvdXRcIlxuXG5cdGNvbnN0cnVjdG9yKGQ6IER1cmF0aW9uKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gYHRpbWVvdXQ6ICR7ZC9NaWxsaXNlY29uZH1tc2Bcblx0fVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aFRpbWVvdXQ8Uj4oZDogRHVyYXRpb24sIGV4ZTogKCk9PlByb21pc2U8Uj4pOiBQcm9taXNlPFJ8VGltZW91dD4ge1xuXHRsZXQgdGltZXJcblx0bGV0IHRpbWVQcm8gPSBuZXcgUHJvbWlzZTxUaW1lb3V0PigocmVzb2x2ZSk9Pntcblx0XHR0aW1lciA9IHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHJlc29sdmUobmV3IFRpbWVvdXQoZCkpXG5cdFx0fSwgZC9NaWxsaXNlY29uZClcblx0fSlcblxuXHRsZXQgcmV0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtleGUoKSwgdGltZVByb10pXG5cdGNsZWFyVGltZW91dCh0aW1lcilcblx0cmV0dXJuIHJldFxufVxuXG4iLCJcbmV4cG9ydCB7SnNvbiwgSnNvbktleSwgSnNvbkhhcywgdHlwZSBIYXN9IGZyb20gXCIuL3NyYy9qc29uXCJcblxuZXhwb3J0IHR5cGUge0pzb25EZWNvZGVyLCBKc29uRW5jb2RlLCBDb25zdHJ1Y3Rvckpzb25EZWNvZGVyLCBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyfSBmcm9tIFwiLi9zcmMvY29kZXJcIlxuXG5leHBvcnQge1Jhd0pzb259IGZyb20gXCIuL3NyYy9jb2RlclwiXG5cbmV4cG9ydCB7Q2xhc3NBcnJheX0gZnJvbSBcIi4vc3JjL2NsYXNzXCJcblxuZXhwb3J0IHR5cGUge0pzb25UeXBlLCBKc29uT2JqZWN0LCBKc29uUHJpbWl0aXZlLCBKc29uQXJyYXl9IGZyb20gXCIuL3NyYy90eXBlXCJcblxuLy8gZXhwb3J0IHtQcm9OdWxsYWJsZSwgUHJvcGVydHlNdXN0TnVsbGFibGUsIGFzTm9uTnVsbH0gZnJvbSBcIi4vdHlwZVwiXG4iLCJcbmV4cG9ydCBjbGFzcyBDbGFzc0FycmF5PFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06IFRbUF19PiBleHRlbmRzIEFycmF5PFQ+IHtcblxuICBjb25zdHJ1Y3Rvcihwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIHRzYnVnOiDnvJbor5HkuLplczXlkI7vvIzlhoXlu7rnsbvlnovnu6fmib/nmoTljp/lnovpk77kvJrlj5HnlJ/plJnor6/mlLnlj5jjgIJcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQ2xhc3NBcnJheS5wcm90b3R5cGUpO1xuXG4gICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5pdGVtUHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLml0ZW1Qcm90b3R5cGUgPSBwcm90b3R5cGVcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpdGVtUHJvdG90eXBlXCIsIHtlbnVtZXJhYmxlOiBmYWxzZX0pO1xuICB9XG5cbiAgcHVibGljIG5ld0l0ZW0oKTpUIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtUHJvdG90eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBpdGVtUHJvdG90eXBlOlQ7XG59XG5cbnR5cGUgTm90RW1wdHlBcnJheTxUPiA9IEFycmF5PFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcnJheUl0ZW1Qcm90b3R5cGU8VD4oYXJyOiBDbGFzc0FycmF5PFQ+fE5vdEVtcHR5QXJyYXk8VD4pOiBUe1xuICBpZiAoYXJyIGluc3RhbmNlb2YgQ2xhc3NBcnJheSkge1xuICAgIHJldHVybiBhcnIubmV3SXRlbSgpXG4gIH1cblxuICByZXR1cm4gYXJyWzBdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzQXJyYXk8VCBleHRlbmRzIG9iamVjdD4oYXJnOiBhbnkpOiBhcmcgaXMgQ2xhc3NBcnJheTxUPnxOb3RFbXB0eUFycmF5PFQ+IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIChhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5XG4gICAgfHwgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgYXJnLmxlbmd0aCAhPT0gMCAmJiBpc0NsYXNzKGFyZ1swXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzKGFyZzogYW55KTogYXJnIGlzIHtba2V5Om51bWJlcl06YW55fSB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnOiBhbnkpOiBhcmcgaXMgbnVtYmVyfHN0cmluZ3xib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgYXJnID09PSBcImJvb2xlYW5cIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUmVjRW1wdHlBcnJheTxUPihhcmc6IGFueSk6IGFyZyBpcyBBcnJheTxUPiB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUFycmF5PFQ+KGFyZzogYW55KTogYXJnIGlzIEFycmF5PFQ+IHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09IFwib2JqZWN0XCIgJiYgYXJnIGluc3RhbmNlb2YgQXJyYXkgJiYgIShhcmcgaW5zdGFuY2VvZiBDbGFzc0FycmF5KVxuICAgICYmIChhcmcubGVuZ3RoID09PSAwIHx8IGlzUHJpbWl0aXZlKGFyZ1swXSkpXG59XG5cbiIsImltcG9ydCB7SnNvblR5cGV9IGZyb20gXCIuL3R5cGVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogW2FueSwgRXJyb3J8bnVsbF1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3Rvckpzb25FbmNvZGVyIHtcbiAgZW5jb2RlSnNvbjxUPihpbnN0YW5jZTogVCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkRlY29kZXIge1xuICBkZWNvZGVKc29uKGpzb246IEpzb25UeXBlKTogRXJyb3J8bnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25FbmNvZGUge1xuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlXG59XG5cbmV4cG9ydCBjbGFzcyBSYXdKc29uIGltcGxlbWVudHMgSnNvbkRlY29kZXIsIEpzb25FbmNvZGV7XG4gIHB1YmxpYyByYXc6SnNvblR5cGUgPSBudWxsXG5cbiAgZGVjb2RlSnNvbihqc29uOiBKc29uVHlwZSk6IEVycm9yIHwgbnVsbCB7XG4gICAgdGhpcy5yYXcgPSBqc29uXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBlbmNvZGVKc29uKCk6IEpzb25UeXBlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb25zdHJ1Y3RvckRlY29kZXIoY29uc3RydWN0b3I6IG9iamVjdCk6IGNvbnN0cnVjdG9yIGlzIENvbnN0cnVjdG9ySnNvbkRlY29kZXIge1xuICBsZXQgY29uID0gY29uc3RydWN0b3IgYXMgYW55IGFzIENvbnN0cnVjdG9ySnNvbkRlY29kZXJcbiAgcmV0dXJuIGNvbi5kZWNvZGVKc29uICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbi5kZWNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBjb24uZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NvbnN0cnVjdG9yRW5jb2Rlcihjb25zdHJ1Y3Rvcjogb2JqZWN0KTogY29uc3RydWN0b3IgaXMgQ29uc3RydWN0b3JKc29uRW5jb2RlciB7XG4gIGxldCBjb24gPSBjb25zdHJ1Y3RvciBhcyBhbnkgYXMgQ29uc3RydWN0b3JKc29uRW5jb2RlclxuICByZXR1cm4gY29uLmVuY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgY29uLmVuY29kZUpzb24gPT09IFwiZnVuY3Rpb25cIlxuICAgICYmIGNvbi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzRGVjb2RlcihzZWxmOiBvYmplY3QpOiBzZWxmIGlzIEpzb25EZWNvZGVyIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkRlY29kZXJcbiAgcmV0dXJuIHNmLmRlY29kZUpzb24gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2YuZGVjb2RlSnNvbiA9PT0gXCJmdW5jdGlvblwiXG4gICAgJiYgc2YuZGVjb2RlSnNvbi5sZW5ndGggPT09IDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0VuY29kZXIoc2VsZjogb2JqZWN0KTogc2VsZiBpcyBKc29uRW5jb2RlIHtcbiAgbGV0IHNmID0gc2VsZiBhcyBhbnkgYXMgSnNvbkVuY29kZVxuICByZXR1cm4gc2YuZW5jb2RlSnNvbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZi5lbmNvZGVKc29uID09PSBcImZ1bmN0aW9uXCJcbiAgICAmJiBzZi5lbmNvZGVKc29uLmxlbmd0aCA9PT0gMFxufVxuIiwiXG5cbmltcG9ydCB7XG4gIGNhblJlY0VtcHR5QXJyYXksXG4gIGdldEFycmF5SXRlbVByb3RvdHlwZSwgaXNDbGFzcywgaXNDbGFzc0FycmF5LCBpc1ByaW1pdGl2ZUFycmF5XG59IGZyb20gXCIuL2NsYXNzXCJcbmltcG9ydCB7aGFzQ29uc3RydWN0b3JEZWNvZGVyLCBoYXNDb25zdHJ1Y3RvckVuY29kZXIsIGhhc0RlY29kZXIsIGhhc0VuY29kZXJ9IGZyb20gXCIuL2NvZGVyXCJcbmltcG9ydCB7XG4gIGlzSnNvbkVtcHR5QXJyYXksXG4gIGlzSnNvbk9iamVjdCxcbiAgaXNKc29uT2JqZWN0QXJyYXksIGlzSnNvblByaW1pdGl2ZUFycmF5LFxuICBKc29uT2JqZWN0LFxuICBKc29uVHlwZSxcbn0gZnJvbSBcIi4vdHlwZVwiXG5cbmNvbnN0IGpzb25Ub1Byb3BlcnR5U3ltOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKFwiZnJvbS1qc29uXCIpO1xuY29uc3QgcHJvcGVydHlUb0pzb25TeW06IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woXCJ0by1qc29uXCIpO1xuLy8gY29uc3QganNvbkRlY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1kZWNvZGVyXCIpO1xuLy8gY29uc3QganNvbkVuY29kZXJTeW06c3ltYm9sID0gU3ltYm9sKFwianNvbi1lbmNvZGVyXCIpO1xuXG50eXBlIEpzb25Ub1Byb3BlcnR5TWFwID0gTWFwPHN0cmluZywgc3RyaW5nfHN5bWJvbD5cbnR5cGUgUHJvcGVydHlUb0pzb25NYXAgPSBNYXA8c3RyaW5nfHN5bWJvbCwgc3RyaW5nPlxuXG5pbnRlcmZhY2UgQ29udmVydGVyTWFwIHtcbiAgW2pzb25Ub1Byb3BlcnR5U3ltXT86IEpzb25Ub1Byb3BlcnR5TWFwXG4gIFtwcm9wZXJ0eVRvSnNvblN5bV0/OiBQcm9wZXJ0eVRvSnNvbk1hcFxufVxuXG4vLyDmuIXnqbrljp/mnaXnmoTpnZ7lr7nosaEo5pWw57uEKeWAvFxuLy8gVE9ETzogZm9yIGluIOebruWJjeafpeaJvueahOi1hOaWmeWPquaYr+S8mumBjeWOhuWHuuWPr+aemuS4vueahO+8jOWQjOaXtuafpeW+l+WvueixoeeahOaWueazleaYr+S4jeWPr+aemuS4vueahO+8jOS9huaYr1xuLy8g6L+Z6YeM5Ye6546w5LqGIGZvciBpbiDpgY3ljoblh7rkuoblr7nosaHnmoTmlrnms5XjgILvvIhlczXnmoTmtY/op4jlmajnjq/looPlh7rnjrDmraTnjrDosaHvvIzlhbbku5bnvJbor5HmlrnlvI/kuI7ov5DooYznjq/looPmnKrpqozor4HvvIlcbi8vIOaJgOS7pei/memHjOWKoOS6huKAnOWGl+S9meKAneeahOadoeS7tuWIpOaWrVxuZnVuY3Rpb24gZ2V0UHJvcGVydHlLZXlzPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogKGtleW9mIFQpW117XG4gIGxldCBrZXlzOihrZXlvZiBUKVtdID0gW11cbiAgZm9yIChsZXQgcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmIChpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSAmJiBpbnN0YW5jZS5wcm9wZXJ0eUlzRW51bWVyYWJsZShwKSkge1xuICAgICAga2V5cy5wdXNoKHApXG4gICAgfVxuICB9XG4gIHJldHVybiBrZXlzXG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHlLZXk8VCBleHRlbmRzIG9iamVjdD4oaW5zdGFuY2U6IFQsIGtleTogc3RyaW5nfHN5bWJvbHxudW1iZXIpOiBrZXkgaXMga2V5b2YgVCB7XG4gIHJldHVybiBpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGluc3RhbmNlLnByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSlcbn1cblxuY29uc3QgaGFzID0gU3ltYm9sKFwiaGFzXCIpXG5cbi8vIHRvZG86IGdlbmVyaWMgZXJyb3I6IGZvciBleGFtcGxlICBjbGFzcyBhPFQ+e2Q6VH0gICAgaGFzPGE+ID89IHt9IG5vdCB7ZDpib29sZWFufVxuLy8gZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFQgYXMgKFRbUF0gZXh0ZW5kcyBGdW5jdGlvbiA/IG5ldmVyIDogUCldOiBib29sZWFufVxuZXhwb3J0IHR5cGUgSGFzPFQ+ID0ge1tQIGluIGtleW9mIFRdOiBib29sZWFufVxuXG5leHBvcnQgZnVuY3Rpb24gSnNvbkhhczxUIGV4dGVuZHMgb2JqZWN0Pihhcmc6IFQpOiBIYXM8VD4ge1xuICBpZiAoYXJnLmhhc093blByb3BlcnR5KGhhcykpIHtcbiAgICByZXR1cm4gKGFyZyBhcyBhbnkpW2hhc11cbiAgfVxuXG4gIC8vIOS7heS7heaYr+ihpeWBv+aAp+mAu+i+ke+8jGZyb21Kc29uIOi/lOWbnueahOWvueixoemDveW3sue7j+iuvue9ruS6hmhhc1xuICBsZXQgcmV0OntbcDogc3RyaW5nXTpib29sZWFufSA9IHt9XG4gIGZvciAobGV0IHAgaW4gYXJnKSB7XG4gICAgcmV0W3BdID0gdHJ1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyZywgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6cmV0LCB3cml0YWJsZTpmYWxzZX0pXG5cbiAgcmV0dXJuIHJldCBhcyBIYXM8VD5cbn1cblxuZXhwb3J0IGNsYXNzIEpzb24ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGlzYWxsb3dOdWxsKClcbiAgfVxuXG4gIHB1YmxpYyBpZ25vcmVOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChwLGtleSk9PnsocCBhcyBhbnkpW2tleV0gPSBudWxsfVxuICAgIHRoaXMuZnJvbU51bGxKc29uID0gKHAsa2V5KT0+eyhwIGFzIGFueSlba2V5XSA9IG51bGw7IHJldHVybiBudWxsfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgZGlzYWxsb3dOdWxsKCk6IHRoaXMge1xuICAgIHRoaXMubnVsbFRvSnNvbiA9IChfLF8yKT0+e31cbiAgICB0aGlzLmZyb21OdWxsSnNvbiA9IChfLF8yKT0+e3JldHVybiBFcnJvcihcImNhbiBub3QgbnVsbFwiKX1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHJpdmF0ZSBudWxsVG9Kc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PnZvaWQgPSAoXyxfMik9Pnt9XG4gIHByaXZhdGUgZnJvbU51bGxKc29uOiA8VD4odG86VCwga2V5OiBrZXlvZiBUKSA9PkVycm9yfG51bGwgPSAoXyxfMik9PntyZXR1cm4gbnVsbH1cblxuICBwdWJsaWMgdG9Kc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogc3RyaW5nIHtcblxuICAgIGxldCB0byA9IHRoaXMuY2xhc3MyanNvbihpbnN0YW5jZSk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG8pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGFzczJqc29uPFQgZXh0ZW5kcyBvYmplY3Q+KGZyb206IFQpOiBKc29uVHlwZSB7XG4gICAgaWYgKGhhc0VuY29kZXIoZnJvbSkpIHtcbiAgICAgIHJldHVybiBmcm9tLmVuY29kZUpzb24oKVxuICAgIH1cbiAgICBpZiAoaGFzQ29uc3RydWN0b3JFbmNvZGVyKGZyb20uY29uc3RydWN0b3IpKSB7XG4gICAgICByZXR1cm4gZnJvbS5jb25zdHJ1Y3Rvci5lbmNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKGZyb20gYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuXG4gICAgbGV0IHRvOntba2V5OnN0cmluZ106YW55fSA9IHt9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gICAgICBsZXQgdG9LZXkgPSBwcm9wZXJ0eTJqc29uTWFwLmdldChrZXkgYXMgc3RyaW5nfHN5bWJvbCkgfHwga2V5IGFzIHN0cmluZztcbiAgICAgIGlmICh0b0tleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG5cbiAgICAgIGlmIChmcm9tViA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChmcm9tViA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLm51bGxUb0pzb24odG8sIHRvS2V5KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNDbGFzcyhmcm9tVikpIHtcbiAgICAgICAgdG9bdG9LZXldID0gdGhpcy5jbGFzczJqc29uKGZyb21WKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0NsYXNzQXJyYXkoZnJvbVYpKSB7XG4gICAgICAgIGxldCBhcnI6IEpzb25UeXBlW10gPSBbXVxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGZyb21WKSB7XG4gICAgICAgICAgYXJyLnB1c2godGhpcy5jbGFzczJqc29uKGl0ZW0pKVxuICAgICAgICB9XG4gICAgICAgIHRvW3RvS2V5XSA9IGFyclxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyDln7rmnKzlj5jph4/otYvlgLxcbiAgICAgIHRvW3RvS2V5XSA9IGZyb21WO1xuICAgIH1cblxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgcHVibGljIGZyb21Kc29uPFQgZXh0ZW5kcyB7W1AgaW4ga2V5b2YgVF06VFtQXX0+KGpzb246IEpzb25PYmplY3R8c3RyaW5nXG4gICAgLCBwcm90b3R5cGU6IHtuZXcoLi4uYXJnczphbnlbXSk6IFR9fFQpOltULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwcm90b3R5cGUgPSBuZXcgcHJvdG90eXBlKCk7XG4gICAgfVxuXG4gICAgbGV0IGpzb25PYmogOkpzb25PYmplY3QgPSBqc29uIGFzIEpzb25PYmplY3RcbiAgICBpZiAodHlwZW9mIGpzb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGxldCBwYXIgPSBKU09OLnBhcnNlKGpzb24pXG4gICAgICBpZiAocGFyID09PSBudWxsIHx8IHR5cGVvZiBwYXIgIT09IFwib2JqZWN0XCIgfHwgcGFyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFtwcm90b3R5cGUsIG5ldyBFcnJvcihcImpzb24gc3RyaW5nIG11c3QgYmUgJ3suLi59J1wiKV1cbiAgICAgIH1cblxuICAgICAganNvbk9iaiA9IHBhclxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmpzb24yY2xhc3MoanNvbk9iaiwgcHJvdG90eXBlLCBwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZSlcbiAgfVxuXG4gIHByaXZhdGUganNvbjJjbGFzczxUIGV4dGVuZHMge1tuOm51bWJlcl06YW55fT4oZnJvbTogSnNvbk9iamVjdCwgcHJvdG90eXBlOiBUXG4gICAgLCBjbGFzc05hbWU6IHN0cmluZyk6IFtULCBudWxsfEVycm9yXSB7XG5cbiAgICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgfVxuICAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gICAgfVxuXG4gICAgbGV0IGpzb24yUHJvcGVydHlNYXA6IEpzb25Ub1Byb3BlcnR5TWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW2pzb25Ub1Byb3BlcnR5U3ltXSB8fCBuZXcgTWFwKCk7XG4gICAgbGV0IHByb3BlcnR5Mmpzb25NYXA6IFByb3BlcnR5VG9Kc29uTWFwID0gKHByb3RvdHlwZSBhcyBDb252ZXJ0ZXJNYXApW3Byb3BlcnR5VG9Kc29uU3ltXSB8fCBuZXcgTWFwKCk7XG5cbiAgICBsZXQgaGFzU2V0S2V5ID0gbmV3IFNldDxrZXlvZiB0eXBlb2YgcHJvdG90eXBlPigpXG5cbiAgICBsZXQgaGFzVmFsdWU6e1twOiBzdHJpbmd8c3ltYm9sfG51bWJlcl06Ym9vbGVhbn0gPSB7fVxuXG4gICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhmcm9tKSkge1xuICAgICAgaWYgKGtleSA9PT0gXCItXCIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuXG4gICAgICBpZiAocHJvcGVydHkyanNvbk1hcC5nZXQodG9LZXkgYXMgc3RyaW5nfHN5bWJvbCkgPT09IFwiLVwiKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGNsYXNz5a+56LGh5rKh5pyJ6L+Z6aG55YC877yM5bCx6Lez6L+HXG4gICAgICBpZiAoIWlzUHJvcGVydHlLZXkocHJvdG90eXBlLCB0b0tleSkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgICAgIGhhc1ZhbHVlW3RvS2V5XSA9IHRydWVcblxuICAgICAgbGV0IHByb3BlcnR5TmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAgICAgaWYgKGZyb21ba2V5XSA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZXJyID0gdGhpcy5mcm9tTnVsbEpzb24ocHJvdG90eXBlLCB0b0tleSlcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBFcnJvcihwcm9wZXJ0eU5hbWUgKyBcIi0tLVwiICsgZXJyLm1lc3NhZ2UpXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGxldCBmcm9tViA9IGZyb21ba2V5XVxuICAgICAgbGV0IGtleVByb3RvID0gcHJvdG90eXBlW3RvS2V5XVxuXG4gICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgcHJvcGVydHlOYW1lKVxuICAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpICYmIGlzQ2xhc3NBcnJheTx7W2tleTpudW1iZXJdOmFueX0+KGtleVByb3RvKSkge1xuICAgICAgICBsZXQgaXRlbSA9IGdldEFycmF5SXRlbVByb3RvdHlwZShrZXlQcm90bylcbiAgICAgICAgbGV0IHJldEFyciA9IG5ldyBBcnJheTx0eXBlb2YgaXRlbT4oKVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyb21WLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgbGV0IFtyZXQsIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVZbaV0sIGl0ZW0sIHByb3BlcnR5TmFtZSArIGBbJHtpfV1gKVxuICAgICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldEFyci5wdXNoKHJldClcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RvdHlwZVt0b0tleV0gPSByZXRBcnJcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBwcm9wZXJ0eU5hbWUpXG4gICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHByb3RvdHlwZVt0b0tleV0gPSBmcm9tVlxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBnZXRQcm9wZXJ0eUtleXMocHJvdG90eXBlKSkge1xuICAgICAgaWYgKCFoYXNTZXRLZXkuaGFzKGtleSkpIHtcbiAgICAgICAgLy8gKHByb3RvdHlwZSBhcyBQcm9OdWxsYWJsZTx0eXBlb2YgcHJvdG90eXBlPilba2V5XSA9IG51bGxcbiAgICAgICAgaGFzVmFsdWVba2V5XSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgaGFzLCB7ZW51bWVyYWJsZTpmYWxzZSwgdmFsdWU6aGFzVmFsdWUsIHdyaXRhYmxlOmZhbHNlfSlcblxuICAgIHJldHVybiBbcHJvdG90eXBlLCBudWxsXVxuICB9XG5cbiAgLy8gPFQgZXh0ZW5kcyBNdWxsPFQsIEV4Y2x1ZGU+LCBFeGNsdWRlID0gbmV2ZXI+XG4gIC8vIHB1YmxpYyBmcm9tSnNvbjI8VCBleHRlbmRzIHtbUCBpbiBrZXlvZiBUXTpUW1BdfT4oanNvbjogSnNvbk9iamVjdHxzdHJpbmdcbiAgLy8gICAsIHByb3RvdHlwZToge25ldyguLi5hcmdzOmFueVtdKTogVH18VCk6W1Byb051bGxhYmxlPFQ+LCBudWxsfEVycm9yXSB7XG4gIC8vXG4gIC8vICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAvLyAgICAgcHJvdG90eXBlID0gbmV3IHByb3RvdHlwZSgpO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQganNvbk9iaiA6SnNvbk9iamVjdCA9IGpzb24gYXMgSnNvbk9iamVjdFxuICAvLyAgIGlmICh0eXBlb2YganNvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgbGV0IHBhciA9IEpTT04ucGFyc2UoanNvbilcbiAgLy8gICAgIGlmIChwYXIgPT09IG51bGwgfHwgdHlwZW9mIHBhciAhPT0gXCJvYmplY3RcIiB8fCBwYXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgbmV3IEVycm9yKFwianNvbiBzdHJpbmcgbXVzdCBiZSAney4uLn0nXCIpXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAganNvbk9iaiA9IHBhclxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gdGhpcy5qc29uMmNsYXNzMihqc29uT2JqLCBwcm90b3R5cGUsIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lKVxuICAvLyB9XG4gIC8vXG4gIC8vIHByaXZhdGUganNvbjJjbGFzczI8VCBleHRlbmRzIHtbbjpudW1iZXJdOmFueX0+KGZyb206IEpzb25PYmplY3QsIHByb3RvdHlwZTogVFxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgY2xhc3NOYW1lOiBzdHJpbmcpOiBbUHJvTnVsbGFibGU8VD4sIG51bGx8RXJyb3JdIHtcbiAgLy9cbiAgLy8gICBpZiAoaGFzRGVjb2Rlcihwcm90b3R5cGUpKSB7XG4gIC8vICAgICBsZXQgZXJyID0gcHJvdG90eXBlLmRlY29kZUpzb24oZnJvbSlcbiAgLy8gICAgIHJldHVybiBbcHJvdG90eXBlLCBlcnJdXG4gIC8vICAgfVxuICAvLyAgIGlmIChoYXNDb25zdHJ1Y3RvckRlY29kZXIocHJvdG90eXBlLmNvbnN0cnVjdG9yKSkge1xuICAvLyAgICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5kZWNvZGVKc29uKGZyb20pXG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBqc29uMlByb3BlcnR5TWFwOiBKc29uVG9Qcm9wZXJ0eU1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtqc29uVG9Qcm9wZXJ0eVN5bV0gfHwgbmV3IE1hcCgpO1xuICAvLyAgIGxldCBwcm9wZXJ0eTJqc29uTWFwOiBQcm9wZXJ0eVRvSnNvbk1hcCA9IChwcm90b3R5cGUgYXMgQ29udmVydGVyTWFwKVtwcm9wZXJ0eVRvSnNvblN5bV0gfHwgbmV3IE1hcCgpO1xuICAvL1xuICAvLyAgIGxldCBoYXNTZXRLZXkgPSBuZXcgU2V0PGtleW9mIHR5cGVvZiBwcm90b3R5cGU+KClcbiAgLy9cbiAgLy8gICBmb3IgKGxldCBrZXkgb2YgZ2V0UHJvcGVydHlLZXlzKGZyb20pKSB7XG4gIC8vICAgICBpZiAoa2V5ID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgbGV0IHRvS2V5ID0ganNvbjJQcm9wZXJ0eU1hcC5nZXQoa2V5IGFzIHN0cmluZykgfHwga2V5O1xuICAvL1xuICAvLyAgICAgaWYgKHByb3BlcnR5Mmpzb25NYXAuZ2V0KHRvS2V5IGFzIHN0cmluZ3xzeW1ib2wpID09PSBcIi1cIikge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgLy8gY2xhc3Plr7nosaHmsqHmnInov5npobnlgLzvvIzlsLHot7Pov4dcbiAgLy8gICAgIGlmICghaXNQcm9wZXJ0eUtleShwcm90b3R5cGUsIHRvS2V5KSkge1xuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaGFzU2V0S2V5LmFkZCh0b0tleSlcbiAgLy9cbiAgLy8gICAgIGlmIChmcm9tW2tleV0gPT09IG51bGwpIHtcbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IG51bGxcbiAgLy8gICAgICAgY29udGludWVcbiAgLy8gICAgIH1cbiAgLy9cbiAgLy8gICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZSArIFwiLlwiICsgdG9LZXkudG9TdHJpbmcoKVxuICAvL1xuICAvLyAgICAgbGV0IGZyb21WID0gZnJvbVtrZXldXG4gIC8vICAgICBsZXQga2V5UHJvdG8gPSBwcm90b3R5cGVbdG9LZXldXG4gIC8vXG4gIC8vICAgICBsZXQgZXJyID0gY2hlY2tUeXBlKGZyb21WLCBrZXlQcm90bywgY2xhc3NOYW1lKVxuICAvLyAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAvLyAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdEFycmF5KGZyb21WKSAmJiBpc0NsYXNzQXJyYXk8e1trZXk6bnVtYmVyXTphbnl9PihrZXlQcm90bykpIHtcbiAgLy8gICAgICAgbGV0IGl0ZW0gPSBnZXRBcnJheUl0ZW1Qcm90b3R5cGUoa2V5UHJvdG8pXG4gIC8vICAgICAgIGxldCByZXRBcnIgPSBuZXcgQXJyYXk8dHlwZW9mIGl0ZW0+KClcbiAgLy8gICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcm9tVi5sZW5ndGg7ICsraSkge1xuICAvLyAgICAgICAgIGxldCBbcmV0LCBlcnJdID0gdGhpcy5qc29uMmNsYXNzKGZyb21WW2ldLCBpdGVtLCBjbGFzc05hbWUgKyBgWyR7aX1dYClcbiAgLy8gICAgICAgICBpZiAoZXJyICE9PSBudWxsKSB7XG4gIC8vICAgICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgICByZXRBcnIucHVzaChyZXQpXG4gIC8vICAgICAgIH1cbiAgLy9cbiAgLy8gICAgICAgcHJvdG90eXBlW3RvS2V5XSA9IHJldEFyclxuICAvLyAgICAgICBjb250aW51ZVxuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgJiYgaXNDbGFzcyhrZXlQcm90bykpIHtcbiAgLy8gICAgICAgW3Byb3RvdHlwZVt0b0tleV0sIGVycl0gPSB0aGlzLmpzb24yY2xhc3MoZnJvbVYsIGtleVByb3RvLCBjbGFzc05hbWUpXG4gIC8vICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgLy8gICAgICAgICByZXR1cm4gW3Byb3RvdHlwZSwgZXJyXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGNvbnRpbnVlXG4gIC8vICAgICB9XG4gIC8vXG4gIC8vICAgICBwcm90b3R5cGVbdG9LZXldID0gZnJvbVZcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgZm9yIChsZXQga2V5IG9mIGdldFByb3BlcnR5S2V5cyhwcm90b3R5cGUpKSB7XG4gIC8vICAgICBpZiAoIWhhc1NldEtleS5oYXMoa2V5KSkge1xuICAvLyAgICAgICAocHJvdG90eXBlIGFzIFByb051bGxhYmxlPHR5cGVvZiBwcm90b3R5cGU+KVtrZXldID0gbnVsbFxuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy9cbiAgLy8gICByZXR1cm4gW3Byb3RvdHlwZSwgbnVsbF1cbiAgLy8gfVxufVxuXG4vLyAnLScgOiBpZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBKc29uS2V5KGpzb25LZXk6c3RyaW5nLCAuLi5qc29uS2V5czpzdHJpbmdbXSk6IFByb3BlcnR5RGVjb3JhdG9yIHtcbiAgcmV0dXJuICh0YXJnZXQ6IG9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZ3xzeW1ib2wpID0+IHtcblxuICAgIGxldCB0YXJnZXRTeW0gPSB0YXJnZXQgYXMgQ29udmVydGVyTWFwXG5cbiAgICBpZiAoIXRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0pIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0gPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGpzb25LZXksIHByb3BlcnR5S2V5KTtcbiAgICBmb3IgKGxldCBrZXkgb2YganNvbktleXMpIHtcbiAgICAgIHRhcmdldFN5bVtqc29uVG9Qcm9wZXJ0eVN5bV0uc2V0KGtleSwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIGlmICghdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSkge1xuICAgICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXSA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgdGFyZ2V0U3ltW3Byb3BlcnR5VG9Kc29uU3ltXS5zZXQocHJvcGVydHlLZXksIGpzb25LZXkpO1xuICB9XG59XG5cbi8qXG4qIHRvZG86XG4qIOaZrumAmueahOexu1xuKiDmlbDnu4TkuK3nmoTlgLznmoTnsbvlnovlv4XpobvkuIDoh7Rcbiog5pWw57uE5Lit55qE5YC85LiN6IO95pyJbnVsbFxuKiDkuI3og73mnInpq5jnu7TmlbDnu4Rcbiog5pWw57uE5Lit5Y+v5Lul5pyJ57G7XG4qXG4qICovXG5mdW5jdGlvbiBjaGVja1R5cGU8VD4oZnJvbVY6IEpzb25UeXBlXG4gICwgcHJvcGVydHk6IFRba2V5b2YgVF18bnVsbCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBFcnJvcnxudWxsIHtcblxuICBpZiAoZnJvbVYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvbk9iamVjdChmcm9tVikgLyoge30gKi8gJiYgIWlzQ2xhc3MocHJvcGVydHkpIC8qIG5vdCBpbml0IGJ5IG5ldyBYWFgoLi4uKSovKSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ3t9JywgYnV0IHRoZSBwcm9wZXJ0eSBvZiAke2NsYXNzTmFtZX0gaXMgbm90LiBcbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJuZXcgWFhYKC4uLilcImApXG4gIH1cblxuICBpZiAoaXNKc29uT2JqZWN0QXJyYXkoZnJvbVYpIC8qIFt7fV0gKi8gJiYgIWlzQ2xhc3NBcnJheShwcm9wZXJ0eSkgLyogbm90IGluaXQgYnkgbmV3IENsYXNzQXJyYXkqLyl7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgJ1t7fV0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm5ldyBDbGFzc0FycmF5KGNsYXp6KVwiYClcbiAgfVxuICAvLyB0b2RvOiBjaGVjayBhcnJheSBlbGVtZW50XG5cbiAgaWYgKHByb3BlcnR5ID09PSBudWxsIHx8IHByb3BlcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzSnNvblByaW1pdGl2ZUFycmF5KGZyb21WKSAmJiAhaXNQcmltaXRpdmVBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW251bWJlcnxzdHJpbmd8Ym9vbGVhbl0nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QuIFxuICAgICAgICBQbGVhc2UgaW5pdCB0aGUgdmFsdWUgd2l0aCBcIm51bGwgb3IgW3h4eF1cImApXG4gIH1cbiAgLy8gdG9kbzogY2hlY2sgYXJyYXkgZWxlbWVudFxuXG4gIGlmIChpc0pzb25FbXB0eUFycmF5KGZyb21WKSAmJiAhY2FuUmVjRW1wdHlBcnJheShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gVHlwZUVycm9yKGB0aGUganNvbiB2YWx1ZSBpcyAnW10nLCBidXQgdGhlIHByb3BlcnR5IG9mICR7Y2xhc3NOYW1lfSBpcyBub3QgYXJyYXkgdHlwZS5gKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBmcm9tViAhPT0gdHlwZW9mIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIFR5cGVFcnJvcihgdGhlIGpzb24gdmFsdWUgaXMgXCI8JHt0eXBlb2YgZnJvbVZ9PiR7ZnJvbVZ9XCIsIGJ1dCB0aGUgcHJvcGVydHkgb2YgJHtjbGFzc05hbWV9IGlzICc8JHt0eXBlb2YgcHJvcGVydHl9PiR7cHJvcGVydHl9Jy5cbiAgICAgICAgUGxlYXNlIGluaXQgdGhlIHZhbHVlIHdpdGggXCJudWxsIG9yIDwke3R5cGVvZiBmcm9tVn0+XCJgKVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuXG4iLCJpbXBvcnQge0pzb25EZWNvZGVyLCBSYXdKc29ufSBmcm9tIFwiLi9jb2RlclwiXG5cbmV4cG9ydCB0eXBlIEpzb25QcmltaXRpdmUgPSBudW1iZXJ8c3RyaW5nfGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IHtba2V5OnN0cmluZ106SnNvblR5cGV9XG5cbmV4cG9ydCB0eXBlIEpzb25BcnJheSA9IEpzb25UeXBlW11cblxuZXhwb3J0IHR5cGUgSnNvblR5cGUgPSBKc29uUHJpbWl0aXZlfEpzb25PYmplY3R8SnNvbkFycmF5fG51bGxcblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkFycmF5KGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvbkFycmF5IHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0pzb25PYmplY3QoYXJnOiBKc29uVHlwZSkgOiBhcmcgaXMgSnNvbk9iamVjdCB7XG4gIHJldHVybiBhcmcgIT09IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIiAmJiAhKGFyZyBpbnN0YW5jZW9mIEFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uT2JqZWN0QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uT2JqZWN0W10ge1xuICByZXR1cm4gIGlzSnNvbkFycmF5KGFyZykgJiYgYXJnLmxlbmd0aCA9PT0gMSAmJiBpc0pzb25PYmplY3QoYXJnWzBdKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlKGFyZzogSnNvblR5cGUpOiBhcmcgaXMgSnNvblByaW1pdGl2ZSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGFyZyA9PT0gXCJib29sZWFuXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkVtcHR5QXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBbXSB7XG4gIHJldHVybiBpc0pzb25BcnJheShhcmcpICYmIGFyZy5sZW5ndGggPT0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uUHJpbWl0aXZlQXJyYXkoYXJnOiBKc29uVHlwZSk6IGFyZyBpcyBKc29uUHJpbWl0aXZlW10ge1xuICByZXR1cm4gaXNKc29uQXJyYXkoYXJnKSAmJiBhcmcubGVuZ3RoICE9PSAwICYmIGlzSnNvblByaW1pdGl2ZShhcmdbMF0pXG59XG5cbmV4cG9ydCB0eXBlIEl0ZW08VHlwZT4gPSBUeXBlIGV4dGVuZHMgQXJyYXk8aW5mZXIgSXRlbT4gPyBJdGVtIDogbmV2ZXI7XG5cbnR5cGUgUHJpbWl0aXZlID0gbnVtYmVyfG51bGx8c3RyaW5nfHN5bWJvbHxib29sZWFuXG5cbnR5cGUgRmxhdHRlbjxUeXBlPiA9IFR5cGUgZXh0ZW5kcyBBcnJheTxpbmZlciBJdGVtPiA/IEl0ZW0gOiBUeXBlO1xuXG50eXBlIFJlY3Vyc2lvbkNoZWNrPFQsIEV4Y2x1ZGU+ID0gRXh0cmFjdENsYXNzPFQ+IGV4dGVuZHMgUHJvcGVydHlNdXN0TnVsbGFibGU8RXh0cmFjdENsYXNzPFQ+LCBFeGNsdWRlPiA/IFQgOiBuZXZlclxuXG50eXBlIEV4dHJhY3RDbGFzczxUPiA9IEV4Y2x1ZGU8RmxhdHRlbjxUPiwgUHJpbWl0aXZlPlxuXG50eXBlIElzRnVuY3Rpb248VD4gPSBUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSk9PmFueT8gdHJ1ZSA6IGZhbHNlXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eTxULCBFeGNsdWRlPiA9IG51bGwgZXh0ZW5kcyBUPyAoRmxhdHRlbjxUPiBleHRlbmRzIFByaW1pdGl2ZXxKc29uVHlwZXxKc29uRGVjb2Rlcj8gVFxuICAgIDogUmVjdXJzaW9uQ2hlY2s8VCwgRXhjbHVkZT4pIDogKFQgZXh0ZW5kcyBFeGNsdWRlID8gVCA6IG5ldmVyKVxuXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU11c3ROdWxsYWJsZTxULCBFeGNsdWRlID0gbmV2ZXI+ID0ge1xuICBbUCBpbiBrZXlvZiBUXTogSXNGdW5jdGlvbjxUW1BdPiBleHRlbmRzIHRydWU/IFRbUF0gOiBDaGVja1Byb3BlcnR5PFRbUF0sIEV4Y2x1ZGU+XG59XG5cbmV4cG9ydCB0eXBlIFByb051bGxhYmxlPFQ+ID0geyBbUCBpbiBrZXlvZiBUXTogVFtQXSBleHRlbmRzIEpzb25UeXBlIHwgUmF3SnNvbiA/IFRbUF18bnVsbCA6IFByb051bGxhYmxlPFRbUF0+fG51bGwgfVxuXG5leHBvcnQgZnVuY3Rpb24gYXNOb25OdWxsPFQ+KGFyZzogVCk6IE5vbk51bGxhYmxlPFQ+IHtcbiAgcmV0dXJuIGFyZyBhcyBOb25OdWxsYWJsZTxUPlxufVxuIiwiXG5leHBvcnQge0NsaWVudCwgUmVzdWx0fSBmcm9tIFwiLi9zcmMvY2xpZW50XCJcblxuZXhwb3J0IHtBYnN0cmFjdFdlYlNvY2tldERyaXZlciwgV2ViU29ja2V0UHJvdG9jb2x9IGZyb20gXCIuL3NyYy93ZWJzb2NrZXRcIlxuZXhwb3J0IHR5cGUge1xuICAgIEV2ZW50LCBFcnJvckV2ZW50LCBDbG9zZUV2ZW50LCBNZXNzYWdlRXZlbnQsXG4gICAgV2ViU29ja2V0RHJpdmVyXG59IGZyb20gXCIuL3NyYy93ZWJzb2NrZXRcIlxuXG5leHBvcnQge0Vsc2VFcnIsIEVsc2VDb25uRXJyLCBDb25uVGltZW91dEVyciwgRWxzZVRpbWVvdXRFcnIsIHR5cGUgU3RtRXJyb3J9IGZyb20gXCIuL3NyYy9lcnJvclwiXG5cbmV4cG9ydCB7d2l0aEJyb3dzZXIsIEJyb3dzZXJXc30gZnJvbSBcIi4vc3JjL2Jyb3dzZXJ3c1wiXG5cbmV4cG9ydCB0eXBlIHtQcm90b2NvbH0gZnJvbSBcIi4vc3JjL3Byb3RvY29sXCJcbiIsImltcG9ydCB7QWJzdHJhY3RXZWJTb2NrZXREcml2ZXIsIFdlYlNvY2tldFByb3RvY29sfSBmcm9tIFwiLi93ZWJzb2NrZXRcIlxuaW1wb3J0IHtEdXJhdGlvbiwgU2Vjb25kfSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7UHJvdG9jb2x9IGZyb20gXCIuL3Byb3RvY29sXCJcblxuXG5leHBvcnQgY2xhc3MgQnJvd3NlcldzIGV4dGVuZHMgQWJzdHJhY3RXZWJTb2NrZXREcml2ZXIge1xuXHRwcml2YXRlIHdlYnNvY2tldDogV2ViU29ja2V0O1xuXG5cdGNsb3NlKGNvZGU/OiBudW1iZXIsIHJlYXNvbj86IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMud2Vic29ja2V0LmNsb3NlKGNvZGUsIHJlYXNvbilcblx0fVxuXG5cdHNlbmQoZGF0YTogQXJyYXlCdWZmZXIpOiB2b2lkIHtcblx0XHR0aGlzLndlYnNvY2tldC5zZW5kKGRhdGEpXG5cdH1cblxuXHRjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMud2Vic29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwpXG5cdFx0dGhpcy53ZWJzb2NrZXQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIlxuXHRcdHRoaXMud2Vic29ja2V0Lm9uY2xvc2UgPSAoZXY6IENsb3NlRXZlbnQpPT57XG5cdFx0XHR0aGlzLm9uY2xvc2UoZXYpXG5cdFx0fVxuXHRcdHRoaXMud2Vic29ja2V0Lm9uZXJyb3IgPSAoZXY6IEV2ZW50KT0+e1xuXHRcdFx0dGhpcy5vbmVycm9yKHtlcnJNc2c6IFwiQnJvd3NlcldlYlNvY2tldCBvbmVycm9yOiBcIiArIGV2LnRvU3RyaW5nKCl9KVxuXHRcdH1cblx0XHR0aGlzLndlYnNvY2tldC5vbm1lc3NhZ2UgPSAoZXY6IE1lc3NhZ2VFdmVudCk9Pntcblx0XHRcdHRoaXMub25tZXNzYWdlKGV2KVxuXHRcdH1cblx0XHR0aGlzLndlYnNvY2tldC5vbm9wZW4gPSAoZXY6IEV2ZW50KT0+e1xuXHRcdFx0dGhpcy5vbm9wZW4oZXYpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQnJvd3Nlcih1cmw6IHN0cmluZywgY29ubmVjdGlvblRpbWVvdXQ6IER1cmF0aW9uID0gMzAqU2Vjb25kKTogKCk9PlByb3RvY29sIHtcblx0cmV0dXJuICgpPT57XG5cdFx0cmV0dXJuIG5ldyBXZWJTb2NrZXRQcm90b2NvbCh1cmwsICh1cmw6c3RyaW5nKT0+e1xuXHRcdFx0cmV0dXJuIG5ldyBCcm93c2VyV3ModXJsKVxuXHRcdH0sIGNvbm5lY3Rpb25UaW1lb3V0KVxuXHR9XG59XG5cbiIsIlxuaW1wb3J0IHtmb3JtYXRNYXAsIE5ldH0gZnJvbSBcIi4vbmV0XCJcbmltcG9ydCB7VXRmOCwgTG9nZ2VyLCBVbmlxRmxhZywgQ29uc29sZUxvZ2dlciwgRHVyYXRpb24sIFNlY29uZH0gZnJvbSBcInRzLXh1dGlsc1wiXG5pbXBvcnQge1N0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5pbXBvcnQge1Byb3RvY29sfSBmcm9tIFwiLi9wcm90b2NvbFwiXG5pbXBvcnQge011dGV4fSBmcm9tIFwidHMtY29uY3VycmVuY3lcIlxuXG5leHBvcnQgY2xhc3MgUmVzdWx0IHtcbiAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IFV0ZjgodGhpcy5kYXRhKS50b1N0cmluZygpXG4gIH1cblxuICBwdWJsaWMgdXRmOFJhd0J1ZmZlcigpOkFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhdGE6QXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoMCkpIHtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2xpZW50IHtcblx0cHVibGljIG9uUHVzaDogKHJlczpSZXN1bHQpPT5Qcm9taXNlPHZvaWQ+ID0gYXN5bmMgKCk9Pnt9O1xuXHRwdWJsaWMgb25QZWVyQ2xvc2VkOiAoZXJyOlN0bUVycm9yKT0+UHJvbWlzZTx2b2lkPiA9IGFzeW5jICgpPT57fTtcblxuXHRwcml2YXRlIGZsYWcgPSBVbmlxRmxhZygpXG5cdHByaXZhdGUgbmV0TXV0ZXg6IE11dGV4ID0gbmV3IE11dGV4KClcbiAgcHJpdmF0ZSBuZXRfOiBOZXRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHByb3RvY29sQ3JlYXRvcjogKCk9PlByb3RvY29sLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gQ29uc29sZUxvZ2dlcikge1xuICAgIGxvZ2dlci53LmluZm8obG9nZ2VyLmYuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0ubmV3YCwgYGZsYWc9JHt0aGlzLmZsYWd9YCkpXG5cdFx0dGhpcy5uZXRfID0gdGhpcy5uZXdOZXQoKVxuICB9XG5cblx0cHJpdmF0ZSBuZXdOZXQoKTogTmV0IHtcblx0XHRyZXR1cm4gbmV3IE5ldCh0aGlzLmxvZ2dlciwgdGhpcy5wcm90b2NvbENyZWF0b3IsIGFzeW5jIChlcnI6IFN0bUVycm9yKT0+e1xuXHRcdFx0dGhpcy5sb2dnZXIudy53YXJuKHRoaXMubG9nZ2VyLmYuV2FybihgQ2xpZW50WyR7dGhpcy5mbGFnfV0ub25QZWVyQ2xvc2VkYCwgYHJlYXNvbjogJHtlcnJ9YCkpXG5cdFx0XHRhd2FpdCB0aGlzLm9uUGVlckNsb3NlZChlcnIpXG5cdFx0fSwgYXN5bmMgKGRhdGE6IEFycmF5QnVmZmVyKT0+e1xuXHRcdFx0dGhpcy5sb2dnZXIudy5pbmZvKHRoaXMubG9nZ2VyLmYuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0ub25QdXNoYCwgYHNpemU6ICR7ZGF0YS5ieXRlTGVuZ3RofWApKVxuXHRcdFx0YXdhaXQgdGhpcy5vblB1c2gobmV3IFJlc3VsdChkYXRhKSlcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBuZXQoKTogUHJvbWlzZTxOZXQ+IHtcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5uZXRNdXRleC53aXRoTG9jazxOZXQ+KGFzeW5jICgpPT57XG5cdFx0XHRpZiAodGhpcy5uZXRfLmlzSW52YWxpZCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLm5ldF8uY2xvc2UoKVxuXHRcdFx0XHR0aGlzLm5ldF8gPSB0aGlzLm5ld05ldCgpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLm5ldF9cblx0XHR9KVxuXHR9XG5cbiAgcHVibGljIGFzeW5jIFNlbmQoZGF0YTogQXJyYXlCdWZmZXJ8c3RyaW5nLCBoZWFkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCwgdGltZW91dDogRHVyYXRpb24gPSAzMCpTZWNvbmQpOiBQcm9taXNlPFtSZXN1bHQsIFN0bUVycm9yIHwgbnVsbF0+IHtcblx0XHRsZXQgc2ZsYWcgPSBoZWFkZXJzLmdldChDbGllbnQucmVxaWRLZXkpID8/IFVuaXFGbGFnKClcblx0XHRsZXQgdXRmOERhdGEgPSBuZXcgVXRmOChkYXRhKVxuXG5cdFx0dGhpcy5sb2dnZXIudy5pbmZvKHRoaXMubG9nZ2VyLmYuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV06c3RhcnRgXG5cdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSwgcmVxdWVzdCB1dGY4IHNpemUgPSAke3V0ZjhEYXRhLmJ5dGVMZW5ndGh9YCkpXG5cblx0XHRsZXQgbmV0ID0gYXdhaXQgdGhpcy5uZXQoKVxuXHRcdGxldCBlcnIgPSBhd2FpdCBuZXQuY29ubmVjdCgpXG5cdFx0aWYgKGVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5lcnJvcih0aGlzLmxvZ2dlci5mLkVycm9yKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XTplcnJvcmBcblx0XHRcdFx0LCBgY29ubmVjdCBlcnJvcjogJHtlcnJ9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQoKSwgZXJyXVxuXHRcdH1cblxuXHRcdGxldCBbcmV0LCBlcnIyXSA9IGF3YWl0IG5ldC5zZW5kKHV0ZjhEYXRhLnJhdy5idWZmZXIsIGhlYWRlcnMsIHRpbWVvdXQpXG5cdFx0aWYgKGVycjIgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5pbmZvKHRoaXMubG9nZ2VyLmYuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVuZGBcblx0XHRcdFx0LCBgcmVzcG9uc2Ugc2l6ZSA9ICR7cmV0LmJ5dGVMZW5ndGh9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQocmV0KSwgZXJyMl1cblx0XHR9XG5cdFx0aWYgKCFlcnIyLmlzQ29ubkVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5lcnJvcih0aGlzLmxvZ2dlci5mLkVycm9yKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5TZW5kWyR7c2ZsYWd9XShjb25uSUQ9JHtuZXQuY29ubmVjdElEfSk6ZXJyb3JgXG5cdFx0XHRcdCwgYHJlcXVlc3QgZXJyb3IgPSAke2VycjJ9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBSZXN1bHQocmV0KSwgZXJyMl1cblx0XHR9XG5cblx0XHQvLyBzZW5kaW5nIC0tLSBjb25uIGVycm9yOiAgcmV0cnlcblx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOnJldHJ5YCwgYHJldHJ5LTFgKSlcblxuXHRcdG5ldCA9IGF3YWl0IHRoaXMubmV0KClcblxuXHRcdGVyciA9IGF3YWl0IG5ldC5jb25uZWN0KClcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmVycm9yKHRoaXMubG9nZ2VyLmYuRXJyb3IoYENsaWVudFske3RoaXMuZmxhZ31dLlNlbmRbJHtzZmxhZ31dOmVycm9yYCwgYGNvbm5lY3QgZXJyb3I6ICR7ZXJyfWApKVxuXHRcdFx0cmV0dXJuIFtuZXcgUmVzdWx0KCksIGVycl1cblx0XHR9XG5cblx0XHRbcmV0LCBlcnIyXSA9IGF3YWl0IG5ldC5zZW5kKHV0ZjhEYXRhLnJhdy5idWZmZXIsIGhlYWRlcnMsIHRpbWVvdXQpXG5cdFx0aWYgKGVycjIgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5pbmZvKHRoaXMubG9nZ2VyLmYuSW5mbyhgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVuZGBcblx0XHRcdFx0LCBgcmVzcG9uc2Ugc2l6ZSA9ICR7cmV0LmJ5dGVMZW5ndGh9YCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZXJyb3IodGhpcy5sb2dnZXIuZi5FcnJvcihgQ2xpZW50WyR7dGhpcy5mbGFnfV0uU2VuZFske3NmbGFnfV0oY29ubklEPSR7bmV0LmNvbm5lY3RJRH0pOmVycm9yYFxuXHRcdFx0XHQsIGByZXF1ZXN0IGVycm9yID0gJHtlcnIyfWApKVxuXHRcdH1cblxuXHRcdHJldHVybiBbbmV3IFJlc3VsdChyZXQpLCBlcnIyXVxuICB9XG5cblx0LyoqXG5cdCAqIENsb3NlIOWQju+8jENsaWVudCDku43lj6/nu6fnu63kvb/nlKjvvIzkuIvmrKHlj5HpgIHor7fmsYLml7bvvIzkvJroh6rliqjph43ov55cblx0ICogQ2xvc2UoKSDosIPnlKjkuI3kvJrop6blj5Egb25QZWVyQ2xvc2VkKClcblx0ICogQ2xvc2UoKSDkuI4g5YW25LuW5o6l5Y+j5rKh5pyJ5piO56Gu55qE5pe25bqP5YWz57O777yMQ2xvc2UoKSDosIPnlKjlkI7vvIzkuZ/lj6/og73kvJrlh7rnjrAgU2VuZCgpIOeahOiwg+eUqOi/lOWbniDmiJbogIUgb25QZWVyQ2xvc2VkKClcblx0ICogXHRcdOS9huatpOaXtueahCBvblBlZXJDbG9zZWQoKSDlubbkuI3mmK/lm6DkuLogQ2xvc2UoKSDogIzop6blj5HnmoTjgIJcblx0ICovXG5cdHB1YmxpYyBhc3luYyBDbG9zZSgpIHtcblx0XHRhd2FpdCB0aGlzLm5ldE11dGV4LndpdGhMb2NrPHZvaWQ+KGFzeW5jICgpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci53LmluZm8odGhpcy5sb2dnZXIuZi5JbmZvKGBDbGllbnRbJHt0aGlzLmZsYWd9XS5jbG9zZWAsIFwiY2xvc2VkIGJ5IHNlbGZcIikpXG5cdFx0XHRhd2FpdCB0aGlzLm5ldF8uY2xvc2UoKVxuXHRcdH0pXG5cdH1cblxuXHRVcGRhdGVQcm90b2NvbChjcmVhdG9yOiAoKT0+UHJvdG9jb2wpIHtcblx0XHR0aGlzLnByb3RvY29sQ3JlYXRvciA9IGNyZWF0b3Jcblx0fVxuXG4gIHB1YmxpYyBhc3luYyBSZWNvdmVyKCk6IFByb21pc2U8U3RtRXJyb3J8bnVsbD4ge1xuICAgIHJldHVybiBhd2FpdCAoYXdhaXQgdGhpcy5uZXQoKSkuY29ubmVjdCgpXG4gIH1cblxuXHRwcml2YXRlIHN0YXRpYyByZXFpZEtleTogc3RyaW5nID0gXCJYLVJlcS1JZFwiXG5cdHB1YmxpYyBhc3luYyBTZW5kV2l0aFJlcUlkKGRhdGE6IEFycmF5QnVmZmVyfHN0cmluZywgaGVhZGVyczogTWFwPHN0cmluZywgc3RyaW5nPlxuXHRcdCwgdGltZW91dDogRHVyYXRpb24gPSAzMCpTZWNvbmQpOiBQcm9taXNlPFtSZXN1bHQsIFN0bUVycm9yIHwgbnVsbF0+IHtcblx0XHRoZWFkZXJzLnNldChDbGllbnQucmVxaWRLZXksIFVuaXFGbGFnKCkpXG5cblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5TZW5kKGRhdGEsIGhlYWRlcnMsIHRpbWVvdXQpXG5cdH1cbn1cblxuXG4iLCJcbmFic3RyYWN0IGNsYXNzIFN0bUVycm9yQmFzZSBleHRlbmRzIEVycm9yIHtcblx0YWJzdHJhY3QgaXNDb25uRXJyOiBib29sZWFuXG5cdGFic3RyYWN0IGlzVGltZW91dEVycjogYm9vbGVhblxuXHRhYnN0cmFjdCBnZXQgdG9Db25uRXJyKCk6IFN0bUVycm9yXG5cblx0dG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5tZXNzYWdlXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbm5UaW1lb3V0RXJyIGV4dGVuZHMgU3RtRXJyb3JCYXNlIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiQ29ublRpbWVvdXRFcnJcIlxuXHRpc0Nvbm5FcnI6IGJvb2xlYW4gPSB0cnVlXG5cdGlzVGltZW91dEVycjogYm9vbGVhbiA9IHRydWVcblx0Z2V0IHRvQ29ubkVycigpOiBTdG1FcnJvciB7XG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsc2VDb25uRXJyIGV4dGVuZHMgU3RtRXJyb3JCYXNlIHtcblx0bWVzc2FnZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZyA9IFwiRWxzZUNvbm5FcnJcIlxuXHRpc0Nvbm5FcnI6IGJvb2xlYW4gPSB0cnVlXG5cdGlzVGltZW91dEVycjogYm9vbGVhbiA9IGZhbHNlXG5cdGdldCB0b0Nvbm5FcnIoKTogU3RtRXJyb3Ige1xuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5tZXNzYWdlID0gbVxuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBFbHNlVGltZW91dEVyciBleHRlbmRzIFN0bUVycm9yQmFzZSB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkVsc2VUaW1lb3V0RXJyXCJcblx0aXNDb25uRXJyOiBib29sZWFuID0gZmFsc2Vcblx0aXNUaW1lb3V0RXJyOiBib29sZWFuID0gdHJ1ZVxuXHRnZXQgdG9Db25uRXJyKCk6IFN0bUVycm9yIHtcblx0XHRyZXR1cm4gbmV3IEVsc2VDb25uRXJyKHRoaXMubWVzc2FnZSlcblx0fVxuXG5cdGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsc2VFcnIgZXh0ZW5kcyBTdG1FcnJvckJhc2Uge1xuXHRtZXNzYWdlOiBzdHJpbmdcblx0bmFtZTogc3RyaW5nID0gXCJFbHNlRXJyXCJcblx0Y2F1c2U6IEVycm9yfG51bGxcblx0aXNDb25uRXJyOiBib29sZWFuID0gZmFsc2Vcblx0aXNUaW1lb3V0RXJyOiBib29sZWFuID0gZmFsc2Vcblx0Z2V0IHRvQ29ubkVycigpOiBTdG1FcnJvciB7XG5cdFx0cmV0dXJuIG5ldyBFbHNlQ29ubkVycih0aGlzLm1lc3NhZ2UpXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcsIGNhdXNlOiBFcnJvcnxudWxsID0gbnVsbCkge1xuXHRcdHN1cGVyKClcblx0XHRpZiAoY2F1c2UgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gbVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2UgPSBgJHttfSwgY2F1c2VkIGJ5ICR7Y2F1c2UubWVzc2FnZX1gXG5cdFx0fVxuXG5cdFx0dGhpcy5jYXVzZSA9IGNhdXNlXG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgU3RtRXJyb3IgPSBFbHNlRXJyIHwgRWxzZVRpbWVvdXRFcnIgfCBFbHNlQ29ubkVyciB8IENvbm5UaW1lb3V0RXJyXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0bUVycm9yKGFyZzogYW55KTogYXJnIGlzIFN0bUVycm9yIHtcblx0cmV0dXJuIGFyZyBpbnN0YW5jZW9mIFN0bUVycm9yQmFzZVxufVxuIiwiXG4vKipcblxuIGNvbnRlbnQgcHJvdG9jb2w6XG4gICByZXF1ZXN0IC0tLVxuICAgICByZXFpZCB8IGhlYWRlcnMgfCBoZWFkZXItZW5kLWZsYWcgfCBkYXRhXG4gICAgIHJlcWlkOiA0IGJ5dGVzLCBuZXQgb3JkZXI7XG4gICAgIGhlYWRlcnM6IDwga2V5LWxlbiB8IGtleSB8IHZhbHVlLWxlbiB8IHZhbHVlID4gLi4uIDsgIFtvcHRpb25hbF1cbiAgICAga2V5LWxlbjogMSBieXRlLCAga2V5LWxlbiA9IHNpemVvZihrZXkpO1xuICAgICB2YWx1ZS1sZW46IDEgYnl0ZSwgdmFsdWUtbGVuID0gc2l6ZW9mKHZhbHVlKTtcbiAgICAgaGVhZGVyLWVuZC1mbGFnOiAxIGJ5dGUsID09PSAwO1xuICAgICBkYXRhOiAgICAgICBbb3B0aW9uYWxdXG5cbiAgICAgIHJlcWlkID0gMTogY2xpZW50IHB1c2ggYWNrIHRvIHNlcnZlci5cbiAgICAgICAgICAgIGFjazogbm8gaGVhZGVycztcbiAgICAgICAgICAgIGRhdGE6IHB1c2hJZC4gNCBieXRlcywgbmV0IG9yZGVyO1xuXG4gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICByZXNwb25zZSAtLS1cbiAgICAgcmVxaWQgfCBzdGF0dXMgfCBkYXRhXG4gICAgIHJlcWlkOiA0IGJ5dGVzLCBuZXQgb3JkZXI7XG4gICAgIHN0YXR1czogMSBieXRlLCAwLS0tc3VjY2VzcywgMS0tLWZhaWxlZFxuICAgICBkYXRhOiBpZiBzdGF0dXM9PXN1Y2Nlc3MsIGRhdGE9PGFwcCBkYXRhPiAgICBbb3B0aW9uYWxdXG4gICAgIGlmIHN0YXR1cz09ZmFpbGVkLCBkYXRhPTxlcnJvciByZWFzb24+XG5cblxuICAgIHJlcWlkID0gMTogc2VydmVyIHB1c2ggdG8gY2xpZW50XG4gICAgICAgIHN0YXR1czogMFxuICAgICAgICAgIGRhdGE6IGZpcnN0IDQgYnl0ZXMgLS0tIHB1c2hJZCwgbmV0IG9yZGVyO1xuICAgICAgICAgICAgICAgIGxhc3QgLS0tIHJlYWwgZGF0YVxuXG4gKi9cblxuaW1wb3J0IHtVdGY4fSBmcm9tIFwidHMteHV0aWxzXCI7XG5pbXBvcnQge0Vsc2VFcnIsIFN0bUVycm9yfSBmcm9tIFwiLi9lcnJvclwiXG5cbmV4cG9ydCBjbGFzcyBSZXF1ZXN0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBidWZmZXI6IEFycmF5QnVmZmVyO1xuXG5cdGdldCBlbmNvZGVkRGF0YSgpOiBBcnJheUJ1ZmZlciB7cmV0dXJuIHRoaXMuYnVmZmVyfVxuXHRnZXQgbG9hZExlbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aCAtIDR9XG5cblx0cHVibGljIFNldFJlcUlkKGlkOm51bWJlcikge1xuXHRcdChuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpKS5zZXRVaW50MzIoMCwgaWQpO1xuXHR9XG5cblx0Y29uc3RydWN0b3IoYnVmZmVyOiBBcnJheUJ1ZmZlcikge1xuXHRcdHRoaXMuYnVmZmVyID0gYnVmZmVyXG5cdH1cblxuXHRzdGF0aWMgTmV3KHJlcUlkOiBudW1iZXIsIGRhdGE6IEFycmF5QnVmZmVyfHN0cmluZywgaGVhZGVyczogTWFwPHN0cmluZyxzdHJpbmc+KTogW1JlcXVlc3QsIFN0bUVycm9yfG51bGxdIHtcbiAgICBsZXQgbGVuID0gNDtcblxuICAgIGxldCBoZWFkZXJBcnIgPSBuZXcgQXJyYXk8e2tleTpVdGY4LCB2YWx1ZTpVdGY4fT4oKTtcblx0XHRsZXQgZXJyOiBTdG1FcnJvcnxudWxsID0gbnVsbFxuICAgIGhlYWRlcnMuZm9yRWFjaCgodmFsdWU6IHN0cmluZywga2V5OiBzdHJpbmcsIF86IE1hcDxzdHJpbmcsIHN0cmluZz4pPT57XG4gICAgICBsZXQgdXRmOCA9IHtrZXk6IG5ldyBVdGY4KGtleSksIHZhbHVlOiBuZXcgVXRmOCh2YWx1ZSl9O1xuXHRcdFx0aWYgKHV0Zjgua2V5LmJ5dGVMZW5ndGggPiAyNTUgfHwgdXRmOC52YWx1ZS5ieXRlTGVuZ3RoID4gMjU1KSB7XG5cdFx0XHRcdGVyciA9IG5ldyBFbHNlRXJyKGBrZXkoJHtrZXl9KSdzIGxlbmd0aCBvciB2YWx1ZSgke3ZhbHVlfSkncyBsZW5ndGggaXMgbW9yZSB0aGFuIDI1NWApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuICAgICAgaGVhZGVyQXJyLnB1c2godXRmOCk7XG4gICAgICBsZW4gKz0gMSArIHV0Zjgua2V5LmJ5dGVMZW5ndGggKyAxICsgdXRmOC52YWx1ZS5ieXRlTGVuZ3RoO1xuICAgIH0pO1xuXHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIFtuZXcgUmVxdWVzdChuZXcgQXJyYXlCdWZmZXIoMCkpLCBlcnJdXG5cdFx0fVxuXG4gICAgbGV0IGJvZHkgPSBuZXcgVXRmOChkYXRhKTtcbiAgICBsZW4gKz0gMSArIGJvZHkuYnl0ZUxlbmd0aDtcblxuXHRcdGxldCByZXQgPSBuZXcgUmVxdWVzdChuZXcgQXJyYXlCdWZmZXIobGVuKSlcblx0XHRyZXQuU2V0UmVxSWQocmVxSWQpXG5cbiAgICBsZXQgcG9zID0gNDtcbiAgICBmb3IgKGxldCBoIG9mIGhlYWRlckFycikge1xuICAgICAgKG5ldyBEYXRhVmlldyhyZXQuYnVmZmVyKSkuc2V0VWludDgocG9zLCBoLmtleS5ieXRlTGVuZ3RoKTtcbiAgICAgIHBvcysrO1xuICAgICAgKG5ldyBVaW50OEFycmF5KHJldC5idWZmZXIpKS5zZXQoaC5rZXkucmF3LCBwb3MpO1xuICAgICAgcG9zICs9IGgua2V5LmJ5dGVMZW5ndGg7XG4gICAgICAobmV3IERhdGFWaWV3KHJldC5idWZmZXIpKS5zZXRVaW50OChwb3MsIGgudmFsdWUuYnl0ZUxlbmd0aCk7XG4gICAgICBwb3MrKztcbiAgICAgIChuZXcgVWludDhBcnJheShyZXQuYnVmZmVyKSkuc2V0KGgudmFsdWUucmF3LCBwb3MpO1xuICAgICAgcG9zICs9IGgudmFsdWUuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgKG5ldyBEYXRhVmlldyhyZXQuYnVmZmVyKSkuc2V0VWludDgocG9zLCAwKTtcbiAgICBwb3MrKztcblxuICAgIChuZXcgVWludDhBcnJheShyZXQuYnVmZmVyKSkuc2V0KGJvZHkucmF3LCBwb3MpO1xuXG5cdFx0cmV0dXJuIFtyZXQsIG51bGxdXG4gIH1cbn1cblxuZXhwb3J0IGVudW0gU3RhdHVzIHtcbiAgT0ssXG4gIEZhaWxlZFxufVxuXG5leHBvcnQgY2xhc3MgUmVzcG9uc2Uge1xuXHQvLyByZXFpZCArIHN0YXR1cyArIHB1c2hpZFxuXHRzdGF0aWMgTWF4Tm9Mb2FkTGVuID0gNCArIDEgKyA0XG5cbiAgcHVibGljIHJlYWRvbmx5IHN0YXR1czogU3RhdHVzO1xuXHRwdWJsaWMgcmVhZG9ubHkgcmVxSWQ6IG51bWJlciA9IDBcblx0cHVibGljIHJlYWRvbmx5IGRhdGE6IEFycmF5QnVmZmVyXG5cdHB1YmxpYyByZWFkb25seSBwdXNoSWQ6IG51bWJlclxuXG5cdGdldCBpc1B1c2goKTpib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5yZXFJZCA9PSAxO1xuXHR9XG5cblx0Y29uc3RydWN0b3IocmVxSWQ6IG51bWJlciwgc3Q6IFN0YXR1cywgZGF0YTogQXJyYXlCdWZmZXIsIHB1c2hJZDogbnVtYmVyID0gMCkge1xuXHRcdHRoaXMucmVxSWQgPSByZXFJZFxuXHRcdHRoaXMuc3RhdHVzID0gc3Rcblx0XHR0aGlzLmRhdGEgPSBkYXRhXG5cdFx0dGhpcy5wdXNoSWQgPSBwdXNoSWRcblx0fVxuXG5cdHB1YmxpYyBuZXdQdXNoQWNrKCk6IFtBcnJheUJ1ZmZlciwgU3RtRXJyb3J8bnVsbF0ge1xuXHRcdGlmICghdGhpcy5pc1B1c2gpIHtcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCBuZXcgRWxzZUVycihcImludmFsaWQgcHVzaCBkYXRhXCIpXVxuXHRcdH1cblxuXHRcdGxldCByZXQgPSBuZXcgQXJyYXlCdWZmZXIoNCArIDEgKyA0KVxuXHRcdGxldCB2aWV3ID0gbmV3IERhdGFWaWV3KHJldClcblx0XHR2aWV3LnNldFVpbnQzMigwLCAxKVxuXHRcdHZpZXcuc2V0VWludDgoNCwgMClcblx0XHR2aWV3LnNldFVpbnQzMig1LCB0aGlzLnB1c2hJZClcblxuXHRcdHJldHVybiBbcmV0LCBudWxsXVxuXHR9XG5cblx0cHVibGljIHN0YXRpYyBaZXJvUmVzKCk6IFJlc3BvbnNlIHtcblx0XHRyZXR1cm4gbmV3IFJlc3BvbnNlKDAsIFN0YXR1cy5GYWlsZWQsIG5ldyBBcnJheUJ1ZmZlcigwKSlcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgUGFyc2UoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0ge1xuXHRcdGlmIChidWZmZXIuYnl0ZUxlbmd0aCA8IDUpIHtcblx0XHRcdHJldHVybiBbdGhpcy5aZXJvUmVzKCksIG5ldyBFbHNlRXJyKFwiZmFrZWh0dHAgcHJvdG9jb2wgZXJyKHJlc3BvbnNlLnNpemUgPCA1KS5cIildXG5cdFx0fVxuXHRcdGxldCB2aWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcilcblxuXHRcdGxldCByZXFJZCA9IHZpZXcuZ2V0VWludDMyKDApXG5cdFx0bGV0IHN0YXR1cyA9IHZpZXcuZ2V0VWludDgoNCk9PTAgPyBTdGF0dXMuT0sgOiBTdGF0dXMuRmFpbGVkXG5cdFx0bGV0IHB1c2hJZCA9IDBcblxuXHRcdGxldCBvZmZzZXQgPSA1XG5cdFx0aWYgKHJlcUlkID09IDEpIHtcblx0XHRcdGlmIChidWZmZXIuYnl0ZUxlbmd0aCA8IG9mZnNldCs0KSB7XG5cdFx0XHRcdHJldHVybiBbdGhpcy5aZXJvUmVzKCksIG5ldyBFbHNlRXJyKFwiZmFrZWh0dHAgcHJvdG9jb2wgZXJyKHJlc3BvbnNlLnNpemUgb2YgcHVzaCA8IDkpLlwiKV1cblx0XHRcdH1cblx0XHRcdHB1c2hJZCA9IHZpZXcuZ2V0VWludDMyKG9mZnNldClcblx0XHRcdG9mZnNldCArPSA0XG5cdFx0fVxuXG5cdFx0bGV0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoMClcblx0XHRpZiAoYnVmZmVyLmJ5dGVMZW5ndGggPiBvZmZzZXQpIHtcblx0XHRcdGRhdGEgPSBuZXcgVWludDhBcnJheShidWZmZXIpLnNsaWNlKG9mZnNldCkuYnVmZmVyXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtuZXcgUmVzcG9uc2UocmVxSWQsIHN0YXR1cywgZGF0YSwgcHVzaElkKSwgbnVsbF1cblx0fVxufVxuIiwiaW1wb3J0IHtEdXJhdGlvbiwgTG9nZ2VyLCBTZWNvbmQsIFVuaXFGbGFnLCBVdGY4fSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7YXN5bmNFeGUsIENoYW5uZWwsIE11dGV4LCBSZWNlaXZlQ2hhbm5lbCwgU2VtYXBob3JlLCBTZW5kQ2hhbm5lbCwgd2l0aFRpbWVvdXQsIFRpbWVvdXR9IGZyb20gXCJ0cy1jb25jdXJyZW5jeVwiXG5pbXBvcnQge1Jlc3BvbnNlLCBSZXF1ZXN0LCBTdGF0dXMgYXMgUmVzU3RhdHVzfSBmcm9tIFwiLi9mYWtlaHR0cFwiXG5pbXBvcnQge0Vsc2VDb25uRXJyLCBFbHNlRXJyLCBTdG1FcnJvcn0gZnJvbSBcIi4vZXJyb3JcIlxuaW1wb3J0IHtIYW5kc2hha2UsIFByb3RvY29sfSBmcm9tIFwiLi9wcm90b2NvbFwiXG5cbmNsYXNzIFN5bmNBbGxSZXF1ZXN0IHtcblx0YWxsUmVxdWVzdHM6IE1hcDxudW1iZXIsIENoYW5uZWw8W1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXT4+ID0gbmV3IE1hcCgpXG5cdHNlbWFwaG9yZTogU2VtYXBob3JlID0gbmV3IFNlbWFwaG9yZSgzKVxuXG5cdGdldCBwZXJtaXRzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuc2VtYXBob3JlLm1heFxuXHR9XG5cblx0c2V0IHBlcm1pdHMobWF4OiBudW1iZXIpIHtcblx0XHR0aGlzLnNlbWFwaG9yZSA9IG5ldyBTZW1hcGhvcmUobWF4KVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGVybWl0czogbnVtYmVyID0gMykge1xuXHRcdHRoaXMuc2VtYXBob3JlID0gbmV3IFNlbWFwaG9yZShwZXJtaXRzKVxuXHR9XG5cblx0Ly8gY2hhbm5lbCDlv4XpobvlnKggU3luY0FsbFJlcXVlc3Qg55qE5o6n5Yi25LiL77yM5omA5LulIEFkZCDojrflj5bnmoTlj6rog70gcmVjZWl2ZVxuLy8g6KaBIHNlbmQg5bCx5b+F6aG76YCa6L+HIHJlbW92ZSDojrflj5ZcblxuXHRhc3luYyBBZGQocmVxSWQ6IG51bWJlcik6IFByb21pc2U8UmVjZWl2ZUNoYW5uZWw8W1Jlc3BvbnNlLCBTdG1FcnJvcnxudWxsXT4+IHtcblx0XHRhd2FpdCB0aGlzLnNlbWFwaG9yZS5BY3F1aXJlKClcblx0XHRsZXQgY2ggPSBuZXcgQ2hhbm5lbDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPigxKVxuXHRcdHRoaXMuYWxsUmVxdWVzdHMuc2V0KHJlcUlkLCBjaClcblx0XHRyZXR1cm4gY2hcblx0fVxuXG5cdC8vIOWPr+S7peeUqOWQjOS4gOS4qiByZXFpZCDph43lpI3osIPnlKhcblx0UmVtb3ZlKHJlcUlkOiBudW1iZXIpOiBTZW5kQ2hhbm5lbDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPiB8IG51bGwge1xuXHRcdGxldCByZXQgPSB0aGlzLmFsbFJlcXVlc3RzLmdldChyZXFJZCkgPz8gbnVsbFxuXHRcdGlmIChyZXQgIT0gbnVsbCAmJiB0aGlzLnNlbWFwaG9yZS5jdXJyZW50ICE9IDApIHtcblx0XHRcdHRoaXMuc2VtYXBob3JlLlJlbGVhc2UoKVxuXHRcdH1cblx0XHR0aGlzLmFsbFJlcXVlc3RzLmRlbGV0ZShyZXFJZClcblxuXHRcdHJldHVybiByZXRcblx0fVxuXG5cdGFzeW5jIENsZWFyQWxsV2l0aChyZXQ6IFtSZXNwb25zZSwgU3RtRXJyb3J8bnVsbF0pIHtcblx0XHRmb3IgKGxldCBbXywgY2hdIG9mIHRoaXMuYWxsUmVxdWVzdHMpIHtcblx0XHRcdGF3YWl0IGNoLlNlbmQocmV0KVxuXHRcdFx0YXdhaXQgY2guQ2xvc2UoKVxuXHRcdH1cblx0XHR0aGlzLmFsbFJlcXVlc3RzLmNsZWFyKClcblx0XHRhd2FpdCB0aGlzLnNlbWFwaG9yZS5SZWxlYXNlQWxsKClcblx0fVxufVxuXG4vKipcbiAqXG4gKiAgICBOb3RDb25uZWN0ICAtLS0+IChDb25uZWN0aW5nKSAgLS0tPiBDb25uZWN0ZWQgLS0tPiBJbnZhbGlkYXRlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgfF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19ffFxuICpcbiAqL1xuXG5pbnRlcmZhY2UgU3RhdGVCYXNlIHtcblx0dG9TdHJpbmcoKTpzdHJpbmdcblx0aXNFcXVhbChvdGhlcjogU3RhdGVCYXNlKTogdGhpcyBpcyBJbnZhbGlkYXRlZFxuXHRpc0ludmFsaWRhdGVkKCk6IGJvb2xlYW5cbn1cblxuY2xhc3MgTm90Q29ubmVjdCBpbXBsZW1lbnRzIFN0YXRlQmFzZSB7XG5cdGlzRXF1YWwob3RoZXI6IFN0YXRlQmFzZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBvdGhlciBpbnN0YW5jZW9mIE5vdENvbm5lY3Rcblx0fVxuXG5cdGlzSW52YWxpZGF0ZWQoKTogdGhpcyBpcyBJbnZhbGlkYXRlZCB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHR0b1N0cmluZygpOnN0cmluZyB7XG5cdFx0cmV0dXJuIFwiTm90Q29ubmVjdFwiXG5cdH1cbn1cblxuY2xhc3MgQ29ubmVjdGVkIGltcGxlbWVudHMgU3RhdGVCYXNlIHtcblx0aXNFcXVhbChvdGhlcjogU3RhdGVCYXNlKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIG90aGVyIGluc3RhbmNlb2YgQ29ubmVjdGVkXG5cdH1cblxuXHRpc0ludmFsaWRhdGVkKCk6IHRoaXMgaXMgSW52YWxpZGF0ZWQge1xuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0dG9TdHJpbmcoKTpzdHJpbmcge1xuXHRcdHJldHVybiBcIkNvbm5lY3RlZFwiXG5cdH1cbn1cblxuY2xhc3MgSW52YWxpZGF0ZWQgaW1wbGVtZW50cyBTdGF0ZUJhc2Uge1xuXHRwdWJsaWMgZXJyOiBTdG1FcnJvclxuXHRpc0VxdWFsKG90aGVyOiBTdGF0ZUJhc2UpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiBJbnZhbGlkYXRlZFxuXHR9XG5cblx0aXNJbnZhbGlkYXRlZCgpOiB0aGlzIGlzIEludmFsaWRhdGVkIHtcblx0XHRyZXR1cm4gdHJ1ZVxuXHR9XG5cblx0dG9TdHJpbmcoKTpzdHJpbmcge1xuXHRcdHJldHVybiBcIkludmFsaWRhdGVkXCJcblx0fVxuXG5cdGNvbnN0cnVjdG9yKGVycjogU3RtRXJyb3IpIHtcblx0XHR0aGlzLmVyciA9IGVyclxuXHR9XG59XG5cbnR5cGUgU3RhdGUgPSBOb3RDb25uZWN0fENvbm5lY3RlZHxJbnZhbGlkYXRlZFxuXG5jbGFzcyBSZXFJZCB7XG5cdHByaXZhdGUgc3RhdGljIHJlcUlkU3RhcnQgPSAxMFxuXHRwcml2YXRlIHZhbHVlID0gUmVxSWQucmVxSWRTdGFydFxuXG5cdGdldCgpOiBudW1iZXIge1xuXHRcdHRoaXMudmFsdWUgKz0gMVxuXHRcdGlmICh0aGlzLnZhbHVlIDwgUmVxSWQucmVxSWRTdGFydCB8fCB0aGlzLnZhbHVlID4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHtcblx0XHRcdHRoaXMudmFsdWUgPSBSZXFJZC5yZXFJZFN0YXJ0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMudmFsdWVcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgTmV0IHtcblx0cHJpdmF0ZSBoYW5kc2hha2U6IEhhbmRzaGFrZSA9IG5ldyBIYW5kc2hha2UoKVxuXHRwcml2YXRlIGNvbm5Mb2NrZXI6IE11dGV4ID0gbmV3IE11dGV4KClcblx0cHJpdmF0ZSBzdGF0ZTogU3RhdGUgPSBuZXcgTm90Q29ubmVjdFxuXHRwcml2YXRlIHByb3RvOiBQcm90b2NvbFxuXG5cdHByaXZhdGUgcmVxSWQ6IFJlcUlkID0gbmV3IFJlcUlkKClcblx0cHJpdmF0ZSBhbGxSZXF1ZXN0czogU3luY0FsbFJlcXVlc3QgPSBuZXcgU3luY0FsbFJlcXVlc3QoKVxuXG5cdHByaXZhdGUgZmxhZyA9IFVuaXFGbGFnKClcblxuXHRnZXQgY29ubmVjdElEKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuaGFuZHNoYWtlLkNvbm5lY3RJZFxuXHR9XG5cblx0Z2V0IGlzSW52YWxpZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5pc0ludmFsaWRhdGVkKClcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIsIHByb3RvQ3JlYXRvcjogKCk9PlByb3RvY29sXG5cdFx0XHRcdFx0XHRcdCwgcHJpdmF0ZSBvblBlZXJDbG9zZWQ6IChlcnI6IFN0bUVycm9yKT0+UHJvbWlzZTx2b2lkPlxuXHRcdFx0XHRcdFx0XHQsIHByaXZhdGUgb25QdXNoOiAoZGF0YTogQXJyYXlCdWZmZXIpPT5Qcm9taXNlPHZvaWQ+KSB7XG5cdFx0bG9nZ2VyLncuZGVidWcobG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLm5ld2AsIGBmbGFnPSR7dGhpcy5mbGFnfWApKVxuXG5cdFx0dGhpcy5wcm90byA9IHByb3RvQ3JlYXRvcigpXG5cdFx0dGhpcy5wcm90by5sb2dnZXIgPSBsb2dnZXJcblx0XHR0aGlzLnByb3RvLm9uRXJyb3IgPSBhc3luYyAoZXJyOiBTdG1FcnJvcik9Pnthd2FpdCB0aGlzLm9uRXJyb3IoZXJyKX1cblx0XHR0aGlzLnByb3RvLm9uTWVzc2FnZSA9IGFzeW5jIChkYXRhOkFycmF5QnVmZmVyKT0+e2F3YWl0IHRoaXMub25NZXNzYWdlKGRhdGEpfVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjbG9zZUFuZE9sZFN0YXRlKGVycjogU3RtRXJyb3IpOiBQcm9taXNlPFN0YXRlPiB7XG5cdFx0bGV0IG9sZCA9IGF3YWl0IHRoaXMuY29ubkxvY2tlci53aXRoTG9jazxTdGF0ZT4oYXN5bmMgKCk9Pntcblx0XHRcdGxldCBvbGQgPSB0aGlzLnN0YXRlXG5cblx0XHRcdGlmICh0aGlzLnN0YXRlLmlzSW52YWxpZGF0ZWQoKSkge1xuXHRcdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLnN0YXRlID0gbmV3IEludmFsaWRhdGVkKGVycilcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LkludmFsaWRhdGVkYCwgYCR7ZXJyfWApKVxuXG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0fSlcblxuXHRcdGF3YWl0IHRoaXMuYWxsUmVxdWVzdHMuQ2xlYXJBbGxXaXRoKFtSZXNwb25zZS5aZXJvUmVzKCksIGVyci50b0Nvbm5FcnJdKVxuXG5cdFx0cmV0dXJuIG9sZFxuXHR9XG5cblx0YXN5bmMgb25FcnJvcihlcnI6IFN0bUVycm9yKSB7XG5cdFx0bGV0IG9sZCA9IGF3YWl0IHRoaXMuY2xvc2VBbmRPbGRTdGF0ZShlcnIpXG5cdFx0aWYgKG9sZCBpbnN0YW5jZW9mIENvbm5lY3RlZCkge1xuXHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uY2xvc2VgXG5cdFx0XHRcdFx0LCBcImNsb3NlZCwgYmVjb21lIGludmFsaWRhdGVkXCIpKVxuXHRcdFx0XHRhd2FpdCB0aGlzLm9uUGVlckNsb3NlZChlcnIpXG5cdFx0XHRcdGF3YWl0IHRoaXMucHJvdG8uQ2xvc2UoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRhc3luYyBvbk1lc3NhZ2UobXNnOiBBcnJheUJ1ZmZlcikge1xuXHRcdGxldCBbcmVzcG9uc2UsIGVycl0gPSBSZXNwb25zZS5QYXJzZShtc2cpXG5cdFx0aWYgKGVycikge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOnBhcnNlYFxuXHRcdFx0XHQsIGBlcnJvciAtLS0gJHtlcnJ9YCkpXG5cdFx0XHRhd2FpdCB0aGlzLm9uRXJyb3IoZXJyKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHJlc3BvbnNlLmlzUHVzaCkge1xuXHRcdFx0bGV0IFtwdXNoQWNrLCBlcnJdID0gcmVzcG9uc2UubmV3UHVzaEFjaygpXG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+Lm9uTWVzc2FnZTpuZXdQdXNoQWNrYFxuXHRcdFx0XHRcdCwgYGVycm9yIC0tLSAke2Vycn1gKSlcblx0XHRcdFx0YXdhaXQgdGhpcy5vbkVycm9yKGVycilcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdGFzeW5jRXhlKGFzeW5jKCk9Pntcblx0XHRcdFx0YXdhaXQgdGhpcy5vblB1c2gocmVzcG9uc2UuZGF0YSlcblx0XHRcdH0pXG5cblx0XHRcdC8vIGlnbm9yZSBlcnJvclxuXHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0bGV0IGVyciA9IGF3YWl0IHRoaXMucHJvdG8uU2VuZChwdXNoQWNrKVxuXHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOnB1c2hBY2tgXG5cdFx0XHRcdFx0XHQsIGBlcnJvciAtLS0gJHtlcnJ9YCkpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOnB1c2hBY2tgXG5cdFx0XHRcdFx0LCBgcHVzaElEID0gJHtyZXNwb25zZS5wdXNoSWR9YCkpXG5cdFx0XHR9KVxuXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRsZXQgY2ggPSBhd2FpdCB0aGlzLmFsbFJlcXVlc3RzLlJlbW92ZShyZXNwb25zZS5yZXFJZClcblx0XHRpZiAoY2ggPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLldhcm4oYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5vbk1lc3NhZ2U6Tm90RmluZGBcblx0XHRcdFx0LCBgd2FybmluZzogbm90IGZpbmQgcmVxdWVzdCBmb3IgcmVxSWQoJHtyZXNwb25zZS5yZXFJZH1gKSlcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGxldCBjaDEgPSBjaFxuXG5cdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ub25NZXNzYWdlOnJlc3BvbnNlYFxuXHRcdFx0LCBgcmVxSWQ9JHtyZXNwb25zZS5yZXFJZH1gKSlcblx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0YXdhaXQgY2gxLlNlbmQoW3Jlc3BvbnNlLCBudWxsXSlcblx0XHR9KVxuXHR9XG5cblx0Ly8g5Y+v6YeN5aSN6LCD55SoXG5cdGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxTdG1FcnJvcnxudWxsPiB7XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMuY29ubkxvY2tlci53aXRoTG9jazxTdG1FcnJvcnxudWxsPihhc3luYyAoKT0+e1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgaW5zdGFuY2VvZiBDb25uZWN0ZWQpIHtcblx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XS5jb25uZWN0OkNvbm5lY3RlZGAsIGBjb25uSUQ9JHt0aGlzLmNvbm5lY3RJRH1gKSlcblx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnN0YXRlLmlzSW52YWxpZGF0ZWQoKSkge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLmNvbm5lY3Q8JHt0aGlzLmNvbm5lY3RJRH0+OkludmFsaWRhdGVkYFxuXHRcdFx0XHRcdCwgYCR7dGhpcy5zdGF0ZS5lcnJ9YCkpXG5cdFx0XHRcdHJldHVybiB0aGlzLnN0YXRlLmVyclxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzdGF0ZS5Ob3RDb25uZWN0XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLmNvbm5lY3Q6Tm90Q29ubmVjdGAsIFwid2lsbCBjb25uZWN0XCIpKVxuXHRcdFx0bGV0IFtoYW5kc2hha2UsIGVycl0gPSBhd2FpdCB0aGlzLnByb3RvLkNvbm5lY3QoKVxuXHRcdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSBuZXcgSW52YWxpZGF0ZWQoZXJyKVxuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dLmNvbm5lY3Q6ZXJyb3JgLCBgJHtlcnJ9YCkpXG5cdFx0XHRcdHJldHVybiBlcnJcblx0XHRcdH1cblxuXHRcdFx0Ly8gT0tcblx0XHRcdHRoaXMuc3RhdGUgPSBuZXcgQ29ubmVjdGVkXG5cdFx0XHR0aGlzLmhhbmRzaGFrZSA9IGhhbmRzaGFrZVxuXHRcdFx0dGhpcy5hbGxSZXF1ZXN0cy5wZXJtaXRzID0gdGhpcy5oYW5kc2hha2UuTWF4Q29uY3VycmVudFxuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uY29ubmVjdDpoYW5kc2hha2VgXG5cdFx0XHRcdCwgYCR7dGhpcy5oYW5kc2hha2V9YCkpXG5cblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSlcblx0fVxuXG5cdC8vIOWmguaenOayoeaciei/nuaOpeaIkOWKn++8jOebtOaOpei/lOWbnuWksei0pVxuXHRhc3luYyBzZW5kKGRhdGE6IEFycmF5QnVmZmVyLCBoZWFkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG5cdFx0XHRcdFx0XHQgLCB0aW1lb3V0OiBEdXJhdGlvbiA9IDMwKlNlY29uZCk6IFByb21pc2U8W0FycmF5QnVmZmVyLCBTdG1FcnJvcnxudWxsXT4ge1xuXHRcdC8vIOmihOWIpOaWrVxuXHRcdGxldCByZXQgPSBhd2FpdCB0aGlzLmNvbm5Mb2NrZXIud2l0aExvY2s8U3RtRXJyb3J8bnVsbD4gKGFzeW5jICgpPT57XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kOnN0YXRlYFxuXHRcdFx0XHQsIGAke3RoaXMuc3RhdGV9IC0tLSBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfWApKVxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNJbnZhbGlkYXRlZCgpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnN0YXRlLmVyci50b0Nvbm5FcnJcblx0XHRcdH1cblx0XHRcdGlmICghKHRoaXMuc3RhdGUgaW5zdGFuY2VvZiBDb25uZWN0ZWQpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgRWxzZUNvbm5FcnIoXCJub3QgY29ubmVjdGVkXCIpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSlcblx0XHRpZiAocmV0KSB7XG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgcmV0XVxuXHRcdH1cblxuXHRcdGxldCByZXFJZCA9IHRoaXMucmVxSWQuZ2V0KClcblx0XHRsZXQgW3JlcXVlc3QsIGVycl0gPSBSZXF1ZXN0Lk5ldyhyZXFJZCwgZGF0YSwgaGVhZGVycylcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kOkZha2VIdHRwUmVxdWVzdGBcblx0XHRcdFx0LCBgaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX0gKHJlcUlkOiR7cmVxSWR9KSAtLS0gZXJyb3I6ICR7ZXJyfWApKVxuXHRcdFx0cmV0dXJuIFtuZXcgQXJyYXlCdWZmZXIoMCksIGVycl1cblx0XHR9XG5cdFx0aWYgKHJlcXVlc3QubG9hZExlbiA+IHRoaXMuaGFuZHNoYWtlLk1heEJ5dGVzKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kOk1heEJ5dGVzYFxuXHRcdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSBlcnJvcjogZGF0YSBpcyBUb28gTGFyZ2VgKSlcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApXG5cdFx0XHRcdCwgbmV3IEVsc2VFcnIoYHJlcXVlc3Quc2l6ZSgke3JlcXVlc3QubG9hZExlbn0pID4gTWF4Qnl0ZXMoJHt0aGlzLmhhbmRzaGFrZS5NYXhCeXRlc30pYCldXG5cdFx0fVxuXG5cdFx0Ly8g5Zyo5a6i5oi356uv6LaF5pe25Lmf6K6k5Li65piv5LiA5Liq6K+35rGC57uT5p2f77yM5L2G5piv55yf5q2j55qE6K+35rGC5bm25rKh5pyJ57uT5p2f77yM5omA5Lul5Zyo5pyN5Yqh5Zmo55yL5p2l77yM5LuN54S25Y2g55So5pyN5Yqh5Zmo55qE5LiA5Liq5bm25Y+R5pWwXG5cdFx0Ly8g5Zug5Li6572R57uc5byC5q2l55qE5Y6f5Zug77yM5a6i5oi356uv5bm25Y+R5pWw5LiN5Y+v6IO95LiO5pyN5Yqh5Zmo5a6M5YWo5LiA5qC377yM5omA5Lul6L+Z6YeM5Li76KaB5piv5Y2P5Yqp5pyN5Yqh5Zmo5YGa6aKE5o6n5rWB77yM5oyJ54Wn5a6i5oi356uv55qE6YC76L6R5aSE55CG5Y2z5Y+vXG5cblx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kWyR7cmVxSWR9XTpyZXF1ZXN0YFxuXHRcdFx0LCBgaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX0gKHJlcUlkOiR7cmVxSWR9KWApKVxuXG5cdFx0bGV0IGNoID0gYXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5BZGQocmVxSWQpXG5cdFx0bGV0IHJldDIgPSBhd2FpdCB3aXRoVGltZW91dDxbUmVzcG9uc2UsIFN0bUVycm9yfG51bGxdPih0aW1lb3V0LCBhc3luYyAoKT0+e1xuXHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0bGV0IGVyciA9IGF3YWl0IHRoaXMucHJvdG8uU2VuZChyZXF1ZXN0LmVuY29kZWREYXRhKVxuXHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hbGxSZXF1ZXN0cy5SZW1vdmUocmVxSWQpPy5TZW5kKFtSZXNwb25zZS5aZXJvUmVzKCksIGVycl0pXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHRcdGxldCByID0gYXdhaXQgY2guUmVjZWl2ZSgpXG5cdFx0XHRpZiAocikge1xuXHRcdFx0XHRyZXR1cm4gclxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFtSZXNwb25zZS5aZXJvUmVzKCksIG5ldyBFbHNlRXJyKFwiY2hhbm5lbCBpcyBjbG9zZWQsIGV4Y2VwdGlvbiEhIVwiKV1cblx0XHR9KVxuXG5cdFx0aWYgKHJldDIgaW5zdGFuY2VvZiBUaW1lb3V0KSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYE5ldFske3RoaXMuZmxhZ31dPCR7dGhpcy5jb25uZWN0SUR9Pi5zZW5kWyR7cmVxSWR9XTpUaW1lb3V0YFxuXHRcdFx0XHQsIGBoZWFkZXJzOiR7Zm9ybWF0TWFwKGhlYWRlcnMpfSAocmVxSWQ6JHtyZXFJZH0pIC0tLSB0aW1lb3V0KD4ke3RpbWVvdXQvU2Vjb25kfXMpYCkpXG5cdFx0XHRyZXR1cm4gW25ldyBBcnJheUJ1ZmZlcigwKSwgbmV3IEVsc2VFcnIoYHJlcXVlc3QgdGltZW91dCgke3RpbWVvdXQvU2Vjb25kfXMpYCldXG5cdFx0fVxuXG5cdFx0aWYgKHJldDJbMV0pIHtcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCByZXQyWzFdXVxuXHRcdH1cblxuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgTmV0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LnNlbmRbJHtyZXFJZH1dOnJlc3BvbnNlYFxuXHRcdFx0LCBgaGVhZGVyczoke2Zvcm1hdE1hcChoZWFkZXJzKX0gKHJlcUlkOiR7cmVxSWR9KSAtLS0gJHtyZXQyWzBdLnN0YXR1c31gKSlcblxuXHRcdGlmIChyZXQyWzBdLnN0YXR1cyAhPSBSZXNTdGF0dXMuT0spIHtcblx0XHRcdHJldHVybiBbbmV3IEFycmF5QnVmZmVyKDApLCBuZXcgRWxzZUVycihuZXcgVXRmOChyZXQyWzBdLmRhdGEpLnRvU3RyaW5nKCkpXVxuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuYWxsUmVxdWVzdHMuUmVtb3ZlKHJlcUlkKVxuXG5cdFx0cmV0dXJuIFtyZXQyWzBdLmRhdGEsIG51bGxdXG5cdH1cblxuXHRhc3luYyBjbG9zZSgpIHtcblx0XHRsZXQgb2xkID0gYXdhaXQgdGhpcy5jbG9zZUFuZE9sZFN0YXRlKG5ldyBFbHNlRXJyKFwiY2xvc2VkIGJ5IHNlbGZcIikpXG5cdFx0aWYgKG9sZCBpbnN0YW5jZW9mIENvbm5lY3RlZCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBOZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4uY2xvc2VgXG5cdFx0XHRcdCwgXCJjbG9zZWQsIGJlY29tZSBpbnZhbGlkYXRlZFwiKSlcblx0XHRcdGF3YWl0IHRoaXMucHJvdG8uQ2xvc2UoKVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TWFwKG1hcDogTWFwPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB7XG5cdGxldCByZXQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG5cdG1hcC5mb3JFYWNoKCh2LCBrKSA9PiB7XG5cdFx0cmV0LnB1c2goayArIFwiOlwiICsgdilcblx0fSlcblxuXHRyZXR1cm4gXCJ7XCIgKyByZXQuam9pbihcIiwgXCIpICsgXCJ9XCJcbn1cbiIsIlxuaW1wb3J0IHtMb2dnZXIsIER1cmF0aW9uLCBhc3NlcnQsIFNlY29uZCwgZm9ybWF0RHVyYXRpb259IGZyb20gXCJ0cy14dXRpbHNcIlxuaW1wb3J0IHtTdG1FcnJvcn0gZnJvbSBcIi4vZXJyb3JcIlxuXG4vKipcbiAqXG4gKiDkuIrlsYLnmoTosIPnlKggUHJvdG9jb2wg5Y+K5ZON5bqUIERlbGVnYXRlIOeahOaXtuW6j+mAu+i+ke+8mlxuICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZcbiAqICAgICBjb25uZWN0ezF9IC0tKy0tKHRydWUpLS0rLS0tWy5hc3luY10tLS0+c2VuZHtufSAtLS0tLS0+IGNsb3NlezF9XG4gKiAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXlxuICogICAgICAgICAgIChmYWxzZSl8ICAgICAgICAgIHwtLS0tLS0tPiBvbk1lc3NhZ2UgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgfCAgICAgICAgICB8ICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgPFVuaXQ+LS0tLSsgICAgICAgICAgfCAgICAgICAgICAoZXJyb3IpIC0tLSBbLmFzeW5jXSAtLS0+fFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tLS0tLS0+IG9uRXJyb3IgLS0tIFsuYXN5bmNdIC0tLS0rXG4gKlxuICpcbiAqICAgIFByb3RvY29sLmNvbm5lY3QoKSDkuI4gUHJvdG9jb2wuY2xvc2UoKSDkuIrlsYLkvb/nlKjmlrnnoa7kv53lj6rkvJrosIPnlKggMSDmrKFcbiAqICAgIFByb3RvY29sLmNvbm5lY3QoKSDlpLHotKXvvIzkuI3kvJror7fmsYIv5ZON5bqU5Lu75L2V5o6l5Y+jXG4gKiAgICBQcm90b2NvbC5zZW5kKCkg5Lya5byC5q2l5bm25Y+R5Zyw6LCD55SoIG4g5qyh77yMUHJvdG9jb2wuc2VuZCgpIOaJp+ihjOeahOaXtumVv+S4jeS8muiuqeiwg+eUqOaWueaMgui1t+etieW+hVxuICogICAg5Zyo5LiK5bGC5piO56Gu6LCD55SoIFByb3RvY29sLmNsb3NlKCkg5ZCO77yM5omN5LiN5Lya6LCD55SoIFByb3RvY29sLnNlbmQoKVxuICogICAgRGVsZWdhdGUub25NZXNzYWdlKCkg5aSx6LSlIOWPiiBEZWxlZ2F0ZS5vbkVycm9yKCkg5Lya5byC5q2l6LCD55SoIFByb3RvY29sLmNsb3NlKClcbiAqXG4gKiAgICDov57mjqXmiJDlip/lkI7vvIzku7vkvZXkuI3og73nu6fnu63pgJrkv6HnmoTmg4XlhrXpg73ku6UgRGVsZWdhdGUub25FcnJvcigpIOi/lOWbnlxuICogICAgRGVsZWdhdGUuY2xvc2UoKSDnmoTosIPnlKjkuI3op6blj5EgRGVsZWdhdGUub25FcnJvcigpXG4gKiAgICBEZWxlZ2F0ZS5jb25uZWN0KCkg55qE6ZSZ6K+v5LiN6Kem5Y+RIERlbGVnYXRlLm9uRXJyb3IoKVxuICogICAgRGVsZWdhdGUuc2VuZCgpIOS7hei/lOWbnuacrOasoSBEZWxlZ2F0ZS5zZW5kKCkg55qE6ZSZ6K+v77yMXG4gKiAgICAgICDkuI3mmK/lupXlsYLpgJrkv6HnmoTplJnor6/vvIzlupXlsYLpgJrkv6HnmoTplJnor6/pgJrov4cgRGVsZWdhdGUub25FcnJvcigpIOi/lOWbnlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgSGFuZHNoYWtlIHtcblx0SGVhckJlYXRUaW1lOiBEdXJhdGlvbiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG5cdEZyYW1lVGltZW91dDogRHVyYXRpb24gPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAvLyDlkIzkuIDluKfph4zpnaLnmoTmlbDmja7otoXml7Zcblx0TWF4Q29uY3VycmVudDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgLy8g5LiA5Liq6L+e5o6l5LiK55qE5pyA5aSn5bm25Y+RXG5cdE1heEJ5dGVzOiBudW1iZXIgPSAxMCAqIDEwMjQgKiAxMDI0IC8vIOS4gOW4p+aVsOaNrueahOacgOWkp+Wtl+iKguaVsFxuXHRDb25uZWN0SWQ6IHN0cmluZyA9IFwiLS0tbm9fY29ubmVjdElkLS0tXCJcblxuXHR0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiBgaGFuZHNoYWtlIGluZm86e0Nvbm5lY3RJZDogJHt0aGlzLkNvbm5lY3RJZH0sIE1heENvbmN1cnJlbnQ6ICR7dGhpcy5NYXhDb25jdXJyZW50fSwgSGVhckJlYXRUaW1lOiAke2Zvcm1hdER1cmF0aW9uKHRoaXMuSGVhckJlYXRUaW1lKX0sIE1heEJ5dGVzL2ZyYW1lOiAke3RoaXMuTWF4Qnl0ZXN9LCBGcmFtZVRpbWVvdXQ6ICR7Zm9ybWF0RHVyYXRpb24odGhpcy5GcmFtZVRpbWVvdXQpfX1gXG5cdH1cblxuXHQvKipcblx0ICogYGBgXG5cdCAqIEhlYXJ0QmVhdF9zIHwgRnJhbWVUaW1lb3V0X3MgfCBNYXhDb25jdXJyZW50IHwgTWF4Qnl0ZXMgfCBjb25uZWN0IGlkXG5cdCAqIEhlYXJ0QmVhdF9zOiAyIGJ5dGVzLCBuZXQgb3JkZXJcblx0ICogRnJhbWVUaW1lb3V0X3M6IDEgYnl0ZVxuXHQgKiBNYXhDb25jdXJyZW50OiAxIGJ5dGVcblx0ICogTWF4Qnl0ZXM6IDQgYnl0ZXMsIG5ldCBvcmRlclxuXHQgKiBjb25uZWN0IGlkOiA4IGJ5dGVzLCBuZXQgb3JkZXJcblx0ICogYGBgXG5cdCAqL1xuXG5cdHN0YXRpYyBTdHJlYW1MZW4gPSAyICsgMSArIDEgKyA0ICsgOFxuXG5cdHN0YXRpYyBQYXJzZShidWZmZXI6IEFycmF5QnVmZmVyKTogSGFuZHNoYWtlIHtcblx0XHRhc3NlcnQoYnVmZmVyLmJ5dGVMZW5ndGggPj0gSGFuZHNoYWtlLlN0cmVhbUxlbilcblxuXHRcdGxldCByZXQgPSBuZXcgSGFuZHNoYWtlKClcblx0XHRsZXQgdmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xuXG5cdFx0cmV0LkhlYXJCZWF0VGltZSA9IHZpZXcuZ2V0VWludDE2KDApICogU2Vjb25kXG5cdFx0cmV0LkZyYW1lVGltZW91dCA9IHZpZXcuZ2V0VWludDgoMikgKiBTZWNvbmRcblx0XHRyZXQuTWF4Q29uY3VycmVudCA9IHZpZXcuZ2V0VWludDgoMyk7XG5cdFx0cmV0Lk1heEJ5dGVzID0gdmlldy5nZXRVaW50MzIoNCk7XG5cdFx0cmV0LkNvbm5lY3RJZCA9IChcIjAwMDAwMDAwXCIgKyB2aWV3LmdldFVpbnQzMig4KS50b1N0cmluZygxNikpLnNsaWNlKC04KSArXG5cdFx0XHQoXCIwMDAwMDAwMFwiICsgdmlldy5nZXRVaW50MzIoMTIpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTgpO1xuXG5cdFx0cmV0dXJuIHJldFxuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9jb2wge1xuXHRDb25uZWN0KCk6IFByb21pc2U8W0hhbmRzaGFrZSwgU3RtRXJyb3J8bnVsbF0+XG5cdENsb3NlKCk6IFByb21pc2U8dm9pZD5cblx0U2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8U3RtRXJyb3J8bnVsbD5cblxuXHRsb2dnZXI6IExvZ2dlclxuXG5cdC8vIGRlbGVnYXRlXG5cdG9uTWVzc2FnZTogKGRhdGE6QXJyYXlCdWZmZXIpPT5Qcm9taXNlPHZvaWQ+XG5cdG9uRXJyb3I6IChlcnI6IFN0bUVycm9yKT0+UHJvbWlzZTx2b2lkPlxufVxuXG4iLCJpbXBvcnQge0hhbmRzaGFrZSwgUHJvdG9jb2x9IGZyb20gXCIuL3Byb3RvY29sXCJcbmltcG9ydCB7Q29ublRpbWVvdXRFcnIsIEVsc2VDb25uRXJyLCBpc1N0bUVycm9yLCBTdG1FcnJvcn0gZnJvbSBcIi4vZXJyb3JcIlxuaW1wb3J0IHtDb25zb2xlTG9nZ2VyLCBEdXJhdGlvbiwgTG9nZ2VyLCBTZWNvbmQsIFVuaXFGbGFnfSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7YXN5bmNFeGUsIENoYW5uZWwsIFNlbmRDaGFubmVsLCBUaW1lb3V0LCB3aXRoVGltZW91dH0gZnJvbSBcInRzLWNvbmN1cnJlbmN5XCJcblxuZXhwb3J0IGludGVyZmFjZSBFdmVudCB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VFdmVudCBleHRlbmRzIEV2ZW50e1xuXHRyZWFkb25seSBkYXRhOiBBcnJheUJ1ZmZlciB8IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENsb3NlRXZlbnQgZXh0ZW5kcyBFdmVudHtcblx0cmVhZG9ubHkgY29kZTogbnVtYmVyO1xuXHRyZWFkb25seSByZWFzb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFcnJvckV2ZW50IGV4dGVuZHMgRXZlbnR7XG5cdGVyck1zZzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2ViU29ja2V0RHJpdmVyIHtcblx0b25jbG9zZTogKChldjogQ2xvc2VFdmVudCkgPT4gYW55KVxuXHRvbmVycm9yOiAoKGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpXG5cdG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50KSA9PiBhbnkpXG5cdG9ub3BlbjogKChldjogRXZlbnQpID0+IGFueSlcblxuXHRjbG9zZShjb2RlPzogbnVtYmVyLCByZWFzb24/OiBzdHJpbmcpOiB2b2lkXG5cdHNlbmQoZGF0YTogQXJyYXlCdWZmZXIpOiB2b2lkXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdFdlYlNvY2tldERyaXZlciBpbXBsZW1lbnRzIFdlYlNvY2tldERyaXZlcntcblx0b25jbG9zZTogKChldjogQ2xvc2VFdmVudCkgPT4gYW55KSA9ICgpPT57fVxuXHRvbmVycm9yOiAoKGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpICA9ICgpPT57fVxuXHRvbm1lc3NhZ2U6ICgoZXY6IE1lc3NhZ2VFdmVudCkgPT4gYW55KSA9ICgpPT57fVxuXHRvbm9wZW46ICgoZXY6IEV2ZW50KSA9PiBhbnkpID0gKCk9Pnt9XG5cblx0YWJzdHJhY3QgY2xvc2UoY29kZT86IG51bWJlciwgcmVhc29uPzogc3RyaW5nKTogdm9pZFxuXHRhYnN0cmFjdCBzZW5kKGRhdGE6IEFycmF5QnVmZmVyKTogdm9pZFxufVxuXG5jbGFzcyBkdW1teVdzIGV4dGVuZHMgQWJzdHJhY3RXZWJTb2NrZXREcml2ZXIge1xuXHRjbG9zZSgpOiB2b2lkIHt9XG5cdHNlbmQoKTogdm9pZCB7fVxufVxuXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0UHJvdG9jb2wgaW1wbGVtZW50cyBQcm90b2NvbCB7XG5cdGxvZ2dlcl86IExvZ2dlciA9IENvbnNvbGVMb2dnZXJcblx0b25NZXNzYWdlOiAoZGF0YTpBcnJheUJ1ZmZlcik9PlByb21pc2U8dm9pZD4gPSBhc3luYyAoKT0+e31cblx0b25FcnJvcjogKGVycjogU3RtRXJyb3IpPT5Qcm9taXNlPHZvaWQ+ID0gYXN5bmMgKCk9Pnt9XG5cdGNsb3NlQnlTZWxmOiBib29sZWFuID0gZmFsc2Vcblx0aGFuZHNoYWtlOiBIYW5kc2hha2UgPSBuZXcgSGFuZHNoYWtlKClcblxuXHRnZXQgY29ubmVjdElEKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMuaGFuZHNoYWtlLkNvbm5lY3RJZCB9XG5cdHByaXZhdGUgZmxhZyA9IFVuaXFGbGFnKClcblx0ZHJpdmVyOiBBYnN0cmFjdFdlYlNvY2tldERyaXZlciA9IG5ldyBkdW1teVdzKClcblxuXHRnZXQgbG9nZ2VyKCk6IExvZ2dlciB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyX1xuXHR9XG5cdHNldCBsb2dnZXIobCkge1xuXHRcdHRoaXMubG9nZ2VyXyA9IGxcblx0XHR0aGlzLmxvZ2dlcl8udy5kZWJ1Zyh0aGlzLmxvZ2dlcl8uZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ubmV3YCwgYGZsYWc9JHt0aGlzLmZsYWd9YCkpXG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHVybDogc3RyaW5nLCBwcml2YXRlIGRyaXZlckNyZWF0b3I6ICh1cmw6c3RyaW5nKT0+V2ViU29ja2V0RHJpdmVyXG5cdFx0XHRcdFx0XHRcdCwgcHJpdmF0ZSBjb25uZWN0VGltZW91dDogRHVyYXRpb24gPSAzMCpTZWNvbmQpIHtcblx0XHRpZiAodXJsLmluZGV4T2YoXCJzOi8vXCIpID09PSAtMSkge1xuXHRcdFx0dGhpcy51cmwgPSBcIndzOi8vXCIgKyB1cmw7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5jbG9zZUJ5U2VsZiA9IHRydWVcblx0XHR0aGlzLmRyaXZlci5jbG9zZSgpXG5cdFx0dGhpcy5kcml2ZXIgPSBuZXcgZHVtbXlXcygpXG5cdH1cblxuXHRjcmVhdGVEcml2ZXIoaGFuZHNoYWtlQ2hhbm5lbDogU2VuZENoYW5uZWw8QXJyYXlCdWZmZXJ8U3RtRXJyb3I+KSB7XG5cdFx0bGV0IGlzQ29ubmVjdGluZyA9IHRydWVcblx0XHR0aGlzLmRyaXZlciA9IHRoaXMuZHJpdmVyQ3JlYXRvcih0aGlzLnVybClcblx0XHR0aGlzLmRyaXZlci5vbmNsb3NlID0gKGV2KT0+e1xuXHRcdFx0aWYgKGlzQ29ubmVjdGluZykge1xuXHRcdFx0XHRpc0Nvbm5lY3RpbmcgPSBmYWxzZVxuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0ub25jbG9zZWAsIGAke2V2LmNvZGV9ICR7ZXYucmVhc29ufWApKVxuXHRcdFx0XHRcdGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuU2VuZChuZXcgRWxzZUNvbm5FcnIoYGNsb3NlZDogJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuY2xvc2VCeVNlbGYpIHtcblx0XHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9uY2xvc2VgXG5cdFx0XHRcdFx0XHQsIGBjbG9zZWQgYnkgcGVlcjogJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKSlcblx0XHRcdFx0XHRhd2FpdCB0aGlzLm9uRXJyb3IobmV3IEVsc2VDb25uRXJyKGBjbG9zZWQgYnkgcGVlcjogJHtldi5jb2RlfSAke2V2LnJlYXNvbn1gKSlcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5kcml2ZXIub25lcnJvciA9IChldik9Pntcblx0XHRcdGlmIChpc0Nvbm5lY3RpbmcpIHtcblx0XHRcdFx0aXNDb25uZWN0aW5nID0gZmFsc2Vcblx0XHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9uZXJyb3JgLCBldi5lcnJNc2cpKVxuXHRcdFx0XHRcdGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuU2VuZChuZXcgRWxzZUNvbm5FcnIoZXYuZXJyTXNnKSlcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuY2xvc2VCeVNlbGYpIHtcblx0XHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9uZXJyb3JgLCBgJHtldi5lcnJNc2d9YCkpXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5vbkVycm9yKG5ldyBFbHNlQ29ubkVycihldi5lcnJNc2cpKVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmRyaXZlci5vbm1lc3NhZ2UgPSAoZXYpPT57XG5cdFx0XHRpZiAodHlwZW9mIGV2LmRhdGEgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFske3RoaXMuZmxhZ31dLm9ubWVzc2FnZTplcnJvcmAsIFwibWVzc2FnZSB0eXBlIGVycm9yXCIpKVxuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMub25FcnJvcihuZXcgRWxzZUNvbm5FcnIoXCJtZXNzYWdlIHR5cGUgZXJyb3JcIikpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZGF0YTpBcnJheUJ1ZmZlciA9IGV2LmRhdGFcblxuXHRcdFx0aWYgKGlzQ29ubmVjdGluZykge1xuXHRcdFx0XHRpc0Nvbm5lY3RpbmcgPSBmYWxzZVxuXHRcdFx0XHRhc3luY0V4ZShhc3luYyAoKT0+e1xuXHRcdFx0XHRcdGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuU2VuZChkYXRhKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0YXN5bmNFeGUoYXN5bmMgKCk9Pntcblx0XHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XTwke3RoaXMuY29ubmVjdElEfT4ucmVhZGBcblx0XHRcdFx0XHQsIGByZWFkIG9uZSBtZXNzYWdlYCkpXG5cdFx0XHRcdGF3YWl0IHRoaXMub25NZXNzYWdlKGRhdGEpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHR0aGlzLmRyaXZlci5vbm9wZW4gPSAoKT0+e1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHt0aGlzLmZsYWd9XS5vbm9wZW5gLCBgd2FpdGluZyBmb3IgaGFuZHNoYWtlYCkpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgQ29ubmVjdCgpOiBQcm9taXNlPFtIYW5kc2hha2UsIChTdG1FcnJvciB8IG51bGwpXT4ge1xuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV0uQ29ubmVjdDpzdGFydGBcblx0XHRcdCwgYCR7dGhpcy51cmx9I2Nvbm5lY3RUaW1lb3V0PSR7dGhpcy5jb25uZWN0VGltZW91dH1gKSlcblxuXHRcdGxldCBoYW5kc2hha2VDaGFubmVsID0gbmV3IENoYW5uZWw8QXJyYXlCdWZmZXJ8U3RtRXJyb3I+KDEpXG5cdFx0dGhpcy5jcmVhdGVEcml2ZXIoaGFuZHNoYWtlQ2hhbm5lbClcblxuXHRcdGxldCBoYW5kc2hha2UgPSBhd2FpdCB3aXRoVGltZW91dDxBcnJheUJ1ZmZlcnxTdG1FcnJvcnxudWxsPih0aGlzLmNvbm5lY3RUaW1lb3V0LCBhc3luYyAoKT0+e1xuXHRcdFx0cmV0dXJuIGF3YWl0IGhhbmRzaGFrZUNoYW5uZWwuUmVjZWl2ZSgpXG5cdFx0fSlcblx0XHRpZiAoaGFuZHNoYWtlIGluc3RhbmNlb2YgVGltZW91dCkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHsodGhpcy5mbGFnKX1dLkNvbm5lY3Q6ZXJyb3JgLCBcInRpbWVvdXRcIikpXG5cdFx0XHRyZXR1cm4gW25ldyBIYW5kc2hha2UoKSwgbmV3IENvbm5UaW1lb3V0RXJyKFwidGltZW91dFwiKV1cblx0XHR9XG5cdFx0aWYgKGlzU3RtRXJyb3IoaGFuZHNoYWtlKSkge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHsodGhpcy5mbGFnKX1dLkNvbm5lY3Q6ZXJyb3JgLCBgJHtoYW5kc2hha2V9YCkpXG5cdFx0XHRyZXR1cm4gW25ldyBIYW5kc2hha2UoKSwgaGFuZHNoYWtlXVxuXHRcdH1cblx0XHRpZiAoaGFuZHNoYWtlID09IG51bGwpIHtcblx0XHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7KHRoaXMuZmxhZyl9XS5Db25uZWN0OmVycm9yYCwgXCJjaGFubmVsIGNsb3NlZFwiKSlcblx0XHRcdHJldHVybiBbbmV3IEhhbmRzaGFrZSgpLCBuZXcgRWxzZUNvbm5FcnIoXCJjaGFubmVsIGNsb3NlZFwiKV1cblx0XHR9XG5cblx0XHRpZiAoaGFuZHNoYWtlLmJ5dGVMZW5ndGggIT0gSGFuZHNoYWtlLlN0cmVhbUxlbikge1xuXHRcdFx0dGhpcy5sb2dnZXIudy5kZWJ1Zyh0aGlzLmxvZ2dlci5mLkRlYnVnKGBXZWJTb2NrZXRbJHsodGhpcy5mbGFnKX1dLkNvbm5lY3Q6ZXJyb3JgXG5cdFx0XHRcdCwgYGhhbmRzaGFrZSgke2hhbmRzaGFrZS5ieXRlTGVuZ3RofSkgc2l6ZSBlcnJvcmApKVxuXHRcdFx0cmV0dXJuIFtuZXcgSGFuZHNoYWtlKCksIG5ldyBFbHNlQ29ubkVycihgaGFuZHNoYWtlKCR7aGFuZHNoYWtlLmJ5dGVMZW5ndGh9KSBzaXplIGVycm9yYCldXG5cdFx0fVxuXHRcdHRoaXMuaGFuZHNoYWtlID0gSGFuZHNoYWtlLlBhcnNlKGhhbmRzaGFrZSlcblx0XHR0aGlzLmxvZ2dlci53LmRlYnVnKHRoaXMubG9nZ2VyLmYuRGVidWcoYFdlYlNvY2tldFskeyh0aGlzLmZsYWcpfV08JHsodGhpcy5jb25uZWN0SUQpfT4uQ29ubmVjdDplbmRgXG5cdFx0XHQsIGBjb25uZWN0SUQgPSAkeyh0aGlzLmNvbm5lY3RJRCl9YCkpXG5cblx0XHRyZXR1cm4gW3RoaXMuaGFuZHNoYWtlLCBudWxsXVxuXHR9XG5cblx0YXN5bmMgU2VuZChkYXRhOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8U3RtRXJyb3IgfCBudWxsPiB7XG5cdFx0dGhpcy5kcml2ZXIuc2VuZChkYXRhKVxuXHRcdHRoaXMubG9nZ2VyLncuZGVidWcodGhpcy5sb2dnZXIuZi5EZWJ1ZyhgV2ViU29ja2V0WyR7dGhpcy5mbGFnfV08JHt0aGlzLmNvbm5lY3RJRH0+LlNlbmRgXG5cdFx0XHQsIGBmcmFtZUJ5dGVzID0gJHtkYXRhLmJ5dGVMZW5ndGh9YCkpXG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4iLCJcbmV4cG9ydCB7dHlwZSBEdXJhdGlvbiwgSG91ciwgU2Vjb25kLCBNaW51dGUsIE1pY3Jvc2Vjb25kLCBNaWxsaXNlY29uZCwgZm9ybWF0RHVyYXRpb259IGZyb20gXCIuL3NyYy9kdXJhdGlvblwiXG5cbmV4cG9ydCB7VXRmOH0gZnJvbSBcIi4vc3JjL3V0ZjhcIlxuXG5leHBvcnQge3R5cGUgTG9nZ2VyLCBDb25zb2xlTG9nZ2VyfSBmcm9tIFwiLi9zcmMvbG9nZ2VyXCJcblxuZXhwb3J0IHtBc3NlcnRFcnJvciwgYXNzZXJ0fSBmcm9tIFwiLi9zcmMvYXNzZXJ0XCJcblxuZXhwb3J0IHtSYW5kb21JbnQsIFVuaXFGbGFnfSBmcm9tICcuL3NyYy90eXBlZnVuYydcblxuIiwiXG5leHBvcnQgY2xhc3MgQXNzZXJ0RXJyb3IgaW1wbGVtZW50cyBFcnJvciB7XG5cdG1lc3NhZ2U6IHN0cmluZ1xuXHRuYW1lOiBzdHJpbmcgPSBcIkFzc2VydEVycm9yXCJcblxuXHRjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGJvb2xlYW4sIG1zZzogc3RyaW5nID0gXCJcIikge1xuXHRpZiAoIWNvbmRpdGlvbikge1xuXHRcdGNvbnNvbGUuYXNzZXJ0KGNvbmRpdGlvbiwgbXNnKVxuXHRcdHRocm93IG5ldyBBc3NlcnRFcnJvcihtc2cpXG5cdH1cbn1cbiIsIlxuXG5leHBvcnQgdHlwZSBEdXJhdGlvbiA9IG51bWJlclxuXG5leHBvcnQgY29uc3QgTWljcm9zZWNvbmQgPSAxXG5leHBvcnQgY29uc3QgTWlsbGlzZWNvbmQgPSAxMDAwICogTWljcm9zZWNvbmRcbmV4cG9ydCBjb25zdCBTZWNvbmQgPSAxMDAwICogTWlsbGlzZWNvbmRcbmV4cG9ydCBjb25zdCBNaW51dGUgPSA2MCAqIFNlY29uZFxuZXhwb3J0IGNvbnN0IEhvdXIgPSA2MCAqIE1pbnV0ZVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RHVyYXRpb24oZDogRHVyYXRpb24pOiBzdHJpbmcge1xuXHRsZXQgcmV0ID0gXCJcIlxuXHRsZXQgbGVmdCA9IGRcblxuXHRsZXQgdiA9IE1hdGguZmxvb3IobGVmdC9Ib3VyKVxuXHRpZiAodiAhPSAwKSB7XG5cdFx0cmV0ICs9IGAke3Z9aGBcblx0XHRsZWZ0IC09IHYgKiBIb3VyXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9NaW51dGUpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1taW5gXG5cdFx0bGVmdCAtPSB2ICogTWludXRlXG5cdH1cblx0diA9IE1hdGguZmxvb3IobGVmdC9TZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1zYFxuXHRcdGxlZnQgLT0gdiAqIFNlY29uZFxuXHR9XG5cdHYgPSBNYXRoLmZsb29yKGxlZnQvTWlsbGlzZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn1tc2Bcblx0XHRsZWZ0IC09IHYgKiBNaWxsaXNlY29uZFxuXHR9XG5cdHYgPSBNYXRoLmZsb29yKGxlZnQvTWljcm9zZWNvbmQpXG5cdGlmICh2ICE9IDApIHtcblx0XHRyZXQgKz0gYCR7dn11c2Bcblx0fVxuXG5cdGlmIChyZXQubGVuZ3RoID09IDApIHtcblx0XHRyZXQgPSBcIjB1c1wiXG5cdH1cblxuXHRyZXR1cm4gcmV0XG59XG4iLCJcbmV4cG9ydCBpbnRlcmZhY2UgTG9nV3JpdGVyIHtcblx0ZGVidWcobXNnOiBzdHJpbmcpOiB2b2lkXG5cdGluZm8obXNnOiBzdHJpbmcpOiB2b2lkXG5cdHdhcm4obXNnOiBzdHJpbmcpOiB2b2lkXG5cdGVycm9yKG1zZzogc3RyaW5nKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ0Zvcm1hdHRlciB7XG5cdERlYnVnKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHN0cmluZ1xuXHRJbmZvKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHN0cmluZ1xuXHRXYXJuKHRhZzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHN0cmluZ1xuXHRFcnJvcih0YWc6IHN0cmluZywgbXNnOiBzdHJpbmcpOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuXHR3OiBMb2dXcml0ZXJcblx0ZjogTG9nRm9ybWF0dGVyXG59XG5cbmV4cG9ydCBjbGFzcyBUaW1lRm9ybWF0dGVyIGltcGxlbWVudHMgTG9nRm9ybWF0dGVyIHtcbiAgRGVidWcodGFnOiBhbnksIG1zZzogYW55KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSBEZWJ1ZzogJHt0YWd9ICAtLS0+ICAke21zZ31gXG4gIH1cblxuICBFcnJvcih0YWc6IGFueSwgbXNnOiBhbnkpOiBzdHJpbmcge1xuXHRcdHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9IEVycm9yOiAke3RhZ30gIC0tLT4gICR7bXNnfWBcbiAgfVxuXG4gIEluZm8odGFnOiBhbnksIG1zZzogYW55KTogc3RyaW5nIHtcblx0XHRyZXR1cm4gYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSBJbmZvOiAke3RhZ30gIC0tLT4gICR7bXNnfWBcbiAgfVxuXG4gIFdhcm4odGFnOiBhbnksIG1zZzogYW55KTogc3RyaW5nIHtcblx0XHRyZXR1cm4gYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSBXYXJuOiAke3RhZ30gIC0tLT4gICR7bXNnfWBcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ29uc29sZUxvZ2dlcjogTG9nZ2VyID0ge1xuXHR3OiBjb25zb2xlLFxuXHRmOiBuZXcgVGltZUZvcm1hdHRlcigpXG59XG5cbi8qKlxuICog5pqC5rKh5pyJ5om+5YiwIGNvbnNvbGUuZGVidWcvaW5mby93YXJuL2Vycm9yIOexu+S8vCBza2lwIHN0YWNrIOeahOWKn+iDve+8jOaXoOazleWvuSBjb25zb2xlIOaWueazleWBmuS6jOasoVxuICog5bCB6KOF77yM5ZCm5YiZIGNvbnNvbGUg6L6T5Ye655qE5paH5Lu25ZCN5LiO6KGM5Y+36YO95piv5LqM5qyh5bCB6KOF5paH5Lu255qE5paH5Lu25ZCN5LiO6KGM5Y+377yM5LiN5pa55L6/5p+l55yL5pel5b+X5L+h5oGvXG4gKiAgdG9kbzog5piv5ZCm5pyJ5YW25LuW5Y+v6Z2g55qE5pa55byP5YGa5aaC5LiL55qE5pu/5o2iP1xuICogTG9nZ2VyLkRlYnVnKHRhZywgbXNnKSA9PiBMb2dnZXIudy5kZWJ1ZyhMb2dnZXIuZi5EZWJ1Zyh0YWcsIG1zZykpXG4gKlxuICovXG4iLCJcblxuZXhwb3J0IGZ1bmN0aW9uIFJhbmRvbUludChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuXHRtaW4gPSBNYXRoLmNlaWwobWluKTtcblx0bWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuXHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVuaXFGbGFnKCk6IHN0cmluZyB7XG5cdHJldHVybiBSYW5kb21JbnQoMHgxMDAwMDAwMCwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpLnRvU3RyaW5nKDE2KVxufVxuIiwiXG5leHBvcnQgY2xhc3MgVXRmOCB7XG4gIHB1YmxpYyByZWFkb25seSByYXc6IFVpbnQ4QXJyYXk7XG4gIHByaXZhdGUgcmVhZG9ubHkgaW5kZXhlczogQXJyYXk8bnVtYmVyPjtcbiAgcHJpdmF0ZSByZWFkb25seSBzdHI6c3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgYnl0ZUxlbmd0aDpudW1iZXI7XG4gIHB1YmxpYyByZWFkb25seSBsZW5ndGg6bnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBBcnJheUJ1ZmZlcnxzdHJpbmcpIHtcbiAgICB0aGlzLmluZGV4ZXMgPSBuZXcgQXJyYXk8bnVtYmVyPigpO1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5yYXcgPSBuZXcgVWludDhBcnJheShpbnB1dCk7XG4gICAgICB0aGlzLnN0ciA9IFwiXCJcbiAgICAgIGxldCB1dGY4aSA9IDA7XG4gICAgICB3aGlsZSAodXRmOGkgPCB0aGlzLnJhdy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5pbmRleGVzLnB1c2godXRmOGkpO1xuICAgICAgICBsZXQgY29kZSA9IFV0ZjgubG9hZFVURjhDaGFyQ29kZSh0aGlzLnJhdywgdXRmOGkpO1xuICAgICAgICB0aGlzLnN0ciArPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlKVxuICAgICAgICB1dGY4aSArPSBVdGY4LmdldFVURjhDaGFyTGVuZ3RoKGNvZGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5pbmRleGVzLnB1c2godXRmOGkpOyAgLy8gZW5kIGZsYWdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHIgPSBpbnB1dDtcblxuICAgICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgICBmb3IgKGxldCBjaCBvZiBpbnB1dCkge1xuICAgICAgICBsZW5ndGggKz0gVXRmOC5nZXRVVEY4Q2hhckxlbmd0aChjaC5jb2RlUG9pbnRBdCgwKSEpXG4gICAgICB9XG4gICAgICB0aGlzLnJhdyA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICBmb3IgKGxldCBjaCBvZiBpbnB1dCkge1xuICAgICAgICB0aGlzLmluZGV4ZXMucHVzaChpbmRleCk7XG4gICAgICAgIGluZGV4ID0gVXRmOC5wdXRVVEY4Q2hhckNvZGUodGhpcy5yYXcsIGNoLmNvZGVQb2ludEF0KDApISwgaW5kZXgpXG4gICAgICB9XG4gICAgICB0aGlzLmluZGV4ZXMucHVzaChpbmRleCk7IC8vIGVuZCBmbGFnXG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLmluZGV4ZXMubGVuZ3RoIC0gMTtcbiAgICB0aGlzLmJ5dGVMZW5ndGggPSB0aGlzLnJhdy5ieXRlTGVuZ3RoO1xuXG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBsb2FkVVRGOENoYXJDb2RlKGFDaGFyczogVWludDhBcnJheSwgbklkeDogbnVtYmVyKTogbnVtYmVyIHtcblxuICAgIGxldCBuTGVuID0gYUNoYXJzLmxlbmd0aCwgblBhcnQgPSBhQ2hhcnNbbklkeF07XG5cbiAgICByZXR1cm4gblBhcnQgPiAyNTEgJiYgblBhcnQgPCAyNTQgJiYgbklkeCArIDUgPCBuTGVuID9cbiAgICAgIC8qIChuUGFydCAtIDI1MiA8PCAzMCkgbWF5IGJlIG5vdCBzYWZlIGluIEVDTUFTY3JpcHQhIFNvLi4uOiAqL1xuICAgICAgLyogc2l4IGJ5dGVzICovIChuUGFydCAtIDI1MikgKiAxMDczNzQxODI0ICsgKGFDaGFyc1tuSWR4ICsgMV0gLSAxMjggPDwgMjQpXG4gICAgICArIChhQ2hhcnNbbklkeCArIDJdIC0gMTI4IDw8IDE4KSArIChhQ2hhcnNbbklkeCArIDNdIC0gMTI4IDw8IDEyKVxuICAgICAgKyAoYUNoYXJzW25JZHggKyA0XSAtIDEyOCA8PCA2KSArIGFDaGFyc1tuSWR4ICsgNV0gLSAxMjhcbiAgICAgIDogblBhcnQgPiAyNDcgJiYgblBhcnQgPCAyNTIgJiYgbklkeCArIDQgPCBuTGVuID9cbiAgICAgICAgLyogZml2ZSBieXRlcyAqLyAoblBhcnQgLSAyNDggPDwgMjQpICsgKGFDaGFyc1tuSWR4ICsgMV0gLSAxMjggPDwgMTgpXG4gICAgICAgICsgKGFDaGFyc1tuSWR4ICsgMl0gLSAxMjggPDwgMTIpICsgKGFDaGFyc1tuSWR4ICsgM10gLSAxMjggPDwgNilcbiAgICAgICAgKyBhQ2hhcnNbbklkeCArIDRdIC0gMTI4XG4gICAgICAgIDogblBhcnQgPiAyMzkgJiYgblBhcnQgPCAyNDggJiYgbklkeCArIDMgPCBuTGVuID9cbiAgICAgICAgICAvKiBmb3VyIGJ5dGVzICovKG5QYXJ0IC0gMjQwIDw8IDE4KSArIChhQ2hhcnNbbklkeCArIDFdIC0gMTI4IDw8IDEyKVxuICAgICAgICAgICsgKGFDaGFyc1tuSWR4ICsgMl0gLSAxMjggPDwgNikgKyBhQ2hhcnNbbklkeCArIDNdIC0gMTI4XG4gICAgICAgICAgOiBuUGFydCA+IDIyMyAmJiBuUGFydCA8IDI0MCAmJiBuSWR4ICsgMiA8IG5MZW4gP1xuICAgICAgICAgICAgLyogdGhyZWUgYnl0ZXMgKi8gKG5QYXJ0IC0gMjI0IDw8IDEyKSArIChhQ2hhcnNbbklkeCArIDFdIC0gMTI4IDw8IDYpXG4gICAgICAgICAgICArIGFDaGFyc1tuSWR4ICsgMl0gLSAxMjhcbiAgICAgICAgICAgIDogblBhcnQgPiAxOTEgJiYgblBhcnQgPCAyMjQgJiYgbklkeCArIDEgPCBuTGVuID9cbiAgICAgICAgICAgICAgLyogdHdvIGJ5dGVzICovIChuUGFydCAtIDE5MiA8PCA2KSArIGFDaGFyc1tuSWR4ICsgMV0gLSAxMjhcbiAgICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAvKiBvbmUgYnl0ZSAqLyBuUGFydDtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHB1dFVURjhDaGFyQ29kZShhVGFyZ2V0OiBVaW50OEFycmF5LCBuQ2hhcjogbnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIG5QdXRBdDogbnVtYmVyKTpudW1iZXIge1xuXG4gICAgbGV0IG5JZHggPSBuUHV0QXQ7XG5cbiAgICBpZiAobkNoYXIgPCAweDgwIC8qIDEyOCAqLykge1xuICAgICAgLyogb25lIGJ5dGUgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IG5DaGFyO1xuICAgIH0gZWxzZSBpZiAobkNoYXIgPCAweDgwMCAvKiAyMDQ4ICovKSB7XG4gICAgICAvKiB0d28gYnl0ZXMgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4YzAgLyogMTkyICovICsgKG5DaGFyID4+PiA2KTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKG5DaGFyICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgfSBlbHNlIGlmIChuQ2hhciA8IDB4MTAwMDAgLyogNjU1MzYgKi8pIHtcbiAgICAgIC8qIHRocmVlIGJ5dGVzICovXG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweGUwIC8qIDIyNCAqLyArIChuQ2hhciA+Pj4gMTIpO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiA2KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAobkNoYXIgJiAweDNmIC8qIDYzICovKTtcbiAgICB9IGVsc2UgaWYgKG5DaGFyIDwgMHgyMDAwMDAgLyogMjA5NzE1MiAqLykge1xuICAgICAgLyogZm91ciBieXRlcyAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHhmMCAvKiAyNDAgKi8gKyAobkNoYXIgPj4+IDE4KTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMTIpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDYpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArIChuQ2hhciAmIDB4M2YgLyogNjMgKi8pO1xuICAgIH0gZWxzZSBpZiAobkNoYXIgPCAweDQwMDAwMDAgLyogNjcxMDg4NjQgKi8pIHtcbiAgICAgIC8qIGZpdmUgYnl0ZXMgKi9cbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ZjggLyogMjQ4ICovICsgKG5DaGFyID4+PiAyNCk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDE4KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAxMikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gNikgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKG5DaGFyICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgfSBlbHNlIC8qIGlmIChuQ2hhciA8PSAweDdmZmZmZmZmKSAqLyB7IC8qIDIxNDc0ODM2NDcgKi9cbiAgICAgIC8qIHNpeCBieXRlcyAqL1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHhmYyAvKiAyNTIgKi8gKyAvKiAobkNoYXIgPj4+IDMwKSBtYXkgYmUgbm90IHNhZmUgaW4gRUNNQVNjcmlwdCEgU28uLi46ICovIChuQ2hhciAvIDEwNzM3NDE4MjQpO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiAyNCkgJiAweDNmIC8qIDYzICovKTtcbiAgICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4ODAgLyogMTI4ICovICsgKChuQ2hhciA+Pj4gMTgpICYgMHgzZiAvKiA2MyAqLyk7XG4gICAgICBhVGFyZ2V0W25JZHgrK10gPSAweDgwIC8qIDEyOCAqLyArICgobkNoYXIgPj4+IDEyKSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAoKG5DaGFyID4+PiA2KSAmIDB4M2YgLyogNjMgKi8pO1xuICAgICAgYVRhcmdldFtuSWR4KytdID0gMHg4MCAvKiAxMjggKi8gKyAobkNoYXIgJiAweDNmIC8qIDYzICovKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbklkeDtcblxuICB9O1xuXG4gIHByaXZhdGUgc3RhdGljIGdldFVURjhDaGFyTGVuZ3RoKG5DaGFyOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBuQ2hhciA8IDB4ODAgPyAxIDogbkNoYXIgPCAweDgwMCA/IDIgOiBuQ2hhciA8IDB4MTAwMDBcbiAgICAgID8gMyA6IG5DaGFyIDwgMHgyMDAwMDAgPyA0IDogbkNoYXIgPCAweDQwMDAwMDAgPyA1IDogNjtcbiAgfVxuXG5cbiAgLy8gcHJpdmF0ZSBzdGF0aWMgbG9hZFVURjE2Q2hhckNvZGUoYUNoYXJzOiBVaW50MTZBcnJheSwgbklkeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgLy9cbiAgLy8gICAvKiBVVEYtMTYgdG8gRE9NU3RyaW5nIGRlY29kaW5nIGFsZ29yaXRobSAqL1xuICAvLyAgIGxldCBuRnJzdENociA9IGFDaGFyc1tuSWR4XTtcbiAgLy9cbiAgLy8gICByZXR1cm4gbkZyc3RDaHIgPiAweEQ3QkYgLyogNTUyMzEgKi8gJiYgbklkeCArIDEgPCBhQ2hhcnMubGVuZ3RoID9cbiAgLy8gICAgIChuRnJzdENociAtIDB4RDgwMCAvKiA1NTI5NiAqLyA8PCAxMCkgKyBhQ2hhcnNbbklkeCArIDFdICsgMHgyNDAwIC8qIDkyMTYgKi9cbiAgLy8gICAgIDogbkZyc3RDaHI7XG4gIC8vIH1cbiAgLy9cbiAgLy8gcHJpdmF0ZSBzdGF0aWMgcHV0VVRGMTZDaGFyQ29kZShhVGFyZ2V0OiBVaW50MTZBcnJheSwgbkNoYXI6IG51bWJlciwgblB1dEF0OiBudW1iZXIpOm51bWJlciB7XG4gIC8vXG4gIC8vICAgbGV0IG5JZHggPSBuUHV0QXQ7XG4gIC8vXG4gIC8vICAgaWYgKG5DaGFyIDwgMHgxMDAwMCAvKiA2NTUzNiAqLykge1xuICAvLyAgICAgLyogb25lIGVsZW1lbnQgKi9cbiAgLy8gICAgIGFUYXJnZXRbbklkeCsrXSA9IG5DaGFyO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICAvKiB0d28gZWxlbWVudHMgKi9cbiAgLy8gICAgIGFUYXJnZXRbbklkeCsrXSA9IDB4RDdDMCAvKiA1NTIzMiAqLyArIChuQ2hhciA+Pj4gMTApO1xuICAvLyAgICAgYVRhcmdldFtuSWR4KytdID0gMHhEQzAwIC8qIDU2MzIwICovICsgKG5DaGFyICYgMHgzRkYgLyogMTAyMyAqLyk7XG4gIC8vICAgfVxuICAvL1xuICAvLyAgIHJldHVybiBuSWR4O1xuICAvLyB9XG4gIC8vXG4gIC8vIHByaXZhdGUgc3RhdGljIGdldFVURjE2Q2hhckxlbmd0aChuQ2hhcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgLy8gICByZXR1cm4gbkNoYXIgPCAweDEwMDAwID8gMSA6IDI7XG4gIC8vIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0cjtcbiAgfVxuXG4gIC8vIERlcHJlY2F0ZWRcbiAgcHVibGljIGNvZGVQb2ludEF0KGluZGV4OiBudW1iZXIpOkFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb2RlVW5pdEF0KGluZGV4KTtcbiAgfVxuXG4gIHB1YmxpYyBjb2RlVW5pdEF0KGluZGV4OiBudW1iZXIpOkFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5yYXcuc2xpY2UodGhpcy5pbmRleGVzW2luZGV4XSwgdGhpcy5pbmRleGVzW2luZGV4KzFdKTtcbiAgfVxuXG59XG5cblxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJcbmltcG9ydCB7Q2xpZW50LCB3aXRoQnJvd3Nlcn0gZnJvbSBcInRzLXN0cmVhbWNsaWVudFwiXG5pbXBvcnQge1VuaXFGbGFnfSBmcm9tIFwidHMteHV0aWxzXCJcbmltcG9ydCB7SnNvbn0gZnJvbSBcInRzLWpzb25cIlxuXG5sZXQgY2xpZW50OiBDbGllbnR8bnVsbCA9IG51bGxcbmxldCB1cmwgPSBcIlwiXG5cbmZ1bmN0aW9uIGhlYWRlcnMoY2FjaGU6IENhY2hlKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gIGxldCByZXQ6TWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKVxuICBsZXQga2V5OiBzdHJpbmcgPSBcIlwiXG5cbiAga2V5ID0gKCQoXCIja2V5MVwiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICBpZiAoa2V5ICE9PSBcIlwiKSB7XG4gICAgY2FjaGUua2V5MSA9IGtleVxuICAgIGNhY2hlLnZhbHVlMSA9ICgkKFwiI3ZhbHVlMVwiKS52YWwoKSBhcyBzdHJpbmcpLnRyaW0oKVxuICAgIHJldC5zZXQoa2V5LCBjYWNoZS52YWx1ZTEpXG4gIH0gZWxzZSB7XG4gICAgY2FjaGUua2V5MSA9IFwiXCJcbiAgICBjYWNoZS52YWx1ZTEgPSBcIlwiXG4gIH1cblxuICBrZXkgPSAoJChcIiNrZXkyXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gIGlmIChrZXkgIT09IFwiXCIpIHtcbiAgICBjYWNoZS5rZXkyID0ga2V5XG4gICAgY2FjaGUudmFsdWUyID0gKCQoXCIjdmFsdWUyXCIpLnZhbCgpIGFzIHN0cmluZykudHJpbSgpXG4gICAgcmV0LnNldChrZXksIGNhY2hlLnZhbHVlMilcbiAgfSBlbHNlIHtcbiAgICBjYWNoZS5rZXkyID0gXCJcIlxuICAgIGNhY2hlLnZhbHVlMiA9IFwiXCJcbiAgfVxuXG4gIGtleSA9ICgkKFwiI2tleTNcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgaWYgKGtleSAhPT0gXCJcIikge1xuICAgIGNhY2hlLmtleTMgPSBrZXlcbiAgICBjYWNoZS52YWx1ZTMgPSAoJChcIiN2YWx1ZTNcIikudmFsKCkgYXMgc3RyaW5nKS50cmltKClcbiAgICByZXQuc2V0KGtleSwgY2FjaGUudmFsdWUzKVxuICB9IGVsc2Uge1xuICAgIGNhY2hlLmtleTMgPSBcIlwiXG4gICAgY2FjaGUudmFsdWUzID0gXCJcIlxuICB9XG5cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBwcmludChzdHJpbmc6IHN0cmluZykge1xuICBsZXQgYm9keSA9ICQoXCIjb3V0cHV0XCIpO1xuICBib2R5LmFwcGVuZChcIjxwPlwiK3N0cmluZytcIjwvcD5cIik7XG59XG5mdW5jdGlvbiBwcmludFB1c2goc3RyaW5nOiBzdHJpbmcpIHtcbiAgbGV0IGJvZHkgPSAkKFwiI291dHB1dFwiKTtcbiAgYm9keS5hcHBlbmQoXCI8cCBzdHlsZT0nY29sb3I6IGNhZGV0Ymx1ZSc+XCIrc3RyaW5nK1wiPC9wPlwiKTtcbn1cbmZ1bmN0aW9uIHByaW50RXJyb3Ioc3RyaW5nOiBzdHJpbmcpIHtcbiAgbGV0IGJvZHkgPSAkKFwiI291dHB1dFwiKTtcbiAgYm9keS5hcHBlbmQoXCI8cCBzdHlsZT0nY29sb3I6IHJlZCc+XCIrc3RyaW5nK1wiPC9wPlwiKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmQoKSB7XG4gIGxldCB3c3MgPSAkKFwiI3dzc1wiKS52YWwoKVxuICBpZiAoY2xpZW50ID09PSBudWxsIHx8IHVybCAhPSB3c3MpIHtcbiAgICB1cmwgPSB3c3MgYXMgc3RyaW5nXG4gICAgY2xpZW50ID0gbmV3IENsaWVudCh3aXRoQnJvd3Nlcih1cmwpKVxuXHRcdGNsaWVudC5vblB1c2ggPSBhc3luYyAoZGF0YSk9Pntcblx0XHRcdHByaW50UHVzaChcInB1c2g6IFwiICsgZGF0YS50b1N0cmluZygpKVxuXHRcdH1cbiAgICBjbGllbnQub25QZWVyQ2xvc2VkID0gYXN5bmMgKGVycik9Pntcblx0XHRcdHByaW50RXJyb3IoYCR7ZXJyfWApXG5cdFx0fVxuICB9XG5cbiAgbGV0IGNhY2hlID0gbmV3IENhY2hlKClcbiAgY2FjaGUud3NzID0gdXJsXG5cbiAgY2FjaGUuZGF0YSA9ICQoXCIjcG9zdFwiKS52YWwoKSBhcyBzdHJpbmdcblxuXHQkKFwiI291dHB1dFwiKS5lbXB0eSgpXG5cbiAgbGV0IFtyZXQsIGVycl0gPSBhd2FpdCBjbGllbnQuU2VuZFdpdGhSZXFJZChjYWNoZS5kYXRhLCBoZWFkZXJzKGNhY2hlKSlcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJsYXN0XCIsIEpTT04uc3RyaW5naWZ5KGNhY2hlKSlcblxuICBpZiAoZXJyICE9PSBudWxsKSB7XG4gICAgaWYgKGVyci5pc0Nvbm5FcnIpIHtcbiAgICAgIHByaW50RXJyb3IoYGNvbm4tZXJyb3I6ICR7ZXJyfWApXG4gICAgfSBlbHNlIHtcbiAgICAgIHByaW50RXJyb3IoYHJlc3AtZXJyb3I6ICR7ZXJyfWApXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHByaW50KFwicmVzcCBzdHJpbmc6IFwiICsgcmV0LnRvU3RyaW5nKCkgKyBcIlxcbiAgPT0+ICB0byBqc29uOiBcIiArIEpTT04uc3RyaW5naWZ5KEpTT04ucGFyc2UocmV0LnRvU3RyaW5nKCkpKSlcbiAgICBjb25zb2xlLmxvZyhcInJlc3AtLS1qc29uOiBcIilcbiAgICBjb25zb2xlLmxvZyhKU09OLnBhcnNlKHJldC50b1N0cmluZygpKSlcbiAgfVxufVxuXG4kKFwiI3NlbmRcIikub24oXCJjbGlja1wiLCBhc3luYyAoKT0+e1xuICBhd2FpdCBzZW5kKClcbn0pXG5cbmNsYXNzIENhY2hlIHtcbiAgd3NzOiBzdHJpbmcgPSBcIlwiXG4gIGtleTE6IHN0cmluZyA9IFwiXCJcbiAgdmFsdWUxOiBzdHJpbmcgPSBcIlwiXG4gIGtleTI6IHN0cmluZyA9IFwiXCJcbiAgdmFsdWUyOiBzdHJpbmcgPSBcIlwiXG4gIGtleTM6IHN0cmluZyA9IFwiXCJcbiAgdmFsdWUzOiBzdHJpbmcgPSBcIlwiXG4gIGRhdGE6IHN0cmluZyA9IFwiXCJcbn1cblxuJCgoKT0+e1xuICBsZXQgY2FjaGVTID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXN0XCIpXG4gIGxldCBjYWNoZTogQ2FjaGVcbiAgaWYgKGNhY2hlUyA9PT0gbnVsbCkge1xuICAgIGNhY2hlID0gbmV3IENhY2hlKClcbiAgfSBlbHNlIHtcbiAgICBjYWNoZSA9IEpTT04ucGFyc2UoY2FjaGVTKSBhcyBDYWNoZVxuICB9XG5cbiAgJChcIiNrZXkxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS5rZXkxKVxuICAkKFwiI3ZhbHVlMVwiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUudmFsdWUxKVxuICAkKFwiI2tleTJcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLmtleTIpXG4gICQoXCIjdmFsdWUyXCIpLmF0dHIoXCJ2YWx1ZVwiLCBjYWNoZS52YWx1ZTIpXG4gICQoXCIja2V5M1wiKS5hdHRyKFwidmFsdWVcIiwgY2FjaGUua2V5MylcbiAgJChcIiN2YWx1ZTNcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLnZhbHVlMylcbiAgJChcIiN3c3NcIikuYXR0cihcInZhbHVlXCIsIGNhY2hlLndzcylcblx0JChcIiNwb3N0XCIpLnZhbChjYWNoZS5kYXRhKVxufSlcblxuY2xhc3MgUmV0dXJuUmVxIHtcblx0ZGF0YTogc3RyaW5nID0gXCJcIlxufVxuXG5mdW5jdGlvbiBpbml0QXR0cigpIHtcblx0JChcIiNrZXkxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcImFwaVwiKVxuXHQkKFwiI3ZhbHVlMVwiKS5hdHRyKFwidmFsdWVcIiwgXCJcIilcblx0JChcIiNrZXkyXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlwiKVxuXHQkKFwiI3ZhbHVlMlwiKS5hdHRyKFwidmFsdWVcIiwgXCJcIilcblx0JChcIiNrZXkzXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlwiKVxuXHQkKFwiI3ZhbHVlM1wiKS5hdHRyKFwidmFsdWVcIiwgXCJcIilcblx0JChcIiN3c3NcIikuYXR0cihcInZhbHVlXCIsIFwiMTI3LjAuMC4xOjgwMDFcIilcblx0JChcIiNwb3N0XCIpLnZhbChcIlwiKVxufVxuXG4kKFwiI3JldHVyblwiKS5vbihcImNsaWNrXCIsIGFzeW5jICgpPT57XG5cdGluaXRBdHRyKClcblx0JChcIiN2YWx1ZTFcIikuYXR0cihcInZhbHVlXCIsIFwicmV0dXJuXCIpXG5cdGxldCByZXEgPSBuZXcgUmV0dXJuUmVxKClcblx0cmVxLmRhdGEgPSBVbmlxRmxhZygpXG5cdCQoXCIjcG9zdFwiKS52YWwobmV3IEpzb24oKS50b0pzb24ocmVxKSlcbn0pXG5cblxuY2xhc3MgUHVzaFJlcSB7XG5cdHRpbWVzOiBudW1iZXIgPSAwXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIlxufVxuXG4kKFwiI3B1c2hcIikub24oXCJjbGlja1wiLCBhc3luYyAoKT0+e1xuXHRpbml0QXR0cigpXG5cdCQoXCIjdmFsdWUxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIlB1c2hMdDIwVGltZXNcIilcblx0bGV0IHJlcSA9IG5ldyBQdXNoUmVxKClcblx0cmVxLnRpbWVzID0gMTBcblx0cmVxLnByZWZpeCA9IFwidGhpcyBpcyBhIHB1c2ggdGVzdFwiXG5cdCQoXCIjcG9zdFwiKS52YWwobmV3IEpzb24oKS50b0pzb24ocmVxKSlcbn0pXG5cbiQoXCIjY2xvc2VcIikub24oXCJjbGlja1wiLCBhc3luYyAoKT0+e1xuXHRpbml0QXR0cigpXG5cdCQoXCIjdmFsdWUxXCIpLmF0dHIoXCJ2YWx1ZVwiLCBcImNsb3NlXCIpXG5cdCQoXCIjcG9zdFwiKS52YWwoXCJ7fVwiKVxufSlcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==