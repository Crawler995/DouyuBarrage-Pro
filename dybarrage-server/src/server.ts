import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as Socket from 'socket.io';
import * as process from 'process';
import RoomManager from './websocket/RoomManager';

import * as HttpDataGet from './http/dataget';
import singleReceiveMsgTypes from './websocket/msgtype/singleReceiveMsgTypes';

process.on('SIGINT', async () => {
  await RoomManager.forceStopAll();
  process.exit();
})

const app = new Koa();

// http server
const router = new Router();
router.get('/api/room/:roomId/dyinfo', HttpDataGet.getRoomDyInfo);
router.get('/api/room/:roomId/crawlrec', HttpDataGet.getCrawlRecord);
app
.use(router.routes())
.use(router.allowedMethods());

// websocket server
const io = Socket(app.listen(3001, () => {
  console.log('server listen on port 3001');
}));
io.on('connection', (socket) => {
  console.log('new connection');

  // receive 'add_room' from the client
  // means the client is prepared
  socket.on('add_room', async (roomId) => {
    await RoomManager.addRoom(roomId, socket);
  });

  // start crawl process
  socket.on('start_crawl', () => {
    RoomManager.startRoomCrawlProcess(socket);
  });

  // stop crawl process
  socket.on('stop_crawl', () => {
    RoomManager.stopRoomCrawlProcess(socket);
  });

  // the client is disconnected
  // remove all things of the client
  socket.on('disconnect', () => {
    RoomManager.removeRoom(socket);
  })
});