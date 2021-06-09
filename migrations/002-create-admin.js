'use strict';

const { createLog, config: { defaultUser }, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Creating default admin account');

  try {
    let user = await User.findOne({ username: defaultUser.username });

    if (!user) {
      user = new User(defaultUser);
      user.hashedPassword = await User.hashPassword(defaultUser.password);
      await user.save();
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = async (next) => {
  log.info('Deleting default admin account');

  try {
    await User.deleteOne({ username: defaultUser.username });
    next();
  } catch (err) {
    next(err);
  }
};
