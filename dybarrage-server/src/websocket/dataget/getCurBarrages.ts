import { RoomUtil } from '../RoomManager';

export default (util: RoomUtil) => {
  const res = JSON.stringify(util.lastBarrages.map(item => item.dm_content));
  util.lastBarrages.length = 0;
  return res;
};
