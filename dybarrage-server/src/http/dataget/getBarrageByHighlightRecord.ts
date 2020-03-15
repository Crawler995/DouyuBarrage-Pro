import * as Koa from 'koa';
import * as Router from 'koa-router';
import { Op } from 'sequelize';
import { HighlightRecord } from '../../model';
import * as moment from 'moment';
import getBarrage from './getBarrage';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const { highlightRecordIds, columns, afterTime } = ctx.request.body;
  const roomId = ctx.params.roomId;

  let where;
  if (highlightRecordIds.length === 0) {
    where = {
      room_id: roomId
    };
  } else {
    where = {
      id: {
        [Op.or]: highlightRecordIds
      }
    };
  }
  const recordsRes = await HighlightRecord.findAll({
    where
  });

  const times = recordsRes.map((item: any) => {
    const start = item.getDataValue('time');
    const stop = moment(new Date(item.getDataValue('time')).getTime() + afterTime * 1000).format(
      'YYYY-MM-DD HH:mm:ss'
    );

    return {
      [Op.gte]: start,
      [Op.lte]: stop
    };
  });

  const buffer = await getBarrage(roomId, columns, times);

  ctx.set('Content-disposition', 'attachment; filename=highlight_barrages.csv');
  ctx.set('Content-type', 'text/csv; charset=utf-8');
  ctx.body = buffer;
};
