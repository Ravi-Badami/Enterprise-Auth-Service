const request = require('supertest');
const mongoose = require('mongoose');
const redisClient = require('../../config/redis'); 
const app = require('../../app');

// Mock dependencies
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
    db: {
      admin: () => ({
        ping: jest.fn().mockResolvedValue(true)
      })
    }
  }
}));

// Mock Redis to return the client implementation directly
jest.mock('../../config/redis', () => ({
  ping: jest.fn().mockResolvedValue('PONG'),
  isOpen: true,
  connect: jest.fn(),
  on: jest.fn()
}));

describe('Health Check API', () => {
  
  describe('GET /health/live', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health/live');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body).toHaveProperty('uptime_seconds');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 OK when services are up', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body.checks.database.status).toEqual('healthy');
      expect(res.body.checks.redis.status).toEqual('healthy');
    });

    it('should return 503 when database is down', async () => {
      // Mock database failure
      mongoose.connection.readyState = 0; // Disconnected
      
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toEqual(503);
      expect(res.body.status).toEqual('unhealthy');
      expect(res.body.checks.database.status).toEqual('unhealthy');
      
      // Reset mock
      mongoose.connection.readyState = 1;
    });

    it('should return 503 when redis is down', async () => {
      // Mock redis failure
      redisClient.ping.mockRejectedValueOnce(new Error('Redis Down'));
      
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toEqual(503);
      expect(res.body.status).toEqual('unhealthy');
      expect(res.body.checks.redis.status).toEqual('unhealthy');
    });
  });
});
