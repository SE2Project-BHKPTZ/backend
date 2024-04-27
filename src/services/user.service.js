const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const getByUsername = async (username) => User.findOne({ username: username.toString() });
const getByUUID = async (uuid) => User.findOne({ uuid });
exports.getByUUID = async (uuid) => User.findOne({ uuid });
exports.getAll = async () => User.find({});

exports.register = async (username, password) => new Promise((resolve, reject) => {
  getByUsername(username).then(async (fetchedUser) => {
    if (fetchedUser != null) reject(new Error('User already exists'));
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      uuid: uuidv4(),
      playedGames: [],
      websocket: '',
    });
    await user.save();

    const accessToken = jwt.sign(
      { uuid: user.uuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL },
    );
    const refreshToken = jwt.sign(
      { uuid: user.uuid },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_TTL },
    );

    resolve({ accessToken, refreshToken, expires_in: process.env.ACCESS_TOKEN_TTL });
  }).catch((err) => {
    reject(new Error(err));
  });
});

exports.login = async (username, password) => new Promise((resolve, reject) => {
  getByUsername(username).then(async (user) => {
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) reject(new Error('Invalid password'));

    const accessToken = jwt.sign(
      { uuid: user.uuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL },
    );
    const refreshToken = jwt.sign(
      { uuid: user.uuid },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_TTL },
    );

    resolve({ accessToken, refreshToken, expires_in: process.env.ACCESS_TOKEN_TTL });
  }).catch(() => {
    reject(new Error('User does not exist'));
  });
});

exports.me = async (uuid) => new Promise((resolve, reject) => {
  getByUUID(uuid).then((user) => {
    resolve({
      username: user.username,
      uuid: user.uuid,
      registerTimestamp: user.registerTimestamp,
      playedGames: user.playedGames,
    });
  }).catch((err) => {
    reject(new Error(err));
  });
});

exports.refresh = async (refreshToken) => new Promise((resolve, reject) => {
  let verifiedRefreshToken;
  try {
    verifiedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    reject(new Error('Invalid refreshToken'));
  }
  const accessToken = jwt.sign(
    { uuid: verifiedRefreshToken.uuid },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL },
  );
  resolve({ accessToken });
});

exports.setWebsocket = async (uuid, socketID) => new Promise((resolve, reject) => {
  getByUUID(uuid).then((user) => {
    user.websocket = socketID;
    user.save();
    resolve('websocket set');
  }).catch((err) => {
    reject(new Error(err));
  });
});
