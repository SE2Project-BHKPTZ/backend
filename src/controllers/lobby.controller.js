const lobbyService = require('../services/lobby.service');

async function createLobby(req, res, next) {
  const { lobbyId, name } = req.body;
  if (!lobbyId || !name) {
    return res.status(400).json({ error: 'Lobby ID and name are required' });
  }

  try {
    const lobby = await lobbyService.createLobby(lobbyId, name);
    res.json({ lobbyId: lobby.lobbyId });
  } catch (err) {
    console.error('Error while creating lobby', err.message);
    next(err);
  }
}

async function joinLobby(req, res, next) {
  const { lobbyId, uuid, socketId } = req.body;
  const player = { uuid, socketId };

  try {
    const lobby = await lobbyService.joinLobby(lobbyId, player);
    if (!lobby) {
      return res.json({ success: false, message: 'Lobby is full or does not exist' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error while joining lobby', err.message);
    next(err);
  }
}

module.exports = { createLobby, joinLobby };