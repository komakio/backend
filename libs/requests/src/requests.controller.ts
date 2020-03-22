import { Controller, Post } from '@nestjs/common';
import { UserReq, Auth } from 'utils/decorators';
import { User } from '@users/users/users.model';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';

@Controller('v1/requests')
export class RequestsController {
    constructor(private requestsRabbitMQ: RequestsRabbitMQService) {}

    @Auth()
    @Post()
    public async create(@UserReq() user: User): Promise<void> {        
        await this.requestsRabbitMQ.sendToRequests({ userId: user._id });
    }
}
