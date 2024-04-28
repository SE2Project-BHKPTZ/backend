const lobbyService = require('../services/lobby.service');

async function getLobby(req, res) {
  try {
    res.json(await lobbyService.getAll());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function getCurrentLobby(req, res) {
  try {
    res.json(await lobbyService.getCurrentLobby(req.uuid));
  } catch (err) {
    if (err.message === 'Player is not in an lobby') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}
async function deleteLobby(req, res) {
  if (req.query.uuid === undefined) {
    res.status(400).json({ message: 'uuid undefined' });
    return;
  }
  try {
    res.json(await lobbyService.delete(req.query.uuid.toString()));
  } catch (err) {
    if (err.message === 'Lobby not found') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}
async function createLobby(req, res) {
  if (req.body.name === undefined) {
    res.status(400).json({ message: 'name undefined' });
    return;
  }
  if (req.body.isPublic === undefined) {
    res.status(400).json({ message: 'isPublic undefined' });
    return;
  }
  if (!(req.body.isPublic === 1 || req.body.isPublic === 0)) {
    res.status(400).json({ message: 'isPublic invalid' });
    return;
  }
  if (req.body.maxPlayers === undefined || typeof req.body.maxPlayers !== 'number') {
    res.status(400).json({ message: 'maxPlayers invalid or undefined' });
    return;
  }
  if (req.body.maxPlayers < 3 || req.body.maxPlayers > 6) {
    res.status(400).json({ message: 'maxPlayers out of range' });
    return;
  }
  try {
    res.json(
      await lobbyService.create(
        req.body.name.toString(),
        req.body.isPublic.toString(),
        req.body.maxPlayers,
        req.uuid,
      ),
    );
  } catch (err) {
    if (err.message === 'Player is already in an lobby') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}
async function joinLobby(req, res) {
  if (req.body.lobbyID === undefined) {
    res.status(400).json({ message: 'lobbyID undefined' });
    return;
  }

  try {
    res.json(await lobbyService.join(req.body.lobbyID.toString(), req.uuid));
  } catch (err) {
    if (err.message === 'Player is already in an lobby') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}
async function leaveLobby(req, res) {
  try {
    res.json(await lobbyService.leave(req.uuid));
  } catch (err) {
    if (err.message === 'Player is not in an lobby') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}
async function kickFromLobby(req, res) {
  if (req.body.uuid === undefined) {
    res.status(400).json({ message: 'uuid undefined' });
    return;
  }
  try {
    res.json(await lobbyService.kick(req.uuid, req.body.uuid.toString()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = {
  getLobby,
  getCurrentLobby,
  createLobby,
  deleteLobby,
  joinLobby,
  leaveLobby,
  kickFromLobby,
};
