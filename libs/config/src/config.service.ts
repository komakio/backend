import { Injectable } from '@nestjs/common';

export const env = process.env.ENV || 'develop';

@Injectable()
export class ConfigService {
  public env = env;
  public isProduction = process.env.NODE_ENV === 'production';
  public emails = {
    publicRelations: process.env.PUBLIC_RELATIONS_EMAIL || 'test@komak.io',
  };
  public delayNotificationTime =
    parseInt(process.env.DELAY_NOTIFICATION_TIME) || 3 * 60 * 1000;
  public adminApiToken = process.env.ADMIN_API_TOKEN || 'lorem';

  public host = this.isProduction
    ? process.env.HOST
    : this.env === 'develop'
    ? 'localhost'
    : 'staging.komak.io';

  public recaptchaAllowedHostnames = process.env.RECAPTCHA_ALLOWED_HOSTNAMES?.split(
    ','
  ) || ['localhost', 'staging.komak.io'];
  public sentryDsn = process.env.SENTRY_BACKEND;
  public tag = process.env.TAG;
  public packageNames = process.env.PACKAGES_NAMES?.split(',') || [
    'io.komak.app.dev',
  ];
  public googleAuthProjects = {
    ios: process.env.GOOGLE_AUTH_PROJECT_IOS?.split(',') || [
      '50726922019-5cff1qhkilhft8jtaecj7gqeo980pghe.apps.googleusercontent.com',
    ],
    android: process.env.GOOGLE_AUTH_PROJECT_ANDROID?.split(',') || [
      '50726922019-3mba9hr53ob7dbj43s658gr92i5ndsf3.apps.googleusercontent.com',
    ],
  };
  public maxDistance = parseInt(process.env.MAX_DISTANCE, 10) || 1000;

  public peliasUrl = process.env.PELIAS_URL;

  public mongo = {
    srv: process.env.MONGO_SRV,
    host: process.env.MONGO_HOST || 'localhost',
    port: parseInt(process.env.MONGO_PORT, 10) || 27017,
    database: process.env.MONGO_DB || 'default',
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    replicaSet: process.env.MONGO_REPLICASET,
  };

  public rabbitmq = {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    prefix: process.env.RABBITMQ_PREFIX || 'default',
  };

  public redis = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    database: parseInt(process.env.REDIS_DB, 10) || 0,
    password: process.env.REDIS_PASSWORD,
    isAws: process.env.REDIS_AWS === 'true',
    prefix: process.env.REDIS_PREFIX || 'default',
    sentinelMask: process.env.SENTINEL_MASK, // redis-{instance}.namespace
    sentinelCount: process.env.SENTINEL_COUNT
      ? parseInt(process.env.SENTINEL_COUNT, 10)
      : null,
    sentinelName: process.env.SENTINEL_NAME,
  };

  public fcm = {
    serverKey: process.env.FCM_SERVER_KEY,
  };

  public jwt = {
    accessTokenSecret:
      process.env.ACCESS_TOKEN_SECRET ||
      'du:<9tv:B{P^X/s~Lv4+MsT7.>%w%!A$zU%_C~Pj3[,]+~c2LB;;fLBE5E@NKFg',
    accessTokenExpiration: 60 * 60 * 24 * 365,
  };

  public mailgun = {
    apiKey: process.env.EMAIL_API_KEY || 'lorem',
    domain: process.env.EMAIL_DOMAIN,
    from: process.env.EMAIL_ADDRESS,
  };

  public recaptcha = {
    score: parseFloat(process.env.RECAPTCHA_SCORE) || 0.5,
    secret:
      process.env.RECAPTCHA_SECRET ||
      '6Lc2ReUUAAAAAO-oGA0nnHTNBf90r1w0FzGPViMU',
  };

  public crowdin = {
    apiKey: process.env.CROWDIN_API_KEY || 'lorem',
    projectId: process.env.CROWDIN_PROJECT_ID || 'lorem',
  };

  public amplitudeToken = process.env.AMPLITUDE_TOKEN;

  public facebook = {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  };
}
