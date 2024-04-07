const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  lobbyId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
});

module.exports = mongoose.model('Lobby', lobbySchema);