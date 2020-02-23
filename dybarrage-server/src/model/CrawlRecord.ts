import { Sequelize, DATE, STRING, NOW, INTEGER, Model, NUMBER } from "sequelize";
import db from '../router/db';
import * as moment from "moment";

// table crawl_record
class CrawlRecord extends Model {} 
CrawlRecord.init({
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
}, {
  timestamps: false,
  sequelize: db,
  freezeTableName: true,
  modelName: 'crawl_record'
});

CrawlRecord.sync().then(() => {
  console.log('CrawlRecord sync');
})

export default CrawlRecord;