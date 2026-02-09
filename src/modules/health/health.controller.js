const healthService = require('./health.service');
const catchAsync = require('../../utils/asyncHandler');

class HealthController {
  /**
   * Liveness Probe
   * Simply returns 200 OK if the process is running
   */
  getLiveness = (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime_seconds: process.uptime(),
    });
  };

  /**
   * Readiness Probe
   * Checks critical dependencies (DB, Cache)
   */
  getReadiness = catchAsync(async (req, res) => {
    // Run checks in parallel
    const [dbResult, redisResult] = await Promise.all([
      healthService.checkDatabase(),
      healthService.checkRedis(),
    ]);

    // Get system info
    const systemInfo = healthService.getSystemInfo();

    const readinessData = {
      status: 'healthy', // Default to healthy
      ...systemInfo,
      checks: {
        database: dbResult,
        redis: redisResult,
      },
    };

    // Determine overall status
    // If any critical service is unhealthy, the whole service is not ready
    if (dbResult.status !== 'healthy' || redisResult.status !== 'healthy') {
      readinessData.status = 'unhealthy';
      // 503 Service Unavailable is appropriate for Readiness probes that fail
      return res.status(503).json(readinessData);
    }

    res.status(200).json(readinessData);
  });

  /**
   * Startup Probe
   * Can be used to check if initialization logic is complete
   * For now, it aliases to readiness
   */
  getStartup = (req, res) => {
    return this.getReadiness(req, res);
  };
}

module.exports = new HealthController();
