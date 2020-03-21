import { Module } from '@nestjs/common';
import { MongoModule } from '@mongo/mongo';
import { ConfigModule } from '@config/config';
import { LoggerModule } from '@logger/logger';
import { UsersModule } from '@users/users';
import { ProfilesModule } from '@profiles/profiles';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@users/users/auth/auth.guard';

@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    imports: [MongoModule, ProfilesModule, ConfigModule, LoggerModule, UsersModule],
})
export class AppModule {}
