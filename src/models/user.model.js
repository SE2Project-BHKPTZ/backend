const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
  registerTimestamp: {
    type: Date,
    default: Date.now,
  },
  playedGames: {
    type: [String],
    required: true,
  },
  websocket: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('User', userSchema);
