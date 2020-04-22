import { Profile } from 'libs/profiles/src/profiles.model';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { User } from '@backend/users/users.model';
import { TestingModule } from '@nestjs/testing';
import { MockNotificationsService } from '@backend/notifications/mock/notifications-service.mock';
import { MockRabbitMQService } from '@backend/rabbitmq/mocks/rabbitmq-service.mock';
import { MockAppleService } from '@backend/users/mock/apple-service.mock';
import { MockGoogleService } from '@backend/users/mock/google-service.mock';

export interface PrePopulatedProfiles {
  helper: Profile;
  needer: Profile;
}

export interface InternalTestModuleFixture {
  moduleFixture: TestingModule;
  users: {
    helper: User;
    needer: User;
  };
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

export interface TestApplicationController {
  app: INestApplication;
  tokens: InternalTestModuleFixture['tokens'];
  services: InternalTestModuleFixture['services'];
  users: InternalTestModuleFixture['users'];
}

export interface TestMicroserviceController {
  app: INestMicroservice;
  getConsumer: (
    data: any
  ) => { ack: jest.Mock; nack: jest.Mock; consume: () => Promise<void> };
  tokens: InternalTestModuleFixture['tokens'];
  services: InternalTestModuleFixture['services'];
}
