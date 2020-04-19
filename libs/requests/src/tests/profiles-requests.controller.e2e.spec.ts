import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { prePopulateProfiles } from '@utils/test/prepopulate';
import { RequestsModule } from '../requests.module';
import { RequestsService } from '../requests.service';

describe('Profile Requests controller', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];
  let users: TestApplicationController['users'];

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'profile-requests-controller'
    );
    app = testController.app;
    tokens = testController.tokens;
    users = testController.users;
    await prePopulateProfiles({ users, moduleFixture: app });
  });

  afterAll(() => stopTest(app));

  // user profile mismatch
  it('Get profile requests with wrong profileId => error 403 (/v1/profiles/:id/requests)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/profiles/000f000f000f/requests')
      .set({ Authorization: `Bearer ${tokens.needer}` });
    expect(res.status).toBe(403);
  });

  // add a profile for a needer or helper
  it('Get profile requests with wrong profileId => error 403 (/v1/profiles/:id/requests)', async () => {
    const requestsModule = app.select(RequestsModule);
    const requestsService = requestsModule.get(
      RequestsService
    ) as RequestsService;
    requestsService.createOne();
    const res = await request(app.getHttpServer())
      .get('/v1/profiles/000f000f000f/requests')
      .set({ Authorization: `Bearer ${tokens.helper}` });
    expect(res.status).toBe(403);
  });

  // wrong order of requests
  // add a profile for a needer
  //must add some requests to the profile

  // profileId should be searched in candidates, acceptor and requester Ids
});
