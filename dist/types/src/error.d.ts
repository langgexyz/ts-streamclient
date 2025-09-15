declare abstract class StmErrorBase extends Error {
    abstract isConnErr: boolean;
    abstract isTimeoutErr: boolean;
    abstract get toConnErr(): StmError;
    toString(): string;
}
export declare class ConnTimeoutErr extends StmErrorBase {
    message: string;
    name: string;
    isConnErr: boolean;
    isTimeoutErr: boolean;
    get toConnErr(): StmError;
    constructor(m: string);
}
export declare class ElseConnErr extends StmErrorBase {
    message: string;
    name: string;
    isConnErr: boolean;
    isTimeoutErr: boolean;
    get toConnErr(): StmError;
    constructor(m: string);
}
export declare class ElseTimeoutErr extends StmErrorBase {
    message: string;
    name: string;
    isConnErr: boolean;
    isTimeoutErr: boolean;
    get toConnErr(): StmError;
    constructor(m: string);
}
export declare class ElseErr extends StmErrorBase {
    message: string;
    name: string;
    cause: Error | null;
    isConnErr: boolean;
    isTimeoutErr: boolean;
    get toConnErr(): StmError;
    constructor(m: string, cause?: Error | null);
}
export type StmError = ElseErr | ElseTimeoutErr | ElseConnErr | ConnTimeoutErr;
export declare function isStmError(arg: any): arg is StmError;
export {};
//# sourceMappingURL=error.d.ts.map