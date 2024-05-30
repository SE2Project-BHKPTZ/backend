const {
  create,
  join,
  leave,
  delete: deleteLobby,
  kick,
  exportedForTesting, updateLobbyStatus,
} = require('./lobby.service');

const { getRandomString, calculateMaxRounds } = exportedForTesting;
const Lobby = require('../models/lobby.model');
const userService = require('./user.service');

jest.mock('../models/lobby.model');
jest.mock('./user.service');

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

describe('Function calculateMaxRounds', () => {
  test('should return 20 when maxPlayers is 3', () => {
    expect(calculateMaxRounds(3)).toBe(20);
  });

  test('should return 15 when maxPlayers is 4', () => {
    expect(calculateMaxRounds(4)).toBe(15);
  });

  test('should return 12 when maxPlayers is 5', () => {
    expect(calculateMaxRounds(5)).toBe(12);
  });

  test('should return 10 when maxPlayers is 6', () => {
    expect(calculateMaxRounds(6)).toBe(10);
  });

  test('should return -1 for any other number of maxPlayers', () => {
    expect(calculateMaxRounds(2)).toBe(-1);
    expect(calculateMaxRounds(7)).toBe(-1);
    expect(calculateMaxRounds(0)).toBe(-1);
    expect(calculateMaxRounds(-1)).toBe(-1);
    expect(calculateMaxRounds(100)).toBe(-1);
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

    userService.getByUUID.mockResolvedValueOnce({ username: 'testPlayer' });
    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(create('Test Lobby', true, 5, 'testPlayerUUID')).resolves.toMatchObject({ lobbyid: 'testLobbyId', websocket: 'testWebsocketId' });

    expect(mockLobby.save).toHaveBeenCalled();
  });

  it('should reject with an error if player is already in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({});

    await expect(create('Test Lobby', true, 5, 'testPlayerUUID')).rejects.toThrow('Player is already in an lobby');

    expect(Lobby).not.toHaveBeenCalled();
  });

  it('should reject with an error if a lobby with the same name already exists', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce({});

    await expect(create('Test Lobby', true, 5, 'testPlayerUUID')).rejects.toThrow('Lobby with name already exists');

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
    userService.getByUUID.mockResolvedValue({ websocket: 'testWebsocketId', username: 'testuser' });
    await expect(join('testLobbyId', 'testPlayerUUID')).resolves.toMatchObject({ lobbyId: 'testLobbyId', websocket: 'testWebsocketId' });

    expect(mockLobby.save).toHaveBeenCalled();
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
});

describe('Function leave', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should leave a lobby successfully', async () => {
    const mockLobby = {
      uuid: 'uuid',
      players: [{ uuid: 'testPlayerUUID', username: 'testuser' }, { uuid: 'testPlayerUUID2', username: 'testuser2' }],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValueOnce(mockLobby);
    Lobby.deleteOne.mockReturnValueOnce({
      then: jest.fn((callback) => callback({ deletedCount: 1 })),
    });

    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(leave('testPlayerUUID')).resolves.toMatchObject({ lobbyid: undefined, message: 'lobby left successfull', websocket: 'testWebsocketId' });

    expect(mockLobby.players).not.toContain('testPlayerUUID');
    expect(mockLobby.save).toHaveBeenCalled();
  });

  it('should reject with an error if player is not in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null);

    await expect(leave('nonExistingPlayerUUID')).rejects.toThrow('Player is not in an lobby');
  });
});

describe('Function kick', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be kicked from a lobby successfully', async () => {
    const mockLobby = {
      uuid: 'uuid',
      players: [{ uuid: 'testPlayerUUID', username: 'testuser' }, { uuid: 'testPlayerUUID2', username: 'testuser2' }],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValue(mockLobby);

    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(kick('testPlayerUUID', 'testPlayerUUID2')).resolves.toMatchObject({ lobbyid: undefined, message: 'user kicked successfull', websocket: 'testWebsocketId' });

    expect(mockLobby.players).not.toContain('testPlayerUUID');
    expect(mockLobby.save).toHaveBeenCalled();
  });

  it('should reject with an error if admin player is not in a lobby', async () => {
    Lobby.findOne = jest.fn().mockResolvedValueOnce(null);
    await expect(kick('nonExistingPlayerUUID', 'testPlayerUUID2')).rejects.toThrow('You are not in the lobby');
  });

  it('should reject with an error if Player is not in an lobby', async () => {
    const mockLobby = {
      uuid: 'uuid',
      players: [{ uuid: 'testPlayerUUID', username: 'testuser' }],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValueOnce(mockLobby).mockResolvedValueOnce(null);

    await expect(kick('testPlayerUUID', 'testPlayerUUID2')).rejects.toThrow('Player is not in an lobby');
  });

  it('should reject with an error if You are not the Admin', async () => {
    const mockLobby = {
      uuid: 'uuid',
      players: [{}, { uuid: 'testPlayerUUID', username: 'testuser' }],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Lobby.findOne = jest.fn().mockResolvedValue(mockLobby);

    userService.getByUUID.mockResolvedValueOnce({ websocket: 'testWebsocketId' });

    await expect(kick('testPlayerUUID', 'testPlayerUUID2')).rejects.toThrow('You are not the Admin');
  });
});

describe('Function updateLobbyStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed if lobby is found', async () => {
    const mockLobby = {
      uuid: 'uuid',
      players: [{ uuid: 'testPlayerUUID', username: 'testuser' }, { uuid: 'testPlayerUUID2', username: 'testuser2' }],
      save: jest.fn(),
    };

    Lobby.findOne = jest.fn().mockResolvedValue(mockLobby);

    const result = await updateLobbyStatus('12345', 'RUNNING');

    const expectedLobby = {
      ...mockLobby,
      status: 'RUNNING',
    };
    await expect(result).toMatchObject(expectedLobby);
    await expect(mockLobby.save).toHaveBeenCalled();
  });

  it('should throw error if lobby is not found', async () => {
    Lobby.findOne = jest.fn().mockResolvedValue(null);

    await expect(updateLobbyStatus('12345', 'RUNNING')).rejects.toThrow('Lobby not found');
  });
});
