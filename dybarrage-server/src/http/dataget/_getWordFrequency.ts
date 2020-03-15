import { Barrage } from '../../model';
import * as nodejieba from 'nodejieba';
import stopWords from '../util/stopWords';
import * as path from 'path';
import * as process from 'process';

const _getWordFrequency = async (roomId: string) => {
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

  if (sortedRes.length === 0) {
    return [];
  }

  const resMaxLen = 100;
  const thresold =
    sortedRes.length > resMaxLen
      ? sortedRes[resMaxLen - 1].value
      : sortedRes[sortedRes.length - 1].value;
  const chartData = sortedRes.filter(item => item.value >= thresold);
  return chartData;
};

process.on('message', async m => {
  if (typeof m === 'object' && m.type === 'word_frequency') {
    const chartData = await _getWordFrequency(m.roomId);
    (process as any).send({
      type: 'word_frequency',
      chartData
    });
  }
});

process.on('SIGHUP', () => {
  process.exit();
});
