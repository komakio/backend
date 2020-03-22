import { Injectable } from '@nestjs/common';
import { ConfigService } from '@config/config';
import { RabbitMQService } from '@rabbitmq/rabbitmq';
import { QueueRequest } from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
    public requestQueueName = `${this.config.rabbitmq.prefix}requestQueue`;

    constructor(private config: ConfigService, private rabbitMQ: RabbitMQService) {}

    public async sendToRequests(props: QueueRequest) {
        await this.rabbitMQ.sendToQueue(this.requestQueueName, props);
    }
}
