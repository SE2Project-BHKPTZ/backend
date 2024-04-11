const { v4: uuidv4 } = require('uuid');
const Lobby = require('../models/lobby.model');

// const getByUUID = async (uuid) => Lobby.findOne({ uuid });
// const getByLobbyID = async (lobbyid) => Lobby.findOne({ lobbyid });

const getRandomString = (len) => {
  const arr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ans = '';
  for (let i = len; i > 0; i -= 1) {
    ans
      += arr[(Math.floor(Math.random() * arr.length))];
  }
  return ans;
};

exports.getAll = async () => Lobby.find({});

exports.create = async (name, isPublic, playerUUID) => new Promise((resolve, reject) => {
  const user = new Lobby({
    uuid: uuidv4(),
    lobbyid: getRandomString(6),
    status: 'CREATED',
    name,
    players: [playerUUID],
    results: [],
    isPublic,
  });
  user.save().then((data, err) => {
    if (err) reject(new Error(err));
    resolve(data.lobbyid);
  });
});
