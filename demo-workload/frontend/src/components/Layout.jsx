import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/simulator', label: 'Failure Simulator', icon: '💥' },
  { to: '/metrics', label: 'System Metrics', icon: '📈' },
  { to: '/users', label: 'Users', icon: '👥' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-lg">
              🛡️
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">KubeGuardian</h1>
              <p className="text-xs text-slate-400">Demo Workload</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-brand-700/50 bg-brand-950/50 px-3 py-1 text-xs text-brand-300 sm:inline">
            SRE Training Environment
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <nav className="lg:w-56 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <li key={item.to} className="shrink-0">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `nav-link whitespace-nowrap ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
