const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader == null) {
    res.sendStatus(401);
    return;
  }
  const token = authHeader.split(' ')[1];
  if (token === undefined) {
    res.sendStatus(401);
    return;
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.uuid = data.uuid;

    next();
  });
};
