import request from 'supertest';
import { prepareHttpTestController, stopTest } from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { prePopulateProfiles } from '@utils/test/prepopulate';
import { HelpRequestStatusEnum, RequestTypeEnum } from '../requests.model';
import {
  PrePopulatedProfiles,
  TestApplicationController,
} from '@utils/test/model';
import { RequestsMongoService } from '../services/requests-mongo.service';
import { ObjectID } from 'mongodb';

describe('Cancel Requests controller', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];
  let users: TestApplicationController['users'];
  let profiles: PrePopulatedProfiles;
  let requestId: ObjectID;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'cancel-requests-controller'
    );
    app = testController.app;
    tokens = testController.tokens;
    users = testController.users;
    profiles = await prePopulateProfiles({ users, moduleFixture: app });
  });

  afterAll(() => stopTest(app));

  it('Create a request => success (/v1/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ profileId: profiles.needer._id });

    requestId = new ObjectID(res.body._id);
    expect(res.status).toBe(201);
  });

  it('Cancel a request with wrong profileId => error 403 (/v1/requests/:id/cancel)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/requests/${requestId}/cancel`)
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ profileId: profiles.helper._id });

    expect(res.status).toBe(403);
  });

  it('Cancel a request => success (/v1/requests/:id/cancel)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/requests/${requestId}/cancel`)
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ profileId: profiles.needer._id });

    const requestMongoService = app.get(RequestsMongoService);
    const req = await requestMongoService.findOneById(requestId);
    expect(res.status).toBe(201);
    expect(req).toMatchObject({
      status: HelpRequestStatusEnum.Canceled,
      candidates: [],
      requesterShortName: profiles.needer.firstName,
      requesterProfileId: profiles.needer._id,
      type: RequestTypeEnum.Misc,
      location: profiles.needer.address.location,
    });
  });
});
