import io from "socket.io-client";
import getRoomId from '../../util/getRoomId';
import { message } from "antd";
import singleReceiveMsgTypes from "./singleReceiveMsgTypes";
import singleSendMsgTypes from "./singleSendMsgTypes";
import periodlyReceiveMsgTypes from "./periodlyReceiveMsgTypes";


class WebSocketClient {
  private ws: SocketIOClient.Socket;
  private roomId: string;
  private isConnectedFailedBefore: boolean;
  private needWaitServerStartFns: Array<() => void>

  constructor(
    roomId: string, 
    connectSuccessFn: () => void,
    connectErrorFn: () => void
  ) {
    this.ws = io('http://localhost:3001/');
    this.isConnectedFailedBefore = false;
    this.needWaitServerStartFns = [];

    this.ws.on('connect', () => {
      console.log('connect server');

      // special condition:
      // 1.
      // start web, forget to start server
      // 2.
      // start web, start server, stop server
      //
      // if start server later, the websocket connection should be recovered automatically
      // and HTTP requests should be requested
      if(getRoomId() !== '') {      
        if(this.isConnectedFailedBefore) {
          this.needWaitServerStartFns.forEach(fn => fn());
          this.start();
        }

        connectSuccessFn();
      }
    });

    this.ws.on('connect_timeout', () => {
      console.log('connect timeout');
    });

    this.ws.on('connect_error', () => {
      console.log('connect error');
      this.isConnectedFailedBefore = true;
      connectErrorFn();
    });

    this.roomId = roomId;
  }

  // tell the server: you can send data to me
  public start = () => {
    this.emitEvent('add_room', getRoomId());
    this.isConnectedFailedBefore = false;
  }

  public stop = () => {
    this.ws.close();
  }

  public addSubscriber = (
    eventId: singleReceiveMsgTypes | periodlyReceiveMsgTypes, 
    notifyFn: (data: any) => void
  ) => {
    this.ws.on(eventId, (data: any) => notifyFn(data));
  }

  public removeSubscriber = (eventId: singleReceiveMsgTypes | periodlyReceiveMsgTypes) => {
    this.ws.off(eventId);
  }

  public addNeedWaitServerStartFn = (fn: () => void) => {
    this.needWaitServerStartFns.push(fn);
  }

  public emitEvent = (eventId: singleSendMsgTypes, msg: string) => {
    this.ws.emit(eventId, msg);
  }
}


// singleton
let websocketClient: WebSocketClient | undefined = undefined;

const getWebSocketClient = (): WebSocketClient => {
  if(websocketClient === undefined) {
    websocketClient = new WebSocketClient(
      getRoomId(),
      () => message.success('连接服务器成功！'),
      () => message.error('连接服务器失败！请检查服务器。')
    );
  }
  return websocketClient;
}

export default getWebSocketClient;