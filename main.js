require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const mongoose = require('mongoose');
const userRouter = require('./src/routes/user.route');

mongoose
  .connect(`mongodb://${process.env.MONGO_HOST}:27017/wizard?authSource=admin`, {
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRouter);

const server = http.createServer(app);

const io = socketio(server, { cors: { origin: '*' } });

const { test } = require('./src/socketHandler/testHandler')(io);

const onConnection = (socket) => {
  socket.on('test:test', test);
};

io.on('connection', onConnection);

// SocketIO admin UI
if (process.env.SIO_ADMINUI_USERNAME && process.env.SIO_ADMINUI_PASSWORD) {
  app.use('/sioadmin', express.static('./node_modules/@socket.io/admin-ui/ui/dist'));

  instrument(io, {
    auth: {
      type: 'basic',
      username: process.env.SIO_ADMINUI_USERNAME,
      password: process.env.SIO_ADMINUI_PASSWORD,
    },
    mode: 'development',
  });
}

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}  http://localhost:${process.env.PORT}`);
});
