'use strict';

const { createLog, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill user subscriptionsCounter');

  try {
    const users = await User.find({
      subscriptionsCounter: { $exists: false },
    }).select('subscriptions subscriptionsCounter');
    await Promise.all(users.map((user) => {
      user.subscriptionsCounter = user.subscriptions.length;
      return user.save();
    }));
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = async (next) => {
  next();
};
