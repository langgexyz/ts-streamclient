import {Client} from "../src/client"
import {testUrl} from "./local.properties"
import {plainToClass, classToPlain, Expose} from "class-transformer"
import {asyncExe, Channel, withTimeout} from "ts-concurrency"
import {Second} from "ts-xutils"
import {withNode} from "./nodews"


class ReturnReq {
	data: string = ""
}

class ReturnRes {
	ret: string = ""
}

class PushReq {
	times: number = 0
	prefix: string = ""

	@Exclude()
	result: Set<string>|null = null
	check(str: string): boolean {
		if (this.result == null) {
			this.result = new Set()
			for (let i = 0; i < this.times; i++) {
				this.result.add(`${this.prefix}-${i}`)
			}
		}
		return  this.result.delete(str)
	}
}

function client(): Client {
	return new Client(withNode(testUrl))
}

test("sendOne", async ()=>{
	let c = client()
	let req = new ReturnReq()
	req.data = "dkjfeoxeoxoeyionxa;;'a"
	let headers = new Map<string, string>()
	headers.set("api", "return")
	let [ret, err] = await c.SendWithReqId(JSON.stringify(classToPlain(req)), headers)
	expect(err).toBeNull()
	let res = plainToClass(ReturnRes, JSON.parse(ret.toString()))
	expect(res.ret).toEqual(req.data)
	await c.Close()
})

test("sendMega", async ()=>{
	let c = client()
	let headers = new Map<string, string>()
	headers.set("api", "mega")
	let [_, err] = await c.SendWithReqId("{}", headers)
	expect(err != null).toBeTruthy()
	let ret = (err!.message == "response is too large") || (err!.message == "507 Insufficient Storage")
	expect(ret).toBeTruthy()
	await c.Close()
})

test("sendMore", async ()=>{
	let c = client()
	let headers = new Map<string, string>()
	headers.set("api", "return")
	let cases = [
		"woenkx",
		"0000今天很好",
		"kajiwnckajie",
		"val req = ReturnRequest(it)",
		"xpwu.kt-streamclient"
	]

	let sender = new Array<Promise<void>>()
	cases.forEach((value)=>{
		sender.push((async ()=>{
			let req = new ReturnReq()
			req.data = value
			let [ret, err] = await c.SendWithReqId(JSON.stringify(classToPlain(req)), headers)
			expect(err).toBeNull()
			let res = plainToClass(ReturnRes, JSON.parse(ret.toString()))
			expect(res.ret).toEqual(req.data)
		})())
	})

	await Promise.all(sender)
	await c.Close()
})

test("sendClose", async ()=>{
	let c = client()
	let ch = new Channel<boolean>()
	c.onPeerClosed = async ()=>{
		await ch.Send(true)
	}

	let headers = new Map<string, string>()
	headers.set("api", "close")

	asyncExe(async ()=>{
		let [ret, err] = await c.SendWithReqId("{}", headers)
		expect(err).toBeNull()
		expect(ret.toString()).toEqual("{}")
	})

	let rt = await withTimeout(5*Second, async ()=>{
		return (await ch.Receive())!
	})

	expect(rt).toBeTruthy()
	await c.Close()
})

test("sendPush", async ()=>{
	let c = client()
	let req = new PushReq()
	req.times = 3
	req.prefix = "this is a push test"
	let ch = new Channel<boolean>(req.times)
	c.onPush = async (msg)=>{
		console.log(msg.toString())
		await ch.Send(req.check(msg.toString()))
		if (req.result!.size == 0) {
			await ch.Close()
		}
	}

	let headers = new Map<string, string>()
	headers.set("api", "PushLt20Times")
	let [ret, err] = await c.SendWithReqId(JSON.stringify(classToPlain(req)), headers)
	expect(err).toBeNull()
	expect(ret.toString()).toEqual("{}")

	let rt = await withTimeout(30*Second, async ()=>{
		while (true) {
			let r = await ch.Receive()
			if (r == null) {
				break
			}

			if (!r) {
				return false
			}
		}

		return true
	})

	expect(rt).toBeTruthy()
	await c.Close()
})
