const express = require('express');

const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', lobbyController.getLobby);
router.post('/create', authMiddleware.authenticateToken, lobbyController.createLobby);

module.exports = router;
