import { Barrage, User } from '../../model';
import { Op } from 'sequelize';
import { Parser } from 'json2csv';

const getBarrage = async (
  roomId: string,
  columns: string[],
  times: Array<{ [Op.gte]: string; [Op.lte]: string }>
) => {
  const barrages = await Barrage.findAll({
    include: [
      {
        model: User,
        required: true,
        attributes: [
          ['avatar_url', 'sender_avatar_url'],
          ['name', 'sender_name'],
          ['level', 'sender_level'],
          'badge_name',
          'badge_level'
        ]
      }
    ],
    where: {
      room_id: roomId,
      time: {
        [Op.or]: times
      }
    }
  });

  const barragesJSON = barrages
    .map(item => item.toJSON())
    .map((item: any) => ({
      id: item.id,
      time: item.time,
      room_id: item.room_id,
      dm_content: item.dm_content,
      ...item.user
    }));

  const csv = new Parser({
    fields: columns
  }).parse(barragesJSON);

  const utf8BOM = Buffer.from('\xEF\xBB\xBF', 'binary');
  const buffer = Buffer.concat([utf8BOM, Buffer.from(csv)]);

  return buffer;
};

export default getBarrage;
