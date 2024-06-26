const { v4: uuidv4 } = require('uuid');
const Lobby = require('../models/lobby.model');
const userService = require('./user.service');

const getByLobbyID = async (lobbyid) => Lobby.findOne({ lobbyid });

const getLobbyByName = async (name) => Lobby.findOne({ name });

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

const isPlayerInLobby = async (uuid) => Lobby.findOne({ 'players.uuid': uuid.toString(), status: ['RUNNING', 'CREATED'] });

exports.getPublic = async () => Lobby.find({ isPublic: true });

exports.getAll = async () => Lobby.find({});

exports.getCurrentLobby = async (playerUUID) => {
  const playerInLobby = await isPlayerInLobby(playerUUID);
  if (playerInLobby == null) {
    throw new Error('Player is not in an lobby');
  }
  return playerInLobby;
};

exports.delete = async (uuid) => Lobby.deleteOne({ uuid: uuid.toString() }).then(((data) => {
  if (data.deletedCount === 0) {
    throw Error('Lobby not found');
  }
  return 'delete successful';
}));

function calculateMaxRounds(maxPlayers) {
  switch (maxPlayers) {
    case 3:
      return 20;
    case 4:
      return 15;
    case 5:
      return 12;
    case 6:
      return 10;
    default:
      return -1;
  }
}

exports.create = async (name, isPublic, maxPlayers, playerUUID, maxRounds) => {
  const lobbyWithName = await getLobbyByName(name);
  if (lobbyWithName != null) {
    throw new Error('Lobby with name already exists');
  }

  const playerInLobby = await isPlayerInLobby(playerUUID);
  if (playerInLobby != null) {
    throw new Error('Player is already in an lobby');
  }
  const maxRoundsCalculated = maxRounds !== undefined ? maxRounds : calculateMaxRounds(maxPlayers);

  const lobby = new Lobby({
    uuid: uuidv4(),
    lobbyid: await getRandomString(6),
    status: 'CREATED',
    name,
    players: [
      { uuid: playerUUID, username: (await userService.getByUUID(playerUUID)).username },
    ],
    maxPlayers,
    results: [],
    isPublic,
    maxRounds: maxRoundsCalculated,
  });

  const result = await lobby.save();
  const user = await userService.getByUUID(playerUUID);

  return { lobbyid: result.lobbyid, websocket: user.websocket };
};

exports.join = async (lobbyID, playerUUID) => {
  const playerInLobby = await isPlayerInLobby(playerUUID);
  if (playerInLobby != null) {
    throw new Error('Player is already in an lobby');
  }

  const lobby = await getByLobbyID(lobbyID);

  if (lobby == null) {
    throw new Error('Lobby not found');
  }

  if (lobby.players.length === lobby.maxPlayers) {
    throw new Error('Lobby is full');
  }

  lobby.players.push(
    { uuid: playerUUID, username: (await userService.getByUUID(playerUUID)).username },
  );

  await lobby.save();

  const user = await userService.getByUUID(playerUUID);
  return { lobbyId: lobbyID, websocket: user.websocket };
};

exports.leave = async (playerUUID) => {
  const lobby = await isPlayerInLobby(playerUUID);
  if (lobby == null) {
    throw new Error('Player is not in an lobby');
  }

  lobby.players = lobby.players.filter((player) => player.uuid !== playerUUID);
  if (lobby.players.length === 0) {
    this.delete(lobby.uuid);
    return 'lobby left successfully';
  }

  await lobby.save();

  const user = await userService.getByUUID(playerUUID);
  return { message: 'lobby left successfully', lobbyid: lobby.lobbyid, websocket: user.websocket };
};

exports.kick = async (adminUUID, playerUUID) => {
  const lobby = await isPlayerInLobby(adminUUID);
  if (lobby == null) {
    throw new Error('You are not in the lobby');
  }

  if (lobby.players[0].uuid === adminUUID) {
    if (lobby.players.filter((player) => player.uuid === playerUUID).length === 0) {
      throw new Error('Player is not in an lobby');
    }

    lobby.players = lobby.players.filter((player) => player.uuid !== playerUUID);
    await lobby.save();

    const user = await userService.getByUUID(playerUUID);
    return { message: 'user kicked successfully', lobbyid: lobby.lobbyid, websocket: user.websocket };
  }
  throw new Error('You are not the Admin');
};

exports.updateLobbyStatus = async (lobbyId, status) => {
  const lobby = await getByLobbyID(lobbyId);
  if (!lobby) {
    throw new Error('Lobby not found');
  }

  lobby.status = status;
  await lobby.save();

  return lobby;
};

exports.exportedForTesting = {
  getRandomString,
  calculateMaxRounds,
};

exports.getByLobbyID = getByLobbyID;
