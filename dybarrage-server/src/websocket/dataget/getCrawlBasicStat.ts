import Barrage from '../../model/Barrage';
import { RoomUtil } from '../RoomManager';
import { Op, Sequelize } from 'sequelize';
import CrawlRecord from '../../model/CrawlRecord';

export const getPastTotalCrawlDmNum = async (roomId: string) => {
  return await (
    await Barrage.findAndCountAll({
      where: {
        room_id: roomId
      }
    })
  ).count;  
}

export const getPastTotalCrawlTime = async (roomId: string) => {
  const fakeTotalTime = await (await CrawlRecord.findOne({
    attributes: [
      [
        Sequelize.fn(
          'sum',
          Sequelize.fn('timediff', Sequelize.col('stop_time'), Sequelize.col('start_time'))
        ),
        'crawl_total_time'
      ]
    ],
    where: {
      room_id: roomId
    }
  }))?.get('crawl_total_time');

  if(fakeTotalTime === null) {
    return 0;
  }

  let fakeTotalTimeStr = fakeTotalTime + '';
  if(fakeTotalTimeStr.length < 6) {
    fakeTotalTimeStr = Array(6 - fakeTotalTimeStr.length).fill(0).join('') + fakeTotalTimeStr;
  }
  
  const len = fakeTotalTimeStr.length;

  const hour = parseInt(fakeTotalTimeStr.substr(0, len - 4));
  const minute = parseInt(fakeTotalTimeStr.substr(len - 4, 2));
  const second = parseInt(fakeTotalTimeStr.substr(len - 2, 2));

  return hour * 3600 + minute * 60 + second;
}

export const getCrawlBasicStat = (util: RoomUtil) => {
  const { crawlBasicStat } = util;
  const thisCrawlTime = crawlBasicStat.startCrawlTime ? 
    Math.floor((Date.now() - crawlBasicStat.startCrawlTime.getTime()) / 1000) : 0;

  return JSON.stringify([
    { title: '抓取弹幕总数', value: crawlBasicStat.pastTotalCrawlDmNum + crawlBasicStat.thisCrawlDmNum },
    { title: '此次抓取弹幕数', value: crawlBasicStat.thisCrawlDmNum },
    { title: '抓取总时间', value:  convertSecondsToTimeStr(crawlBasicStat.pastTotalCrawlTime + thisCrawlTime)},
    { title: '此次抓取时间', value: convertSecondsToTimeStr(thisCrawlTime) }
  ]);
};

const convertSecondsToTimeStr = (seconds: number) => {
  const hour = Math.floor(seconds / 3600);
  seconds -= hour * 3600;
  const minute = Math.floor(seconds / 60);
  seconds -= minute * 60;
  const second = seconds;

  return `${hour}时${minute}分${second}秒`;
};
