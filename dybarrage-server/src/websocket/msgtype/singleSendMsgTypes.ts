// not periodly
// only send when specific condition occurs
type singleSendMsgTypes =
  'add_room_success' |
  'add_room_failed' |

  'start_crawl_success' |
  'start_crawl_failed' |
  
  'crawl_failed' |
  
  'stop_crawl_success' |
  'stop_crawl_failed'
;

export default singleSendMsgTypes;