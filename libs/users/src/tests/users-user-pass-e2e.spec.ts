import request from 'supertest';
import {
  TestApplicationController,
  prepareHttpTestController,
  stopTest,
} from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { LoginResult } from '../users.controller';

describe('User/Pass user', () => {
  let app: TestApplicationController['app'];

  const username = `${new Date()}@komak.io`;
  const password = '123456789';
  let accessToken: string;

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'user_pass_user'
    );
    app = testController.app;
  });

  afterAll(() => stopTest(app));

  it('/v1/users/login succeeded', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username, password });

    accessToken = (res.body as LoginResult).accessToken.token;

    expect(res.status).toBe(201);
    expect(res.body.hasOwnProperty('user')).toBeTruthy();
    expect(res.body.accessToken.hasOwnProperty('token')).toBeTruthy();
    expect(res.body.accessToken.hasOwnProperty('expiration')).toBeTruthy();
  });

  it('/v1/users/current succeeded', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/current')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(res.status).toBe(200);
    expect(res.body.hasOwnProperty('password')).toBeFalsy();
    expect(res.body.username).toBe(username);
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
  });

  it('/v1/users/login unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({ username, password: 'somerandometext' });

    expect(res.status).toBe(403);
  });

  it('/v1/users/current unauthorized', async () => {
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

  it('/v1/users/registration-token bad request', async () => {
    const res = await request(app.getHttpServer())
      .patch('/v1/users/registration-token')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        uuid: 'fZIfOWUWeGQ',
      });
    expect(res.status).toBe(400);
  });
});
