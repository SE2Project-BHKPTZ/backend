const { io } = require('../socketHandler/websocket');
const userService = require('./user.service');

const fetchSocket = async (socketID) => {
  const sockets = await io().in(socketID).fetchSockets();
  return sockets[0];
};

const getPlayerName = async (playerUUID) => {
  const user = await userService.getByUUID(playerUUID);
  return user.username;
};

exports.joinRoom = async (roomName, socketID, playerUUID) => {
  const socket = await fetchSocket(socketID);
  const playerName = await getPlayerName(playerUUID);

  socket.join(roomName);
  io().to(roomName).emit('lobby:userJoined', { playerUUID, playerName });
};

exports.leaveRoom = async (roomName, socketID, playerUUID) => {
  const socket = await fetchSocket(socketID);
  const playerName = await getPlayerName(playerUUID);

  socket.leave(roomName);
  io().to(roomName).emit('lobby:userLeft', { playerUUID, playerName });
};

exports.kickedFromRoom = async (roomName, socketID, playerUUID) => {
  const socket = await fetchSocket(socketID);
  const playerName = await getPlayerName(playerUUID);

  socket.leave(roomName);
  io().to(roomName).emit('lobby:userLeft', { playerUUID, playerName });
  io().to(socketID).emit('lobby:userKick', { msg: 'You are kicked' });
};
