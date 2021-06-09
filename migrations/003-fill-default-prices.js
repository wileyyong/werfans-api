'use strict';

const { createLog, config: { defaultPrices }, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill default prices');

  try {
    await User.updateOne(
      {
        $or: [
          { prices: { $exists: false } },
          { prices: { $size: 0 } },
        ],
      },
      {
        $set: {
          prices: defaultPrices,
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
