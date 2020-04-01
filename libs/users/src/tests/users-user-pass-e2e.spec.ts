import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { dummyUsers } from '@utils/test/users';

describe('User/Pass user', () => {
  let app: TestApplicationController['app'];
  let tokens: TestApplicationController['tokens'];
  // let services: TestApplicationController['services'];
  let accessToken;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'user_pass_user'
    );
    app = testController.app;
    tokens = testController.tokens;
    // services = testController.services;
  });

  afterAll(() => stopTest(app));

  it('/v1/users/login (POST)', async () => {
    const helper = dummyUsers.find(u => u.type === 'helper');

    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username: helper.user.username, password: helper.password });

    expect(res.status).toBe(201);
    // expect(services.apiResolveHttp.getInfo).toHaveReturned();
    // expect(services.apiResolveHttp.getInfo).toHaveBeenCalledTimes(1);
    // expect(res.body.industries).toBeDefined();
    // expect(res.body.industries.length).toBeGreaterThan(0);
    // expect(res.body.industries).toEqual([]);

    // expect(redisRes.body.industries).toEqual(res.body.industries);
  });

  it('/v1/users (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer ${tokens.helper}` });

    expect(res.status).toBe(200);
    // expect(services.apiResolveHttp.getInfo).toHaveReturned();
    // expect(services.apiResolveHttp.getInfo).toHaveBeenCalledTimes(1);
    // expect(res.body.industries).toBeDefined();
    // expect(res.body.industries.length).toBeGreaterThan(0);
    // expect(res.body.industries).toEqual([]);

    // expect(redisRes.body.industries).toEqual(res.body.industries);
  });
});
