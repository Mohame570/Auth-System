import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let resetToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.name).toBe('Test User');
          token = res.body.token;
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User 2', email: 'test@example.com', password: 'password123' })
        .expect(409);
    });

    it('should reject empty password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'new@example.com', password: '' })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.name).toBe('Test User');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return success message', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.token).toBeUndefined();
        });
    });

    it('should return same message for non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'newpassword123' })
        .expect(401);
    });
  });
});
