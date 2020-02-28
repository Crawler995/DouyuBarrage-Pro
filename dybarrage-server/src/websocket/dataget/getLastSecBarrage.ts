import { RoomUtil } from "../RoomManager";
import Barrage from "../../model/Barrage";
import moment = require("moment");

export default async (util: RoomUtil) => {
  const res = await Barrage.findAll({
    attributes: [
      'sender_name', 'sender_level', 'sender_avatar_url',
      'badge_name', 'badge_level',
      'dm_content'
    ],
    where: {
      room_id: util.roomId,
      time: moment(Date.now() - 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    limit: 7
  });

  return JSON.stringify(res);
};