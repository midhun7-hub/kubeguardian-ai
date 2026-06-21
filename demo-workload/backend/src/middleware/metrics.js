const client = require('prom-client');
const os = require('os');

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30, 60],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
  registers: [register],
});

const processMemoryBytes = new client.Gauge({
  name: 'process_memory_bytes',
  help: 'Process memory usage in bytes',
  labelNames: ['type'],
  registers: [register],
});

const processCpuUsage = new client.Gauge({
  name: 'process_cpu_usage_percent',
  help: 'Process CPU usage percentage',
  registers: [register],
});

const systemMemoryBytes = new client.Gauge({
  name: 'system_memory_bytes',
  help: 'System memory usage in bytes',
  labelNames: ['type'],
  registers: [register],
});

const systemCpuUsage = new client.Gauge({
  name: 'system_cpu_usage_percent',
  help: 'System CPU usage percentage',
  registers: [register],
});

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

function updateResourceMetrics() {
  const mem = process.memoryUsage();
  processMemoryBytes.set({ type: 'rss' }, mem.rss);
  processMemoryBytes.set({ type: 'heapTotal' }, mem.heapTotal);
  processMemoryBytes.set({ type: 'heapUsed' }, mem.heapUsed);
  processMemoryBytes.set({ type: 'external' }, mem.external);

  const now = Date.now();
  const currentCpu = process.cpuUsage();
  const elapsedMs = now - lastCpuTime;

  if (elapsedMs > 0) {
    const userDiff = currentCpu.user - lastCpuUsage.user;
    const systemDiff = currentCpu.system - lastCpuUsage.system;
    const totalMicroseconds = userDiff + systemDiff;
    const cpuPercent = (totalMicroseconds / 1000 / elapsedMs) * 100;
    processCpuUsage.set(Math.min(cpuPercent, 100 * os.cpus().length));
  }

  lastCpuUsage = currentCpu;
  lastCpuTime = now;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  systemMemoryBytes.set({ type: 'total' }, totalMem);
  systemMemoryBytes.set({ type: 'free' }, freeMem);
  systemMemoryBytes.set({ type: 'used' }, totalMem - freeMem);

  const loadAvg = os.loadavg()[0];
  const cpuCount = os.cpus().length;
  systemCpuUsage.set(Math.min((loadAvg / cpuCount) * 100, 100));
}

setInterval(updateResourceMetrics, 5000);
updateResourceMetrics();

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  activeRequests.inc();
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    activeRequests.dec();
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });

  next();
}

async function getMetrics() {
  updateResourceMetrics();
  return register.metrics();
}

function getMetricsContentType() {
  return register.contentType;
}

module.exports = {
  register,
  metricsMiddleware,
  getMetrics,
  getMetricsContentType,
  httpRequestTotal,
  activeRequests,
  processMemoryBytes,
  processCpuUsage,
};
