'use strict';

const { createLog, modelProvider: { Photo } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill photo viewsCounter');

  try {
    await Photo.updateMany(
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
