import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { GroupsMongoService } from '@backend/groups/services/groups-mongo.service';
import { ObjectID } from 'mongodb';

describe('Profile controller', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'profiles'
    );
    app = testController.app;
    tokens = testController.tokens;
  });

  afterAll(() => stopTest(app));

  const newHelperProfile = {
    self: true,
    firstName: 'testName',
    lastName: 'testLastname',
    address: {
      raw: 'Vendersgade 28, 2,1363, Copenhagen',
      extra: 'string',
      postalCode: '1363',
      city: 'copenhagen',
      country: 'denmark',
      location: {
        type: 'Point',
        coordinates: [3.234564, -52.123425],
      },
    },
    disabled: false,
    role: 'helper',
    phone: {
      dialCode: 'string',
      number: '64333445',
    },
    coverage: 200,
  };

  const newNeederProfile = {
    self: true,
    firstName: 'testName',
    lastName: 'testLastname',
    address: {
      raw: 'Vendersgade 28, 2,1363, Copenhagen',
      extra: 'string',
      postalCode: '1363',
      city: 'copenhagen',
      country: 'denmark',
      location: {
        type: 'Point',
        coordinates: [3.234564, -52.123425],
      },
    },
    disabled: false,
    role: 'needer',
    phone: {
      dialCode: 'string',
      number: '64333445',
    },
    coverage: 200,
  };

  let neederProfileId: string;

  it('Create new helper profile => success (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(newHelperProfile);
    expect(res.body).toEqual(expect.objectContaining(newHelperProfile));
  });

  it('Create new helper profile without coordinates => error 400 (/v1/profiles)', async () => {
    const body = JSON.parse(JSON.stringify(newHelperProfile));
    delete body.address.location.coordinates;

    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(body);
    expect(res.status).toBe(400);
  });

  it('Create new helper profile without location => error 400 (/v1/profiles)', async () => {
    const body = JSON.parse(JSON.stringify(newHelperProfile));
    delete body.address.location;

    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(body);
    expect(res.status).toBe(400);
  });

  it('Create new helper profile with negative coverage => error 400 (/v1/profiles)', async () => {
    const body = JSON.parse(JSON.stringify(newHelperProfile));
    body.coverage = -100;

    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(body);
    expect(res.status).toBe(400);
  });

  it('Create new needer profile => success (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send(newNeederProfile);

    neederProfileId = res.body._id;
    expect(res.body).toEqual(expect.objectContaining(newNeederProfile));
  });

  it('Get all helper profiles => success (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` });

    expect(res.body[0]).toEqual(expect.objectContaining(newHelperProfile));
  });

  it('Get all needer profiles => success (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.needer}` });

    expect(res.body[0]).toEqual(expect.objectContaining(newNeederProfile));
  });

  it('Change profile from needer to helper => success (/v1/profiles/{id})', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/profiles/${neederProfileId}`)
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ ...newNeederProfile, role: 'helper' });

    expect(res.status).toBe(200);
  });

  it('Add a profile to a group => success (/v1/profiles/{id}/group)', async () => {
    const secret = 'lorempipsum';
    await app.get(GroupsMongoService).createOne({
      name: 'komak',
      url: 'komak.io',
      secret,
      managersUserIds: [new ObjectID()],
    });
    const res = await request(app.getHttpServer())
      .patch(`/v1/profiles/${neederProfileId}/group`)
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ secret });

    expect(res.status).toBe(200);
  });

  it('Add a profile to a group with wrong secret => error 403 (/v1/profiles/{id}/group)', async () => {
    const secret = 'lorempipsum';
    await app.get(GroupsMongoService).createOne({
      name: 'komak',
      url: 'komak.io',
      secret,
      managersUserIds: [new ObjectID()],
    });
    const res = await request(app.getHttpServer())
      .patch(`/v1/profiles/${neederProfileId}/group`)
      .set({ Authorization: `Bearer ${tokens.needer}` })
      .send({ secret: 'wrongsecret' });

    expect(res.status).toBe(403);
  });

  it('Add a profile to a group without secret => error 400 (/v1/profiles/{id}/group)', async () => {
    const secret = 'lorempipsum';
    await app.get(GroupsMongoService).createOne({
      name: 'komak',
      url: 'komak.io',
      secret,
      managersUserIds: [new ObjectID()],
    });
    const res = await request(app.getHttpServer())
      .patch(`/v1/profiles/${neederProfileId}/group`)
      .set({ Authorization: `Bearer ${tokens.needer}` });

    expect(res.status).toBe(400);
  });
});
