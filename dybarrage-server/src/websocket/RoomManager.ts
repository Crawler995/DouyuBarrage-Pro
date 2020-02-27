import { Socket } from "socket.io";
import periodlySendMsgType from "./msgtype/periodlySendMsgType";
import CrawlRecord from "../model/CrawlRecord";
import * as moment from "moment";
import DmCrawler from "./crawler/DmCrawler";
import singleSendMsgTypes from "./msgtype/singleSendMsgTypes";
import { getCrawlBasicStat, getKeywordStat } from './dataget';
import log4js from "../logger";
import getDmSendVData from "./dataget/getDmSendVData";

// useful utils of a room socket
export interface RoomUtil {
  roomId: string,
  // flags of setInterval() (for sending data periodly)
  intervalFlags: Array<any>,
  startCrawlTime: string,
  crawlDmNum: number,
  dmKeywords: Array<string>
}

class RoomManager {
  private roomUtilMap: Map<Socket, RoomUtil> = new Map<Socket, RoomUtil>();
  private DATA_SEND_INTERVAL: number = 1000;
  private logger = log4js.getLogger('RoomManager');

  // send msg to client once
  public singleEmitClient = (
    socket: Socket, 
    msgType: singleSendMsgTypes | periodlySendMsgType, 
    msg?: string
  ) => {
    socket.emit(msgType, msg ?? '');
  }

  // start to send msg to client periodly
  public startPeriodlyEmitClient = (
    socket: Socket,
    msgType: periodlySendMsgType,
    dataFn: (util: RoomUtil) => Promise<string>
  ) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    return setInterval(async () => {
      socket.emit(msgType, await dataFn(util));
    }, this.DATA_SEND_INTERVAL);
  }

  public getSocketByRoomId = (roomId: string) => {
    for(const [socket, util] of this.roomUtilMap) {
      if(util.roomId === roomId) {
        return socket;
      }
    }
  }

  public hasRoom = (roomId: string): boolean => {
    for(const [socket, util] of this.roomUtilMap) {
      if(util.roomId === roomId) {
        return true;
      }
    }
    return false;
  }

  public addRoom = async (roomId: string, socket: Socket) => {
    if(roomId === '') {
      this.singleEmitClient(socket, 'add_room_failed', '房间号为空！');
      this.logger.error('roomId is empty');
      return;
    }
    if(this.hasRoom(roomId)) {
      this.singleEmitClient(socket, 'add_room_failed', '已有相同房间号的客户端加入！');
      this.logger.error('there is the same room existed');
      return;
    }
    
    const util: RoomUtil = {
      roomId,
      intervalFlags: [],
      startCrawlTime: '',
      crawlDmNum: 0,
      dmKeywords: []
    };
    this.roomUtilMap.set(socket, util);

    this.singleEmitClient(socket, 'add_room_success');
    // for client init UI
    this.singleEmitClient(socket, 'crawl_basic_stat', await getCrawlBasicStat(util));
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));
    this.singleEmitClient(socket, 'dmsendv_data', await getDmSendVData(util));

    this.logger.info('add room ' + roomId);
  }

  public removeRoom = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // there is a connection between client and server
    // but the client 'add_room_failed'
    // so there's no util in the map
    // now the client is closed, so needn't emit client something
    if(util === undefined) {
      return;
    }
    // if started crawling before
    // stop it
    if(util.startCrawlTime !== '') {
      await this.stopRoomCrawlProcess(socket);
    }
    this.roomUtilMap.delete(socket);

    this.logger.info('remove room ' + util.roomId);
  }

  public startRoomCrawlProcess = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if(util === undefined) {
      this.logger.error('try to start crawling before \'add room success\'');
      this.singleEmitClient(socket, 'start_crawl_failed', '还未成功加入服务器！');
      return;
    }

    DmCrawler.addCrawler(util.roomId);
    util.startCrawlTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    this.singleEmitClient(socket, 'start_crawl_success');
    // start periodly sending real-time data
    util.intervalFlags.push(
      this.startPeriodlyEmitClient(socket, 'crawl_basic_stat', getCrawlBasicStat),
      this.startPeriodlyEmitClient(socket, 'keyword_stat', getKeywordStat),
      this.startPeriodlyEmitClient(socket, 'dmsendv_data', getDmSendVData),
    );
  }

  public stopRoomCrawlProcess = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if(util === undefined || util.startCrawlTime === '') {
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
    // stop sending data periodly
    util.intervalFlags.forEach(flag => clearInterval(flag));

    this.singleEmitClient(socket, 'stop_crawl_success');
  }

  public addKeyword = async (socket: Socket, keyword: string) => {
    const util = this.roomUtilMap.get(socket);
    if(util === undefined) {
      this.logger.error('add keyword error');
      this.singleEmitClient(socket, 'add_keyword_failed', '还未成功加入服务器！');
      return;
    }

    util.dmKeywords.push(keyword);
    this.singleEmitClient(socket, 'add_keyword_success');
    // when user add a keyword, the server should send the data once for client to update UI
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));

    this.logger.info('add keyword ' + keyword);
  }

  public deleteKeyword = async (socket: Socket, keyword: string) => {
    const util = this.roomUtilMap.get(socket);
    if(util === undefined) {
      this.logger.error('delete keyword error');
      this.singleEmitClient(socket, 'delete_keyword_failed', '还未成功加入服务器！');
      return;
    }

    util.dmKeywords = util.dmKeywords.filter(item => item !== keyword);
    this.singleEmitClient(socket, 'delete_keyword_success');
    // when user delete a keyword, the server should send the data once for client to update UI
    this.singleEmitClient(socket, 'keyword_stat', await getKeywordStat(util));

    this.logger.info('delete keyword ' + keyword);
  }

  public getUtilByRoomId = (roomId: string) => {
    for(const [socket, util] of this.roomUtilMap) {
      if(roomId === util.roomId) {
        return util;
      }
    }
  }

  // when server close
  public removeAllRoom = async () => {
    for(const [socket, util] of this.roomUtilMap) {
      await this.removeRoom(socket);
    }

    this.logger.info('force to remove all room');
  }
}

export default new RoomManager();