import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { dummyUsers } from '@utils/test/users';
import { LoginResult } from '../users.controller';

describe('User/Pass user', () => {
  let app: TestApplicationController['app'];
  // let tokens: TestApplicationController['tokens'];
  // let services: TestApplicationController['services'];
  let accessToken: string;
  const helper = dummyUsers.find(u => u.type === 'helper');
  const needer = dummyUsers.find(u => u.type === 'needer');

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'user_pass_user'
    );
    app = testController.app;
    // tokens = testController.tokens;
    // services = testController.services;
  });

  afterAll(() => stopTest(app));

  it('/v1/users/login succeeded', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username: helper.user.username, password: helper.password });

    accessToken = (res.body as LoginResult).accessToken.token;

    expect(res.status).toBe(201);
    // expect(services.apiResolveHttp.getInfo).toHaveReturned();
    // expect(services.apiResolveHttp.getInfo).toHaveBeenCalledTimes(1);
    // expect(res.body.industries).toBeDefined();
    // expect(res.body.industries.length).toBeGreaterThan(0);
    // expect(res.body.industries).toEqual([]);

    // expect(redisRes.body.industries).toEqual(res.body.industries);
  });

  it('/v1/users (GET) succeeded', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(res.status).toBe(200);
    // expect(services.apiResolveHttp.getInfo).toHaveReturned();
    // expect(services.apiResolveHttp.getInfo).toHaveBeenCalledTimes(1);
    // expect(res.body.industries).toBeDefined();
    // expect(res.body.industries.length).toBeGreaterThan(0);
    // expect(res.body.industries).toEqual([]);

    // expect(redisRes.body.industries).toEqual(res.body.industries);
  });

  it('/v1/users/registration-token succeeded', async () => {
    const res = await request(app.getHttpServer())
      .patch('/v1/users/registration-token')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        uuid: 'fZIfOWUWeGQ',
        registrationToken: 'APA91bGh6bZEj6yRENLOJ9lc1yKLG3anUSksP4KMnmWoSabdpc',
      });
    expect(res.status).toBe(200);
    // expect(services.apiResolveHttp.getInfo).toHaveReturned();
    // expect(services.apiResolveHttp.getInfo).toHaveBeenCalledTimes(1);
    // expect(res.body.industries).toBeDefined();
    // expect(res.body.industries.length).toBeGreaterThan(0);
    // expect(res.body.industries).toEqual([]);

    // expect(redisRes.body.industries).toEqual(res.body.industries);
  });

  it('/v1/users/login unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username: helper.user.username, password: 'somerandometext' });

    expect(res.status).toBe(403);
  });

  it('/v1/users (GET) unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer somerandometext` });

    expect(res.status).toBe(403);
  });

  it('/v1/users/registration-token unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .patch('/v1/users/registration-token')
      .set({ Authorization: `Bearer somerandometext` })
      .send({
        uuid: 'fZIfOWUWeGQ',
        registrationToken: 'APA91bGh6bZEj6yRENLOJ9lc1yKLG3anUSksP4KMnmWoSabdpc',
      });
    expect(res.status).toBe(403);
  });

  it('/v1/users/registration-token bad request', async () => {
    const res = await request(app.getHttpServer())
      .patch('/v1/users/registration-token')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        registrationToken: 'APA91bGh6bZEj6yRENLOJ9lc1yKLG3anUSksP4KMnmWoSabdpc',
      });
    expect(res.status).toBe(400);
  });
});
