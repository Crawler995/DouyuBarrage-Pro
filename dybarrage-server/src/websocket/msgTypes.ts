import crawlBasicStat from "./datasource/crawlBasicStat";

const msgTypeDataSourceMap: Map<string, (roomId: string) => Promise<string>> = 
  new Map<string, () => Promise<string>>();

msgTypeDataSourceMap.set('CRAWL_BASIC_STAT', crawlBasicStat)

export default msgTypeDataSourceMap;