import {AbstractWebSocketDriver, WebSocketProtocol} from "./websocket"
import {Duration, Second} from "ts-xutils"
import {Protocol} from "./protocol"


export class BrowserWs extends AbstractWebSocketDriver {
	private websocket: WebSocket;

	close(code?: number, reason?: string): void {
		this.websocket.close(code, reason)
	}

	send(data: ArrayBuffer): void {
		this.websocket.send(data)
	}

	constructor(url: string) {
		super()

		this.websocket = new WebSocket(url)
		this.websocket.binaryType = "arraybuffer"
		this.websocket.onclose = (ev: CloseEvent)=>{
			this.onclose(ev)
		}
		this.websocket.onerror = (ev: Event)=>{
			this.onerror({errMsg: "BrowserWebSocket onerror: " + ev.toString()})
		}
		this.websocket.onmessage = (ev: MessageEvent)=>{
			this.onmessage(ev)
		}
		this.websocket.onopen = (ev: Event)=>{
			this.onopen(ev)
		}
	}
}

export function withBrowser(url: string, connectionTimeout: Duration = 30*Second): ()=>Protocol {
	return ()=>{
		return new WebSocketProtocol(url, (url:string)=>{
			return new BrowserWs(url)
		}, connectionTimeout)
	}
}

