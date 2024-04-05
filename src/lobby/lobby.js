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
const lobbies = {};

app.post('/create-lobby', (req, res) => {
  const lobbyId = req.body.lobbyId;
  const name = req.body.name;

  if (!lobbyId || !name) {
    return res.status(400).json({ error: 'Lobby ID and name are required' });
  }

  if (lobbies[lobbyId]) {
    return res.status(400).json({ error: 'A lobby with this ID already exists' });
  }

  const lobby = new Lobby(lobbyId, name);
  lobbies[lobbyId] = lobby;
  res.json({ lobbyId: lobby.lobbyId });
});

io.on('connection', (socket) => {
  socket.on('join-room', (lobbyId) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      return socket.emit('error', 'Lobby does not exist');
    }
    if (lobby.players.length >= 6) {
      return socket.emit('error', 'Lobby is full');
    }
    socket.join(lobbyId);
  });

  socket.on('message', (lobbyId, message) => {
    io.to(lobbyId).emit('message', message);
  });

  socket.on('disconnect', () => {
    for (const lobbyId in lobbies) {
      const lobby = lobbies[lobbyId];
      const playerIndex = lobby.players.findIndex(player => player.socketId === socket.id);
      if (playerIndex !== -1) {
        lobby.players.splice(playerIndex, 1);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});