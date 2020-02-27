import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as Socket from 'socket.io';
import * as process from 'process';
import RoomManager from './websocket/RoomManager';

import * as HttpDataGet from './http/dataget';
import singleReceiveMsgTypes from './websocket/msgtype/singleReceiveMsgTypes';
import log4js from './logger';

const logger = log4js.getLogger('server');

process.on('SIGINT', async () => {
  await RoomManager.removeAllRoom();
  logger.info('exit');
  process.exit();
});

const app = new Koa();

// http server
const router = new Router();
router.get('/api/room/:roomId/dyinfo', HttpDataGet.getRoomDyInfo);
router.get('/api/room/:roomId/crawlrec', HttpDataGet.getCrawlRecord);
app
.use(router.routes())
.use(router.allowedMethods());

// websocket server
const io = Socket(app.listen(3001, () => {
  logger.info('server listen on port 3001');
}));
class SocketUtil {
  private singleReceiveMsgFnMap: Map<singleReceiveMsgTypes, (...args: any[]) => void>;

  constructor(private socket: Socket.Socket) {
    this.socket = socket;
    this.singleReceiveMsgFnMap = new Map<singleReceiveMsgTypes, (...args: any[]) => void>([
      ['add_room', async (roomId: string) => {
        await RoomManager.addRoom(roomId, this.socket);
      }],
      ['start_crawl', () => {
        RoomManager.startRoomCrawlProcess(this.socket);
      }],
      ['stop_crawl', () => {
        RoomManager.stopRoomCrawlProcess(this.socket);
      }],
      ['add_keyword', async (keyword: string) => {
        await RoomManager.addKeyword(this.socket, keyword);
      }],
      ['delete_keyword', async (keyword: string) => {
        await RoomManager.deleteKeyword(this.socket, keyword);
      }],
      ['disconnect', () => {
        RoomManager.removeRoom(this.socket);
      }]
    ]);
  }

  subscribeEvents = () => {
    for(const [msg, fn] of this.singleReceiveMsgFnMap) {
      this.socket.on(msg, fn);
    }
  }
}
io.on('connection', (socket) => {
  logger.info('new connection');

  new SocketUtil(socket).subscribeEvents();
});