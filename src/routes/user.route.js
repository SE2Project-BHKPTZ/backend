const express = require('express');

const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - username
 *     - password
 *     - uuid
 *     - registerTimestamp
 *     - playedGames
 *    properties:
 *     username:
 *      type: string
 *      description: The player´s username
 *     password:
 *      type: string
 *      description: The user account password
 *     uuid:
 *      type: string
 *      description: The auto-generated Unique User ID
 *     registerTimestamp:
 *      type: date
 *      description: The registration timestamp
 *     playedGames:
 *      type: array
 *      items:
 *        type: string
 *      description: The array of the played games
 *     websocket:
 *      type: string
 *      description: The connection websocket ID
 *    example:
 *     username: "BestPlayerEver"
 *     password: "TopSecret&%22?"
 *     uuid: "9937525"
 *     registerTimestamp: "2024-04-17T12:30:45.123Z"
 *     playedGames: ["9994", "2323", "1111"]
 *     websocket: "123"
 *
 */
/**
 * @swagger
 * tags:
 *  name: Users
 *  description: The users' managing API
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all user data
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successful operation. All users data was retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error. Unable to retrieve user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', userController.getUser);
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to register.
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: The password of the user to register.
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Access token for the registered user.
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token for the registered user.
 *                 expires_in:
 *                   type: string
 *                   description: Expiration time for the access token.
 *       400:
 *         description: Bad request. Username or password undefined.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the bad request.
 *       401:
 *         description: Unauthorized. User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the user already exists.
 *       500:
 *         description: Internal Server Error. Failed to register user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */
router.post('/register', userController.register);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user logging in.
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: The password of the user logging in.
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Access token for the logged-in user.
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token for the logged-in user.
 *                 expires_in:
 *                   type: string
 *                   description: Expiration time for the access token.
 *       400:
 *         description: Bad request. Username or password undefined, or invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the bad request.
 *       401:
 *         description: Unauthorized. User does not exist or invalid password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating invalid credentials.
 *       500:
 *         description: Internal Server Error. Failed to authenticate user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */

router.post('/login', userController.login);
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the user whose details are requested.
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the user.
 *                 uuid:
 *                   type: string
 *                   description: The UUID of the user.
 *                 registerTimestamp:
 *                   type: string
 *                   description: The registration timestamp of the user.
 *                 playedGames:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The array of games played by the user.
 *       400:
 *         description: Bad request. UUID parameter is undefined.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the bad request.
 *       500:
 *         description: Internal Server Error. Failed to retrieve user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */

router.get('/me', authMiddleware.authenticateToken, userController.me);
/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to use for refreshing the access token.
 *             example:
 *               refreshToken: "your_refresh_token_here"
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The refreshed access token.
 *       400:
 *         description: Bad request. Refresh token not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the refresh token was not provided.
 *       401:
 *         description: Unauthorized. Invalid refresh token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the provided refresh token as invalid.
 *       500:
 *         description: Internal Server Error. Failed to refresh access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */
router.post('/refresh', userController.refresh);

module.exports = router;
