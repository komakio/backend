import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import { UserReq, Auth } from 'utils/decorators';
import { User } from '@users/users/users.model';
import { RequestsService } from './requests.service';

@Controller('v1/requests')
export class RequestsController {
    constructor(private requests: RequestsService) {}

    @Auth()
    @Post()
    public async create(@UserReq() user: User): Promise<Profile> {
        return this.requests.createOne();
    }
}
