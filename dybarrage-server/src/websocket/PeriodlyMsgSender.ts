import { Socket } from "socket.io";
import periodlySendMsgType from "./msgtype/periodlySendMsgType";
import { BarrageInfo } from "./crawler/BarrageInfo";
import { getNowString } from "src/util";



class PeriodlyMsgSender {
  private client: Socket;
  private msgTypeDataHandlerMap: Map<periodlySendMsgType, (barrages: Array<BarrageInfo>) => string>;

  public constructor(client: Socket) {
    this.client = client;
    this.msgTypeDataHandlerMap = new Map<periodlySendMsgType, (barrages: Array<BarrageInfo>) => string>([

    ]);
  }

  public getMsgDataFromNewBarrages = (barrages: Array<BarrageInfo>) => {

  }

  private getBarrageSendVelocity = (barrages: Array<BarrageInfo>) => {
    return JSON.stringify({
    })
  }
}