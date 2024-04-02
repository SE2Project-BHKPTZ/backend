const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

exports.getAll = async () => User.find({});

exports.add = async (username, password) => {
  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    password: hashedPassword,
    uuid: uuidv4(),
    playedGames: [],
  });

  return user.save();
};
