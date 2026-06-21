import React from 'react';

export default function ResponsePanel({ title, response, error, loading }) {
  return (
    <div className="card mt-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title || 'Backend Response'}
      </h3>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Waiting for response...
        </div>
      )}

      {error && (
        <pre className="overflow-x-auto rounded-lg bg-red-950/40 p-4 font-mono text-xs text-red-300">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {response && !loading && (
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-300">
          {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
        </pre>
      )}

      {!loading && !error && !response && (
        <p className="text-sm text-slate-500">Trigger a simulation to see the backend response.</p>
      )}
    </div>
  );
}
