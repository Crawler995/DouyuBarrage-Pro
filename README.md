# DouyuBarrage-Pro

比[第一个版本DouyuBarrage]( https://github.com/Crawler995/DouyuBarrage )**功能更加强大智能、界面更加易用、可视化更加科学**！（第一个版本其实是用来试水的，为了验证这个想法的可行性。没想到的是收到了那么一点点的star，这激励我要把这个项目做好、做完整，不能辜负大家的期望。这个版本有两位知乎朋友在认真的使用、反馈问题，非常感谢！）

目前已基本可以使用，不排除还有莫名奇妙的问题，欢迎反馈。

**起飞~~~**

[![2020-03-19-140649.jpg](https://i.postimg.cc/vm451RbX/2020-03-19-140649.jpg)](https://postimg.cc/CZVRtQZf)

[![2020-03-19-135721.jpg](https://i.postimg.cc/zf4KKdfN/2020-03-19-135721.jpg)](https://postimg.cc/TyqKXJmN)

[![2020-03-19-140456.jpg](https://i.postimg.cc/zDKSS1Wc/2020-03-19-140456.jpg)](https://postimg.cc/K4cMxw0P)

[![2020-03-19-140521.jpg](https://i.postimg.cc/xTQG6F3T/2020-03-19-140521.jpg)](https://postimg.cc/kDjt4sHk)

[![2020-03-19-141017.jpg](https://i.postimg.cc/Jz4NLDFf/2020-03-19-141017.jpg)](https://postimg.cc/pp4hQTRC)

[![2020-03-19-140618.jpg](https://i.postimg.cc/KjPPZnx2/2020-03-19-140618.jpg)](https://postimg.cc/9wfRbwD8)

[![2020-03-19-140726.jpg](https://i.postimg.cc/Fsxy8gTb/2020-03-19-140726.jpg)](https://postimg.cc/YhhLmgKj)

[![2020-03-19-140827.jpg](https://i.postimg.cc/MpPyKZ2v/2020-03-19-140827.jpg)](https://postimg.cc/NKXydc0c)

## 功能

1. 开始/暂停抓取弹幕
2. 开启/关闭弹幕墙，支持弹幕飘过速度、弹幕字体大小、透明度等设置
3. 抓取弹幕记录查询、下载指定抓取记录所抓取的弹幕、下载全部弹幕
4. 自定义关键词统计
5. 铁粉（发送弹幕最多）统计
6. 高光时刻实时自动捕获、记录、查询、下载高光时刻弹幕
7. 弹幕发送速度实时可视化
8. 高频弹幕词云
9. ……待补充

## 运行

### 运行之前

1. 确认已安装`node.js`、`mysql`
2. `mysql`中创建数据库`create database dybarrage_pro;`
3. `mysql`中增加最大连接数`set GLOBAL max_connections=200;`（若在使用过程中出现`too many connections`错误，则继续增大最大连接数，这与你所抓取的直播间数量、流量有关）
4. 打开`dybarrage-server/src`中的`config.ts`文件，修改数据库连接用户名、密码

### 安装依赖

```bash
# dybarrage-server
npm install
# dybarrage-web
npm install
```

### 运行

```bash
# dybarrage-server
npm start
# dybarrage-web
npm start

# 若出现报错，应该是全局依赖没有装上，比如react-app-rewired、cross-env等，使用npm install <包名> -g安装即可，如npm install react-app-rewired -g
```


## 技术栈

All `TypeScript`！

> Any application that can be written in JavaScript, will eventually be written in JavaScript.  --Jeff Atwood

### 前端

`TypeScript, React, Ant Design, ECharts, socket.io-client, Axios`

### 后端

`TypeScript, Koa, Axios, socket.io, sequelize, MySQL, json-csv`

## 通讯

### WebSocket

1. 客户端发出单次消息

| 消息类型               | 说明                           | 携带数据 | 时机                                              |
| ---------------------- | ------------------------------ | -------- | ------------------------------------------------- |
| `add_room`             | 用于表明客户端身份（即房间号） | 房间号   | 客户端连接上服务器后发出                          |
| `start_crawl`          | 用于命令服务端开始抓取弹幕     |          | 用户在客户端点击“开始抓取”按钮后发出              |
| `stop_crawl`           | 用于命令服务端停止抓取弹幕     |          | 用户在客户端点击“停止抓取”按钮后发出              |
| `add_keyword`          | 用于命令服务端增加统计关键词   | 关键词   | 用户在客户端“关键词统计”界面增加关键词后发出      |
| `delete_keyword`       | 用于命令服务端删除统计关键词   | 关键词   | 用户在客户端“关键词统计”界面删除关键词后发出      |
| `request_send_dm`      | 用于命令服务端开始推送弹幕信息 |          | 用户在客户端打开弹幕墙后发出                      |
| `stop_send_dm`         | 用于命令服务端停止推送弹幕信息 |          | 用户在客户端关闭弹幕墙后发出                      |
| `add_highlight_record` | 用于命令服务端记录高光时刻     |          | 客户端在捕捉到高光时刻后发出                      |
| `disconnect`           | 用于告知服务端客户端已断开连接 | 断开原因 | 客户端在断开连接后发出（由`socket.io`库自动发出） |

2. 服务端回应单次消息

| 消息类型                 | 说明                             | 携带数据 | 时机                                                         |
| ------------------------ | -------------------------------- | -------- | ------------------------------------------------------------ |
| `add_room_success`       | 用于告知客户端已成功加入服务端   |          | 服务端成功将客户端加入`RoomManager`后发出                    |
| `add_room_failed`        | 用于告知客户端加入服务端失败     | 失败原因 | 服务端无法将客户端加入`RoomManager`后发出，可能原因有：已存在相同房间号的客户端等 |
| `start_crawl_success`    | 用于告知客户端已成功开始爬取弹幕 |          | 服务端成功启动弹幕抓取socket后发出                           |
| `start_crawl_failed`     | 用于告知客户端未能开始爬取弹幕   | 失败原因 | 服务端尝试启动弹幕抓取socket失败后发出，可能原因未知         |
| `crawl_failed`           | 用于告知客户端在抓取过程中出错   | 失败原因 | 服务端在爬取弹幕过程中socket出错，可能原因未知               |
| `stop_crawl_success`     | 用于告知客户端停止抓取成功       |          | 服务器在成功停止抓取后发出                                   |
| `stop_crawl_failed`      | 用于告知客户端停止抓取失败       | 失败原因 | 服务器在停止抓取失败后发出                                   |
| `add_keyword_success`    | 用于告知客户端添加关键词成功     |          | 服务器在成功添加关键词后发出                                 |
| `add_keyword_failed`     | 用于告知客户端添加关键词失败     | 失败原因 | 服务器在添加关键词失败后发出                                 |
| `delete_keyword_success` | 用于告知客户端删除关键词成功     |          | 服务器在成功删除关键词后发出                                 |
| `delete_keyword_failed`  | 用于告知客户端删除关键词失败     | 失败原因 | 服务器在删除关键词失败后发出                                 |

3. 服务端推送周期性实时数据

用于服务器周期或单次推送给客户端，用于实时或初始化更新客户端界面的数据，目前周期推送速度设定为`2s/次`。

| 消息类型           | 说明                                           | 时机                                                         |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| `crawl_basic_stat` | 用于更新客户端“基本情况”页面中的“弹幕基本信息” | 1. 客户端发送`add_room`，且服务器返回`add_room_success`后推送一次，用于初始化界面；<br>2. 客户端发送`start_crawl`，且服务器返回`start_crawl_success`后开始周期推送<br>3. 客户端发送`stop_crawl`，且服务器返回`stop_crawl_success`后停止推送 |
| `keyword_stat`     | 用于更新客户端“关键词统计”页面                 | 1. 客户端发送`add_room`，且服务器返回`add_room_success`后推送一次，用于初始化界面；<br/>2. 客户端发送`add_keyword`，且服务器返回`add_keyword_success`后推送一次，用于更新界面；<br>3. 客户端发送`delete_keyword`，且服务器返回`delete_keyword_success`后推送一次，用于更新界面；<br>4. 客户端发送`start_crawl`，且服务器返回`start_crawl_success`后开始周期推送<br>5. 客户端发送`stop_crawl`，且服务器返回`stop_crawl_success`后停止推送 |
| `dmsendv_data`     | 用于更新客户端“实时弹幕发送速度”页面中的图表   | 1. 客户端发送`start_crawl`，且服务器返回`start_crawl_success`后开始周期推送；<br>2. 客户端发送`stop_crawl`，且服务器返回`stop_crawl_success`后停止推送 |
| `cur_dm`           | 用于更新客户端弹幕墙中的弹幕                   | 1. 客户端发送`request_send_dm`后开始周期推送；<br>2. 客户端发送`stop_send_dm`后停止推送 |

