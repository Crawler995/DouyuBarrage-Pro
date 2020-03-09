import * as WebSocket from 'ws';
import RawMessageHandler from './RawMessageHandler';
import Barrage from '../../model/Barrage';
import * as moment from 'moment';
import RoomManager, { RoomUtil } from '../RoomManager';
import log4js from '../../logger';
import { DATA_SEND_INTERVAL } from '../../config';

// Douyu Barrage Crawler
// detail
// https://zhuanlan.zhihu.com/p/106697646
// https://zhuanlan.zhihu.com/p/107200326

interface WSUtil {
  ws: WebSocket;
  heartbeatInterval: any;
}

class DmCrawler {
  private crawlerWSUtilMap: Map<RoomUtil, WSUtil>;
  private logger = log4js.getLogger('DmCrawler');

  public constructor() {
    this.crawlerWSUtilMap = new Map<RoomUtil, WSUtil>();
  }

  public addCrawler = (roomUtil: RoomUtil) => {
    const crawlerWs = new WebSocket('wss://danmuproxy.douyu.com:8506/');

    crawlerWs.onerror = ev => {
      const socket = RoomManager.getSocketByRoomId(roomUtil.roomId);
      this.logger.error('crawler error: ' + ev.message);
      if (socket === undefined) {
        return;
      }

      RoomManager.singleEmitClient(socket, 'crawl_failed', '爬取弹幕出错 ' + ev.message);
      RoomManager.stopRoomCrawlProcess(socket);
    };

    crawlerWs.onopen = () => {
      this.logger.info(`room ${roomUtil.roomId} start crawling successfully`);
      // start to send heartbeat to Douyu server
      const heartbeatInterval = this.prepareReceiveDm(crawlerWs, roomUtil.roomId);

      this.crawlerWSUtilMap.set(roomUtil, {
        ws: crawlerWs,
        heartbeatInterval
      });
    };

    crawlerWs.onmessage = (ev: WebSocket.MessageEvent) => {
      const util = this.crawlerWSUtilMap.get(roomUtil);
      // receive message after room removed
      if(util === undefined) {
        return;
      }
      // const tempBarrages = util.tempBarrages;
      const buf: Buffer = ev.data as Buffer;
      // convert Buffer to parsed and readable msg obj
      const barragesInfo = RawMessageHandler.getBarragesInfo(buf);
      Barrage.bulkCreate(barragesInfo)
      .then().catch(err => {
        this.logger.error('insert barrages error: ' + err);
      });

      roomUtil.crawlBasicStat.thisCrawlDmNum += barragesInfo.length;
      // keyword count
      roomUtil.countKeywords.forEach((value, keyword) => {
        barragesInfo.forEach(barrage => {
          if(barrage.dm_content.includes(keyword)) {
            roomUtil.countKeywords.set(keyword, {
              thisNum: value.thisNum + 1,
              totalNum: value.totalNum + 1
            });
          }
        });
      });
      // last barrages
      if(roomUtil.isRequestedSendingBarrages) {
        roomUtil.lastBarrages.push(...barragesInfo);
      }
    };
  };

  public removeCrawler = (roomUtil: RoomUtil) => {
    const util = this.crawlerWSUtilMap.get(roomUtil);
    // util will be removed before if error occured when crawling
    if (util === undefined) {
      return;
    }
    util.ws.send(RawMessageHandler.encode('type@=logout/'));
    util.ws.close();
    clearInterval(util.heartbeatInterval);
    // clearInterval(util.insertBarragesToDBInterval);
    this.crawlerWSUtilMap.delete(roomUtil);

    this.logger.info(`room ${roomUtil.roomId} stop crawling successfully`);
  };

  // login and join group
  private prepareReceiveDm = (crawlerWs: WebSocket, roomId: string) => {
    crawlerWs.send(
      RawMessageHandler.encode(
        `type@=loginreq/room_id@=${roomId}/dfl@=sn@A=105@Sss@A=1/username@=61609154/uid@=61609154/ver@=20190610/aver@=218101901/ct@=0/`
      )
    );
    crawlerWs.send(RawMessageHandler.encode(`type@=joingroup/rid@=${roomId}/gid@=-9999/`));
    return this.sendHeartbeat(crawlerWs);
  };

  private sendHeartbeat = (crawlerWs: WebSocket) => {
    return setInterval(() => {
      crawlerWs.send(RawMessageHandler.encode('type@=mrkl/'));
    }, 45000);
  };
}

export default new DmCrawler();
