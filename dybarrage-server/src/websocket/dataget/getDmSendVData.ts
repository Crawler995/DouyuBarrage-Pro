import { RoomUtil } from "../RoomManager";
import IGetChartData from './IGetChartData';
import { clientConfig } from "../../config";

const getXAxis = () =>{
  let res = [];
  for(let i = 30; i > 0; i--) {
    res.push(i);
  }
  return res;
}

const getStyle = () => {
  return JSON.stringify({
    title: {
      text: '实时弹幕发送速度',
      x: 'center'
    },
    tooltip : {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: clientConfig.primaryColor
        }
      },
      formatter: `前第{b}秒 速度{c}条/s`
    },
    xAxis: {
      name: '前第x秒',
      type: 'category',
      data: getXAxis(),
      boundaryGap: true,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      name: '弹幕发送速度',
      type: 'value'
    }
  });
};

const getSeries = async (util: RoomUtil) => {
  const {lastCrawlDmNum, crawlDmNum} = util;

  util.dmSendVData.shift();
  util.dmSendVData.push(crawlDmNum - lastCrawlDmNum);
  util.lastCrawlDmNum = crawlDmNum;

  return JSON.stringify([
    {
      data: util.dmSendVData,
      type: 'line',
      lineStyle: {
        color: clientConfig.primaryColor
      }
    }
  ]);
};

const getDmSendVData: IGetChartData = {
  getStyle, getSeries
};

export default getDmSendVData;