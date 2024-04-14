const {
  create,
  join,
  leave,
  delete: deleteLobby,
  exportedForTesting,
} = require('./lobby.service');

const { getRandomString } = exportedForTesting;
const Lobby = require('../models/lobby.model');
const userService = require('./user.service');
const socketService = require('./socket.service');

jest.mock('../models/lobby.model');
jest.mock('./user.service');
jest.mock('./socket.service');

describe('Function getRandomString', () => {
  it('should return a string of the specified length', async () => {
    const len = 10;
    const result = await getRandomString(len);
    expect(result).toHaveLength(len);
    expect(typeof result).toBe('string');
  });

  it('should only contain characters from the specified range', async () => {
    const len = 10;
    const result = await getRandomString(len);
    const validChars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < result.length; i += 1) {
      expect(validChars.includes(result[i])).toBe(true);
    }
  });

  it('should return an empty string if length is 0', async () => {
    const result = await getRandomString(0);
    expect(result).toBe('');
  });

  it('should return an empty string if length is negative', async () => {
    const result = await getRandomString(-1);
    expect(result).toBe('');
  });
});

describe('Function delete', () => {
  it('should delete a lobby successfully', async () => {
    Lobby.deleteOne.mockReturnValueOnce({
      then: jest.fn((callback) => callback({ deletedCount: 1 })),
    });

    await expect(deleteLobby('testUUID')).resolves.toBe('delete successfull');

    expect(Lobby.deleteOne).toHaveBeenCalledWith({ uuid: 'testUUID' });
  });

  it('should throw an error if lobby is not found', async () => {
    Lobby.deleteOne.mockReturnValueOnce({
      then: jest.fn((callback) => callback({ deletedCount: 0 })),
    });

    await expect(deleteLobby('nonExistingUUID')).rejects.toThrow('Lobby not found');

    expect(Lobby.deleteOne).toHaveBeenCalledWith({ uuid: 'nonExistingUUID' });
  });
});

describe('Function create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a lobby successfully', async () => {
    const mockLobby = {
      save: jest.fn().mockResolvedValueOnce({ lobbyid: 'testLobbyId' }),
    };
    Lobby.mockReturnValueOnce(mockLobby);

    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(create('Test Lobby', true, 5, 'testPlayerUUID')).resolves.toBe('testLobbyId');

    expect(Lobby).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Lobby',
      isPublic: true,
      maxPlayers: 5,
      players: ['testPlayerUUID'],
    }));
    expect(mockLobby.save).toHaveBeenCalled();
    expect(socketService.joinRoom).toHaveBeenCalledWith('testLobbyId', 'testWebsocketId');
  });

  it('should reject with an error if player is already in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce({});

    await expect(create('Test Lobby', true, 5, 'testPlayerUUID')).rejects.toThrow('Player is already in an lobby');

    expect(Lobby).not.toHaveBeenCalled();
  });
});

describe('Function join', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should join a lobby successfully', async () => {
    const mockLobby = {
      players: [],
      maxPlayers: 5,
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(mockLobby);
    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });
    await expect(join('testLobbyId', 'testPlayerUUID')).resolves.toBe('lobby joined successfull');

    expect(mockLobby.players).toContain('testPlayerUUID');
    expect(mockLobby.save).toHaveBeenCalled();
    expect(socketService.joinRoom).toHaveBeenCalledWith('testLobbyId', 'testWebsocketId');
  });

  it('should reject with an error if player is already in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce({});
    await expect(join('testLobbyId', 'testPlayerUUID')).rejects.toThrow('Player is already in an lobby');

    expect(Lobby).not.toHaveBeenCalled(); // Lobby should not be fetched
  });

  it('should reject with an error if lobby is full', async () => {
    const mockLobby = {
      players: Array(5).fill('testPlayerUUID'),
      maxPlayers: 5,
    };
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(mockLobby);

    await expect(join('testLobbyId', 'testPlayerUUID')).rejects.toThrow('Lobby is full');
  });

  it('should reject with an error if lobby not found', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(join('nonExistingLobbyId', 'testPlayerUUID')).rejects.toThrow('Lobby not found');
  });

  it('should reject with an error join room fails', async () => {
    const mockLobby = {
      players: [],
      maxPlayers: 5,
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(mockLobby);
    userService.getByUUID.mockResolvedValueOnce({ });

    socketService.joinRoom.mockImplementation(() => {
      throw new Error('error');
    });

    await expect(join('nonExistingLobbyId', 'testPlayerUUID')).rejects.toThrow('User Websocket not connceted');
  });
});

describe('Function leave', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should leave a lobby successfully', async () => {
    const mockLobby = {
      players: ['testPlayerUUID'],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValueOnce(mockLobby);

    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(leave('testPlayerUUID')).resolves.toBe('lobby left successfull');

    expect(mockLobby.players).not.toContain('testPlayerUUID');
    expect(mockLobby.save).toHaveBeenCalled();
    expect(socketService.leaveRoom).toHaveBeenCalledWith(mockLobby.lobbyid, 'testWebsocketId');
  });

  it('should reject with an error if player is not in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null);

    await expect(leave('nonExistingPlayerUUID')).rejects.toThrow('Player is not in an lobby');
  });

  it('should reject with an error if user websocket is not connected', async () => {
    const mockLobby = {
      players: ['testPlayerUUID'],
      save: jest.fn().mockResolvedValueOnce(),
    };
    Lobby.findOne = jest.fn().mockResolvedValueOnce(mockLobby);

    userService.getByUUID.mockResolvedValueOnce({ });
    socketService.leaveRoom.mockImplementation(() => {
      throw new Error('error');
    });

    await expect(leave('testPlayerUUID')).rejects.toThrow('User Websocket not connceted');

    expect(mockLobby.players).not.toContain('testPlayerUUID');
    expect(mockLobby.save).toHaveBeenCalled();
  });
});
