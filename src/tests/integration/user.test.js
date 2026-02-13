require('./setup');
// Mock strictLimiter
jest.mock('../../middlewares/strictLimiter.middleware', () => ({
  strictLimiter: (req, res, next) => next(),
  forgotPasswordLimiter: (req, res, next) => next(),
  resetPasswordLimiter: (req, res, next) => next(),
}));

jest.mock('../../modules/email/email.service', () => jest.fn().mockResolvedValue(true));

const request = require('supertest');
const app = require('../../app');
const User = require('../../modules/user/user.model');

describe('User Integration Tests', () => {
  let userId;
  let token;

  beforeEach(async () => {
    // 1. Register
    await request(app).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'admin',
    });

    // 1b. Manually verify email
    await User.findOneAndUpdate({ email: 'user@example.com' }, { isEmailVerified: true });

    // 2. Login to get token

    // 2. Login to get token
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });

    token = loginRes.body.accessToken;
    userId = loginRes.body.user.id;
  });

  describe('GET /api/v1/users', () => {
    test('should return list of users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].email).toBe('user@example.com');
    });

    test('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users?limit=1&page=1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.limit).toBe(1);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    test('should return user by id', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(userId);
    });

    test('should return 400 for invalid id format', async () => {
      // Assuming validation middleware checks param format
      const res = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    test('should delete user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);

      const check = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(check.statusCode).toBe(404);
    });
  });
});
