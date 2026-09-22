import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldX, Flame } from 'lucide-react';

export default function RiskGauge({ score = 0, threatLevel = "SAFE", classification = "Safe", confidence = 95 }) {
  // Determine color theme based on score
  let strokeColor = "#10b981"; // Emerald
  let textColor = "text-emerald-400";
  let bgGlow = "shadow-emerald-500/20";
  let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let Icon = ShieldCheck;

  if (score >= 70) {
    strokeColor = "#ef4444"; // Red
    textColor = "text-rose-500";
    bgGlow = "shadow-rose-500/30";
    badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    Icon = Flame;
  } else if (score >= 45) {
    strokeColor = "#f59e0b"; // Amber
    textColor = "text-amber-400";
    bgGlow = "shadow-amber-500/20";
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    Icon = AlertTriangle;
  }

  // SVG circular stroke calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
      {/* Background radial highlight */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" 
        style={{ backgroundColor: strokeColor }}
      />

      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#1e293b"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tighter ${textColor}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            / 100 RISK
          </span>
        </div>
      </div>

      {/* Threat Level Badge */}
      <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{classification} — {threatLevel}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Confidence: <strong className="text-slate-200">{confidence}%</strong>
        </span>
      </div>
    </div>
  );
}
