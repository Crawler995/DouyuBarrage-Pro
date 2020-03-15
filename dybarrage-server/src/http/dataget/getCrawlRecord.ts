import * as Koa from 'koa';
import * as Router from 'koa-router';
import { CrawlRecord } from '../../model';
import { Op } from 'sequelize';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;
  const { startTime, stopTime, limit, offset } = ctx.request.query;

  let where = {
    room_id: roomId
  };
  if (startTime !== undefined) {
    where = {
      ...where,
      ...{
        start_time: {
          [Op.gte]: startTime
        }
      }
    };
  }
  if (stopTime !== undefined) {
    where = {
      ...where,
      ...{
        stop_time: {
          [Op.lte]: stopTime
        }
      }
    };
  }

  try {
    const res = await CrawlRecord.findAndCountAll({
      where,
      order: [['start_time', 'desc']],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    ctx.body = {
      error: 0,
      data: res.rows,
      total: res.count
    };
  } catch (error) {
    ctx.body = {
      error: 500,
      data: error
    };
  }
};
