import React, { useState } from 'react';
import ResponsePanel from '../components/ResponsePanel';
import { simulateApi } from '../api/client';

const simulations = [
  {
    id: 'oom',
    label: 'Trigger OOM',
    description: 'Allocate memory until process hits limits (OOMKilled)',
    variant: 'danger',
    action: simulateApi.oom,
  },
  {
    id: 'cpu',
    label: 'Trigger CPU Spike',
    description: 'Run intensive calculations for 60 seconds',
    variant: 'danger',
    action: simulateApi.cpu,
  },
  {
    id: 'crash',
    label: 'Trigger Crash',
    description: 'Throw uncaught exception (CrashLoopBackOff)',
    variant: 'danger',
    action: simulateApi.crash,
  },
  {
    id: 'db',
    label: 'Trigger DB Failure',
    description: 'Connect to invalid MongoDB host temporarily',
    variant: 'danger',
    action: simulateApi.dbFailure,
  },
  {
    id: 'slow',
    label: 'Trigger Slow Response',
    description: 'Delay response by 60 seconds',
    variant: 'secondary',
    action: simulateApi.slowResponse,
  },
  {
    id: 'logs',
    label: 'Trigger Log Storm',
    description: 'Write 10,000+ log entries to stdout',
    variant: 'secondary',
    action: simulateApi.logStorm,
  },
  {
    id: 'ready',
    label: 'Trigger Readiness Failure',
    description: 'Toggle readiness probe state',
    variant: 'secondary',
    action: simulateApi.readinessFailure,
  },
  {
    id: 'live',
    label: 'Trigger Liveness Failure',
    description: 'Toggle liveness probe state (pod restart)',
    variant: 'danger',
    action: simulateApi.livenessFailure,
  },
];

export default function FailureSimulator() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSim, setActiveSim] = useState(null);

  const handleSimulate = async (sim) => {
    setLoading(true);
    setActiveSim(sim.id);
    setResponse(null);
    setError(null);

    try {
      const res = await sim.action();
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data || { message: err.message, status: err.response?.status });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Failure Simulator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Trigger realistic failures for KubeGuardian AI to detect, analyze, and remediate
        </p>
      </div>

      <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 text-sm text-amber-200">
        ⚠️ These actions intentionally degrade the workload. Use only in demo/staging environments.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {simulations.map((sim) => (
          <div key={sim.id} className="card flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white">{sim.label}</h3>
              <p className="mt-1 text-sm text-slate-400">{sim.description}</p>
            </div>
            <button
              className={`mt-4 w-full ${sim.variant === 'danger' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => handleSimulate(sim)}
              disabled={loading}
            >
              {loading && activeSim === sim.id ? 'Running...' : sim.label}
            </button>
          </div>
        ))}
      </div>

      <ResponsePanel
        title={`Response${activeSim ? `: ${simulations.find((s) => s.id === activeSim)?.label}` : ''}`}
        response={response}
        error={error}
        loading={loading}
      />
    </div>
  );
}
