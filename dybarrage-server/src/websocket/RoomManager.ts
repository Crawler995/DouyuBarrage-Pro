import { Socket } from 'socket.io';
import periodlySendMsgType from './msgtype/periodlySendMsgType';
import CrawlRecord from '../model/CrawlRecord';
import * as moment from 'moment';
import DmCrawler from './crawler/DmCrawler';
import singleSendMsgTypes from './msgtype/singleSendMsgTypes';
import { getCrawlBasicStat, getKeywordStat } from './dataget';
import log4js from '../logger';
import getDmSendVData from './dataget/getDmSendVData';
import getDmLevelData from './dataget/getDmLevelData';
import getCurBarrages from './dataget/getCurBarrages';
import { DATA_SEND_INTERVAL } from '../config';
import HighlightRecord from '../model/HighlightRecord';

// useful utils of a room socket
export interface RoomUtil {
  roomId: string;
  // flags of setInterval() (for sending data periodly)
  intervalFlags: Array<{ msgType: string; flag: any }>;
  startCrawlTime: string;
  crawlDmNum: number;
  dmKeywords: Array<string>;
  // real-time data
  // barrage sending velocity
  dmSendV: {
    lastCrawlDmNum: number;
    yData: Array<number>;
    xData: Array<string>;
  };
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
    dataFn: (util: RoomUtil) => Promise<string>
  ) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    const flag = setInterval(async () => {
      socket.emit(msgType, await dataFn(util));
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
      startCrawlTime: '',
      crawlDmNum: 0,
      dmKeywords: [],
      dmSendV: {
        xData: [],
        yData: [],
        lastCrawlDmNum: 0
      }
    };
    this.roomUtilMap.set(socket, util);

    this.singleEmitClient(socket, 'add_room_success');
    // for client init UI
    this.singleEmitClient(socket, 'crawl_basic_stat', await getCrawlBasicStat(util));
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));
    this.singleEmitClient(socket, 'dmsendv_data', getDmSendVData.getStyle());
    this.singleEmitClient(socket, 'dmlevel_data', getDmLevelData.getStyle());
    this.singleEmitClient(socket, 'dmlevel_data', await getDmLevelData.getSeries(util));

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
    if (util.startCrawlTime !== '') {
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

    DmCrawler.addCrawler(util.roomId);
    util.startCrawlTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    this.singleEmitClient(socket, 'start_crawl_success');
    // start periodly sending real-time data
    this.startPeriodlyEmitClient(socket, 'crawl_basic_stat', getCrawlBasicStat);
    this.startPeriodlyEmitClient(socket, 'keyword_stat', getKeywordStat);
    this.startPeriodlyEmitClient(socket, 'dmsendv_data', getDmSendVData.getSeries);
    this.startPeriodlyEmitClient(socket, 'dmlevel_data', getDmLevelData.getSeries);
  };

  public stopRoomCrawlProcess = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if (util === undefined || util.startCrawlTime === '') {
      this.logger.error('try to stop crawling before starting crawling');
      this.singleEmitClient(socket, 'stop_crawl_failed', '还未开始抓取');
      return;
    }

    DmCrawler.removeCrawler(util.roomId);
    // insert a crawl record to database
    await CrawlRecord.upsert({
      start_time: util.startCrawlTime,
      stop_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      room_id: util.roomId,
      dm_num: util.crawlDmNum
    });
    util.startCrawlTime = '';
    util.crawlDmNum = 0;
    util.dmSendV = {
      xData: [],
      yData: [],
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

    util.dmKeywords.push(keyword);
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

    util.dmKeywords = util.dmKeywords.filter(item => item !== keyword);
    this.singleEmitClient(socket, 'delete_keyword_success');
    // when user delete a keyword, the server should send the data once for client to update UI
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));

    this.logger.info('delete keyword ' + keyword);
  };

  public startPeriodlySendBarrages = (socket: Socket) => {
    this.startPeriodlyEmitClient(socket, 'cur_dm', getCurBarrages);
    this.logger.info('start send barrages to room ' + this.roomUtilMap.get(socket)?.roomId);
  };

  public stopPeriodlySendBarrages = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    if (util === undefined) {
      return;
    }
    const res = util.intervalFlags.filter(item => item.msgType === 'cur_dm');
    if (res.length === 0) {
      return;
    }
    const flag = res[0].flag;
    clearInterval(flag);
    util.intervalFlags = util.intervalFlags.filter(item => item.msgType !== 'cur_dm');
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
