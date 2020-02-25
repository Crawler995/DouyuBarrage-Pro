import { getCrawlBasicStat } from "../dataget";

// periodly send to client
// real-time data
const periodlySendMsgTypeDataGetMap: Map<string, (roomId: string) => Promise<string>> = new Map([
  ['crawl_basic_stat', getCrawlBasicStat]
]);


export default periodlySendMsgTypeDataGetMap;