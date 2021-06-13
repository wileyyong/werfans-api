'use strict';

const { config, createLog, modelProvider: { Client } } = require('app/app');

const log = createLog(module);

exports.up = async (next) => {
  try {
    log.info('Creating default client');
    const client = await Client.findOne({ clientId: config.defaultClient.clientId });
    if (!client) {
      await Client.create(config.defaultClient);
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.down = (next) => {
  log.info('Removing default client');

  return Client.deleteOne({ clientId: config.defaultClient.clientId }, next);
};
