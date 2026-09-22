import React from 'react';
import { Link2, Globe, FileCode2, Award, Lock } from 'lucide-react';

export default function ThreatBreakdown({ breakdown = {} }) {
  const dimensions = [
    {
      id: 'url_risk',
      label: 'URL Structure & ML',
      value: breakdown.url_risk || 0,
      icon: Link2,
      desc: 'Lexical patterns, entropy, and classifier probability'
    },
    {
      id: 'domain_risk',
      label: 'Domain & WHOIS Risk',
      value: breakdown.domain_risk || 0,
      icon: Globe,
      desc: 'Registration age, NRD status, and DNS health'
    },
    {
      id: 'content_risk',
      label: 'Webpage Forensics',
      value: breakdown.content_risk || 0,
      icon: FileCode2,
      desc: 'Login forms, password inputs, and hidden iframes'
    },
    {
      id: 'reputation_risk',
      label: 'Brand Impersonation',
      value: breakdown.reputation_risk || 0,
      icon: Award,
      desc: 'Typosquatting and deceptive subdomain targeting'
    },
    {
      id: 'visual_risk',
      label: 'Transport & Visual Risk',
      value: breakdown.visual_risk || 0,
      icon: Lock,
      desc: 'SSL/TLS authority chain and layout similarity'
    }
  ];

  const getBarColor = (val) => {
    if (val >= 70) return 'bg-rose-500';
    if (val >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono">
          Multimodal Risk Vectors
        </h3>
        <span className="text-xs text-slate-400 font-mono">5-Factor Fusion</span>
      </div>

      <div className="space-y-3.5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const barColor = getBarColor(dim.value);
          return (
            <div key={dim.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold text-slate-300">{dim.label}</span>
                </div>
                <span className="font-mono font-bold text-slate-100">{dim.value}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${dim.value}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">{dim.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
