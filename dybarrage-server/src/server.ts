import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as Socket from 'socket.io';

import getRoomDyInfo from './router/getRoomDyInfo';

import RoomManager from './websocket/RoomManager';

const app = new Koa();

// http server
const router = new Router();

router.get('/api/room/:roomId/dyinfo', getRoomDyInfo);

app
.use(router.routes())
.use(router.allowedMethods());

// websocket server
const io = Socket(app.listen(3001, () => {
  console.log('server listen on port 3001');
}));

io.on('connection', (socket) => {
  console.log('new connection');

  // receive 'addroom' from the client
  // means the client is prepared
  // and shows which room the socket belongs to
  socket.on('addroom', roomId => {
    RoomManager.addRoom(roomId, socket);
  });

  // start crawl process
  socket.on('startcrawl', roomId => {

  });

  // stop crawl process
  socket.on('stopcrawl', () => {

  });

  // the client is disconnected
  // remove all things of the client
  socket.on('disconnect', () => {
    RoomManager.removeRoom(socket);
  })
});