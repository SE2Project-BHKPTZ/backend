const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const lobbyRouter = require('./lobby.route');
const lobbyService = require('../services/lobby.service');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/lobbys', lobbyRouter);

jest.mock('../services/lobby.service.js', () => ({
  getAll: jest.fn().mockReturnValue([
    {
      _id: '661a2cb93c5b088ef67bc9fb',
      uuid: '1500532b-377a-4d3c-9e75-6124bbc02b20',
      lobbyid: 'HRTAFQ',
      status: 'CREATED',
      name: 'test',
      players: [
        'd3081378-f270-4e74-9463-b880123c49b6',
      ],
      maxPlayers: 3,
      results: [

      ],
      isPublic: true,
      timestamp: '2024-04-13T06:56:57.162Z',
      __v: 0,
    }]),
  getCurrentLobby: jest.fn().mockReturnValue(
    {
      _id: '661a2cb93c5b088ef67bc9fb',
      uuid: '1500532b-377a-4d3c-9e75-6124bbc02b20',
      lobbyid: 'HRTAFQ',
      status: 'CREATED',
      name: 'test',
      players: [
        'd3081378-f270-4e74-9463-b880123c49b6',
      ],
      maxPlayers: 3,
      results: [

      ],
      isPublic: true,
      timestamp: '2024-04-13T06:56:57.162Z',
      __v: 0,
    },
  ),
  delete: jest.fn().mockReturnValue('delete successfull'),
  create: jest.fn().mockReturnValue('123HZD'),
  join: jest.fn().mockReturnValue('lobby joined successfull'),
  leave: jest.fn().mockReturnValue('lobby left successfull'),
  kick: jest.fn().mockReturnValue('user kicked successfull'),
}));

jest.mock('../middlewares/auth.middleware.js', () => ({
  authenticateToken: jest.fn().mockImplementation((req, res, next) => {
    next();
  }),
}));

describe('Get /lobbys', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/lobbys').send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/lobbys').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.getAll.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/lobbys').send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Get /lobbys/my', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/lobbys/my').send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/lobbys/my').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 400 status code', async () => {
    lobbyService.getCurrentLobby.mockImplementation(() => {
      throw new Error('Player is not in an lobby');
    });
    const response = await request(app).get('/lobbys/my').send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'Player is not in an lobby' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.getCurrentLobby.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/lobbys/my').send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Delete /lobbys', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).delete('/lobbys').query({ uuid: 1234 }).send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).delete('/lobbys').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should respond with a 400 status code', async () => {
    lobbyService.delete.mockImplementation(() => {
      throw new Error('Lobby not found');
    });
    const response = await request(app).delete('/lobbys').query({ uuid: 1234 }).send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'Lobby not found' }));
  });
  test('should have a uuid', async () => {
    const response = await request(app).delete('/lobbys').send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'uuid undefined' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.delete.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).delete('/lobbys').query({ uuid: 1234 }).send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /lobbys', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/lobbys').send({
      name: 'test',
      isPublic: 1,
      maxPlayers: 3,
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/lobbys').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should have name in the request body', async () => {
    const response = await request(app).post('/lobbys').send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'name undefined' }));
  });
  test('should have isPublic in the request body', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'isPublic undefined' }));
  });
  test('should have valid isPublic in the request body', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test', isPublic: -1 });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'isPublic invalid' }));
  });
  test('should have maxPlayers in the request body', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test', isPublic: 1 });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'maxPlayers invalid or undefined' }));
  });
  test('should have valid maxPlayers in the request body', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test', isPublic: 1, maxPlayers: 'test' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'maxPlayers invalid or undefined' }));
  });
  test('should have valid range maxPlayers in the request body', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test', isPublic: 1, maxPlayers: 2 });
    expect(response.statusCode).toBe(400);
  });
  test('should have valid range maxPlayers in the request body 2', async () => {
    const response = await request(app).post('/lobbys').send({ name: 'test', isPublic: 1, maxPlayers: 7 });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'maxPlayers out of range' }));
  });
  test('should return Player is already in an lobby error', async () => {
    lobbyService.create.mockImplementation(() => {
      throw new Error('Player is already in an lobby');
    });
    const response = await request(app).post('/lobbys').send({
      name: 'test',
      isPublic: 1,
      maxPlayers: 3,
    });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'Player is already in an lobby' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.create.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/lobbys').send({
      name: 'test',
      isPublic: 1,
      maxPlayers: 3,
    });
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /lobbys/join', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/lobbys/join').send({
      lobbyID: 'uu12id',
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/lobbys/join').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should have lobbyID in the request body', async () => {
    const response = await request(app).post('/lobbys/join').send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'lobbyID undefined' }));
  });
  test('should return Player is already in an lobby error', async () => {
    lobbyService.join.mockImplementation(() => {
      throw new Error('Player is already in an lobby');
    });
    const response = await request(app).post('/lobbys/join').send({
      lobbyID: 'uu12id',
    });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'Player is already in an lobby' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.join.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/lobbys/join').send({
      lobbyID: 'uu12id',
    });
    expect(response.statusCode).toBe(500);
  });
});

describe('Get /lobbys/leave', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/lobbys/leave').send();
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/lobbys/leave').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should return Player is not in an lobby error', async () => {
    lobbyService.leave.mockImplementation(() => {
      throw new Error('Player is not in an lobby');
    });
    const response = await request(app).get('/lobbys/leave').send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'Player is not in an lobby' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.leave.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/lobbys/leave').send();
    expect(response.statusCode).toBe(500);
  });
});

describe('Post /lobbys/kick', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).post('/lobbys/kick').send({ uuid: 'uuid' });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).post('/lobbys/kick').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
  test('should return uuid undefined error', async () => {
    const response = await request(app).post('/lobbys/kick').send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ message: 'uuid undefined' }));
  });
  test('should respond with a 500 status code', async () => {
    lobbyService.kick.mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/lobbys/kick').send({ uuid: 'uuid' });
    expect(response.statusCode).toBe(500);
  });
});
