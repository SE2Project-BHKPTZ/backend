const { io } = require('../socketHandler/websocket');
const userService = require('./user.service');

exports.joinRoom = async (roomName, socketID, playerUUID) => {
  (await io().in(socketID).fetchSockets())[0].join(roomName);
  io().to(roomName).emit('lobby:userJoined', { playerUUID, playerName: (await userService.getByUUID(playerUUID)).username });
};

exports.leaveRoom = async (roomName, socketID, playerUUID) => {
  (await io().in(socketID).fetchSockets())[0].leave(roomName);
  io().to(roomName).emit('lobby:userLeft', { playerUUID, playerName: (await userService.getByUUID(playerUUID)).username });
};

exports.kickedFromRoom = async (roomName, socketID, playerUUID) => {
  (await io().in(socketID).fetchSockets())[0].leave(roomName);
  io().to(roomName).emit('lobby:userLeft', { playerUUID, playerName: (await userService.getByUUID(playerUUID)).username });
  io().to(socketID).emit('lobby:userKick', { msg: 'You are kicked' });
};
