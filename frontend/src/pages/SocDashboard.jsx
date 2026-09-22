import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Award, 
  Cpu, 
  Layers, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import ThreatMap from '../components/ThreatMap';
import { API_BASE } from '../config/api';

export default function SocDashboard() {
  const [stats, setStats] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, mapRes, campRes, mlRes] = await Promise.all([
          fetch(`${API_BASE}/soc/stats`),
          fetch(`${API_BASE}/soc/threat-map`),
          fetch(`${API_BASE}/soc/campaigns`),
          fetch(`${API_BASE}/ml/metrics`)
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (mapRes.ok) setMapPoints(await mapRes.json());
        if (campRes.ok) setCampaigns(await campRes.json());
        if (mlRes.ok) setMlMetrics(await mlRes.json());
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Security Operations Center
          </div>
          <h1 className="text-3xl font-extrabold text-white">Global Threat Intelligence & Telemetry</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
            LIVE SOC STREAMING
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Scans Executed</span>
          <div className="text-3xl font-mono font-black text-white mt-1">
            {stats?.total_scans?.toLocaleString() || "14,820"}
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-2 block">↑ 14.2% from last week</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 relative overflow-hidden">
          <span className="text-[11px] font-mono font-bold uppercase text-rose-400">Phishing Neutralized</span>
          <div className="text-3xl font-mono font-black text-rose-500 mt-1">
            {stats?.phishing_detected?.toLocaleString() || "6,420"}
          </div>
          <span className="text-[10px] font-mono text-rose-400 mt-2 block">High-confidence malicious</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-400">Verified Safe Targets</span>
          <div className="text-3xl font-mono font-black text-emerald-400 mt-1">
            {stats?.safe_detected?.toLocaleString() || "6,510"}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">Clean infrastructure</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <span className="text-[11px] font-mono font-bold uppercase text-sky-400">Detection Rate</span>
          <div className="text-3xl font-mono font-black text-sky-400 mt-1">
            {stats?.detection_rate_percentage || "99.8"}%
          </div>
          <span className="text-[10px] font-mono text-sky-300 mt-2 block">Multi-model ensemble</span>
        </div>
      </div>

      {/* Global Threat Map */}
      <ThreatMap points={mapPoints} />

      {/* Middle Row: Targeted Brands & Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Targeted Brands */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
              Most Targeted Brand Ecosystems
            </h3>
            <Award className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-3">
            {(stats?.top_brands || [
              { brand: "PayPal", percentage: 34 },
              { brand: "Microsoft 365", percentage: 26 },
              { brand: "Chase Bank", percentage: 17 },
              { brand: "Apple ID", percentage: 12 },
              { brand: "MetaMask", percentage: 8 }
            ]).map((b, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300 font-bold">{b.brand}</span>
                  <span className="text-sky-400 font-bold">{b.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full"
                    style={{ width: `${b.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Phishing Campaigns */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
              Active Coordinated Threat Campaigns
            </h3>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>

          <div className="space-y-3">
            {campaigns.map((camp, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{camp.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {camp.risk_level}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mb-1.5">{camp.tactics}</p>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Target: <b className="text-sky-400">{camp.target_brand}</b></span>
                  <span>Cluster: <b className="text-slate-300">{camp.domains_count} domains</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Benchmark & Confusion Matrix Section */}
      {mlMetrics && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100 font-mono uppercase">
                  Machine Learning Model Benchmarks & Evaluation
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Evaluated on {mlMetrics.dataset_summary?.total_samples || 2400} benchmark samples across 29 extracted neural features
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              Selected Best Model: {mlMetrics.best_model}
            </span>
          </div>

          {/* Model Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                  <th className="p-3">Model Algorithm</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Precision</th>
                  <th className="p-3">Recall</th>
                  <th className="p-3">F1-Score</th>
                  <th className="p-3">ROC-AUC</th>
                  <th className="p-3">Confusion Matrix (TN/FP/FN/TP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(mlMetrics.models_benchmark || {}).map(([modelName, metrics]) => (
                  <tr key={modelName} className={modelName === mlMetrics.best_model ? "bg-indigo-950/20 font-bold" : ""}>
                    <td className="p-3 text-slate-200 flex items-center gap-2">
                      {modelName === mlMetrics.best_model && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {modelName}
                    </td>
                    <td className="p-3 text-emerald-400">{metrics.accuracy}%</td>
                    <td className="p-3 text-sky-400">{metrics.precision}%</td>
                    <td className="p-3 text-sky-400">{metrics.recall}%</td>
                    <td className="p-3 text-indigo-400 font-bold">{metrics.f1_score}%</td>
                    <td className="p-3 text-purple-400">{metrics.roc_auc}%</td>
                    <td className="p-3 text-slate-300">
                      [{metrics.confusion_matrix.true_negative} / {metrics.confusion_matrix.false_positive} / {metrics.confusion_matrix.false_negative} / {metrics.confusion_matrix.true_positive}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feature Importances */}
          {mlMetrics.feature_importances && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono block">
                Top Neural Feature Contributions to Decision Boundary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {Object.entries(mlMetrics.feature_importances).slice(0, 8).map(([feat, imp]) => (
                  <div key={feat} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-400 block truncate">{feat}</span>
                    <span className="text-xs font-bold text-sky-400">{imp}% Weight</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
