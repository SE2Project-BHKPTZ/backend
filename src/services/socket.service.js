const { io } = require('../socketHandler/websocket');

exports.joinRoom = async (roomName, socketID) => {
  (await io().in(socketID).fetchSockets())[0].join(roomName);
};
