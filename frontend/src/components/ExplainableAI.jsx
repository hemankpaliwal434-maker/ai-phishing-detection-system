import React from 'react';
import { Bot, AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function ExplainableAI({ aiExplanation, evidence = [], recommendations = [], attackType, brand }) {
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: AlertOctagon
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          icon: AlertTriangle
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Info
        };
      default:
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Autonomous AI SOC Analyst Reasoning Box */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-xl shadow-indigo-950/20">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 font-mono">
                  Autonomous AI SOC Analyst Findings
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Explainable AI (XAI)
                </span>
              </div>
              {brand && brand !== 'None' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  Target: {brand}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {aiExplanation || "Evaluating security telemetry and forensic indicators..."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Detected Forensic Evidence Cards */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          Corroborating Technical Evidence ({evidence.length} Indicators)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evidence.map((item, idx) => {
            const badge = getSeverityBadge(item.severity);
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {item.title}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.bg}`}>
                    <Icon className="w-3 h-3" />
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  {item.description}
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Category: <span className="text-slate-400">{item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Actionable Security Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recommended Response Actions
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
