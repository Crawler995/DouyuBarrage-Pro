import db from './db';
import * as moment from 'moment';
import { DATE, STRING, Model } from 'sequelize';
import log4js from '../logger';
import User from './User';

// table
class Barrage extends Model {}
Barrage.init(
  {
    id: {
      type: STRING(40),
      primaryKey: true
    },
    time: {
      type: DATE,
      allowNull: false,
      get() {
        const self = this as any;
        return moment(self.getDataValue('time')).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    room_id: {
      type: STRING(10),
      allowNull: false
    },
    user_id: {
      type: STRING(12),
      allowNull: false
    },
    dm_content: {
      type: STRING(200),
      allowNull: false
    }
  },
  {
    timestamps: false,
    sequelize: db,
    freezeTableName: true,
    modelName: 'barrage'
  }
);

const logger = log4js.getLogger('Barrage');

Barrage.sync().then(() => {
  logger.info('sync');
});

export default Barrage;
