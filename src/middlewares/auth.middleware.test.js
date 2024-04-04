const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./auth.middleware');

describe('authenticateToken middleware', () => {
  let req; let res; let
    next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: null,
      },
    };
    res = {
      sendStatus: jest.fn(),
    };
    next = jest.fn();
  });

  it('should send 401 status if authorization header is missing', () => {
    authenticateToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should send 401 status if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';

    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback('err');
    });

    authenticateToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.uuid and call next if token is valid', () => {
    req.headers.authorization = 'Bearer testtoken';

    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(undefined, { uuid: 'testUUID' });
    });

    authenticateToken(req, res, next);

    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(req.uuid).toBe('testUUID');
    expect(next).toHaveBeenCalled();
  });
});
