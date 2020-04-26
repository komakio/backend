import request from 'supertest';
import { prepareHttpTestController, stopTest } from '@utils/test/test';
import { AppModule } from '@apps/api/src/app.module';
import { ObjectID } from 'mongodb';
import { TestApplicationController } from '@utils/test/model';

describe('Groups controller', () => {
  let app: TestApplicationController['app'];
  let users: TestApplicationController['users'];

  const group = {
    name: 'komak',
    url: 'komak.io',
    secret: 'lorempusem',
    managersUserIds: [new ObjectID()],
  };

  beforeAll(async () => {
    const testController = await prepareHttpTestController(
      AppModule,
      'groups-controller'
    );
    app = testController.app;
    users = testController.users;
  });

  afterAll(() => stopTest(app));

  it('Create new group with regular Auth => error 403 (/v1/groups)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/groups')
      .set({ Authorization: `Bearer ${users.helper.token}` })
      .send(group);
    expect(res.status).toBe(403);
  });

  it('Create new group without secret => error 400 (/v1/groups)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/groups')
      .set({ Authorization: `Bearer lorem` })
      .send({
        name: 'komak',
        url: 'komak.io',
        managersUserIds: [new ObjectID()],
      });
    expect(res.status).toBe(400);
  });

  it('Create new group without managerIds => error 400 (/v1/groups)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/groups')
      .set({ Authorization: `Bearer lorem` })
      .send({
        name: 'komak',
        url: 'komak.io',
        secret: 'lorempusem',
      });
    expect(res.status).toBe(400);
  });

  it('Create new group with regular Auth => success (/v1/groups)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/groups')
      .set({ Authorization: `Bearer lorem` })
      .send(group);
    expect(res.status).toBe(201);
    expect(res.body.secret).toBeUndefined();
    expect(res.body.managersUserIds).toBeUndefined();
  });
});
