import { Socket } from "socket.io";
import periodlySendMsgType from "./msgtype/periodlySendMsgType";
import CrawlRecord from "../model/CrawlRecord";
import * as moment from "moment";
import DmCrawler from "./crawler/DmCrawler";
import SingleSendMsgTypesEnum from "./msgtype/singleSendMsgTypes";
import singleSendMsgTypes from "./msgtype/singleSendMsgTypes";
import { getCrawlBasicStat } from './dataget';
import log4js from "../logger";

export interface RoomUtil {
  roomId: string,
  intervalFlag: any,
  startCrawlTime: string,
  crawlDmNum: number
}

class RoomManager {
  private roomUtilMap: Map<Socket, RoomUtil> = new Map<Socket, RoomUtil>();
  private periodlySendMsgTypeFnMap: Map<periodlySendMsgType, (roomId: string) => Promise<string>>;
  private DATA_SEND_INTERVAL: number = 1000;
  private logger = log4js.getLogger('RoomManager');

  constructor() {
    this.periodlySendMsgTypeFnMap = new Map<periodlySendMsgType, (roomId: string) => Promise<string>>([
      ['crawl_basic_stat', getCrawlBasicStat]
    ]);
  }

  public singleEmitClient = (socket: Socket, msgType: singleSendMsgTypes, msg?: string) => {
    socket.emit(msgType, msg ?? '');
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
    
    this.roomUtilMap.set(socket, {
      roomId,
      intervalFlag: 0,
      startCrawlTime: '',
      crawlDmNum: 0
    });

    // for client init data
    for(const [msgType, dataGetFn] of this.periodlySendMsgTypeFnMap) {
      socket.emit(msgType, await dataGetFn(roomId));
    }

    // emit add_room_success event to client
    this.singleEmitClient(socket, 'add_room_success');

    this.logger.info('add room ' + roomId);
  }

  public removeRoom = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // there is a connection between client and server
    // but the client 'add_room_failed'
    // so there's no util in the map
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

    // periodly send data to new client
    util.intervalFlag = setInterval(async () => {
      for(const [msgType, dataGetFn] of this.periodlySendMsgTypeFnMap) {
        socket.emit(msgType, await dataGetFn(util.roomId));
      }
    }, this.DATA_SEND_INTERVAL);

    DmCrawler.addCrawler(util.roomId);
    util.startCrawlTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    // emit startCrawlSuccess event to client
    this.singleEmitClient(socket, 'start_crawl_success');
  }

  public stopRoomCrawlProcess = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    // same as above
    if(util === undefined || util.startCrawlTime === '') {
      this.logger.error('try to stop crawling before starting crawling');
      this.singleEmitClient(socket, 'stop_crawl_failed', '还未开始抓取');
      return;
    }
    // stop send data periodly
    clearInterval(util.intervalFlag);
    DmCrawler.removeCrawler(util.roomId);
    // insert crawl record to database
    await CrawlRecord.upsert({
      start_time: util.startCrawlTime,
      stop_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      room_id: util.roomId,
      dm_num: util.crawlDmNum
    });
    util.startCrawlTime = '';

    this.singleEmitClient(socket, 'stop_crawl_success');
  }

  public getUtilByRoomId = (roomId: string) => {
    for(const [socket, util] of this.roomUtilMap) {
      if(roomId === util.roomId) {
        return util;
      }
    }
  }

  // stop all crawl process
  // write all crawl record to db
  public removeAllRoom = async () => {
    for(const [socket, util] of this.roomUtilMap) {
      await this.removeRoom(socket);
    }

    this.logger.info('force to remove all room');
  }
}

export default new RoomManager();