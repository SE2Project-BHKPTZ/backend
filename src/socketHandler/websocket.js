const socketio = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { setWebsocket } = require('../services/user.service');

let io;
const { test } = require('./testHandler')(io);

exports.createIO = (server) => {
  io = socketio(server, { cors: { origin: '*' } });
  const onConnection = (socket) => {
    console.log('connection');
    socket.on('test:test', test);
  };
  io.use((socket, next) => {
    const { _query: { uuid } } = socket.request;
    console.log(uuid);
    setWebsocket(uuid, socket.id);
    next();
  });

  io.on('connection', onConnection);

  // SocketIO admin UI
  if (process.env.SIO_ADMINUI_USERNAME && process.env.SIO_ADMINUI_PASSWORD) {
    instrument(io, {
      auth: {
        type: 'basic',
        username: process.env.SIO_ADMINUI_USERNAME,
        password: process.env.SIO_ADMINUI_PASSWORD,
      },
      mode: 'development',
    });
  }
};

exports.io = () => io;
