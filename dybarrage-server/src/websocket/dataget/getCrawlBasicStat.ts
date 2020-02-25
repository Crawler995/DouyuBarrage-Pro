import Barrage from "../../model/Barrage";
import RoomManager, { RoomUtil } from '../RoomManager';
import { Op, Sequelize } from "sequelize";
import moment = require("moment");
import CrawlRecord from "../../model/CrawlRecord";

export default async (roomId: string) => {
  const totalBarrageCount = await (await Barrage.findAndCountAll({
    where: {
      room_id: roomId
    }
  })).count;

  const util = RoomManager.getUtilByRoomId(roomId) as RoomUtil;
  const startCrawlTime = util.startCrawlTime;
  let thisCrawlBarrageCount;
  if(startCrawlTime === '') {
    thisCrawlBarrageCount = 0;
  } else {
    thisCrawlBarrageCount = await(await Barrage.findAndCountAll({
      where: {
        room_id: roomId,
        time: {
          [Op.gte]: startCrawlTime
        }
      }
    })).count;
  }
  util.crawlDmNum = thisCrawlBarrageCount;

  // correct value: '00:01:35'
  // crawlFakeTotalTime: 135
  const crawlFakePastTotalTime: number = await(await CrawlRecord.findOne({
    attributes: [
      [Sequelize.fn('sum', (
        Sequelize.fn('timediff', Sequelize.col('stop_time'), Sequelize.col('start_time'))
      )), 'crawl_total_time']
    ],
    where: {
      room_id: roomId
    }
  }))?.get('crawl_total_time') as number;

  const pastTotalTime = convertFakeTimeToTime(crawlFakePastTotalTime);
  const thisCrawlTime = getThisCrawlTime(startCrawlTime);

  return JSON.stringify([
    { title: '抓取弹幕总数', value: totalBarrageCount },
    { title: '此次抓取弹幕数', value: thisCrawlBarrageCount },
    { title: '抓取总时间', value: convertTimeToStr(timeAdd(pastTotalTime, thisCrawlTime)) },
    { title: '此次抓取时间', value: convertTimeToStr(thisCrawlTime) }
  ]);
}

interface Time {
  hours: number,
  minutes: number,
  seconds: number
}

// fakeTime: 135 means '00:01:35'
const convertFakeTimeToTime = (fakeTime: number | null): Time => {
  if(fakeTime === null) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  const crawlFakeTotalTimeStr = fakeTime.toString();
  let crawlTotalTimeStr = '';
  // '135' -> '000135'
  for(let i = 0; i < 6 - crawlFakeTotalTimeStr.length; i++) {
    crawlTotalTimeStr += '0';
  }
  crawlTotalTimeStr += crawlFakeTotalTimeStr;
  // '000135' -> '00时01分35秒'
  return {
    hours: parseInt(crawlTotalTimeStr.substr(0, 2)),
    minutes: parseInt(crawlTotalTimeStr.substr(2, 2)),
    seconds: parseInt(crawlTotalTimeStr.substr(4, 2))
  };
};

const timeAdd = (t1: Time, t2: Time) => {
  const res = {
    hours: t1.hours + t2.hours,
    minutes: t1.minutes + t2.minutes,
    seconds: t1.seconds + t2.seconds
  };

  if(res.seconds >= 60) {
    res.seconds -= 60;
    res.minutes += 1;
  }
  if(res.minutes >= 60) {
    res.minutes -= 60;
    res.hours += 1;
  }

  return res;
};

const getThisCrawlTime = (startCrawlTime: string): Time => {
  const thisCrawlTime = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if(startCrawlTime === '') {
    return thisCrawlTime;
  }

  let thisCrawlBarrageTime = moment(Date.now()).diff(moment(startCrawlTime), 'seconds');
  thisCrawlTime.hours = Math.floor(thisCrawlBarrageTime / 3600);
  thisCrawlBarrageTime -= thisCrawlTime.hours * 3600;
  thisCrawlTime.minutes = Math.floor(thisCrawlBarrageTime / 60);
  thisCrawlBarrageTime -= thisCrawlTime.minutes * 60;
  thisCrawlTime.seconds = thisCrawlBarrageTime; 

  return thisCrawlTime;
}

const convertTimeToStr = (time: Time): string => {
  const {hours, minutes, seconds} = time;
  return `${hours}时${minutes}分${seconds}秒`
};