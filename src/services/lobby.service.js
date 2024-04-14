const { v4: uuidv4 } = require('uuid');
const Lobby = require('../models/lobby.model');
const socketService = require('./socket.service');
const userService = require('./user.service');

const getByLobbyID = async (lobbyid) => Lobby.findOne({ lobbyid });

const getRandomString = async (len) => {
  const arr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ans = '';
  do {
    ans = '';
    for (let i = len; i > 0; i -= 1) {
      ans
      += arr[(Math.floor(Math.random() * arr.length))]; // NOSONAR not used in secure contexts
    }
  } while (await getByLobbyID(ans) != null);
  console.log();

  return ans;
};

const isPlayerInLobby = async (uuid) => Lobby.findOne({ players: uuid });
exports.getAll = async () => Lobby.find({});
exports.delete = async (uuid) => Lobby.deleteOne({ uuid: uuid.toString() }).then(((data) => {
  if (data.deletedCount === 0) {
    throw Error('Lobby not found');
  }
  return 'delete successfull';
}));
exports.create = async (name, isPublic, maxPlayers, playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(playerUUID).then(async (data) => {
      if (data != null) {
        reject(new Error('Player is already in an lobby'));
      } else {
        const lobby = new Lobby({
          uuid: uuidv4(),
          lobbyid: await getRandomString(6),
          status: 'CREATED',
          name,
          players: [playerUUID],
          maxPlayers,
          results: [],
          isPublic,
        });
        lobby.save().then((result, err) => {
          if (err) reject(new Error(err));
          userService.getByUUID(playerUUID).then(async (user) => {
            try {
              await socketService.joinRoom(result.lobbyid, user.websocket);
            } catch (error) {
              reject(new Error('User Websocket not connceted'));
              return;
            }

            resolve(result.lobbyid);
          });
        });
      }
    });
  },
);
exports.join = async (lobbyID, playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(playerUUID).then((data) => {
      if (data != null) {
        reject(new Error('Player is already in an lobby'));
        return;
      }
      getByLobbyID(lobbyID).then((lobby) => {
        if (lobby == null) {
          reject(new Error('Lobby not found'));
          return;
        }
        if (lobby.players.length === lobby.maxPlayers) {
          reject(new Error('Lobby is full'));
          return;
        }
        lobby.players.push(playerUUID);
        lobby.save().then(() => {
          userService.getByUUID(playerUUID).then(async (user) => {
            try {
              await socketService.joinRoom(lobbyID, user.websocket);
            } catch (error) {
              reject(new Error('User Websocket not connceted'));
              return;
            }

            resolve('lobby joined successfull');
          });
        });
      });
    });
  },
);
exports.leave = async (playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(playerUUID).then((lobby) => {
      if (lobby == null) {
        reject(new Error('Player is not in an lobby'));
        return;
      }

      lobby.players.splice(lobby.players.indexOf(playerUUID), 1);
      lobby.save().then(() => {
        userService.getByUUID(playerUUID).then(async (user) => {
          try {
            await socketService.leaveRoom(lobby.lobbyid, user.websocket);
          } catch (error) {
            reject(new Error('User Websocket not connceted'));
          }
          resolve('lobby left successfull');
        });
      });
    });
  },
);

exports.exportedForTesting = {
  getRandomString,
};
