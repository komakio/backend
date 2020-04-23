import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Type,
  DynamicModule,
  ForwardReference,
  INestMicroservice,
  Abstract,
} from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import { RabbitMQService } from '@backend/rabbitmq';
import { MongoService } from '@backend/mongo';
import { MockRabbitMQService } from '@backend/rabbitmq/mocks/rabbitmq-service.mock';
import { MockNotificationsService } from '@backend/notifications/mock/notifications-service.mock';
import { NotificationsService } from '@backend/notifications';
import { prePopulateMirrorUsers } from './prepopulate';
import { AppleService } from '@backend/users/auth/services/apple.service';
import { MockAppleService } from '@backend/users/mock/apple-service.mock';
import { GoogleService } from '@backend/users/auth/services/google.service';
import { MockGoogleService } from '@backend/users/mock/google-service.mock';
import { RedisService } from '@backend/redis';
import {
  TestApplicationController,
  TestMicroserviceController,
  InternalTestModuleFixture,
} from './model';

export const prepareHttpTestController = async (
  Module:
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>,
  uniqueId: string
): Promise<TestApplicationController> => {
  const { moduleFixture, services, users } = await prepareTestController(
    Module,
    uniqueId
  );

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  return {
    app,
    services,
    users,
  };
};

export const prepareRabbitMQTestController = async (
  Module:
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>,
  Controller: string | symbol | Type<any> | Abstract<any>,
  uniqueId: string
): Promise<TestMicroserviceController> => {
  const { moduleFixture, services } = await prepareTestController(
    Module,
    uniqueId
  );

  const app = moduleFixture.createNestMicroservice({ strategy: null });
  expect(app).toBeTruthy();
  await app.init();

  const controller = app.get(Controller);

  const getConsumer = (data: any) => {
    const ack = jest.fn();
    const nack = jest.fn();

    return {
      ack,
      nack,
      consume: () =>
        controller.consume({
          message: data,
          ack,
          nack,
        }),
    };
  };

  return {
    app,
    getConsumer,
    services,
  };
};

export const stopTest = async (app: INestApplication | INestMicroservice) => {
  await app.get(MongoService).close();
  await app.get(RedisService).close();
  await app.close();
};

const getKey = (uniqueId: string) =>
  `${process.env.MONGO_DB || 'default'}-test-${uniqueId}`;

const prepareTestController = async (
  Module:
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>,
  uniqueId: string
): Promise<InternalTestModuleFixture> => {
  // Make databases config to be unique
  const config = new ConfigService();
  const key = getKey(uniqueId);
  config.mongo.database = key;
  config.redis.prefix = key;

  // Remove debug logs
  const logger = new LoggerService();
  logger.debug = () => {
    // do nothing.
  };

  const notifications = new MockNotificationsService();
  const rabbitMQ = new MockRabbitMQService();
  const appleService = new MockAppleService();
  const googleService = new MockGoogleService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [Module],
  })
    .overrideProvider(ConfigService)
    .useValue(config)
    .overrideProvider(LoggerService)
    .useValue(logger)
    .overrideProvider(NotificationsService)
    .useValue(notifications)
    .overrideProvider(RabbitMQService)
    .useValue(rabbitMQ)
    .overrideProvider(AppleService)
    .useValue(appleService)
    .overrideProvider(GoogleService)
    .useValue(googleService)
    .compile();

  await clean(moduleFixture, uniqueId);

  const users = await prePopulateMirrorUsers(moduleFixture);

  return {
    moduleFixture,
    users,
    services: {
      notifications,
      rabbitMQ,
      appleService,
      googleService,
    },
  };
};

const clean = async (
  moduleFixture: TestingModule,
  uniqueId: string
): Promise<void> => {
  const mongoService = moduleFixture.get(MongoService);
  const redisService = moduleFixture.get(RedisService);
  await Promise.all([mongoService.waitReady(), redisService.waitReady()]);
  await Promise.all([
    mongoService.db.dropDatabase(),
    redisService.clearRedisKeys(`${getKey(uniqueId)}:*`),
  ]);
};
