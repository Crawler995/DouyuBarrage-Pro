import * as moment from 'moment';

export const getNowString = () => moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
