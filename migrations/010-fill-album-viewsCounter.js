'use strict';

const { createLog, modelProvider: { Album } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill album viewsCounter');

  try {
    await Album.updateMany(
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
