import request from 'supertest';
import { prepareHttpTestController, stopTest } from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { prePopulateMirrorProfiles } from '@utils/test/prepopulate';
import { HelpRequestStatusEnum, RequestTypeEnum } from '../requests.model';
import {
  PrePopulatedProfiles,
  TestApplicationController,
} from '@utils/test/model';
import { RequestsMongoService } from '../services/requests-mongo.service';
import { ObjectID } from 'mongodb';

describe('Refuse Requests controller', () => {
  let app: TestApplicationController['app'];
  let users: TestApplicationController['users'];
  let profiles: PrePopulatedProfiles;
  let requestId: ObjectID;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'refuse-requests-controller'
    );
    app = testController.app;
    users = testController.users;
    profiles = await prePopulateMirrorProfiles({
      users: { helper: users.helper.user, needer: users.needer.user },
      moduleFixture: app,
    });
  });

  afterAll(() => stopTest(app));

  it('Create a request => success (/v1/requests)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/requests')
      .set({ Authorization: `Bearer ${users.needer.token}` })
      .send({ profileId: profiles.needer._id });

    requestId = new ObjectID(res.body._id);
    expect(res.status).toBe(201);
  });

  it('Refuse a request with wrong profileId => error 403 (/v1/requests/:id/refuse)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/requests/${requestId}/refuse`)
      .set({ Authorization: `Bearer ${users.helper.token}` })
      .send({ profileId: profiles.needer._id });

    expect(res.status).toBe(403);
  });

  it('Accept a request => success (/v1/requests/:id/refuse)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/requests/${requestId}/refuse`)
      .set({ Authorization: `Bearer ${users.helper.token}` })
      .send({ profileId: profiles.helper._id });

    const requestMongoService = app.get(RequestsMongoService);
    const req = await requestMongoService.findOneById(requestId);
    expect(res.status).toBe(201);
    expect(req).toMatchObject({
      status: HelpRequestStatusEnum.Pending,
      candidates: [],
      requesterShortName: profiles.needer.firstName,
      requesterProfileId: profiles.needer._id,
      type: RequestTypeEnum.Misc,
      location: profiles.needer.address.location,
    });
  });
});
