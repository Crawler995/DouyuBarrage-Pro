import { clientConfig } from '../../config';
import Barrage from '../../model/Barrage';
import { RoomUtil } from '../RoomManager';
import { Sequelize } from 'sequelize';
import IGetChartData from './IGetChartData';

const getDataFromDB = async (roomId: string) =>
  await Barrage.findAll({
    attributes: [
      'sender_level',
      [Sequelize.fn('COUNT', Sequelize.col('sender_name')), 'sender_num']
    ],
    where: {
      room_id: roomId
    },
    group: 'sender_level',
    order: [['sender_level', 'ASC']]
  });

const getStyle = () => {
  return JSON.stringify({
    title: {
      text: '弹幕发送用户等级分布',
      x: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: clientConfig.primaryColor
        }
      }
    },
    xAxis: {
      name: '等级',
      type: 'category'
    },
    yAxis: {
      name: '发送弹幕数',
      type: 'value'
    },
    series: [
      {
        name: '弹幕发送用户等级分布',
        type: 'bar',
        itemStyle: {
          color: clientConfig.primaryColor
        }
      },
      {
        name: '弹幕发送用户等级分布',
        type: 'pie',
        center: ['75%', '30%'],
        radius: ['0', '30%'],
        roseType: 'radius',
        itemStyle: {
          color: clientConfig.primaryColor,
          shadowBlur: 30,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          color: 'rgba(0, 0, 0, 0.7)'
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.4)'
          },
          smooth: 0.2
        }
      }
    ]
  });
};

const getSeries = async (util: RoomUtil) => {
  const res = await getDataFromDB(util.roomId);

  const pieDataMap = res.reduce((res, cur) => {
    const num = cur.get('sender_num') as number;
    // 0~9 -> 0
    // 10~19 -> 1
    const level = Math.floor((cur.get('sender_level') as number) / 10);
    const curNum = res.get(level);
    res.set(level, (curNum ?? 0) + num);
    return res;
  }, new Map<number, number>());
  const pieData: Array<{ name: string; value: number }> = [];
  for (const [level, num] of pieDataMap) {
    const name = `${level * 10}-${level * 10 + 9}级`;
    pieData.push({ name, value: num });
  }

  return JSON.stringify({
    xAxis: {
      data: res.map(item => item.get('sender_level'))
    },
    series: [
      {
        data: res.map(item => item.get('sender_num'))
      },
      {
        data: pieData
      }
    ]
  });
};

const getDmLevelData: IGetChartData = {
  getStyle,
  getSeries
};

export default getDmLevelData;
