import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as Socket from 'socket.io';
import * as process from 'process';
import RoomManager from './websocket/RoomManager';
import * as HttpDataGet from './http/dataget';
import singleReceiveMsgTypes from './websocket/msgtype/singleReceiveMsgTypes';
import log4js from './logger';

export default class Server {
  private logger = log4js.getLogger('Server');

  public start = () => {
    this.catchException();

    const app = new Koa();
    const router = new Router();
    router.get('/api/room/:roomId/dyinfo', HttpDataGet.getRoomDyInfo);
    router.get('/api/room/:roomId/crawlrec', HttpDataGet.getCrawlRecord);
    router.get('/api/room/:roomId/highlightrec', HttpDataGet.getHighlightRecord);
    app.use(router.routes()).use(router.allowedMethods());

    const io = Socket(
      app.listen(3001, () => {
        this.logger.info('server listen on port 3001');
      })
    );
    io.on('connection', socket => {
      this.logger.info('new connection');
      new SocketUtil(socket).subscribeEvents();
    });
  };

  private catchException = () => {
    process.on('SIGINT', async () => {
      await RoomManager.removeAllRoom();
      this.logger.info('sigint exit');
      process.exit();
    });
  };
}

class SocketUtil {
  // receive a message, do the specific function
  private singleReceiveMsgFnMap: Map<singleReceiveMsgTypes, (...args: any[]) => void>;
  private socket: Socket.Socket;

  public constructor(socket: Socket.Socket) {
    this.socket = socket;
    // if you want to handle a new type of message from the client
    // you can add your solution below
    this.singleReceiveMsgFnMap = new Map<singleReceiveMsgTypes, (...args: any[]) => void>([
      [
        'add_room',
        async (roomId: string) => {
          await RoomManager.addRoom(roomId, this.socket);
        }
      ],
      [
        'start_crawl',
        () => {
          RoomManager.startRoomCrawlProcess(this.socket);
        }
      ],
      [
        'stop_crawl',
        async () => {
          await RoomManager.stopRoomCrawlProcess(this.socket);
        }
      ],
      [
        'add_keyword',
        async (keyword: string) => {
          await RoomManager.addKeyword(this.socket, keyword);
        }
      ],
      [
        'delete_keyword',
        async (keyword: string) => {
          await RoomManager.deleteKeyword(this.socket, keyword);
        }
      ],
      [
        'disconnect',
        async () => {
          await RoomManager.removeRoom(this.socket);
        }
      ],
      [
        'request_send_dm',
        () => {
          RoomManager.startPeriodlySendBarrages(this.socket);
        }
      ],
      [
        'stop_send_dm',
        () => {
          RoomManager.stopPeriodlySendBarrages(this.socket);
        }
      ],
      [
        'add_highlight_record',
        async () => {
          await RoomManager.addHighlightRecord(this.socket);
        }
      ]
    ]);
  }

  public subscribeEvents = () => {
    for (const [msg, fn] of this.singleReceiveMsgFnMap) {
      this.socket.on(msg, fn);
    }
  };
}
