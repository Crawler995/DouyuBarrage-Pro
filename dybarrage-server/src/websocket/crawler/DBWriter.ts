import { BarrageInfo } from './BarrageInfo';
import User from '../../model/User';
import Barrage from '../../model/Barrage';
import UserBarrageNum from '../../model/UserBarrageNum';
import log4js from '../../logger';

class DBWriter {
  private static logger = log4js.getLogger('DBWriter');

  public static addUsers = async (barragesInfo: BarrageInfo[]) => {
    if (barragesInfo.length === 0) {
      return;
    }
    const users = barragesInfo
      .map(item => ({
        id: item.user_id,
        name: item.sender_name,
        level: item.sender_level,
        avatar_url: item.sender_avatar_url,
        badge_name: item.badge_name,
        badge_level: item.badge_level
      }))
      .reduce(
        (res, cur) => (res.map((item: any) => item.id).includes(cur.id) ? res : res.concat(cur)),
        [] as any
      );

    try {
      await User.bulkCreate(users, {
        updateOnDuplicate: ['name', 'level', 'avatar_url', 'badge_name', 'badge_level']
      });
    } catch (error) {
      DBWriter.logger.error('add users error: ' + error);
    }
  };

  public static addBarrages = async (barragesInfo: BarrageInfo[]) => {
    if (barragesInfo.length === 0) {
      return;
    }
    const barrages = barragesInfo.map(item => ({
      id: item.id,
      time: item.time,
      room_id: item.room_id,
      user_id: item.user_id,
      dm_content: item.dm_content
    }));

    try {
      await Barrage.bulkCreate(barrages);
    } catch (error) {
      DBWriter.logger.error('add barrages error: ' + error);
    }
  };

  public static updateUserBarrageNum = async (barragesInfo: BarrageInfo[]) => {
    if (barragesInfo.length === 0) {
      return;
    }
    const usersBarrageNum = barragesInfo.reduce((res, cur) => {
      res[cur.user_id] !== undefined ? (res[cur.user_id] += 1) : (res[cur.user_id] = 1);
      return res;
    }, {} as any);
    const roomId = barragesInfo[0].room_id;
    const usersId = Object.keys(usersBarrageNum);
    for (const userId of usersId) {
      UserBarrageNum.findOrCreate({
        where: {
          user_id: userId,
          room_id: roomId
        }
      }).spread((_, created) => {
        if (!created) {
          (UserBarrageNum as any).increment(
            {
              barrage_num: usersBarrageNum[userId]
            },
            {
              where: {
                user_id: userId,
                room_id: roomId
              }
            }
          );
        }
      }).catch(err => DBWriter.logger.error('update user barrage num error: ' + err));
    }
  };
}

export default DBWriter;
