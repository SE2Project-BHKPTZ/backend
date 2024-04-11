const express = require('express');

const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', lobbyController.getLobby);
router.delete('/', authMiddleware.authenticateToken, lobbyController.deleteLobby);
router.post('/', authMiddleware.authenticateToken, lobbyController.createLobby);
router.post('/join', authMiddleware.authenticateToken, lobbyController.joinLobby);
router.get('/leave', authMiddleware.authenticateToken, lobbyController.leaveLobby);
module.exports = router;
