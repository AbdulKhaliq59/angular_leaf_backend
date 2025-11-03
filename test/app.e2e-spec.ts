import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('version');
      });
  });

  it('/classify/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/classify/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('mlApi');
        expect(res.body).toHaveProperty('timestamp');
      });
  });

  it('/classify/supported-formats (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/classify/supported-formats')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('supportedFormats');
        expect(res.body).toHaveProperty('maxFileSize');
        expect(res.body).toHaveProperty('maxBatchSize');
        expect(Array.isArray(res.body.supportedFormats)).toBe(true);
      });
  });
});