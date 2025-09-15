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
import { StmError } from "./error";
export declare class Request {
    private readonly buffer;
    get encodedData(): ArrayBuffer;
    get loadLen(): number;
    SetReqId(id: number): void;
    constructor(buffer: ArrayBuffer);
    static New(reqId: number, data: ArrayBuffer | string, headers: Map<string, string>): [Request, StmError | null];
}
export declare enum Status {
    OK = 0,
    Failed = 1
}
export declare class Response {
    static MaxNoLoadLen: number;
    readonly status: Status;
    readonly reqId: number;
    readonly data: ArrayBuffer;
    readonly pushId: number;
    get isPush(): boolean;
    constructor(reqId: number, st: Status, data: ArrayBuffer, pushId?: number);
    newPushAck(): [ArrayBuffer, StmError | null];
    static ZeroRes(): Response;
    static Parse(buffer: ArrayBuffer): [Response, StmError | null];
}
//# sourceMappingURL=fakehttp.d.ts.map