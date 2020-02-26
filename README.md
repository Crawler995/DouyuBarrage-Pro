# DouyuBarrage-Pro

All `TypeScript`！

> Any application that can be written in JavaScript, will eventually be written in JavaScript.  --Jeff Atwood

使用`WebSocket`与`HTTP`双重传输数据，降低性能消耗；

比[第一个版本DouyuBarrage]( https://github.com/Crawler995/DouyuBarrage )功能更加强大智能、界面更加易用、可视化更加科学、代码更加整洁！（当然第一个版本其实也不错的，可以先用着）

正在开发中：进度 ===> 20% 尽请期待，预计两周之内发布！

## 技术栈

### 前端

`TypeScript, React, Ant Design, ECharts, socket.io-client, Axios`

### 后端

`TypeScript, Koa, Axios, socket.io, sequelize, MySQL`

## 通讯

### WebSocket

1. 添加房间

   时机：在客户端初始化完成时

   | 事件             | 发出者 | 携带信息 | 意义                                                     |
   | ---------------- | ------ | -------- | -------------------------------------------------------- |
   | add_room         | 客户端 | 房间号   | 表示有一个新客户端请求加入                               |
   | add_room_success | 服务端 |          | 表示请求加入成功                                         |
   | add_room_failed  | 服务端 | 错误信息 | 表示请求加入失败<br>可能原因：已有相同房间号的客户端加入 |

2. 请求开始抓取弹幕

   时机：在用户点击“开始抓取”按钮时

   | 事件                | 发出者 | 携带信息 | 意义                                                   |
   | ------------------- | ------ | -------- | ------------------------------------------------------ |
   | start_crawl         | 客户端 |          | 表示请求开始抓取弹幕                                   |
   | start_crawl_success | 服务端 |          | 表示请求开始抓取弹幕成功                               |
   | start_crawl_failed  | 服务端 | 错误信息 | 表示请求开始抓取弹幕失败<br>可能原因：还未成功加入房间 |
   
3. 抓取弹幕时意外情况

   时机：服务端抓取弹幕时
   
   | 事件         | 发出者 | 携带信息 | 意义                                         |
   | ------------ | ------ | -------- | -------------------------------------------- |
   | crawl_failed | 服务端 | 错误信息 | 表示抓取过程中出现错误<br>可能原因：网络断开 |
   
4. 传输周期实时数据

   时机：服务端回应客户端`add_room_success`后传输一次，用于客户端相关界面初始化；服务端回应客户端`start_crawl_success`后开始周期传输

   | 事件             | 发出者 | 携带信息                                                   | 意义                   |
   | ---------------- | ------ | ---------------------------------------------------------- | ---------------------- |
   | crawl_basic_stat | 服务端 | 抓取弹幕总数、此次抓取弹幕数、<br>抓取总时间、此次抓取时间 | 表示抓取情况的基本统计 |

5. 请求停止抓取弹幕

   时机：在用户点击“停止抓取”按钮时

   | 事件               | 发出者 | 携带信息 | 意义                                                       |
   | ------------------ | ------ | -------- | ---------------------------------------------------------- |
   | stop_crawl         | 客户端 |          | 表示请求停止抓取弹幕                                       |
   | stop_crawl_success | 服务端 |          | 表示请求停止抓取弹幕成功                                   |
   | stop_crawl_failed  | 服务端 | 错误信息 | 表示请求停止抓取弹幕失败<br>可能原因：在未开始之前请求停止 |



