(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElseErr = exports.ElseTimeoutErr = exports.ElseConnErr = exports.ConnTimeoutErr = void 0;
    exports.isStmError = isStmError;
    class StmErrorBase extends Error {
        toString() {
            return this.message;
        }
    }
    class ConnTimeoutErr extends StmErrorBase {
        get toConnErr() {
            return this;
        }
        constructor(m) {
            super();
            this.name = "ConnTimeoutErr";
            this.isConnErr = true;
            this.isTimeoutErr = true;
            this.message = m;
        }
    }
    exports.ConnTimeoutErr = ConnTimeoutErr;
    class ElseConnErr extends StmErrorBase {
        get toConnErr() {
            return this;
        }
        constructor(m) {
            super();
            this.name = "ElseConnErr";
            this.isConnErr = true;
            this.isTimeoutErr = false;
            this.message = m;
        }
    }
    exports.ElseConnErr = ElseConnErr;
    class ElseTimeoutErr extends StmErrorBase {
        get toConnErr() {
            return new ElseConnErr(this.message);
        }
        constructor(m) {
            super();
            this.name = "ElseTimeoutErr";
            this.isConnErr = false;
            this.isTimeoutErr = true;
            this.message = m;
        }
    }
    exports.ElseTimeoutErr = ElseTimeoutErr;
    class ElseErr extends StmErrorBase {
        get toConnErr() {
            return new ElseConnErr(this.message);
        }
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
    }
    exports.ElseErr = ElseErr;
    function isStmError(arg) {
        return arg instanceof StmErrorBase;
    }
});
//# sourceMappingURL=error.js.map