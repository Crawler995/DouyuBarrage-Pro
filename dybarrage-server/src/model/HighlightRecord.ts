import { Sequelize, DATE, STRING, NOW, INTEGER, Model, NUMBER } from 'sequelize';
import db from './db';
import * as moment from 'moment';
import log4js from '../logger';

// table crawl_record
class HighlightRecord extends Model {}
HighlightRecord.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
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
    }
  },
  {
    timestamps: false,
    sequelize: db,
    freezeTableName: true,
    modelName: 'highlight_record'
  }
);

const logger = log4js.getLogger('HighlightRecord');

HighlightRecord.sync().then(() => {
  logger.info('sync');
});

export default HighlightRecord;
