import { RoomUtil } from '../RoomManager';
import Barrage from '../../model/Barrage';
import { Op } from 'sequelize';

interface IMatchRes {
  key: string;
  keyword: string;
  totalMatchNum: number;
  thisCrawlMatchNum: number;
}

export const getKeywordTotalNum = async (roomId: string, keyword: string) => {
  return await (
    await Barrage.findAndCountAll({
      where: {
        room_id: roomId,
        dm_content: {
          [Op.substring]: keyword
        }
      }
    })
  ).count;
};

export const getKeywordThisNum = async (
  roomId: string,
  keyword: string,
  startCrawlTime: Date | null
) => {
  if (startCrawlTime === null) {
    return 0;
  }

  return await (
    await Barrage.findAndCountAll({
      where: {
        room_id: roomId,
        dm_content: {
          [Op.substring]: keyword
        },
        time: {
          [Op.gte]: startCrawlTime
        }
      }
    })
  ).count;
};

export const getKeywordStat = (util: RoomUtil) => {
  const { countKeywords } = util;
  const res: Array<IMatchRes> = [];

  countKeywords.forEach((value, key) => {
    res.push({
      key,
      keyword: key,
      totalMatchNum: value.totalNum,
      thisCrawlMatchNum: value.thisNum
    });
  });

  return JSON.stringify(res);
};
