// periodly send to client
// real-time data
type periodlySendMsgType =
  | 'crawl_basic_stat'
  | 'keyword_stat'
  | 'dmsendv_data'
  | 'dmlevel_data'
  | 'cur_dm';

export default periodlySendMsgType;
