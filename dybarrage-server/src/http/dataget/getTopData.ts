import * as Koa from 'koa';
import * as Router from 'koa-router';
import axios from 'axios';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  let topDataRes;
  try {
    topDataRes = await axios({
      url: 'http://open.douyucdn.cn/api/RoomApi/live/1',
      validateStatus: status => true
    });

    let topData;
    let statusCode = 200;

    if (topDataRes.status === 200) {
      if (topDataRes.data.error === 0) {
        topData = topDataRes.data;
      } else {
        topData = {
          error: 500,
          data: 'top3数据请求错误'
        };
        statusCode = 500;
      }
    } else {
      topData = {
        error: 500,
        data: 'top3数据请求错误'
      };
      statusCode = 500;
    }

    ctx.status = statusCode;
    ctx.body = topData;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = {
      error: 500,
      data: '网络无连接'
    };
  }
};
