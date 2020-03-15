import * as Koa from 'koa';
import * as Router from 'koa-router';
import { UserBarrageNum, User } from '../../model';
import { Op } from 'sequelize';

const getFans = async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;
  const res = await getFansDataFromDB(roomId);

  ctx.body = {
    error: 0,
    data: {
      xAxis: {
        data: res.map((item: any) => item.get('user').get('sender_name'))
      },
      series: {
        data: res.map((item: any) => item.get('barrage_num'))
      }
    }
  };
};

// todo
const getFansDataFromDB = async (roomId: string) => {
  return await UserBarrageNum.findAll({
    include: [
      {
        model: User,
        required: true,
        attributes: [['name', 'sender_name']]
      }
    ],
    attributes: ['barrage_num'],
    where: {
      room_id: roomId
    },
    order: [['barrage_num', 'DESC']],
    limit: 40
  });
};

export default getFans;
