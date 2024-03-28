require('dotenv').config()
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const userRouter = require("./routes/user.route")
const socketio = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const app = express();

app.use(cors());

//SOCKET IO ADMIN UI
app.use("/sioadmin", express.static('./node_modules/@socket.io/admin-ui/ui/dist'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", userRouter);

server = http.createServer(app)

const io = socketio(server,{cors: {origin: "*"}});

const { test } = require("./socketHandler/testHandler")(io);

const onConnection = (socket) => {
  socket.on("test:test", test);
 
}

io.on("connection", onConnection);

instrument(io, {
  auth: {
    type: "basic",
    username: process.env.SIO_ADMINUI_USERNAME,
    password: process.env.SIO_ADMINUI_PASSWORD 
  },
  mode: "development",
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}  http://localhost:${process.env.PORT}`);
});