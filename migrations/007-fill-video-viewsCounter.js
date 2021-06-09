'use strict';

const { createLog, modelProvider: { Video } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill video viewsCounter');

  try {
    await Video.updateMany(
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
