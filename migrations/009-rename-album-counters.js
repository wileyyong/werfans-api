'use strict';

const { createLog, modelProvider: { Album } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Rename album counters');
  try {
    await Album.collection.updateMany(
      {},
      {
        $rename: {
          photoCounter: 'photosCounter',
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
    await Album.collection.updateMany(
      {},
      {
        $rename: {
          photosCounter: 'photoCounter',
          viewsCounter: 'viewCounter',
        },
      },
    );
    next();
  } catch (err) {
    next(err);
  }
};
