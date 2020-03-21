import { Injectable } from '@nestjs/common';
import { RequestsMongoService } from './services/requests-mongo.service';
import { HelpRequest } from './requests.model';

@Injectable()
export class RequestsService {
    constructor(private requestsMongo: RequestsMongoService) {}

    public async createOne(request: Partial<HelpRequest>) {
        return this.requestsMongo.createOne(request);
    }
}
