import { Sequelize } from 'sequelize';
import { dbconfig } from '../config';

const sequelize = new Sequelize(dbconfig.db, dbconfig.username, dbconfig.password, {
  host: dbconfig.host,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  },
  logging: true,
  define: {
    charset: 'utf8'
  },
  timezone: dbconfig.timezone
});

sequelize
.authenticate()
.then(() => {
  console.log('connect db');
})
.catch((err) => {
  console.log('db error: ' + err);
});

sequelize.sync().then(() => {
  console.log('db sync');
})

export default sequelize;
