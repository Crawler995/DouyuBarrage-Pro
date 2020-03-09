import log4js from '../../logger';
import { getNowString } from '../../util';
import { BarrageInfo } from './BarrageInfo';

// Douyu Barrage Raw Message Handler
// detail
// https://zhuanlan.zhihu.com/p/106697646
// https://zhuanlan.zhihu.com/p/107200326

export default class RawMessageHandler {
  private static logger = log4js.getLogger('RawMessageHandler');

  // barrage content -> Douyu protocol packet
  public static encode = (msg: string): Buffer => {
    const dataLen = msg.length + 9;
    const resLen = msg.length + 13;

    const resBytes = Buffer.alloc(resLen);

    const msgBytes = Buffer.from(msg);
    const dataLenBytes = Buffer.alloc(4);
    Buffer.from([dataLen]).copy(dataLenBytes, 0);
    const msgTypeBytes = Buffer.from([0xb1, 0x02, 0x00, 0x00]);
    const endBytes = Buffer.from([0x00]);

    dataLenBytes.copy(resBytes, 0);
    dataLenBytes.copy(resBytes, 4);
    msgTypeBytes.copy(resBytes, 8);
    msgBytes.copy(resBytes, 12);
    endBytes.copy(resBytes, 12 + msgBytes.length);

    return resBytes;
  };

  public static getBarragesInfo = (buf: Buffer): Array<BarrageInfo> => {
    return RawMessageHandler.getMsgsObj(buf).map(msgObj => {
      return {
        id: msgObj.cid,
        time: getNowString(),
        room_id: msgObj.rid,
        sender_name: msgObj.nn,
        sender_level: parseInt(msgObj.level),
        sender_avatar_url: msgObj.ic,
        dm_content: msgObj.txt,
        badge_name: msgObj.bnn === '' ? null : msgObj.bnn,
        badge_level: msgObj.bl === '0' ? null : parseInt(msgObj.bl)
      }
    });
  }

  private static getMsgsObj = (buf: Buffer): Array<any> => {
    const decodeMsgs = RawMessageHandler.decode(buf);
    const res: Array<any> = [];

    decodeMsgs.forEach(decodeMsg => {
      const obj = RawMessageHandler.parseDecodeMsg(decodeMsg);
      // only need the barrage info
      // ignore other info (gift info...)
      if (obj.type === 'chatmsg' && RawMessageHandler.isValidate(obj)) {
        res.push(obj);
      }
    });

    return res;
  };

  private static isValidate = (obj: any) => {
    return (obj.cid && obj.cid !== '') &&
      (obj.ic) &&
      !(isNaN(parseInt(obj.level))) &&
      !(isNaN(parseInt(obj.bl)));
  }

  // Douyu protocol packet -> barrage info string array
  // a packet may contain several barrage info

  // if the barrages send velocity is too high (maybe > 150)
  // the buffer from Douyu server may be incorrect
  // so try...catch... it
  private static decode = (buf: Buffer): Array<string> => {
    let pos = 0;
    let msg: Array<string> = [];

    try {
      while (pos < buf.length) {
        if(pos > buf.length) {
          throw new Error('pos > buf.length');
        }
        const contentLen = buf.slice(pos, pos + 4).readInt32LE(0);
        if(contentLen < 0) {
          throw new Error('contentLen < 0');
        }
        const content = buf.slice(pos + 12, pos + 3 + contentLen).toString();
        msg.push(content);
        pos += contentLen + 4;
      }

      return msg;
    } catch (error) {
      RawMessageHandler.logger.error('decode error: ' + error);
      return [];
    }
  };

  private static parseDecodeMsg = (decodeMsg: string): any => {
    const res: any = {};
    const attrs = decodeMsg.split('/');
    attrs.pop();

    attrs.forEach(attr => {
      attr = attr.replace(/@S/g, '/').replace(/@A/g, '@');
      const couple = attr.split('@=');
      res[couple[0]] = couple[1];
    });

    return res;
  };
}
