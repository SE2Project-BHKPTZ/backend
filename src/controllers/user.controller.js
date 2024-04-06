const userService = require('../services/user.service');

async function getUser(req, res) {
  try {
    res.json(await userService.getAll());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function register(req, res) {
  if (req.body.username === undefined || req.body.password === undefined) {
    res.status(400).json({ message: 'Username or password undefined' });
    return;
  }
  try {
    res.json(
      await userService.register(req.body.username.toString(), req.body.password.toString()),
    );
  } catch (err) {
    if (err.message === 'User already exists') {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  if (req.body.username === undefined || req.body.password === undefined) {
    res.status(400).json({ message: 'Username or password undefined' });
    return;
  }
  try {
    res.json(await userService.login(req.body.username, req.body.password));
  } catch (err) {
    if (err.message === 'User does not exist' || err.message === 'Invalid password') {
      res.status(400).json({ message: err.message });
      return;
    }

    res.status(500).json({ message: err.message });
  }
}

async function me(req, res) {
  try {
    res.json(await userService.me(req.uuid));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function refresh(req, res) {
  if (req.body.refreshToken === undefined) {
    res.status(400).json({ message: 'refreshToken not provided' });
    return;
  }
  try {
    res.json(await userService.refresh(req.body.refreshToken));
  } catch (err) {
    if (err.message === 'Invalid refreshToken') {
      res.status(400).json({ message: err.message });
      return;
    }

    res.status(500).json({ message: err.message });
  }
}
module.exports = {
  getUser,
  register,
  login,
  me,
  refresh,
};
