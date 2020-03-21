import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { MongoModule } from '@mongo/mongo';

@Module({
    controllers: [ProfilesController],
    providers: [ProfilesService, ProfilesMongoService],
    imports: [MongoModule],
    exports: [ProfilesService],
})
export class ProfilesModule {}
