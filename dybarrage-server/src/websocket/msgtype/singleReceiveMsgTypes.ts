// client send message types
// not periodly
type singleReceiveMsgTypes =
  | 'add_room'
  | 'start_crawl'
  | 'stop_crawl'
  | 'add_keyword'
  | 'delete_keyword'
  | 'request_send_dm'
  | 'stop_send_dm'
  | 'add_highlight_record'
  | 'disconnect';

export default singleReceiveMsgTypes;
