const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, uuid) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.uuid = uuid;

    next();
  });
};
