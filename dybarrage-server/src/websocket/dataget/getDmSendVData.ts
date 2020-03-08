import { RoomUtil } from '../RoomManager';
import * as moment from 'moment';
import { DATA_SEND_INTERVAL } from '../../config';

export const getDmSendVData = (util: RoomUtil) => {
  const res = JSON.stringify({
    now: moment(Date.now()).format('HH:mm:ss'),
    dmv: (util.crawlBasicStat.thisCrawlDmNum - util.dmSendV.lastCrawlDmNum) / (DATA_SEND_INTERVAL / 1000)
  });

  util.dmSendV.lastCrawlDmNum = util.crawlBasicStat.thisCrawlDmNum;
  return res;
};
