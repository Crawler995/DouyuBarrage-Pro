import Barrage from "../../model/Barrage";
import RoomManager from '../RoomManager';
import { Op } from "sequelize";

export default async (roomId: string) => {
  const totalBarrageCount = await (await Barrage.findAndCountAll({
    where: {
      room_id: roomId
    }
  })).count;

  const startCrawlTime = RoomManager.getCrawlStartTimeByRoomId(roomId);
  let thisCrawlBarrageCount;

  if(startCrawlTime === '') {
    thisCrawlBarrageCount = 0;
  } else {
    const thisCrawlBarrageCount = await(await Barrage.findAndCountAll({
      where: {
        room_id: roomId,
        time: {
          [Op.gte]: startCrawlTime
        }
      }
    }));
  }

  return JSON.stringify([
    { title: '弹幕抓取总数', value: totalBarrageCount },
    { title: '此次抓取数', value: thisCrawlBarrageCount },
    { title: '抓取总时间', value: '2小时34分' },
    { title: '此次抓取时间', value: '2分' }
  ]);
}