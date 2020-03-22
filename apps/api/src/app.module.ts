import { Module } from '@nestjs/common';
import { MongoModule } from '@mongo/mongo';
import { ConfigModule } from '@config/config';
import { LoggerModule } from '@logger/logger';
import { UsersModule } from '@users/users';
import { ProfilesModule } from '@profiles/profiles';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@users/users/auth/auth.guard';
import { RequestsModule } from 'libs/requests/src';

const modules = [MongoModule, ProfilesModule, ConfigModule, LoggerModule, UsersModule, RequestsModule];
@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    imports: [...modules],
})
export class AppModule {}

@Module({
    imports: [...modules],
})
export class AppConsumerModule {}
