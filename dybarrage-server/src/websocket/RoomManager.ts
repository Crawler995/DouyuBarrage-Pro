import { Socket } from "socket.io";
import msgTypeDataSourceMap from "./msgTypes";

interface RoomUtil {
  roomId: string,
  intervalFlag: number,
  crawlProcess: number | undefined
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
      crawlProcess: undefined
    });

    console.log('add room ' + roomId);
  }

  public removeRoom = (socket: Socket) => {
    const util = this.roomUtilMap.get(socket);
    console.log('remove room ' + util?.roomId);
    // stop send data loop
    clearInterval(util?.intervalFlag);
    // stop crawl process
    // todo

    this.roomUtilMap.delete(socket);
  }
}

export default new RoomManager();