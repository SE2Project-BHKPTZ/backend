const userService = require('../services/user.service');

async function getUser(req, res, next) {
  try {
    res.json({ status: 'success', data: await userService.getAll() });
  } catch (err) {
    console.error('Error while getting user', err.message);
    next(err);
  }
}

async function addUser(req, res, next) {
  if (req.body.username === undefined || req.body.password === undefined) {
    res.status(400);
    res.json({ status: 'error', data: 'Username or password undefined' });
    return;
  }
  try {
    res.json({ status: 'success', data: await userService.add(req.body.username, req.body.password) });
  } catch (err) {
    console.error('Error while getting user', err.message);
    next(err);
  }/*  */
}

module.exports = {
  getUser,
  addUser,
};
