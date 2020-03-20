import { Module } from '@nestjs/common';
import { MongoModule } from '@mongo/mongo';
import { ConfigModule } from '@config/config';
import { LoggerModule } from '@logger/logger';
import { UsersModule } from '@users/users';

@Module({
    imports: [MongoModule, ConfigModule, LoggerModule, UsersModule],
})
export class AppModule {}
