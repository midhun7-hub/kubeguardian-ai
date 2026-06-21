const express = require('express');
const mongoose = require('mongoose');
const { toggleReady, toggleLive, getProbeState } = require('../state/probeState');

const router = express.Router();

const memoryHog = [];

router.get('/oom', (_req, res) => {
  res.json({
    success: true,
    message: 'OOM simulation started — allocating memory until process limit is reached',
    warning: 'This will likely crash the pod with OOMKilled',
  });

  setImmediate(() => {
    console.error('[SIMULATE] OOM: starting memory allocation');
    const chunkSize = 10 * 1024 * 1024;

    const allocate = () => {
      try {
        memoryHog.push(Buffer.alloc(chunkSize, 'x'));
        if (memoryHog.length % 10 === 0) {
          console.error(`[SIMULATE] OOM: allocated ${memoryHog.length * 10}MB`);
        }
        setImmediate(allocate);
      } catch (error) {
        console.error('[SIMULATE] OOM: allocation failed', error.message);
      }
    };

    allocate();
  });
});

router.get('/cpu', (_req, res) => {
  res.json({
    success: true,
    message: 'CPU spike simulation started — running intensive calculations for 60 seconds',
  });

  setImmediate(() => {
    console.warn('[SIMULATE] CPU: starting intensive calculation loop');
    const endTime = Date.now() + 60000;

    const burnCpu = () => {
      let result = 0;
      for (let i = 0; i < 5000000; i++) {
        result += Math.sqrt(i) * Math.sin(i);
      }
      if (Date.now() < endTime) {
        setImmediate(burnCpu);
      } else {
        console.warn('[SIMULATE] CPU: spike simulation completed');
      }
      return result;
    };

    burnCpu();
  });
});

router.get('/crash', (_req, res) => {
  res.json({
    success: true,
    message: 'Crash simulation triggered — process will exit with uncaught exception',
    warning: 'Pod will enter CrashLoopBackOff',
  });

  setImmediate(() => {
    console.error('[SIMULATE] CRASH: throwing uncaught exception');
    throw new Error('Simulated crash — intentional uncaught exception for KubeGuardian demo');
  });
});

router.get('/db-failure', async (_req, res) => {
  const originalUri = process.env.MONGODB_URI;

  try {
    console.error('[SIMULATE] DB-FAILURE: attempting connection to invalid MongoDB host');

    await mongoose.disconnect();

    const invalidUri = 'mongodb://invalid-host:27017/kubeguardian';
    await mongoose.connect(invalidUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    res.json({
      success: false,
      message: 'Unexpectedly connected to invalid host',
    });
  } catch (error) {
    console.error('[SIMULATE] DB-FAILURE:', error.message);

    try {
      if (originalUri) {
        await mongoose.connect(originalUri);
        console.log('[SIMULATE] DB-FAILURE: reconnected to original MongoDB');
      }
    } catch (reconnectError) {
      console.error('[SIMULATE] DB-FAILURE: failed to reconnect', reconnectError.message);
    }

    res.status(503).json({
      success: false,
      message: 'Database connection failure simulated',
      error: error.message,
      reconnected: mongoose.connection.readyState === 1,
    });
  }
});

router.get('/slow-response', async (_req, res) => {
  console.warn('[SIMULATE] SLOW-RESPONSE: delaying response by 60 seconds');
  await new Promise((resolve) => setTimeout(resolve, 60000));
  res.json({
    success: true,
    message: 'Slow response completed after 60 second delay',
    delayMs: 60000,
  });
});

router.get('/log-storm', (_req, res) => {
  console.warn('[SIMULATE] LOG-STORM: generating 10000+ log entries');

  for (let i = 0; i < 10000; i++) {
    const level = i % 3 === 0 ? 'error' : i % 2 === 0 ? 'warn' : 'info';
    const message = `[LOG-STORM] entry ${i + 1}/10000 — simulated log flood for observability testing`;

    if (level === 'error') {
      console.error(message, { index: i, timestamp: new Date().toISOString() });
    } else if (level === 'warn') {
      console.warn(message, { index: i, timestamp: new Date().toISOString() });
    } else {
      console.log(message, { index: i, timestamp: new Date().toISOString() });
    }
  }

  res.json({
    success: true,
    message: 'Log storm generated — 10000 log entries written to stdout',
    entries: 10000,
  });
});

router.get('/readiness-failure', (_req, res) => {
  const ready = toggleReady();
  console.warn(`[SIMULATE] READINESS: probe state toggled — ready=${ready}`);

  res.json({
    success: true,
    message: ready
      ? 'Readiness probe restored — pod should become ready'
      : 'Readiness probe failed — pod should be marked unready',
    probes: getProbeState(),
  });
});

router.get('/liveness-failure', (_req, res) => {
  const live = toggleLive();
  console.warn(`[SIMULATE] LIVENESS: probe state toggled — live=${live}`);

  res.json({
    success: true,
    message: live
      ? 'Liveness probe restored — pod should remain running'
      : 'Liveness probe failed — Kubernetes should restart the pod',
    probes: getProbeState(),
  });
});

module.exports = router;
