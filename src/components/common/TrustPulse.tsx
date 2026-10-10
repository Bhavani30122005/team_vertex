import React from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle2, Cpu, Server } from 'lucide-react';
import { mockTrustPulse } from '../../data/mockData';

export const TrustPulse: React.FC = () => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Shield className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 tracking-wide">VERITY Trust Pulse™</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-100 text-blue-700 border border-blue-200 rounded">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Institution-wide verification pulse & real-time telemetry summary
            </p>
          </div>
        </div>

        {/* Microservice Health Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">Face Engine:</span>
            <span className="text-emerald-700 font-semibold font-mono">99.8%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">Geofence Node:</span>
            <span className="text-emerald-700 font-semibold font-mono">Active</span>
          </div>
        </div>
      </div>

      {/* Pulse Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-slate-500 flex items-center justify-between font-medium">
            Check-Ins Today
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
              {mockTrustPulse.totalCheckInsToday.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">across {mockTrustPulse.completedSessionsToday} sessions</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-slate-500 flex items-center justify-between font-medium">
            Verification Success Rate
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-emerald-700">
              {mockTrustPulse.overallSuccessRate}%
            </span>
            <span className="text-[11px] text-emerald-700 font-mono font-medium">+0.3% vs avg</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-slate-500 flex items-center justify-between font-medium">
            Avg Verification Latency
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-blue-700">
              {mockTrustPulse.averageVerificationTimeSec}s
            </span>
            <span className="text-[11px] text-slate-500">6 verification layers</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-slate-500 flex items-center justify-between font-medium">
            Unresolved Risk Alerts
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-amber-700">
              {mockTrustPulse.unresolvedRiskAlerts}
            </span>
            <span className="text-[11px] text-amber-700 font-mono font-medium">Requires Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
