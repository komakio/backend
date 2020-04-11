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
import { AuthService } from '@backend/users/auth/services/auth.service';
import { UsersModule } from '@backend/users';
import { MongoService } from '@backend/mongo';
import { dummyUsers } from './users';
import { MockRabbitMQService } from '@backend/rabbitmq/mocks/rabbitmq-service.mock';
import { MockNotificationsService } from '@backend/notifications/mock/notifications-service.mock';
import { NotificationsService } from '@backend/notifications';
import { prePopulateUsers } from './prepopulate';
import { AppleService } from '@backend/users/auth/services/apple.service';
import { MockAppleService } from '@backend/users/mock/apple-service.mock';
import { GoogleService } from '@backend/users/auth/services/google.service';
import { MockGoogleService } from '@backend/users/mock/google-service.mock';
import { RedisService } from '@backend/redis';

// export const toIdempotentObject = (user: User) => {
//   return {
//     ...user,
//     addedDate: null,
//     lastLoginDate: null,
//     password: null,
//   } as User;
// };

export interface TestApplicationController {
  app: INestApplication;
  tokens: InternalTestModuleFixture['tokens'];
  services: InternalTestModuleFixture['services'];
}

export interface TestMicroserviceController {
  app: INestMicroservice;
  getConsumer: (
    data: any
  ) => { ack: jest.Mock; nack: jest.Mock; consume: () => Promise<void> };
  tokens: InternalTestModuleFixture['tokens'];
  services: InternalTestModuleFixture['services'];
}

export const prepareHttpTestController = async (
  Module:
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>,
  uniqueId: string
): Promise<TestApplicationController> => {
  const { moduleFixture, tokens, services } = await prepareTestController(
    Module,
    uniqueId
  );

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  // await app
  //   .getHttpAdapter()
  //   .getInstance()
  //   .ready();

  return {
    app,
    tokens,
    services,
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
  const { moduleFixture, tokens, services } = await prepareTestController(
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
    tokens,
    services,
  };
};

export interface InternalTestModuleFixture {
  moduleFixture: TestingModule;
  tokens: {
    helper: string;
    needer: string;
  };
  services: {
    notifications: MockNotificationsService;
    rabbitMQ: MockRabbitMQService;
    appleService: MockAppleService;
    googleService: MockGoogleService;
  };
}

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
    imports: [Module, UsersModule],
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

  const authService = moduleFixture.get(AuthService);

  const [helper, needer] = await Promise.all([
    authService.generateAccessToken(
      dummyUsers.find(u => u.type === 'helper').user,
      10000000
    ),
    authService.generateAccessToken(
      dummyUsers.find(u => u.type === 'needer').user,
      10000000
    ),
  ]);

  await prePopulateUsers(moduleFixture);

  return {
    moduleFixture,
    tokens: {
      helper: helper.token,
      needer: needer.token,
    },
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

export const stopTest = async (app: INestApplication | INestMicroservice) => {
  await app.get(MongoService).close();
  await app.get(RedisService).close();
  await app.close();
};
