const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader == null || authHeader.split(' ')[1] === undefined) {
    res.sendStatus(401);
    return;
  }
  jwt.verify(authHeader.split(' ')[1], process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.uuid = data.uuid;

    next();
  });
};
