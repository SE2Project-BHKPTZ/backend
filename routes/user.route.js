const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

/* GET user. */
router.get('/', userController.get);

module.exports = router;