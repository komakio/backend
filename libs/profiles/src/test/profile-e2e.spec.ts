import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';

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
    disabled: true,
    role: 'needer',
    phone: {
      dialCode: 'string',
      number: '64333445',
    },
    coverage: 200,
  };

  it('Post new helper profile (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(newHelperProfile);

    expect(res.body).toEqual(expect.objectContaining(newHelperProfile));
  });

  it('Post new needer profile (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` })
      .send(newNeederProfile);

    expect(res.body).toEqual(expect.objectContaining(newNeederProfile));
  });

  it('Get all profile (/v1/profiles)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/profiles')
      .set({ Authorization: `Bearer ${tokens.helper}` });

    expect(res.body[0]).toEqual(expect.objectContaining(newHelperProfile));
    expect(res.body[1]).toEqual(expect.objectContaining(newNeederProfile));
  });
});
