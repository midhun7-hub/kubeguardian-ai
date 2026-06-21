const express = require('express');
const mongoose = require('mongoose');
const { isReady, isLive, getProbeState } = require('../state/probeState');
const { getMetrics, getMetricsContentType } = require('../middleware/metrics');

const router = express.Router();

const startTime = Date.now();

router.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    service: 'kubeguardian-demo-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || 'unknown',
    probes: getProbeState(),
  });
});

router.get('/status', (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'running',
    uptime: process.uptime(),
    uptimeMs: Date.now() - startTime,
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    probes: getProbeState(),
    pid: process.pid,
    nodeVersion: process.version,
  });
});

router.get('/ready', (_req, res) => {
  if (isReady() && mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'ready' });
  }

  res.status(503).json({
    status: 'not_ready',
    ready: isReady(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

router.get('/live', (_req, res) => {
  if (isLive()) {
    return res.status(200).json({ status: 'alive' });
  }

  res.status(503).json({ status: 'not_alive' });
});

router.get('/metrics', async (_req, res, next) => {
  try {
    res.set('Content-Type', getMetricsContentType());
    res.end(await getMetrics());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
