const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const { add } = require('./user.service');

// Mock bcrypt methods
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('add function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hash password and save user', async () => {
    const username = 'testuser';
    const password = 'testpassword';
    const mockedSalt = 'mockedSalt';
    const mockedHashedPassword = 'mockedHashedPassword';
    const mockedUuid = 'mockedUuid';

    // Mock bcrypt.genSalt and bcrypt.hash
    bcrypt.genSalt.mockResolvedValue(mockedSalt);
    bcrypt.hash.mockResolvedValue(mockedHashedPassword);

    // Mock User.save
    const saveMock = jest.fn().mockResolvedValueOnce({
      username,
      password: mockedHashedPassword,
      uuid: mockedUuid,
      playedGames: [],
    });

    // Mock the User constructor to return the mocked user instance
    jest.spyOn(User, 'create').mockResolvedValue(saveMock);

    // Call the function
    const result = await add(username, password);

    // Check if bcrypt.genSalt and bcrypt.hash were called with the correct arguments
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, mockedSalt);

    // Check if User constructor was called with the correct arguments
    expect(User).toHaveBeenCalledWith({
      username,
      password: mockedHashedPassword,
      uuid: mockedUuid,
      playedGames: [],
    });

    // Check if the user was saved
    expect(saveMock).toHaveBeenCalled();

    // Check if the result is correct
    expect(result).toEqual({
      username,
      password: mockedHashedPassword,
      uuid: mockedUuid,
      playedGames: [],
    });
  });
});
