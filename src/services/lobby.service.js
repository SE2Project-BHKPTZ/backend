const Lobby = require('../models/lobby.model');

exports.createLobby = async (lobbyId, name) => new Lobby({
  lobbyId,
  name,
  players: [],
}).save();

exports.joinLobby = async (lobbyId, player) => {
  const lobby = await Lobby.findOne({ lobbyId });
  if (!lobby || lobby.players.length >= 6) {
    return null;
  }
  lobby.players.push(player);
  return lobby.save();
};

exports.getLobby = async (lobbyId) => Lobby.findOne({ lobbyId });