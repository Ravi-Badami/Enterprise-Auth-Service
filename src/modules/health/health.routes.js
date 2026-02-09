const express = require('express');
const healthController = require('./health.controller');

const router = express.Router();

router.get('/live', healthController.getLiveness);
router.get('/ready', healthController.getReadiness);
router.get('/startup', healthController.getStartup);

// Root /health endpoint redirects to readiness
router.get('/', healthController.getReadiness);

module.exports = router;
