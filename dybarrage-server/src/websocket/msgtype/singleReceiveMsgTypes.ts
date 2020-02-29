// client send message types
// not periodly
type singleReceiveMsgTypes =
  | 'add_room'
  | 'start_crawl'
  | 'stop_crawl'
  | 'add_keyword'
  | 'delete_keyword'
  | 'disconnect';

export default singleReceiveMsgTypes;
