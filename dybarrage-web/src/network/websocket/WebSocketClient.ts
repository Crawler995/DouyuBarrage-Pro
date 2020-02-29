import io from 'socket.io-client';
import getRoomId from '../../util/getRoomId';
import singleReceiveMsgTypes from './msgType/singleReceiveMsgTypes';
import singleSendMsgTypes from './msgType/singleSendMsgTypes';
import periodlyReceiveMsgTypes from './msgType/periodlyReceiveMsgTypes';

class WebSocketClient {
  private ws: SocketIOClient.Socket;
  private connectSuccessHooks: Array<() => void> = [];
  private connectErrorHooks: Array<() => void> = [];

  constructor(roomId: string) {
    this.ws = io('http://localhost:3001/');
    this.connectSuccessHooks.push(this.start);

    this.ws.on('connect', () => {
      console.log('connect server');

      if (getRoomId() !== '') {
        this.connectSuccessHooks.forEach(fn => fn());
      }
    });

    this.ws.on('connect_timeout', () => {
      console.log('connect timeout');
    });

    this.ws.on('connect_error', () => {
      console.log('connect error');
      this.connectErrorHooks.forEach(fn => fn());
    });
  }

  // tell the server: you can send data to me
  public start = () => {
    this.emitEvent('add_room', getRoomId());
  };

  public stop = () => {
    this.ws.close();
  };

  public addSubscriber = (
    eventId: singleReceiveMsgTypes | periodlyReceiveMsgTypes,
    notifyFn: (data: any) => void
  ) => {
    this.ws.on(eventId, (data: any) => notifyFn(data));
  };

  public removeSubscriber = (eventId: singleReceiveMsgTypes | periodlyReceiveMsgTypes) => {
    this.ws.off(eventId);
  };

  public addConnectSuccessHook = (fn: () => void) => {
    this.connectSuccessHooks.push(fn);
  };

  public addConnectErrorHook = (fn: () => void) => {
    this.connectErrorHooks.push(fn);
  };

  public emitEvent = (eventId: singleSendMsgTypes, msg: string) => {
    this.ws.emit(eventId, msg);
  };
}

// singleton
let websocketClient: WebSocketClient | undefined = undefined;

const getWebSocketClient = (): WebSocketClient => {
  if (websocketClient === undefined) {
    websocketClient = new WebSocketClient(getRoomId());
  }
  return websocketClient;
};

export default getWebSocketClient;
