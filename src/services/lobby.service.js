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

  return ans;
};

const isPlayerInLobby = async (uuid) => Lobby.findOne({ 'players.uuid': uuid });
exports.getAll = async () => Lobby.find({});
exports.getMy = async (playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(playerUUID).then(async (data) => {
      if (data != null) {
        resolve(data);
      } else {
        reject(new Error('Player is not in an lobby'));
      }
    });
  },
);
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
          players: [
            { uuid: playerUUID, username: (await userService.getByUUID(playerUUID)).username }],
          maxPlayers,
          results: [],
          isPublic,
        });
        lobby.save().then((result, err) => {
          if (err) reject(new Error(err));
          userService.getByUUID(playerUUID).then(async (user) => {
            try {
              await socketService.joinRoom(result.lobbyid, user.websocket, playerUUID);
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
      getByLobbyID(lobbyID).then(async (lobby) => {
        if (lobby == null) {
          reject(new Error('Lobby not found'));
          return;
        }
        if (lobby.players.length === lobby.maxPlayers) {
          reject(new Error('Lobby is full'));
          return;
        }
        lobby.players.push(
          { uuid: playerUUID, username: (await userService.getByUUID(playerUUID)).username },
        );
        lobby.save().then(() => {
          userService.getByUUID(playerUUID).then(async (user) => {
            try {
              await socketService.joinRoom(lobbyID, user.websocket, playerUUID);
            } catch (error) {
              reject(new Error('User Websocket not connceted'));
              return;
            }

            resolve(lobbyID);
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
      lobby.players = lobby.players.filter((player) => player.uuid !== playerUUID);
      if (lobby.players.length === 0) {
        this.delete(lobby.uuid);
        resolve('lobby left successfull');
        return;
      }
      lobby.save().then(() => {
        userService.getByUUID(playerUUID).then(async (user) => {
          try {
            await socketService.leaveRoom(lobby.lobbyid, user.websocket, playerUUID);
          } catch (error) {
            reject(new Error('User Websocket not connceted'));
          }
          resolve('lobby left successfull');
        });
      });
    });
  },
);
exports.kick = async (adminUUID, playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(adminUUID).then((adminlobby) => {
      if (adminlobby == null) {
        reject(new Error('You are not in the lobby'));
        return;
      }
      if (adminlobby.players[0].uuid === adminUUID) {
        isPlayerInLobby(playerUUID).then((lobby) => {
          if (lobby == null) {
            reject(new Error('Player is not in an lobby'));
            return;
          }
          lobby.players = lobby.players.filter((player) => player.uuid !== playerUUID);
          lobby.save().then(() => {
            userService.getByUUID(playerUUID).then(async (user) => {
              try {
                await socketService.kickedFromRoom(lobby.lobbyid, user.websocket, playerUUID);
              } catch (error) {
                reject(new Error('User Websocket not connceted'));
              }
              resolve('user kicked successfull');
            });
          });
        });
      } else {
        reject(new Error('You are not the Admin'));
      }
    });
  },
);

exports.exportedForTesting = {
  getRandomString,
};
