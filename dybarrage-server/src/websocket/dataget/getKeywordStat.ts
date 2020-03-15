import { RoomUtil } from '../RoomManager';
import Barrage from '../../model/Barrage';
import { Op, Sequelize } from 'sequelize';

interface IMatchRes {
  key: string;
  keyword: string;
  totalMatchNum: number;
  thisCrawlMatchNum: number;
}

export const getKeywordTotalNum = async (roomId: string, keyword: string) => {
  return ((
    await Barrage.findOne({
      attributes: [[Sequelize.fn('count', Sequelize.col('id')), 'barrages_num']],
      where: {
        room_id: roomId,
        dm_content: {
          [Op.substring]: keyword
        }
      }
    })
  )?.get('barrages_num') ?? 0) as number;
};

export const getKeywordThisNum = async (
  roomId: string,
  keyword: string,
  startCrawlTime: Date | null
) => {
  if (startCrawlTime === null) {
    return 0;
  }

  return ((
    await Barrage.findOne({
      attributes: [[Sequelize.fn('count', Sequelize.col('id')), 'barrages_num']],
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
  )?.get('barrages_num') ?? 0) as number;
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
