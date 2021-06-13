import healthService from 'app/lib/services/health.service';

const { version } = require('package.json');

module.exports = async () => {
  healthService.updateData('version', true, version);
};
