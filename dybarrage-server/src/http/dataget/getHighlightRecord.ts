import * as Koa from 'koa';
import * as Router from 'koa-router';
import HighlightRecord from '../../model/HighlightRecord';
import { Op } from 'sequelize';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;
  const { startTime, stopTime, limit, offset } = ctx.request.query;

  let timeRange = {};
  let hasTimeRange = false;
  if (startTime !== undefined) {
    timeRange = {
      [Op.gte]: startTime
    };
    hasTimeRange = true;
  }
  if (stopTime !== undefined) {
    timeRange = {
      ...timeRange,
      [Op.lte]: stopTime
    };
    hasTimeRange = true;
  }
  let where = {
    room_id: roomId
  };
  if (hasTimeRange) {
    where = { ...where, ...{ time: timeRange } };
  }

  try {
    const res = await HighlightRecord.findAll({
      where,
      order: [['time', 'desc']],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    ctx.body = {
      error: 0,
      data: res
    };
  } catch (error) {
    ctx.body = {
      error: 500,
      data: error
    };
  }
};
