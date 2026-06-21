import React, { useCallback, useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { healthApi } from '../api/client';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

function parseMetricValue(metricsText, metricName) {
  if (!metricsText) return null;
  const regex = new RegExp(`^${metricName}(?:\\{[^}]*\\})?\\s+(\\S+)`, 'm');
  const match = metricsText.match(regex);
  return match ? parseFloat(match[1]) : null;
}

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [healthRes, statusRes, metricsRes] = await Promise.all([
        healthApi.getHealth(),
        healthApi.getStatus(),
        healthApi.getMetrics(),
      ]);
      setHealth(healthRes.data);
      setStatus(statusRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      setError(err.response?.data || { message: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const requestCount = parseMetricValue(metrics, 'http_requests_total');
  const memoryUsed = status?.memory?.heapUsed;
  const dbConnected = health?.database === 'connected';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Real-time overview of the demo workload for KubeGuardian monitoring
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          Failed to load dashboard data: {error.message || JSON.stringify(error)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Service Status"
          value={loading ? '...' : health?.status === 'ok' ? 'Healthy' : 'Degraded'}
          subtitle={health ? `Uptime: ${Math.floor(health.uptime)}s` : ''}
          icon="✅"
          status={health?.status === 'ok' ? 'success' : 'warning'}
        />
        <StatCard
          title="MongoDB Status"
          value={loading ? '...' : dbConnected ? 'Connected' : 'Disconnected'}
          subtitle={health?.database}
          icon="🍃"
          status={dbConnected ? 'success' : 'danger'}
        />
        <StatCard
          title="Request Count"
          value={requestCount !== null ? requestCount.toLocaleString() : '—'}
          subtitle="Total HTTP requests"
          icon="📡"
          status="neutral"
        />
        <StatCard
          title="Memory Usage"
          value={formatBytes(memoryUsed)}
          subtitle={`RSS: ${formatBytes(status?.memory?.rss)}`}
          icon="💾"
          status="neutral"
        />
        <StatCard
          title="CPU Usage"
          value={
            parseMetricValue(metrics, 'process_cpu_usage_percent') !== null
              ? `${parseMetricValue(metrics, 'process_cpu_usage_percent').toFixed(1)}%`
              : '—'
          }
          subtitle={`Load: ${parseMetricValue(metrics, 'system_cpu_usage_percent')?.toFixed(1) ?? '—'}% system`}
          icon="⚡"
          status="neutral"
        />
        <StatCard
          title="Active Requests"
          value={
            parseMetricValue(metrics, 'http_active_requests') !== null
              ? parseMetricValue(metrics, 'http_active_requests')
              : '0'
          }
          subtitle="In-flight HTTP requests"
          icon="🔄"
          status="neutral"
        />
      </div>

      <div className="card mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Service Details
          </h3>
          <button onClick={fetchData} className="btn-secondary text-xs" disabled={loading}>
            Refresh
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-300">
          {JSON.stringify({ health, status: status ? { ...status, memory: status.memory } : null }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
