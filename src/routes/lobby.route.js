const express = require('express');

const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');

router.post('/create-lobby', lobbyController.createLobby);
router.post('/join-lobby', lobbyController.joinLobby);

module.exports = router;