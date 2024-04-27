const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  lobbyid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  players: {
    type: [Object],
    required: true,
  },
  maxPlayers: {
    type: Number,
    default: false,
  },
  results: {
    type: [Object],
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Lobby', lobbySchema);
