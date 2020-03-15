import db from './db';
import { STRING, INTEGER, Model } from 'sequelize';
import log4js from '../logger';
import Barrage from './Barrage';
import UserBarrageNum from './UserBarrageNum';

class User extends Model {}
User.init(
  {
    id: {
      type: STRING(12),
      primaryKey: true
    },
    name: {
      type: STRING(60),
      allowNull: false
    },
    level: {
      type: INTEGER,
      allowNull: false
    },
    avatar_url: {
      type: STRING(100),
      allowNull: false
    },
    badge_name: {
      type: STRING(20),
      allowNull: false
    },
    badge_level: {
      type: INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: false,
    sequelize: db,
    freezeTableName: true,
    modelName: 'user'
  }
);

const logger = log4js.getLogger('User');

User.sync().then(() => {
  logger.info('sync');
});

export default User;
