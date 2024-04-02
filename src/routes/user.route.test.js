const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./user.route');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRouter);

jest.mock('../services/user.service.js', () => ({
  getAll: jest.fn().mockReturnValue([
    { username: 'test', password: 'test' },
  ]),
  add: jest.fn().mockReturnValue(true),
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
});
