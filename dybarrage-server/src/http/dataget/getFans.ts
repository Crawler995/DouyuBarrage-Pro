import Barrage from '../../model/Barrage';
import { Sequelize } from 'sequelize';
import * as Koa from 'koa';
import * as Router from 'koa-router';

const getFans = async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;
  const res = await getFansDataFromDB(roomId);
  const sortedRes = res.sort(
    (a: any, b: any) => b.get('send_barrages_num') - a.get('send_barrages_num')
  );

  ctx.body = {
    error: 0,
    data: {
      xAxis: {
        data: sortedRes.map((item: any) => item.get('sender_name'))
      },
      series: {
        data: sortedRes.map((item: any) => item.get('send_barrages_num'))
      }
    }
  };
};

const getFansDataFromDB = async (roomId: string) => {
  return await Barrage.findAll({
    attributes: [
      'sender_name',
      [Sequelize.fn('COUNT', Sequelize.col('sender_name')), 'send_barrages_num']
    ],
    where: {
      room_id: roomId
    },
    group: 'sender_name',
    limit: 40
  });
};

export default getFans;
