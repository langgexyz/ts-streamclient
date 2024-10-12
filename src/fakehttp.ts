
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

import {Utf8} from "ts-xutils";
import {ElseErr, StmError} from "./error"

export class Request {
  private readonly buffer: ArrayBuffer;

	get encodedData(): ArrayBuffer {return this.buffer}
	get loadLen(): number { return this.buffer.byteLength - 4}

	public SetReqId(id:number) {
		(new DataView(this.buffer)).setUint32(0, id);
	}

	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer
	}

	static New(reqId: number, data: ArrayBuffer|string, headers: Map<string,string>): [Request, StmError|null] {
    let len = 4;

    let headerArr = new Array<{key:Utf8, value:Utf8}>();
		let err: StmError|null = null
    headers.forEach((value: string, key: string, _: Map<string, string>)=>{
      let utf8 = {key: new Utf8(key), value: new Utf8(value)};
			if (utf8.key.byteLength > 255 || utf8.value.byteLength > 255) {
				err = new ElseErr(`key(${key})'s length or value(${value})'s length is more than 255`)
				return
			}
      headerArr.push(utf8);
      len += 1 + utf8.key.byteLength + 1 + utf8.value.byteLength;
    });
		if (err != null) {
			return [new Request(new ArrayBuffer(0)), err]
		}

    let body = new Utf8(data);
    len += 1 + body.byteLength;

		let ret = new Request(new ArrayBuffer(len))
		ret.SetReqId(reqId)

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

		return [ret, null]
  }
}

export enum Status {
  OK,
  Failed
}

export class Response {
	// reqid + status + pushid
	static MaxNoLoadLen = 4 + 1 + 4

  public readonly status: Status;
	public readonly reqId: number = 0
	public readonly data: ArrayBuffer
	public readonly pushId: number

	get isPush():boolean {
		return this.reqId == 1;
	}

	constructor(reqId: number, st: Status, data: ArrayBuffer, pushId: number = 0) {
		this.reqId = reqId
		this.status = st
		this.data = data
		this.pushId = pushId
	}

	public newPushAck(): [ArrayBuffer, StmError|null] {
		if (!this.isPush) {
			return [new ArrayBuffer(0), new ElseErr("invalid push data")]
		}

		let ret = new ArrayBuffer(4 + 1 + 4)
		let view = new DataView(ret)
		view.setUint32(0, 1)
		view.setUint8(4, 0)
		view.setUint32(5, this.pushId)

		return [ret, null]
	}

	public static ZeroRes(): Response {
		return new Response(0, Status.Failed, new ArrayBuffer(0))
	}

	public static Parse(buffer: ArrayBuffer): [Response, StmError|null] {
		if (buffer.byteLength < 5) {
			return [this.ZeroRes(), new ElseErr("fakehttp protocol err(response.size < 5).")]
		}
		let view = new DataView(buffer)

		let reqId = view.getUint32(0)
		let status = view.getUint8(4)==0 ? Status.OK : Status.Failed
		let pushId = 0

		let offset = 5
		if (reqId == 1) {
			if (buffer.byteLength < offset+4) {
				return [this.ZeroRes(), new ElseErr("fakehttp protocol err(response.size of push < 9).")]
			}
			pushId = view.getUint32(offset)
			offset += 4
		}

		let data = new ArrayBuffer(0)
		if (buffer.byteLength > offset) {
			data = new Uint8Array(buffer).slice(offset).buffer
		}

		return [new Response(reqId, status, data, pushId), null]
	}
}
