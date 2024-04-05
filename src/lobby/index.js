const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const Player = require('./player');
const Lobby = require('./lobby');
const validateLobbyData = require('./validateLobbyData');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const lobbies = {};

app.post('/create-lobby', validateLobbyData, (req, res) => {
  const lobbyId = req.body.lobbyId;
  const name = req.body.name;
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