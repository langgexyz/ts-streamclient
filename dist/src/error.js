class StmErrorBase extends Error {
    toString() {
        return this.message;
    }
}
export class ConnTimeoutErr extends StmErrorBase {
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
export class ElseConnErr extends StmErrorBase {
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
export class ElseTimeoutErr extends StmErrorBase {
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
export class ElseErr extends StmErrorBase {
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
export function isStmError(arg) {
    return arg instanceof StmErrorBase;
}
//# sourceMappingURL=error.js.map