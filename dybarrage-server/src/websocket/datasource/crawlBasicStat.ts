export default async (roomId: string) => {
  return JSON.stringify([
    { title: '弹幕抓取总数', value: Math.ceil(Math.random() * 20000) },
    { title: '此次抓取数', value: 2341 },
    { title: '抓取总时间', value: '2小时34分' },
    { title: '此次抓取时间', value: '2分' }
  ]);
}