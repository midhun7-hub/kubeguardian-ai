import React, { useCallback, useEffect, useState } from 'react';
import { healthApi } from '../api/client';

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const [metricsRes, statusRes] = await Promise.all([
        healthApi.getMetrics(),
        healthApi.getStatus(),
      ]);
      setMetrics(metricsRes.data);
      setStatus(statusRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  const metricLines = metrics
    ? metrics.split('\n').filter((line) => line && !line.startsWith('#'))
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">System Metrics</h2>
          <p className="mt-1 text-sm text-slate-400">
            Prometheus-compatible metrics from <code className="text-brand-300">/metrics</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-600"
            />
            Auto-refresh (5s)
          </label>
          <button onClick={fetchMetrics} className="btn-secondary" disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase text-slate-500">Heap Used</p>
            <p className="mt-1 text-xl font-bold">{(status.memory.heapUsed / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase text-slate-500">Uptime</p>
            <p className="mt-1 text-xl font-bold">{Math.floor(status.uptime)}s</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase text-slate-500">PID</p>
            <p className="mt-1 text-xl font-bold">{status.pid}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Raw Prometheus Output ({metricLines.length} series)
        </h3>
        <pre className="max-h-[600px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">
          {loading && !metrics ? 'Loading metrics...' : metrics || 'No metrics available'}
        </pre>
      </div>
    </div>
  );
}
