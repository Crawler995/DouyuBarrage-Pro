import { clientConfig } from "../../config";
import Barrage from "../../model/Barrage";
import { RoomUtil } from "../RoomManager";
import { Sequelize } from "sequelize";
import IGetChartData from "./IGetChartData";

const getDataFromDB = async (roomId: string) => await Barrage.findAll({
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
    tooltip : {
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
    series: {
      name: '弹幕发送用户等级分布',
      type: 'bar',
      itemStyle: {
        color: clientConfig.primaryColor
      }
    }
  });
};

const getSeries = async (util: RoomUtil) => {
  const res = await getDataFromDB(util.roomId);

  return JSON.stringify({
    xAxis: {
      data: res.map(item => item.get('sender_level'))
    },
    series: {
      data: res.map(item => item.get('sender_num'))
    }
  });
}

const getDmLevelData: IGetChartData = {
  getStyle, getSeries
};

export default getDmLevelData;