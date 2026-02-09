const mongoose = require('mongoose');
const redisClient = require('../../config/redis');
const logger = require('../../utils/logger');

// Configuration for timeouts
const CHECK_TIMEOUT_MS = 5000;

class HealthService {
  /**
   * Check MongoDB connection status
   * @returns {Promise<Object>}
   */
  async checkDatabase() {
    const startTime = Date.now();
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database check timed out')), CHECK_TIMEOUT_MS)
      );

      // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      const dbCheckPromise = new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
          // Perform a lightweight admin ping for true readiness
          mongoose.connection.db
            .admin()
            .ping()
            .then(() => resolve(true))
            .catch((err) => reject(err));
        } else {
          reject(new Error(`Database not connected. State: ${mongoose.connection.readyState}`));
        }
      });

      await Promise.race([dbCheckPromise, timeoutPromise]);

      return {
        status: 'healthy',
        latency_ms: Date.now() - startTime,
        error: null,
      };
    } catch (error) {
      logger.error('Health check failed: Database', { error: error.message });
      return {
        status: 'unhealthy',
        latency_ms: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Check Redis connection status
   * @returns {Promise<Object>}
   */
  async checkRedis() {
    const startTime = Date.now();
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis check timed out')), CHECK_TIMEOUT_MS)
      );

      const redisCheckPromise = redisClient.ping();

      await Promise.race([redisCheckPromise, timeoutPromise]);

      return {
        status: 'healthy',
        latency_ms: Date.now() - startTime,
        error: null,
      };
    } catch (error) {
      logger.error('Health check failed: Redis', { error: error.message });
      return {
        status: 'unhealthy',
        latency_ms: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Get system info
   */
  getSystemInfo() {
    return {
      version: process.env.npm_package_version || '1.0.0',
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString(),
      service: process.env.npm_package_name || 'identity-service',
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
    };
  }
}

module.exports = new HealthService();
