import {Client} from "../src/client"
import {withBrowser} from "../src/browserws"
import {testUrl} from "./local.properties"

function client(): Client {
	return new Client(withBrowser(testUrl))
}

function noConnClient():Client {
	return new Client(withBrowser("127.0.0.1:5000"))
}

test("new", ()=>{
	client()
})

test("close", async ()=>{
	await client().Close()
})

test("recoverErr", async ()=>{
	let c = noConnClient()
	let ret = await c.Recover()
	expect(ret?.isConnErr).toBeTruthy()
})

test("recover", async ()=>{
	let c = client()
	let ret = await c.Recover()
	expect(ret).toBeNull()
})

test("asyncRecover", async ()=>{
	let c= client()
	let ret = await Promise.all([c.Recover(), c.Recover(), c.Recover(), c.Recover()
		, c.Recover(), c.Recover(), c.Recover(), c.Recover(), c.Recover()])
	expect(ret[8]).toBeNull()
})

test("asyncRecoverErr", async ()=>{
	let c= noConnClient()
	let ret = await Promise.all([c.Recover(), c.Recover(), c.Recover(), c.Recover()
		, c.Recover(), c.Recover(), c.Recover(), c.Recover(), c.Recover()])
	expect(ret[8]?.isConnErr).toBeTruthy()
})

test("sendErr", async ()=>{
	let c = noConnClient()
	let headers = new Map<string, string>()
	headers.set("api", "/mega")
	let ret = await c.Send("{}", headers)
	expect(ret[1]?.isConnErr).toBeTruthy()
	ret = await c.Send("{}", headers)
	expect(ret[1]?.isConnErr).toBeTruthy()
	ret = await c.Send("{}", headers)
	expect(ret[1]?.isConnErr).toBeTruthy()
})

test("asyncSendErr", async ()=>{
	let c = noConnClient()
	let headers = new Map<string, string>()
	headers.set("api", "/mega")
	let arr = new Array<()=>Promise<void>>()
	for (let i = 0; i < 9; i++) {
		arr.push(async ()=>{
			let ret = await c.Send("{}", headers)
			expect(ret[1]?.isConnErr).toBeTruthy()
		})
	}

	await Promise.all(arr)
})

test("recoverClose", async ()=>{
	let c = client()
	let ret = await c.Recover()
	expect(ret).toBeNull()
	await c.Close()
})

