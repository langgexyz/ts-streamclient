import {AbstractWebSocketDriver, WebSocketProtocol} from "../src/websocket"
import {WebSocket} from "ws"
import {Duration, Second} from "ts-xutils"
import {Protocol} from "../src/protocol"

export class NodeWs extends AbstractWebSocketDriver {
	private websocket: WebSocket

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
		this.websocket.onclose = (ev)=>{
			this.onclose(ev)
		}
		this.websocket.onerror = (ev)=>{
			this.onerror({errMsg: ev.message})
		}
		this.websocket.onmessage = (ev)=>{
			if (typeof ev.data != "object" || !(ev.data instanceof ArrayBuffer)) {
				console.error("type error: ", ev.data)
				this.onerror({errMsg: `onmessege type error`})
				return
			}

			this.onmessage({data: ev.data})
		}
		this.websocket.onopen = (ev)=>{
			this.onopen(ev)
		}
	}
}

export function withNode(url: string, connectionTimeout: Duration = 30*Second): ()=>Protocol {
	return ()=>{
		return new WebSocketProtocol(url, (url:string)=>{
			return new NodeWs(url)
		}, connectionTimeout)
	}
}
