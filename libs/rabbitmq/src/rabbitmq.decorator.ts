import { createParamDecorator } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ConsumeMessageFields } from 'amqplib';

export interface RMQHelper<T> {
  message: T;
  fields: ConsumeMessageFields;
  ack: (info?: any) => void;
  nack: (info?: any) => void;
}

export interface ConsumerService {
  consume: (data: RMQHelper<any>) => Promise<void>;
}

export const RMQ = createParamDecorator((data, req) => {
  const context: RmqContext = req.args[1];

  const message = context.getMessage();

  const channel = context.getChannelRef();
  const content = message.content.toString('utf-8');
  const jsonContent = JSON.parse(content);
  return {
    message: jsonContent,
    fields: message.fields,
    ack: () => channel.ack(message),
    nack: () => channel.nack(message),
  };
});
