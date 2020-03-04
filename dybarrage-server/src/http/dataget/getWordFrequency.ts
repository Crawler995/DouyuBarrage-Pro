import * as Koa from 'koa';
import * as Router from 'koa-router';
import Barrage from '../../model/Barrage';
import * as nodejieba from 'nodejieba';
import stopWords from '../util/stopWords';
import * as path from 'path';

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;

  const wordMap: Map<string, number> = new Map<string, number>();
  const res: Array<{ name: string; value: number }> = [];

  const barrages = await Barrage.findAll({
    attributes: ['dm_content'],
    where: {
      room_id: roomId
    }
  });

  nodejieba.load({
    userDict: path.resolve('./src/http/util/userDict.txt')
  });

  barrages.forEach((barrage: any) => {
    const content = barrage.getDataValue('dm_content');
    nodejieba.cut(content).forEach((word: string) => {
      wordMap.set(word, wordMap.has(word) ? (wordMap.get(word) as number) + 1 : 1);
    });
  });

  for (const [word, num] of wordMap) {
    if (!stopWords.includes(word)) {
      res.push({ name: word, value: num });
    }
  }

  const sortedRes = res.filter(item => item.name.length > 1).sort((a, b) => b.value - a.value);
  const resMaxLen = 100;
  const thresold =
    sortedRes.length > resMaxLen
      ? sortedRes[resMaxLen - 1].value
      : sortedRes[sortedRes.length - 1].value;
  const chartData = sortedRes.filter(item => item.value >= thresold);

  ctx.body = {
    error: 0,
    data: chartData
  };
};
