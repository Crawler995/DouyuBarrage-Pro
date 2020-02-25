import { getCrawlBasicStat } from "../dataget";

const periodlySendMsgTypeDataGetMap: Map<string, (roomId: string) => Promise<string>> = new Map([
  ['crawl_basic_stat', getCrawlBasicStat]
]);


export default periodlySendMsgTypeDataGetMap;