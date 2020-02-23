import { Socket } from "socket.io";
import msgTypeDataSourceMap from "./msgTypes";
import CrawlRecord from "../model/CrawlRecord";
import * as moment from "moment";

interface RoomUtil {
  roomId: string,
  intervalFlag: number,
  crawlProcess: number | undefined,
  startCrawlTime: string
}

class RoomManager {
  private roomUtilMap: Map<Socket, RoomUtil> = new Map<Socket, RoomUtil>();
  private DATA_SEND_INTERVAL: number = 1000;

  public addRoom = (roomId: string, socket: Socket) => {
    // periodly send all types of data to new client
    const intervalFlag: number = Number(setInterval(() => {
      msgTypeDataSourceMap.forEach(async (dataSourceFn, msgType) => {
        socket.emit(msgType, await dataSourceFn(roomId));
      });
    }, this.DATA_SEND_INTERVAL));

    this.roomUtilMap.set(socket, {
      roomId,
      intervalFlag,
      crawlProcess: undefined,
      startCrawlTime: ''
    });

    console.log('add room ' + roomId);
  }

  public removeRoom = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    console.log('remove room ' + util.roomId);
    // stop send data loop
    clearInterval(util.intervalFlag);

    // if started crawling before
    // stop it
    if(util.startCrawlTime !== '') {
      this.stopRoomCrawlProcess(socket);
    }

    this.roomUtilMap.delete(socket);
  }

  public startRoomCrawlProcess = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    console.log(`add room ${util.roomId} crawl process`);

    util.startCrawlTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    // todo

  }

  public stopRoomCrawlProcess = async (socket: Socket) => {
    const util = this.roomUtilMap.get(socket) as RoomUtil;
    console.log(`stop room ${util.roomId} crawl process`);
    
    // todo

    await CrawlRecord.upsert({
      start_time: util.startCrawlTime,
      stop_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      room_id: util.roomId,
      dm_num: Math.ceil(Math.random() * 2000)
    });

    util.startCrawlTime = '';
  }

  // stop all crawl process
  // write all crawl record to db
  public sigintExit = async () => {
    for(const [socket, util] of this.roomUtilMap) {
      if(util.startCrawlTime !== '') {
        await this.stopRoomCrawlProcess(socket);

        // todo
        // stop crawl process


        // emit 'serverclose' event
      }
      socket.emit('serverclose', '');
    }
  }
}

export default new RoomManager();