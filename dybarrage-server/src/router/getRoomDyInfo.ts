import * as Koa from 'koa';
import * as Router from 'koa-router';
import axios from 'axios';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;

  let roomDyInfoRes;
  try {
    roomDyInfoRes = await axios({
      url: `http://open.douyucdn.cn/api/RoomApi/room/${roomId}`,
      validateStatus: status => true
    });

    let roomDyInfo;
    let statusCode = 200;

    if(roomDyInfoRes.status === 200) {
      if(roomDyInfoRes.data.error === 0) {
        roomDyInfo = roomDyInfoRes.data;
      } else {
        roomDyInfo = {
          error: 404,
          data: '房间未找到'
        }
        statusCode = 404;
      }
    } else if(roomDyInfoRes.status === 404) {
      roomDyInfo = {
        error: 404,
        data: '房间未找到'
      }
      statusCode = 404;
    }

    ctx.status = statusCode;
    ctx.body = roomDyInfo;
  } catch (error) {
    console.log(error);
  }
};