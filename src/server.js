const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();
const logger = require('./config/logger');
const mongoose = require('mongoose');
const redisClient = require('./config/redis');

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Capture the server instance
  logger.info(`listening to ${PORT}`);
});

// Graceful Shutdown Logic
const gracefulShutdown = async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  // 1. Stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // 2. Close Database Connections
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed');

      if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }

      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  });
};
// Listen for PM2 signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
