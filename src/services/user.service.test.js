const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {
  register, login, me, refresh,
} = require('./user.service');

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn().mockReturnValue('mocked-token'),
}));

jest.mock('../models/user.model', () => jest.fn().mockImplementation(() => ({
  save: jest.fn(),
})));

describe('Function register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_TTL = '2h';
  });

  it('registers a new user successfully', async () => {
    const mockUsername = 'newuser';
    const mockPassword = 'testpassword';

    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        username: mockUsername,
        password: 'mocked-hash',
        uuid: expect.any(String),
        playedGames: [],
      }),
    }));
    User.findOne = jest.fn().mockResolvedValue(null);
    bcrypt.genSalt = jest.fn().mockResolvedValue('mocked-salt');
    bcrypt.hash = jest.fn().mockResolvedValue('mocked-hash');

    const result = await register(mockUsername, mockPassword);

    expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 'mocked-salt');

    expect(result).toEqual({
      accessToken: 'mocked-token',
      refreshToken: 'mocked-token',
      expires_in: process.env.ACCESS_TOKEN_TTL,
    });
  });

  it('rejects registration if error while getting user', async () => {
    const mockUsername = 'existinguser';
    const mockPassword = 'testpassword';

    // Mocking getByUsername to return an existing user
    User.findOne = jest.fn().mockImplementation(() => {
      throw new Error('err');
    });

    await expect(register(mockUsername, mockPassword)).rejects.toThrow('err');
  });

  it('rejects registration if user already exists', async () => {
    const mockUsername = 'existinguser';
    const mockPassword = 'testpassword';

    // Mocking getByUsername to return an existing user
    User.findOne = jest.fn().mockResolvedValue({});

    await expect(register(mockUsername, mockPassword)).rejects.toThrow('User already exists');
  });
});

describe('Function login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in a user with correct credentials', async () => {
    const mockUsername = 'testuser';
    const mockPassword = 'testpassword';
    const mockUser = {
      username: mockUsername,
      password: 'hashed-password',
      uuid: 'mocked-uuid',
    };

    // Mocking getByUsername to return the mock user
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    // Mocking bcrypt.compare to return true, indicating correct password
    bcrypt.compare.mockResolvedValue(true);

    const result = await login(mockUsername, mockPassword);

    expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUser.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      { uuid: mockUser.uuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL },
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { uuid: mockUser.uuid },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_TTL },
    );
    expect(result).toEqual({
      accessToken: 'mocked-token',
      refreshToken: 'mocked-token',
      expires_in: process.env.ACCESS_TOKEN_TTL,
    });
  });

  it('rejects login with incorrect password', async () => {
    const mockUsername = 'testuser';
    const mockPassword = 'wrongpassword';

    const mockUser = {
      username: mockUsername,
      password: 'hashed-password',
      uuid: 'mocked-uuid',
    };

    // Mocking getByUsername to return the mock user
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    // Mocking bcrypt.compare to return false, indicating incorrect password
    bcrypt.compare.mockResolvedValue(false);

    await expect(login(mockUsername, mockPassword)).rejects.toThrow('Invalid password');
  });

  it('rejects login with non-existent user', async () => {
    const mockUsername = 'nonexistentuser';

    // Mocking getByUsername to return null, indicating user does not exist
    User.findOne = jest.fn().mockResolvedValue(null);

    await expect(login(mockUsername, 'password')).rejects.toThrow('User does not exist');
  });
});

describe('Function me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user information when UUID is valid', async () => {
    const mockUUID = 'valid-uuid';
    const mockUser = {
      username: 'testuser',
      uuid: mockUUID,
      registerTimestamp: new Date(),
      playedGames: [],
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const result = await me(mockUUID);

    expect(User.findOne).toHaveBeenCalledWith({ uuid: mockUUID });
    expect(result).toEqual({
      username: mockUser.username,
      uuid: mockUser.uuid,
      registerTimestamp: mockUser.registerTimestamp,
      playedGames: mockUser.playedGames,
    });
  });

  it('rejects with an error when UUID is invalid', async () => {
    const mockUUID = 'invalid-uuid';
    const mockError = 'User not found';

    User.findOne = jest.fn().mockRejectedValue(mockError);

    await expect(me(mockUUID)).rejects.toThrow('User not found');
    expect(User.findOne).toHaveBeenCalledWith({ uuid: mockUUID });
  });
});

describe('Function refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes access token with a valid refresh token', async () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockVerifiedToken = { uuid: 'mocked-uuid' };

    jwt.verify.mockReturnValue(mockVerifiedToken);

    const result = await refresh(mockRefreshToken);

    expect(jwt.verify).toHaveBeenCalledWith(
      mockRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { uuid: mockVerifiedToken.uuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL },
    );
    expect(result).toEqual({
      accessToken: 'mocked-token',
    });
  });

  it('rejects refresh if refresh token is invalid', async () => {
    const mockRefreshToken = 'invalid-refresh-token';

    // Mocking jwt.verify to throw an error, simulating an invalid refresh token
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid refresh token');
    });

    await expect(refresh(mockRefreshToken)).rejects.toThrow('Invalid refreshToken');
    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
