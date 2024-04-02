const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { add } = require('./user.service');

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../models/user.model', () => jest.fn().mockImplementation(() => ({
  save: jest.fn(),
})));

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

    bcrypt.genSalt.mockResolvedValue(mockedSalt);
    bcrypt.hash.mockResolvedValue(mockedHashedPassword);

    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        username,
        password: mockedHashedPassword,
        uuid: mockedUuid,
        playedGames: [],
      }),
    }));

    const result = await add(username, password);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, mockedSalt);

    expect(User).toHaveBeenCalledWith({
      username,
      password: mockedHashedPassword,
      uuid: expect.any(String),
      playedGames: [],
    });

    expect(result).toEqual({
      username,
      password: mockedHashedPassword,
      uuid: mockedUuid,
      playedGames: [],
    });
  });
});
