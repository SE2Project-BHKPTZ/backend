const express = require('express');

const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', userController.getUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authMiddleware.authenticateToken, userController.me);
router.post('/refresh', authMiddleware.authenticateToken, userController.refresh);
module.exports = router;
