'use strict';

const { createLog, modelProvider: { Video } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill video commentsCounter');

  try {
    await Video.updateMany(
      {
        commentsCounter: { $exists: false },
      },
      {
        $set: {
          commentsCounter: 0,
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
