import React from 'react';
import { Globe, ShieldAlert, Radio } from 'lucide-react';

export default function ThreatMap({ points = [] }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
            Live Global Threat Activity Stream
          </h3>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
          <Radio className="w-3 h-3 animate-pulse text-rose-500" />
          LIVE RADAR
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {points.map((pt) => {
          const isCritical = pt.risk === 'CRITICAL';
          return (
            <div
              key={pt.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {pt.city}, {pt.country}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">IP: {pt.ip}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isCritical 
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {pt.risk}
                </span>
              </div>
              <div className="text-xs font-semibold text-sky-300 bg-sky-950/30 border border-sky-800/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{pt.threat}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
