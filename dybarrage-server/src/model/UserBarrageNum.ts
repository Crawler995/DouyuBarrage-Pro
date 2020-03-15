import db from './db';
import { STRING, INTEGER, Model } from 'sequelize';
import log4js from '../logger';

class UserBarrageNum extends Model {}
UserBarrageNum.init(
  {
    user_id: {
      type: STRING(12),
      primaryKey: true
    },
    room_id: {
      type: STRING(10),
      primaryKey: true
    },
    barrage_num: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    timestamps: false,
    sequelize: db,
    freezeTableName: true,
    modelName: 'user_barrage_num'
  }
);

const logger = log4js.getLogger('UserBarrageNum');

UserBarrageNum.sync().then(() => {
  logger.info('sync');
});

export default UserBarrageNum;
