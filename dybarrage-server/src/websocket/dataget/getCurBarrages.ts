import { RoomUtil } from '../RoomManager';
import Barrage from '../../model/Barrage';
import * as moment from 'moment';
import { Op } from 'sequelize';
import { DATA_SEND_INTERVAL } from '../../config';

export default (util: RoomUtil) => {
  const res = JSON.stringify(util.lastBarrages.map(item => item.dm_content));
  util.lastBarrages.length = 0;
  return res;
};
