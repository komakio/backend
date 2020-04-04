import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { LoginResult } from '../users.controller';

describe('Users controller', () => {
  let app: TestApplicationController['app'];

  const username = `${new Date()}@komak.io`;
  const password = '123456789';
  let accessToken: string;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'users_login'
    );
    app = testController.app;
  });

  afterAll(() => stopTest(app));

  it('login with a new username and password => register a new user (/v1/users/login)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username, password });

    accessToken = (res.body as LoginResult).accessToken.token;

    expect(res.status).toBe(201);
    expect(res.body.hasOwnProperty('user')).toBeTruthy();
    expect(res.body.accessToken.hasOwnProperty('token')).toBeTruthy();
    expect(res.body.accessToken.hasOwnProperty('expiration')).toBeTruthy();
  });

  it('login using invalid password => error 403 (/v1/users/login)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username, password: 'somerandometext' });

    expect(res.status).toBe(403);
  });

  it('get current user using valid access token => success (/v1/users/current)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(res.status).toBe(200);
    expect(res.body.hasOwnProperty('password')).toBeFalsy();
    expect(res.body.username).toBe(username);
  });

  it('get current user using invalid access token => error 403 (/v1/users/current)', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer somerandometext` });

    expect(res.status).toBe(403);
  });
});
