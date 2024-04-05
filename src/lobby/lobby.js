const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

class Player {
  constructor(uuid, socketId) {
    this.uuid = uuid;
    this.socketId = socketId;
  }
}

class Lobby {
  constructor(lobbyId, name) {
    this.uuid = uuidv4();
    this.lobbyId = lobbyId;
    this.status = 'created';
    this.name = name;
    this.players = [];
    this.results = [];
  }

  addPlayer(player) {
    if (this.players.length < 6) {
      this.players.push(player);
      return true;
    }
    return false;
  }
}

