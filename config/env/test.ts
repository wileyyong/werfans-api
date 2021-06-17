export default {
  port: process.env.PORT || 1341,
  mongo: process.env.MONGO_URI || 'mongodb://localhost/api-backend-test',

  coverageEnabled: false,
};
