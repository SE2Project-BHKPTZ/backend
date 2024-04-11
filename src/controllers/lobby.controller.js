const lobbyService = require('../services/lobby.service');

async function getLobby(req, res) {
  try {
    res.json(await lobbyService.getAll());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function createLobby(req, res) {
  if (req.body.name === undefined) {
    res.status(400).json({ message: 'Lobbyname undefined' });
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
  try {
    res.json(
      await lobbyService.create(req.body.name.toString(), req.body.isPublic.toString(), req.uuid),
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getLobby,
  createLobby,
};
