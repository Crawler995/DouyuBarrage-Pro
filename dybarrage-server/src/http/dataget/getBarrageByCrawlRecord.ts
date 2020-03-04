import * as Koa from 'koa';
import * as Router from 'koa-router';
import CrawlRecord from '../../model/CrawlRecord';
import Barrage from '../../model/Barrage';
import { Op } from 'sequelize';
import { Parser } from 'json2csv';

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

  const barrages = await Barrage.findAll({
    where: {
      room_id: roomId,
      time: {
        [Op.or]: times
      }
    }
  });

  const barragesJSON = barrages.map(item => item.toJSON());

  const csv = new Parser({
    fields: columns
  }).parse(barragesJSON);

  const utf8BOM = Buffer.from('\xEF\xBB\xBF', 'binary');
  const buffer = Buffer.concat([utf8BOM, Buffer.from(csv)]);

  ctx.set('Content-disposition', 'attachment; filename=barrages.csv');
  ctx.set('Content-type', 'text/csv; charset=utf-8');
  ctx.body = buffer;
};
