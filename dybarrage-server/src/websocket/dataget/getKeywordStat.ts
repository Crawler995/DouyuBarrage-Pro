import { RoomUtil } from '../RoomManager';
import Barrage from '../../model/Barrage';
import { Op } from 'sequelize';

interface IMatchRes {
  key: string;
  keyword: string;
  totalMatchNum: number;
  thisCrawlMatchNum: number;
}

export default async (util: RoomUtil) => {
  const { roomId, dmKeywords, startCrawlTime } = util;
  const res: Array<IMatchRes> = [];

  for (const keyword of dmKeywords) {
    const totalMatchKeywordCount = await (
      await Barrage.findAndCountAll({
        where: {
          room_id: roomId,
          dm_content: {
            [Op.substring]: keyword
          }
        }
      })
    ).count;

    let thisMatchKeywordCount;
    if (startCrawlTime === '') {
      thisMatchKeywordCount = 0;
    } else {
      thisMatchKeywordCount = await (
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
    }

    res.push({
      key: keyword,
      keyword,
      totalMatchNum: totalMatchKeywordCount,
      thisCrawlMatchNum: thisMatchKeywordCount
    });
  }

  return JSON.stringify(res);
};
