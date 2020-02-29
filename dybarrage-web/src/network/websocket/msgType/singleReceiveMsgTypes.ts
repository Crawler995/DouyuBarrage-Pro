type singleReceiveMsgTypes =
  | 'add_room_success'
  | 'add_room_failed'
  | 'start_crawl_success'
  | 'start_crawl_failed'
  | 'crawl_failed'
  | 'stop_crawl_success'
  | 'stop_crawl_failed'
  | 'add_keyword_success'
  | 'add_keyword_failed'
  | 'delete_keyword_success'
  | 'delete_keyword_failed';

export default singleReceiveMsgTypes;
