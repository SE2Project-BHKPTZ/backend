const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./user.route');
const userService = require('../services/user.service');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRouter);

jest.mock('../services/user.service.js', () => ({
  getAll: jest.fn().mockReturnValue([
    { username: 'test', password: 'test' }]),
  register: jest.fn().mockReturnValue({
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    expires_in: '2h',
  }),
  login: jest.fn().mockReturnValue({
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    expires_in: '2h',
  }),
  me: jest.fn().mockReturnValue({
    username: 'test',
    uuid: 'cd84686e-24b5-4524-af68-675563608a4d',
    registerTimestamp: '2024-04-02T14:02:02.066Z',
    playedGames: [],
  }),
  refresh: jest.fn().mockReturnValue({
    accessToken: 'accessToken',
  }),
}));

jest.mock('../middlewares/auth.middleware.js', () => ({
  authenticateToken: jest.fn().mockImplementation((req, res, next) => {
    next();
  }),
}));

describe('Get /users', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/users').send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/users').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 500 status code', async () => {
    userService.getAll.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/users').send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /users/register', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/users/register').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/users/register').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should have password in the request body', async () => {
    const response = await request(app).post('/users/register').send({
      username: undefined,
      password: 'test',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should have username in the request body', async () => {
    const response = await request(app).post('/users/register').send({
      username: 'test',
      password: undefined,
    });
    expect(response.statusCode).toBe(400);
  });
  test('should return User exists error', async () => {
    userService.register.mockImplementation(() => {
      throw new Error('User already exists');
    });
    const response = await request(app).post('/users/register').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should respond with a 500 status code', async () => {
    userService.register.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/users/register').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /users/login', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/users/login').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should have password in the request body', async () => {
    const response = await request(app).post('/users/login').send({
      username: undefined,
      password: 'test',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should have username in the request body', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'test',
      password: undefined,
    });
    expect(response.statusCode).toBe(400);
  });
  test('should return User does not exist error', async () => {
    userService.login.mockImplementation(() => {
      throw new Error('User does not exist');
    });
    const response = await request(app).post('/users/login').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should return Invalid password error', async () => {
    userService.login.mockImplementation(() => {
      throw new Error('Invalid password');
    });
    const response = await request(app).post('/users/login').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should respond with a 500 status code', async () => {
    userService.login.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/users/login').send({
      username: 'test',
      password: 'test',
    });
    expect(response.statusCode).toBe(500);
  });
});

describe('Get /users/me', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/users/me').send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/users/me').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 500 status code', async () => {
    userService.me.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/users/me').send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /users/refresh', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/users/refresh').send({
      refreshToken: 'refreshToken',
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/users/refresh').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 400 status code', async () => {
    const response = await request(app).post('/users/refresh').send();
    expect(response.statusCode).toBe(400);
  });
  test('should respond with a 400 Invalid refreshToken status code', async () => {
    userService.refresh.mockImplementation(() => {
      throw new Error('Invalid refreshToken');
    });
    const response = await request(app).post('/users/refresh').send({
      refreshToken: 'refreshToken',
    });
    expect(response.statusCode).toBe(400);
  });
  test('should respond with a 500 status code', async () => {
    userService.refresh.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/users/refresh').send({
      refreshToken: 'refreshToken',
    });
    expect(response.statusCode).toBe(500);
  });
});
