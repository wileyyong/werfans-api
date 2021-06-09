'use strict';

const { createLog, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill user balance');

  try {
    await User.updateMany(
      {
        balance: { $exists: false },
      },
      {
        $set: {
          balance: 0,
        },
      },
    );
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = async (next) => {
  next();
};
