# ts-streamclient

stream client 2.0 for web，与 [go-stream](https://github.com/xpwu/go-stream) 配合使用。像使用短链接一样使用
长链接，支持自定义底层协议(此库已默认browser的 websocket 协议)，支持自定义 Log 的输出。

## 0、代码库的引用
```
"dependencies": {
    "ts-streamclient": "https://github.com/xpwu/ts-streamclient#semver:^2.x.x"
  },
```

## 1、基本使用
1、创建client，一个 client 对应一条长链接，在发送数据时自动连接
``` typescript
// browser websocket 协议
let client = new Client(withBrowser(xxx))
```

2、client.Send(xxx) 即可像短连接一样发送请求，同一个client上的所有
请求都是在一条连接中发送。

## 2、push / peerClosed
set client.onPush 即可设定推送的接收函数   
set client.onPeerClosed 即可设定网络被关闭时的接收函数，但主动
调用 client.close() 方法不会触发 onPeerClosed 事件

## 3、recover connection
如果不需要发送数据而仅需恢复网络，可以使用 client.Recover

## 4、Update protocol/options
client.UpdateProtocol 更新配置，下一次自动重连时，会使用新的配置

## 5、test case
拉取 test 代码，并需要在 test 文件夹下新建 local.properties.ts
文件，并添加如下内容:
```typescript
 export const testUrl = "ws://xxx.xxx.xxx.xxx:xx"
```
测试用例需要自己搭建 go-stream 服务[streamserver](https://github.com/xpwu/streamserver)，
并把上面的字段填写为对应服务器的设置。

## 6、browser test
拉取 browsertest 代码，浏览器打开 browsertest/dist/index.html ， `ws(s)`的值需要修改为自己搭建的 go-stream 服务，
其中的 key value 及 post 数据可以填写自己服务器的设定。

## 7、其他的类 web 平台
可以根据平台提供的 websocket 底层接口，实现 WebSocketDriver 接口即可使用此库，在 test 文件夹下有使用 node ws 的另一个实现。
