import { Controller, Post, Param, Get, Put } from '@nestjs/common';
import { UserReq, Auth } from 'utils/decorators';
import { User } from '@backend/users/users.model';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { NotificationsService } from '@backend/notifications';
import { RequestsService } from './requests.service';

@Controller('v1/requests')
export class RequestsController {
  constructor(
    private requestsRabbitMQ: RequestsRabbitMQService,
    private requests: RequestsService,
    private notifications: NotificationsService
  ) {}

  @Auth()
  @Post()
  public async create(@UserReq() user: User): Promise<void> {
    await this.requestsRabbitMQ.sendToRequests({ userId: user._id });
  }

  @Auth()
  @Put(':id')
  public async cancel(@UserReq() user: User): Promise<void> {
    await this.requestsRabbitMQ.sendToRequests({ userId: user._id });
  }

  @Get(':id')
  public async test(@Param('id') devideId: string): Promise<void> {
    try {
      await this.notifications.send({
        deviceIds: [devideId],
        message: {
          title: 'dummy title',
          body: 'this is the message body.',
          icon: 'no-icon',
        },
      });
    } catch (err) {
      console.log('failed', { err });
    }
  }
}
