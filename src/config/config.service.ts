import { Injectable } from '@nestjs/common';

export const env = process.env.ENV || 'develop';

@Injectable()
export class ConfigService {
    public env = env;
    public isProduction = process.env.NODE_ENV === 'production';
    public host = process.env.HOST;

    public mongo = {
        srv: process.env.MONGO_SRV,
        host: process.env.MONGO_HOST || 'localhost',
        port: parseInt(process.env.MONGO_PORT, 10) || 27017,
        database: process.env.MONGO_DB || 'default',
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        replicaSet: process.env.MONGO_REPLICASET,
    };

    public jwt = {
        accessTokenSecret:
            process.env.ACCESS_TOKEN_SECRET || 'du:<9tv:B{P^X/s~Lv4+MsT7.>%w%!A$zU%_C~Pj3[,]+~c2LB;;fLBE5E@NKFg',
        accessTokenExpiration: 60 * 60 * 24 * 365,
    };
}
