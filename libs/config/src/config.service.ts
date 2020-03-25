import { Injectable } from '@nestjs/common';

export const env = process.env.ENV || 'develop';

@Injectable()
export class ConfigService {
  public env = env;
  public isProduction = process.env.NODE_ENV === 'production';
  public host = process.env.HOST;
  public sentryDsn = process.env.SENTRY_BACKEND;
  public tag = process.env.TAG;
  public packageName = 'io.komak.app';

  public mongo = {
    srv: process.env.MONGO_SRV,
    host: process.env.MONGO_HOST || 'localhost',
    port: parseInt(process.env.MONGO_PORT, 10) || 27018,
    database: process.env.MONGO_DB || 'default',
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    replicaSet: process.env.MONGO_REPLICASET,
  };

  public rabbitmq = {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5673,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    prefix: process.env.RABBITMQ_PREFIX || 'default',
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
}
