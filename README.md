# DouyuBarrage-Pro

比[第一个版本DouyuBarrage]( https://github.com/Crawler995/DouyuBarrage )**功能更加强大智能、界面更加易用、可视化更加科学**、代码更加整洁！（当然第一个版本其实也不错的，可以先用着）

正在开发中：进度 ===> 90% 尽请期待，预计一周之内发布！

下图展示了"**弹幕墙、弹幕实时发送速度可视化、高光时刻自动捕获**"等功能（弹幕可关闭或者调整透明度，嫌弹幕扰乱眼睛的不用担心）。2020年3月1日下午16点10分，著名主播大司马剑姬被石头人单杀，完成究极下饭操作，直播间瞬间爆炸，于是此刻弹幕发送速度曲线陡增、弹幕墙突增大量弹幕，管理中心自动捕获到了此次高光时刻。

[![2020-03-01-161106.jpg](https://i.postimg.cc/vZ4SNCtn/2020-03-01-161106.jpg)](https://postimg.cc/bZjTGCMY)

## 功能

1. 开始/暂停抓取弹幕
2. 开启/关闭弹幕墙，支持弹幕飘过速度、弹幕字体大小、透明度等设置
3. 抓取弹幕记录查询、下载指定抓取记录所抓取的弹幕、下载全部弹幕
4. 自定义关键词统计
5. 铁粉（发送弹幕最多）及其所发弹幕统计
6. 高光时刻实时自动捕获、记录、查询、下载高光时刻弹幕
7. 弹幕发送速度实时可视化
8. 弹幕发送者等级与发送弹幕数量实时关系图
9. 弹幕发送者所带徽章（牌子）与发送弹幕实时数量关系图
10. 高频弹幕词云
11. ……待补充

## 性能

### 前端

2020年3月2日晚，于斗鱼房间12306测试一小时，抓取弹幕一万余条：

[![2020-03-02-192903.jpg](https://i.postimg.cc/vHqNXGfM/2020-03-02-192903.jpg)](https://postimg.cc/ykRj84Lr)

内存与CPU占用情况如下（正好开了一个Ant Design的官网，可见其实此项目连续运行一小时的内存占用还没有一个Ant Design的官网高）：

[![2020-03-02-192952.jpg](https://i.postimg.cc/Nffn1Kyp/2020-03-02-192952.jpg)](https://postimg.cc/grQ4pkHZ)

对CPU占用率有所顾忌？本人机器CPU：`i5-5200U`（大概七八年前的CPU吧），为了进行对比，打开斗鱼直播间12306页面，CPU占用率如下，对比起来一目了然：

[![2020-03-02-193422.jpg](https://i.postimg.cc/nV15j4LX/2020-03-02-193422.jpg)](https://postimg.cc/14fMbNwS)

经过这次粗略的测试，至少可以得出此项目前端性能尚可，没有严重的内存无端占用或泄露现象，在频繁的数据交换处理中CPU占用率处在可接受范围。

### 后端

一般来说，英雄联盟直播间的弹幕发送速度峰值在20-40左右，在英雄联盟直播间的测试没有出现过问题。

感谢一位帮我热心测试的用户，在他测试抓取旭旭宝宝直播间（弹幕发送速度峰值能达到100-200+）的时候后端会出现莫名其妙的问题，初步推断是流量过高造成的问题，目前正在排查原因中。破百的弹幕发送速度属实离谱，DNF还是猛啊。

[![2020-03-04-223501.jpg](https://i.postimg.cc/8kBdm0FS/2020-03-04-223501.jpg)](https://postimg.cc/8scr1wBK)


## 技术栈

All `TypeScript`！

> Any application that can be written in JavaScript, will eventually be written in JavaScript.  --Jeff Atwood

### 前端

`TypeScript, React, Ant Design, ECharts, socket.io-client, Axios`

### 后端

`TypeScript, Koa, Axios, socket.io, sequelize, MySQL`

## 通讯

### WebSocket

1. 在客户端初始化完成时

   | 事件             | 发出者 | 携带信息 | 意义                                                     |
   | ---------------- | ------ | -------- | -------------------------------------------------------- |
   | add_room         | 客户端 | 房间号   | 表示有一个新客户端请求加入                               |
   | add_room_success | 服务端 |          | 表示请求加入成功                                         |
   | add_room_failed  | 服务端 | 错误信息 | 表示请求加入失败<br>可能原因：已有相同房间号的客户端加入 |
   | crawl_basic_stat | 服务端 | 抓取弹幕总数、此次抓取弹幕数、<br>抓取总时间、此次抓取时间 | 用于初始化客户端UI  |
   | keyword_stat     | 服务端 | 关键词总出现数量、关键词此次出现数量                       | 用于初始化客户端UI   |
   | dmsendv_data     | 服务端 | 120秒内的弹幕发送速度                                      | 用于初始化图表UI    |
   | dmlevel_data     | 服务端 | 弹幕发送者等级与发送弹幕数量                               | 用于初始化图表UI |

2. 在用户点击“开始抓取”按钮时

   | 事件                | 发出者 | 携带信息 | 意义                                                   |
   | ------------------- | ------ | -------- | ------------------------------------------------------ |
   | start_crawl         | 客户端 |          | 表示请求开始抓取弹幕                                   |
   | start_crawl_success | 服务端 |          | 表示请求开始抓取弹幕成功                               |
   | start_crawl_failed  | 服务端 | 错误信息 | 表示请求开始抓取弹幕失败<br>可能原因：还未成功加入房间 |
   
3. 服务端抓取弹幕时

   | 事件         | 发出者 | 携带信息 | 意义                                         |
   | ------------ | ------ | -------- | -------------------------------------------- |
   | crawl_failed | 服务端 | 错误信息 | 表示抓取过程中出现错误<br>可能原因：网络断开 |
   
4. 传输周期实时数据

   | 事件             | 发出者 | 携带信息                                                   | 意义                         |
   | ---------------- | ------ | ---------------------------------------------------------- | ---------------------------- |
   | crawl_basic_stat | 服务端 | 抓取弹幕总数、此次抓取弹幕数、<br>抓取总时间、此次抓取时间 | 用于更新客户端显示的实时数据 |
   | keyword_stat     | 服务端 | 关键词总出现数量、关键词此次出现数量                       | 用于更新客户端显示的实时数据 |
   | dmsendv_data     | 服务端 | 120秒内的弹幕发送速度                                      | 用于更新客户端图表           |
   | dmlevel_data     | 服务端 | 弹幕发送者等级与发送弹幕数量                               | 用于更新客户端图表           |
   | cur_dm           | 服务端 | 前一秒之内的弹幕信息                                       | 用于更新客户端弹幕列表       |
   
5. 用户在点击“添加关键词”或“删除关键词”按钮时

   | 事件                   | 发出者 | 携带信息                                 | 意义                                 |
   | ---------------------- | ------ | ---------------------------------------- | ------------------------------------ |
   | add_keyword            | 客户端 | 关键词                                   | 表示添加一个关键词                   |
   | add_keyword_success    | 服务端 |                                          | 表示添加关键词成功                   |
   | add_keyword_failed     | 服务端 |                                          | 表示添加关键词失败<br>可能原因：未知 |
   | delete_keyword         | 客户端 | 关键词                                   | 表示删除一个关键词                   |
   | delete_keyword_success | 服务端 |                                          | 表示删除关键词成功                   |
   | delete_keyword_failed  | 服务端 |                                          | 表示删除关键词失败<br>可能原因：未知 |
   | keyword_stat           | 服务端 | 关键词总出现数量、<br>关键词此次出现数量 | 用于更新客户端UI                     |
   
6. 在用户点击“停止抓取”按钮时

   | 事件               | 发出者 | 携带信息 | 意义                                                       |
   | ------------------ | ------ | -------- | ---------------------------------------------------------- |
   | stop_crawl         | 客户端 |          | 表示请求停止抓取弹幕                                       |
   | stop_crawl_success | 服务端 |          | 表示请求停止抓取弹幕成功                                   |
   | stop_crawl_failed  | 服务端 | 错误信息 | 表示请求停止抓取弹幕失败<br>可能原因：在未开始之前请求停止 |



