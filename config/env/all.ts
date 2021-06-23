import toBoolean from '../../app/lib/helpers/toBoolean';
import toNumber from '../../app/lib/helpers/toNumber';
import { PricePeriod } from '../../app/domains/user';

const appTitle = process.env.APP_TITLE || 'LS';

const config = {
  port: toNumber(process.env.PORT, 1340),
  mongo: process.env.MONGO_URI || 'mongodb+srv://mlm-social:vFx48HoLEqPkD1vX@cluster0.sytbq.mongodb.net/werfans-api',
  mongoOptions: {
    poolSize: toNumber(process.env.MONGO_POOL_SIZE, 5),
    connectTimeoutMS: toNumber(process.env.MONGO_CONNECT_TIMEOUT, 30000),
    socketTimeoutMS: toNumber(process.env.MONGO_SOCKET_TIMEOUT, 30000),
    useUnifiedTopology: true,
    useFindAndModify: false,
  },

  isMigration: false,
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test' || (<any>global).FORCED_NODE_ENV === 'test',

  app: {
    title: appTitle,
  },

  security: {
    tokenLife: toNumber(process.env.ACCESS_TOKEN_LIFE, 3600),
    emailVerificationTokenLife: 3 * 24 * 3600,
    forgotPasswordTokenLife: 24 * 3600,
    tokenSecret: process.env.TOKEN_SECRET || 'tokenSecret',
  },

  i18n: {
    defaultLocale: 'en',
  },

  moleculer: {
    namespace: process.env.MOLECULER_NAMESPACE || process.env.NODE_ENV,
  },

  redis: {
    keyPrefix: `${appTitle}.notifications`,
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379',
  },

  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'AKIAVBPXT7J6JWIAGJ43',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'Tz7ns0KWBGO5TAlWwomPxaTVJ6KPY/awAaw3XU/r+zO70n',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'cadenza-lc1-media-develop',
    url: process.env.S3_BUCKET_URL || 'https://cadenza-lc1-media-develop.s3.amazonaws.com/',
    signatureVersion: 'v4',
  },

  ses: {
    from: process.env.SES_MAIL_FROM || 'no-reply@lc.cadenzasoft.dev',
    region: process.env.SES_REGION || 'us-east-1',
    accessKeyId: process.env.SES_ACCESS_KEY_ID || 'AKIAVBPXT7J6IWNCLNVL',
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || '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',
  },

  billing: {
    endpoint: process.env.BILLING_ENDPOINT || 'https://api.ccbill.com/wap-frontflex/flexforms',
    webhookSecret: process.env.BILLING_WEBHOOK_SECRET || 'webhookSecret',
    flexId: process.env.BILLING_FLEX_ID || 'd91601e7-ffaf-452c-b9b2-21ee77abc662',
    clientAccnum: process.env.BILLING_CLIENT_ACCOUNT_NUM || '951492',
    clientSubacc: process.env.BILLING_CLIENT_SUBACCOUNT || '0021',
    salt: process.env.BILLING_SALT || '',
    testingMode: toBoolean(process.env.BILLING_TESTING_MODE, false),
  },

  urls: {
    resetPassword: process.env.URL_RESET_PASSWORD || 'reset-password',
    verifyEmail: process.env.URL_VERIFY_EMAIL || 'verify-email',
    defaultClientOrigin: process.env.URL_DEFAULT_CLIENT_ORIGIN || 'api-backend.herokuapp.com',
  },

  logger: {
    suppressStdout: process.env.LOGGER_SUPPRESS_STDOUT,
    level: process.env.LOGGER_LEVEL || 'info',
  },

  defaultClient: {
    name: process.env.CLIENT_NAME || 'default',
    clientId: process.env.CLIENT_ID || 'default',
    clientSecret: process.env.CLIENT_SECRET || 'default',
  },
  defaultUser: {
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'adminadmin',
    admin: true,
  },
  defaultPrices: [
    {
      period: PricePeriod.Monthly,
      price: 49.99,
    },
  ],
  banningStrategy: {
    strikeThreshold: toNumber(process.env.STRIKE_THRESHOLD, 3),
    endpointWhitelist: [
      '/users/me',
      '/users/me/strikes',
    ],
  },

  serveSwaggerDocs: toBoolean(process.env.SERVE_SWAGGER_DOCS, true),
};

export type Config = typeof config;

export default config;
