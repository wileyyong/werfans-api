'use strict';

const { createLog, modelProvider: { User } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Refill user subscriptionsCounter');

  try {
    const users = await User.find().select('_id').lean();
    await Promise.all(users.map(({ _id }) => User.syncSubscriptionsCounters(_id)));
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = async (next) => {
  next();
};
