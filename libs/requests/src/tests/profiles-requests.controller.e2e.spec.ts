import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { ObjectID } from 'mongodb';

describe('Profile Requests controller', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'profile-requests-controller'
    );
    app = testController.app;
    tokens = testController.tokens;
  });

  afterAll(() => stopTest(app));

  it('Get profile requests with wrong profileId => error 403 (/v1/profiles/:id/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/profiles/:id/requests')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(group);
    expect(res.status).toBe(403);
  });
});
