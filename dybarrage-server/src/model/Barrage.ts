import db from './db';
import * as moment from "moment";
import { Sequelize, DATE, STRING, NOW, INTEGER, Model, NUMBER } from "sequelize";

// table 
class Barrage extends Model {}
Barrage.init({
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
  sender_name: {
    type: STRING(60),
    allowNull: false
  },
  sender_level: {
    type: INTEGER,
    allowNull: false
  },
  sender_avatar_url: {
    type: STRING(100),
    allowNull: false
  },
  dm_content: {
    type: STRING(200),
    allowNull: false
  },
  badge_name: {
    type: STRING(20),
    allowNull: true
  },
  badge_level: {
    type: INTEGER,
    allowNull: true
  }
}, {
  timestamps: false,
  sequelize: db,
  freezeTableName: true,
  modelName: 'barrage'
});

Barrage.sync().then(() => {
  console.log('Barrage sync');
})

export default Barrage;