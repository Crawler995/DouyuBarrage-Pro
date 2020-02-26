import { Sequelize } from 'sequelize';
import { dbconfig } from '../config';
import log4js from '../logger';

const sequelize = new Sequelize(dbconfig.db, dbconfig.username, dbconfig.password, {
  host: dbconfig.host,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  },
  logging: false,
  dialectOptions: {
    charset: 'utf8mb4'
  },
  define: {
    charset: 'utf8mb4'
  },
  timezone: dbconfig.timezone
});

const logger = log4js.getLogger('db');

sequelize
.authenticate()
.then(() => {
  logger.info('connect db');
})
.catch((err) => {
  logger.error(err);
});

sequelize.sync().then(() => {
  logger.info('sync');
})

export default sequelize;
