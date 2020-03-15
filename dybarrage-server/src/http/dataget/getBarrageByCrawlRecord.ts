import * as Koa from 'koa';
import * as Router from 'koa-router';
import { CrawlRecord } from '../../model';
import { Op } from 'sequelize';
import getBarrage from './getBarrage';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const { crawlRecordIds, columns } = ctx.request.body;
  const roomId = ctx.params.roomId;

  let where;
  if (crawlRecordIds.length === 0) {
    where = {
      room_id: roomId
    };
  } else {
    where = {
      id: {
        [Op.or]: crawlRecordIds
      }
    };
  }
  const recordsRes = await CrawlRecord.findAll({
    where
  });

  const times = recordsRes.map((item: any) => {
    const start = item.getDataValue('start_time');
    const stop = item.getDataValue('stop_time');

    return {
      [Op.gte]: start,
      [Op.lte]: stop
    };
  });

  const buffer = await getBarrage(roomId, columns, times);

  ctx.set('Content-disposition', 'attachment; filename=barrages.csv');
  ctx.set('Content-type', 'text/csv; charset=utf-8');
  ctx.body = buffer;
};
