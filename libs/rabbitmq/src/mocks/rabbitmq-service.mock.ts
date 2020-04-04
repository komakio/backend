import { RabbitMQServiceInterface } from '../rabbitmq.service';

export class MockRabbitMQService implements RabbitMQServiceInterface {
  public url = '';

  public connect = jest.fn();
  public sendToQueue = jest.fn();
  public sendToQueueWithDelay = jest.fn();
  public publishToExchange = jest.fn();
}
