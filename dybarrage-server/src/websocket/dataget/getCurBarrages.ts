import { RoomUtil } from '../RoomManager';
import Barrage from '../../model/Barrage';
import * as moment from 'moment';
import { Op } from 'sequelize';
import { DATA_SEND_INTERVAL } from '../../config';

export default async (util: RoomUtil): Promise<string> => {
  const res = await Barrage.findAll({
    attributes: ['dm_content'],
    where: {
      room_id: util.roomId,
      time: {
        [Op.gte]: moment(Date.now() - DATA_SEND_INTERVAL).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  });

  return JSON.stringify(res);
};
