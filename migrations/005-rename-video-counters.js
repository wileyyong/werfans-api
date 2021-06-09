'use strict';

const { createLog, modelProvider: { Video } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Rename video counters');
  try {
    await Video.collection.updateMany(
      {},
      {
        $rename: {
          commentCounter: 'commentsCounter',
          viewCounter: 'viewsCounter',
        },
      },
    );
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = async (next) => {
  try {
    await Video.collection.updateMany(
      {},
      {
        $rename: {
          commentsCounter: 'commentCounter',
          viewsCounter: 'viewCounter',
        },
      },
    );
    next();
  } catch (err) {
    next(err);
  }
};
