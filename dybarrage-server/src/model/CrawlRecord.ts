import { Sequelize, DATE, STRING, NOW, INTEGER, Model, NUMBER } from 'sequelize';
import db from './db';
import * as moment from 'moment';
import log4js from '../logger';

// table crawl_record
class CrawlRecord extends Model {}
CrawlRecord.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    start_time: {
      type: DATE,
      allowNull: true,
      get() {
        const self = this as any;
        return moment(self.getDataValue('start_time')).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    stop_time: {
      type: DATE,
      allowNull: true,
      get() {
        const self = this as any;
        return moment(self.getDataValue('stop_time')).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    room_id: {
      type: STRING(10),
      allowNull: false
    },
    dm_num: {
      type: INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: false,
    sequelize: db,
    freezeTableName: true,
    modelName: 'crawl_record'
  }
);

const logger = log4js.getLogger('CrawlRecord');

CrawlRecord.sync().then(() => {
  logger.info('sync');
});

export default CrawlRecord;
