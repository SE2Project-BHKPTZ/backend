const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const getByUsername = async (username) => User.findOne({ username: username.toString() });
const getByUUID = async (uuid) => User.findOne({ uuid: uuid.toString() });
exports.getByUUID = async (uuid) => User.findOne({ uuid });
exports.getAll = async () => User.find({});
exports.getByWebsocket = async (websocket) => User.findOne({ websocket });

exports.register = async (username, password) => {
  const fetchedUser = await getByUsername(username);

  if (fetchedUser != null) throw new Error('User already exists');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    password: hashedPassword,
    uuid: uuidv4(),
    playedGames: [],
    websocket: 'null',
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

  return { accessToken, refreshToken, expires_in: process.env.ACCESS_TOKEN_TTL };
};

exports.login = async (username, password) => {
  const user = await getByUsername(username);

  if (user == null) {
    throw new Error('User does not exist');
  }

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) throw new Error('Invalid password');

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

  return { accessToken, refreshToken, expires_in: process.env.ACCESS_TOKEN_TTL };
};

exports.me = async (uuid) => {
  try {
    const user = await getByUUID(uuid);
    return {
      username: user.username,
      uuid: user.uuid,
      registerTimestamp: user.registerTimestamp,
      playedGames: user.playedGames,
    };
  } catch (err) {
    throw new Error(err);
  }
};

exports.refresh = async (refreshToken) => {
  let verifiedRefreshToken;
  try {
    verifiedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new Error('Invalid refreshToken');
  }
  const accessToken = jwt.sign(
    { uuid: verifiedRefreshToken.uuid },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL },
  );
  return { accessToken };
};

exports.setWebsocket = async (uuid, socketID) => {
  try {
    const user = await getByUUID(uuid);
    user.websocket = socketID;
    await user.save();
    return 'websocket set';
  } catch (err) {
    // TODO: Dont throw error since it kills the server
    throw new Error(err);
  }
};
