const { v4: uuidv4 } = require('uuid');
const Lobby = require('../models/lobby.model');

const getRandomString = (len) => {
  const arr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ans = '';
  for (let i = len; i > 0; i -= 1) {
    ans
      += arr[(Math.floor(Math.random() * arr.length))];
  }
  return ans;
};

// const getByUUID = async (uuid) => Lobby.findOne({ uuid });
const getByLobbyID = async (lobbyid) => Lobby.findOne({ lobbyid });

const isPlayerInLobby = async (uuid) => Lobby.findOne({ players: uuid });
exports.getAll = async () => Lobby.find({});
exports.delete = async (uuid) => Lobby.deleteOne({ uuid });
exports.create = async (name, isPublic, maxPlayers, playerUUID) => new Promise(
  (resolve, reject) => {
    isPlayerInLobby(playerUUID).then((data) => {
      if (data != null) {
        reject(new Error('Player is already in an lobby'));
      } else {
        const lobby = new Lobby({
          uuid: uuidv4(),
          lobbyid: getRandomString(6),
          status: 'CREATED',
          name,
          players: [playerUUID],
          maxPlayers,
          results: [],
          isPublic,
        });
        lobby.save().then((result, err) => {
          if (err) reject(new Error(err));
          resolve(result.lobbyid);
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
          resolve('lobby joined successfull');
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
        resolve('lobby left successfull');
      });
    });
  },
);
