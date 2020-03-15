import Barrage from './Barrage';
import CrawlRecord from './CrawlRecord';
import HighlightRecord from './HighlightRecord';
import User from './User';
import UserBarrageNum from './UserBarrageNum';

Barrage.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});
UserBarrageNum.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});

export { Barrage, CrawlRecord, HighlightRecord, User, UserBarrageNum };
