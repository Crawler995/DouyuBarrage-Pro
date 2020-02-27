import * as WebSocket from 'ws';
import RawMessageHandler from './RawMessageHandler';
import Barrage from '../../model/Barrage';
import moment = require('moment');
import RoomManager from '../RoomManager';
import log4js from '../../logger';

// Douyu Barrage Crawler
// detail
// https://zhuanlan.zhihu.com/p/106697646
// https://zhuanlan.zhihu.com/p/107200326

interface WSUtil {
  ws: WebSocket,
  heartbeatInterval: any
}

class DmCrawler {
  private crawlerWSUtilMap: Map<string, WSUtil>;
  private logger = log4js.getLogger('DmCrawler');

  constructor() {
    this.crawlerWSUtilMap = new Map<string, WSUtil>();
  }

  public addCrawler = (roomId: string) => {
    const crawlerWs = new WebSocket('wss://danmuproxy.douyu.com:8506/');

    crawlerWs.onerror = (ev) => {
      const socket = RoomManager.getSocketByRoomId(roomId);
      this.logger.error('crawler error: ' + ev.message);
      if(socket === undefined) {
        return;
      }

      RoomManager.singleEmitClient(socket, 'crawl_failed', '爬取弹幕出错 ' + ev.message);
      RoomManager.stopRoomCrawlProcess(socket);
    }
    
    crawlerWs.onopen = () => {
      this.logger.info(`room ${roomId} start crawling successfully`);
      // start to send heartbeat to Douyu server
      const heartbeatInterval = this.prepareReceiveDm(crawlerWs, roomId);
      this.crawlerWSUtilMap.set(roomId, {
        ws: crawlerWs,
        heartbeatInterval
      });
    }

    crawlerWs.onmessage = (ev: WebSocket.MessageEvent) => {
      const buf: Buffer = ev.data as Buffer;
      // convert Buffer to parsed and readable msg obj
      const msgsObj = RawMessageHandler.getMsgsObj(buf);
      msgsObj.forEach(msgObj => {
        // insert Barrage to database
        Barrage.upsert({
          id: msgObj.cid,
          time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          room_id: msgObj.rid,
          sender_name: msgObj.nn,
          sender_level: parseInt(msgObj.level),
          sender_avatar_url: msgObj.ic,
          dm_content: msgObj.txt,
          badge_name: msgObj.bnn === '' ? null : msgObj.bnn,
          badge_level: msgObj.bl === '0' ? null : parseInt(msgObj.bl)
        })
      });
    }
  }

  // login and join group
  private prepareReceiveDm = (crawlerWs: WebSocket, roomId: string) => {
    crawlerWs.send(RawMessageHandler.encode(`type@=loginreq/room_id@=${roomId}/dfl@=sn@A=105@Sss@A=1/username@=61609154/uid@=61609154/ver@=20190610/aver@=218101901/ct@=0/`));
    crawlerWs.send(RawMessageHandler.encode(`type@=joingroup/rid@=${roomId}/gid@=-9999/`));
    return this.sendHeartbeat(crawlerWs);
  }

  private sendHeartbeat = (crawlerWs: WebSocket) => {
    return setInterval(() => {
      crawlerWs.send(RawMessageHandler.encode('type@=mrkl/'));
    }, 45000);
  }

  public removeCrawler = (roomId: string) => {
    const util = this.crawlerWSUtilMap.get(roomId);
    // util will be removed before if error occured when crawling
    if(util === undefined) {
      return;
    }
    util.ws.send(RawMessageHandler.encode('type@=logout/'));
    util.ws.close();
    clearInterval(util.heartbeatInterval);
    this.crawlerWSUtilMap.delete(roomId);

    this.logger.info(`room ${roomId} stop crawling successfully`);
  }
}

export default new DmCrawler();