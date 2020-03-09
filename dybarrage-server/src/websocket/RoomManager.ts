import { Socket } from 'socket.io';
import periodlySendMsgType from './msgtype/periodlySendMsgType';
import CrawlRecord from '../model/CrawlRecord';
import * as moment from 'moment';
import DmCrawler from './crawler/DmCrawler';
import singleSendMsgTypes from './msgtype/singleSendMsgTypes';
import log4js from '../logger';
import getCurBarrages from './dataget/getCurBarrages';
import { DATA_SEND_INTERVAL } from '../config';
import HighlightRecord from '../model/HighlightRecord';
import { getPastTotalCrawlTime, getPastTotalCrawlDmNum, getCrawlBasicStat } from './dataget/getCrawlBasicStat';
import { getKeywordTotalNum, getKeywordThisNum, getKeywordStat } from './dataget/getKeywordStat';
import { getDmSendVData } from './dataget/getDmSendVData';
import { BarrageInfo } from './crawler/BarrageInfo';

// useful utils of a room socket
export interface RoomUtil {
  roomId: string;
  // flags of setInterval() (for sending data periodly)
  intervalFlags: Array<{ msgType: string; flag: any }>;

  crawlBasicStat: {
    // second
    pastTotalCrawlTime: number;
    pastTotalCrawlDmNum: number;
    startCrawlTime: Date | null;
    thisCrawlDmNum: number;
  };

  countKeywords: Map<string, {
    totalNum: number;
    thisNum: number;
  }>;
  
  // real-time data
  // barrage sending velocity
  dmSendV: {
    lastCrawlDmNum: number;
  };

  isRequestedSendingBarrages: boolean;
  lastBarrages: Array<BarrageInfo>;
}

class RoomManager {
  private roomUtilMap: Map<Socket, RoomUtil> = new Map<Socket, RoomUtil>();
  private DATA_SEND_INTERVAL = DATA_SEND_INTERVAL;
  private logger = log4js.getLogger('RoomManager');

  // send msg to client once
  public singleEmitClient = (
    socket: Socket,
    msgType: singleSendMsgTypes | periodlySendMsgType,
    msg?: string
  ) => {
    socket.emit(msgType, msg ?? '');
  };

  // start to send msg to client periodly
  public startPeriodlyEmitClient = (
    socket: Socket,
    msgType: periodlySendMsgType,
    dataFn: (util: RoomUtil) => string
  ) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    const flag = setInterval(() => {
      socket.emit(msgType, dataFn(util));
    }, this.DATA_SEND_INTERVAL);
    util.intervalFlags.push({ msgType, flag });
  };

  public getSocketByRoomId = (roomId: string) => {
    for (const [socket, util] of this.roomUtilMap) {
      if (util.roomId === roomId) {
        return socket;
      }
    }
  };

  public hasRoom = (roomId: string): boolean => {
    for (const [socket, util] of this.roomUtilMap) {
      if (util.roomId === roomId) {
        return true;
      }
    }
    return false;
  };

  public addRoom = async (roomId: string, socket: Socket) => {
    if (roomId === '') {
      this.singleEmitClient(socket, 'add_room_failed', '房间号为空！');
      this.logger.error('roomId is empty');
      return;
    }
    if (this.hasRoom(roomId)) {
      this.singleEmitClient(socket, 'add_room_failed', '已有相同房间号的客户端加入！');
      this.logger.error('there is the same room existed');
      return;
    }

    const util: RoomUtil = {
      roomId,
      intervalFlags: [],

      crawlBasicStat: {
        startCrawlTime: null,
        pastTotalCrawlTime: await getPastTotalCrawlTime(roomId),
        thisCrawlDmNum: 0,
        pastTotalCrawlDmNum: await getPastTotalCrawlDmNum(roomId)
      },
      
      countKeywords: new Map<string, {
        totalNum: number;
        thisNum: number;
      }>(),

      dmSendV: {
        lastCrawlDmNum: 0
      },

      isRequestedSendingBarrages: false,
      lastBarrages: []
    };
    this.roomUtilMap.set(socket, util);

    this.singleEmitClient(socket, 'add_room_success');
    // for client init UI
    this.singleEmitClient(socket, 'crawl_basic_stat', await getCrawlBasicStat(util));
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));

    this.logger.info('add room ' + roomId);
  };

  public removeRoom = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // there is a connection between client and server
    // but the client 'add_room_failed'
    // so there's no util in the map
    // now the client is closed, so needn't emit client something
    if (util === undefined) {
      return;
    }
    // if started crawling before
    // stop it
    if (util.crawlBasicStat.startCrawlTime !== null) {
      await this.stopRoomCrawlProcess(socket);
    }
    this.roomUtilMap.delete(socket);

    this.logger.info('remove room ' + util.roomId);
  };

  public startRoomCrawlProcess = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if (util === undefined) {
      this.logger.error("try to start crawling before 'add room success'");
      this.singleEmitClient(socket, 'start_crawl_failed', '还未成功加入服务器！');
      return;
    }

    DmCrawler.addCrawler(util);
    util.crawlBasicStat.startCrawlTime = new Date();

    this.singleEmitClient(socket, 'start_crawl_success');
    // start periodly sending real-time data
    this.startPeriodlyEmitClient(socket, 'crawl_basic_stat', getCrawlBasicStat);
    this.startPeriodlyEmitClient(socket, 'keyword_stat', getKeywordStat);
    this.startPeriodlyEmitClient(socket, 'dmsendv_data', getDmSendVData);
  };

  public stopRoomCrawlProcess = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if (util === undefined || util.crawlBasicStat.startCrawlTime === null) {
      this.logger.error('try to stop crawling before starting crawling');
      this.singleEmitClient(socket, 'stop_crawl_failed', '还未开始抓取');
      return;
    }

    DmCrawler.removeCrawler(util);
    // insert a crawl record to database
    await CrawlRecord.upsert({
      start_time: util.crawlBasicStat.startCrawlTime,
      stop_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      room_id: util.roomId,
      dm_num: util.crawlBasicStat.thisCrawlDmNum
    });
    
    util.crawlBasicStat.pastTotalCrawlDmNum += util.crawlBasicStat.thisCrawlDmNum;
    util.crawlBasicStat.pastTotalCrawlTime += 
      Math.floor((Date.now() - util.crawlBasicStat.startCrawlTime?.getTime()) / 1000);
    util.crawlBasicStat.thisCrawlDmNum = 0;
    util.crawlBasicStat.startCrawlTime = null;
    util.dmSendV = {
      lastCrawlDmNum: 0
    };
    // stop sending data periodly
    util.intervalFlags.forEach(item => clearInterval(item.flag));

    this.singleEmitClient(socket, 'stop_crawl_success');
  };

  public addKeyword = async (socket: Socket, keyword: string) => {
    const util = this.roomUtilMap.get(socket);
    if (util === undefined) {
      this.logger.error('add keyword error');
      this.singleEmitClient(socket, 'add_keyword_failed', '还未成功加入服务器！');
      return;
    }

    const startCrawlTime = util.crawlBasicStat.startCrawlTime;
    util.countKeywords.set(keyword, {
      totalNum: await getKeywordTotalNum(util.roomId, keyword), //todo
      thisNum: await getKeywordThisNum(util.roomId, keyword, startCrawlTime) // todo
    }); // todo
    this.singleEmitClient(socket, 'add_keyword_success');
    // when user add a keyword, the server should send the data once for client to update UI
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));

    this.logger.info('add keyword ' + keyword);
  };

  public deleteKeyword = async (socket: Socket, keyword: string) => {
    const util = this.roomUtilMap.get(socket);
    if (util === undefined) {
      this.logger.error('delete keyword error');
      this.singleEmitClient(socket, 'delete_keyword_failed', '还未成功加入服务器！');
      return;
    }

    util.countKeywords.delete(keyword);
    this.singleEmitClient(socket, 'delete_keyword_success');
    // when user delete a keyword, the server should send the data once for client to update UI
    this.singleEmitClient(socket, 'keyword_stat', getKeywordStat(util));

    this.logger.info('delete keyword ' + keyword);
  };

  public startPeriodlySendBarrages = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    if(util === undefined) {
      return;
    }

    util.isRequestedSendingBarrages = true;
    this.startPeriodlyEmitClient(socket, 'cur_dm', getCurBarrages);
    this.logger.info('start send barrages to room ' + this.roomUtilMap.get(socket)?.roomId);
  };

  public stopPeriodlySendBarrages = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    if (util === undefined) {
      return;
    }
    util.isRequestedSendingBarrages = false;
    
    const res = util.intervalFlags.filter(item => item.msgType === 'cur_dm');
    if (res.length === 0) {
      return;
    }
    const flag = res[0].flag;
    clearInterval(flag);
    util.intervalFlags = util.intervalFlags.filter(item => item.msgType !== 'cur_dm');
    util.lastBarrages.length = 0;
    this.logger.info('stop send barrages to room ' + util.roomId);
  };

  public addHighlightRecord = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    if (util === undefined) {
      return;
    }

    await HighlightRecord.upsert({
      time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      room_id: util.roomId
    });
    this.logger.info('add highlight in room ' + util.roomId);
  };

  public getUtilByRoomId = (roomId: string) => {
    for (const [socket, util] of this.roomUtilMap) {
      if (roomId === util.roomId) {
        return util;
      }
    }
  };

  // when server close
  public removeAllRoom = async () => {
    for (const [socket, util] of this.roomUtilMap) {
      await this.removeRoom(socket);
    }

    this.logger.info('force to remove all room');
  };
}

export default new RoomManager();
