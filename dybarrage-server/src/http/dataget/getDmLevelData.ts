import Barrage from '../../model/Barrage';
import { Sequelize } from 'sequelize';
import * as Koa from 'koa';
import * as Router from 'koa-router';

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

const getDmLevelData = async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;
  const res = await getDataFromDB(roomId);

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

  ctx.body = {
    error: 0,
    data: {
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
    }
  };
};

export default getDmLevelData;
