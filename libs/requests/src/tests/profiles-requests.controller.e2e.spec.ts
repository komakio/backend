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
import {
  HelpRequestStatusEnum,
  HelpRequest,
  RequestTypeEnum,
} from '../requests.model';
import { PrePopulatedProfiles } from '@utils/test/model';

describe('Profile Requests controller', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];
  let users: TestApplicationController['users'];
  let profiles: PrePopulatedProfiles;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'profile-requests-controller'
    );
    app = testController.app;
    tokens = testController.tokens;
    users = testController.users;
    profiles = await prePopulateProfiles({ users, moduleFixture: app });
  });

  afterAll(() => stopTest(app));

  it('Create a request without authorization => error 403 (/v1/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .send({ profileId: profiles.needer._id });
    expect(res.status).toBe(403);
  });

  // user profile mismatch
  it('Create a request with wrong profileId => error 403 (/v1/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ profileId: profiles.helper._id });
    expect(res.status).toBe(403);
  });

  it('Create a request without profileId => error 400 (/v1/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .set({ Authorization: `Bearer ${tokens.needer}` });
    expect(res.status).toBe(400);
  });

  it('Create a request => success (/v1/requests)', async () => {
    // const expectedRes: Partial<HelpRequest> = {
    //   status: HelpRequestStatusEnum.Pending,
    //   candidates: [{ distance: 0, profileId: profiles.helper._id }],
    //   requesterShortName: profiles.needer.firstName,
    //   requesterProfileId: profiles.needer._id,
    //   type: RequestTypeEnum.Misc,
    //   location: profiles.needer.address.location,
    //   acceptorShortName: undefined,
    //   acceptorProfileId: undefined,
    //   acceptorDistance: undefined,
    //   acceptorGroupName: undefined,
    //   acceptorGroupUrl: undefined,
    //   comment: undefined,
    // };
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ profileId: profiles.needer._id });
    expect(res.status).toBe(200);
    // expect(res.body).toMatchObject(expectedRes);
  });

  // user profile mismatch
  // it('Get profile requests with wrong profileId => error 403 (/v1/profiles/:id/requests)', async () => {
  //   const res = await requesst(app.getHttpServer())
  //     .get('/v1/profiles/000f000f000f/requests')
  //     .set({ Authorization: `Bearer ${tokens.needer}` });
  //   expect(res.status).toBe(403);
  // });

  // add a profile for a needer or helper
  // wrong order of requests
  // add a profile for a needer
  //must add some requests to the profile

  // profileId should be searched in candidates, acceptor and requester Ids
});
