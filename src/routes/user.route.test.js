const request = require('supertest');
const express = require('express');
const userRouter = require('./user.route');

const app = express();

app.use('/users', userRouter);

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
      username:"test",
      password:"test"
    });
    expect(response.statusCode).toBe(200);
  });
  test('should specify json in the content type header', async () => {
    const response = await request(app).get('/users').send();
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
});
