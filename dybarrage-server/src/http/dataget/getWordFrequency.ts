import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as child_process from 'child_process';
import * as path from 'path';

const fork = child_process.fork;

export default async (ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>>) => {
  const roomId = ctx.params.roomId;

  const promise = () =>
    new Promise((resolve: (value: any) => void) => {
      // new process
      // parse word frequency takes much CPU time
      const worker = fork(path.resolve('./src/http/dataget/_getWordFrequency.ts'));
      worker.on('message', (m: any) => {
        if (typeof m === 'object' && m.type === 'word_frequency') {
          worker.kill();
          resolve(m.chartData);
        }
      });

      worker.send({
        type: 'word_frequency',
        roomId
      });
    });

  const data = await promise();
  ctx.body = {
    error: 0,
    data
  };
};
