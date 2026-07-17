const express = require('express');
const router = express.Router();
const queryProfiler = require('../services/queryProfiler');
const queryOptimizer = require('../utils/queryOptimizer');
const { sendSuccess } = require('../utils/apiResponse');

router.get('/metrics/queries', (req, res) => {
  const hours = parseInt(req.query.hours) || 1;
  const metrics = queryProfiler.getMetrics(hours);
  return sendSuccess(res, metrics);
});

router.get('/metrics/queries/slow', async (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const minMs = parseInt(req.query.minMs) || 200;
  const slow = await queryOptimizer.getSlowQueries(hours, minMs);
  return sendSuccess(res, slow);
});

router.get('/metrics/queries/summary', async (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const summary = await queryOptimizer.getQuerySummary(hours);
  return sendSuccess(res, summary);
});

router.post('/metrics/queries/clear', (req, res) => {
  queryProfiler.clearMetrics();
  return sendSuccess(res, { cleared: true });
});

module.exports = router;