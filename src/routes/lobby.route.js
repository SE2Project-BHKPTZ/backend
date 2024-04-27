const express = require('express');

const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *    schemas:
 *       Lobby:
 *           type: object
 *           required:
 *             - uuid
 *             - lobbyid
 *             - status
 *             - name
 *             - players
 *           properties:
 *             uuid:
 *               type: string
 *               description: The unique user ID
 *             lobbyid:
 *               type: string
 *               description: The unique lobby ID
 *             status:
 *               type: string
 *               description: The lobby status
 *             name:
 *               type: string
 *               description: The lobby name
 *             timestamp:
 *               type: date
 *               description: The lobby creation timestamp
 *             players:
 *               type: [string]
 *               description: The player´s usernames array
 *             maxPlayers:
 *               type: number
 *               description: The max number of players for the lobby (3, 4, 5 or 6)
 *             results:
 *               type: [object]
 *               description: The array of score objects of the players
 *             isPublic:
 *               type: integer
 *               desciption: Identifies if the lobby is public or private
 *           example:
 *             uuid: "1"
 *             lobbyid: "1"
 *             status: "full"
 *             name: "ExampleLobby"
 *             timestamp: "2024-04-17T12:30:45.123Z"
 *           players: ["Emma", "Jason", "Michi"]
 *           maxPlayers: 3
 *           results: [{50}, {-20}, {75}]
 *           isPublic: true

 */
/**
 * @swagger
 * tags:
 *  name: Lobbys
 *  description: The lobbys' managing API
 */
/**
 * @swagger
 * /lobbys:
 *   get:
 *     summary: Get all lobby data
 *     tags: [Lobbys]
 *     responses:
 *       200:
 *         description: Successful operation. All lobbys data was retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lobby'
 *       500:
 *         description: Internal Server Error. Unable to retrieve lobby data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', lobbyController.getLobby);
/**
 * @swagger
 * /lobbys/my:
 *   get:
 *     summary: Get current user lobby
 *     tags: [Lobbys]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Lobby'
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to delete lobby
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/my', authMiddleware.authenticateToken, lobbyController.getMy);
/**
 * @swagger
 * /lobbys:
 *   delete:
 *     summary: Delete a lobby by UUID
 *     tags: [Lobbys]
 *     parameters:
 *       - in: query
 *         name: uuid
 *         required: true
 *         description: The UUID of the lobby to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lobby deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: delete successful
 *       400:
 *         description: Bad request. UUID is undefined or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to delete lobby
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/', lobbyController.deleteLobby);
/**
 * @swagger
 * /lobbys:
 *   post:
 *     summary: Create a new lobby
 *     tags: [Lobbys]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the lobby.
 *       - in: query
 *         name: isPublic
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specifies if the lobby is public or private.
 *       - in: query
 *         name: maxPlayers
 *         required: true
 *         schema:
 *           type: integer
 *         description: The maximum number of players allowed in the lobby.
 *     responses:
 *       200:
 *         description: Lobby created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *       400:
 *         description: Bad request. One or more input parameters are invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Bad request error message.
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to create the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Server internal error message.
 */
router.post('/', authMiddleware.authenticateToken, lobbyController.createLobby);
/**
 * @swagger
 * /lobbys/join:
 *   post:
 *     summary: Join a lobby
 *     tags: [Lobbys]
 *     parameters:
 *       - in: query
 *         name: lobbyID
 *         required: true
 *         description: The ID of the lobby to join.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lobby joined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message that the lobby was joined successfully.
 *       400:
 *         description: Bad request. The lobbyID is undefined or player is already in the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the bad request.
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to join the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */
router.post('/join', authMiddleware.authenticateToken, lobbyController.joinLobby);
/**
 * @swagger
 * /lobbys/leave:
 *   get:
 *     summary: Leave the lobby
 *     tags: [Lobbys]
 *     parameters:
 *     responses:
 *       200:
 *         description: Player successfully left the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message that the player left the lobby.
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to leave the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */
router.get('/leave', authMiddleware.authenticateToken, lobbyController.leaveLobby);
/**
 * @swagger
 * /lobbys/kick:
 *   post:
 *     summary: Kick someone from the lobby
 *     tags: [Lobbys]
 *     parameters:
 *     responses:
 *       200:
 *         description: Player successfully kicked from the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Player successfully kicked from the lobby.
 *       401:
 *         description: Unauthorized. Authentication is required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error. Failed to kick from the lobby.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for the internal server error.
 */
router.post('/kick', authMiddleware.authenticateToken, lobbyController.kickFromLobby);

module.exports = router;
