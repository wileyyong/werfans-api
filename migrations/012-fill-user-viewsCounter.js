'use strict';

const { createLog, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill user viewsCounter');

  try {
    await User.updateMany(
      {
        viewsCounter: { $exists: false },
      },
      {
        $set: {
          viewsCounter: 0,
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
