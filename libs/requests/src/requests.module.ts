import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { MongoModule } from '@mongo/mongo';

@Module({
    providers: [RequestsService],
    imports: [MongoModule],
    exports: [RequestsService],
})
export class RequestsModule {}
