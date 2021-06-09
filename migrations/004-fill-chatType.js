'use strict';

const { createLog, modelProvider: { Chat } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  log.info('Fill chatType');

  try {
    await Chat.updateMany(
      {
        chatType: { $exists: false },
      },
      {
        $set: {
          chatType: 'private',
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
