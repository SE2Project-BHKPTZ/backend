require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const userRouter = require('./src/routes/user.route');
const lobbyRouter = require('./src/routes/lobby.route');

if (process.env.PORT === undefined
  || process.env.MONGO_HOST === undefined
  || process.env.MONGO_INITDB_ROOT_USERNAME === undefined
  || process.env.MONGO_INITDB_ROOT_PASSWORD === undefined
) {
  console.log('Some env variables are missing check README.md');
  process.exit(1);
}

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
app.use('/lobbys', lobbyRouter);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const server = http.createServer(app);

const websocket = require('./src/socketHandler/websocket');

websocket.createIO(server);
if (process.env.SIO_ADMINUI_USERNAME && process.env.SIO_ADMINUI_PASSWORD) {
  app.use('/sioadmin', express.static('./node_modules/@socket.io/admin-ui/ui/dist'));
}
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}  http://localhost:${process.env.PORT}`);
});
