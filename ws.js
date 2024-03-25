const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

let io;

class ws {
  constructor(server) {
   this.server = server
    this.setupWS();
  }
  setupWS() {

    const app = express();
   
    io = socketio(this.server);
  
    instrument(io, {
      auth: {
        type: "basic",
        username: "admin",
        password: process.env.SIO_ADMINUI_PASSWORD // encrypted with bcrypt
      },
      mode: "development",
    });


  }

  getIO() {
    return io
  }

}
module.exports = ws;
