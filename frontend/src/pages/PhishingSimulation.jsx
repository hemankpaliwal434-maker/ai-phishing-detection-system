import React, { useState, useEffect } from 'react';
import { Send, Plus, Users, CheckCircle2, Flame, BarChart3 } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function PhishingSimulation() {
  const [simulations, setSimulations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetGroup, setTargetGroup] = useState('Finance & Accounting');
  const [subject, setSubject] = useState('Urgent: Outstanding Tax Audit Notice 2026');
  const [body, setBody] = useState('Please review the attached corporate tax compliance document immediately.');
  const [difficulty, setDifficulty] = useState('Medium');

  const loadSimulations = async () => {
    try {
      const resp = await fetch(`${API_BASE}/awareness/simulations`);
      if (resp.ok) setSimulations(await resp.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await fetch(`${API_BASE}/awareness/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target_group: targetGroup,
          template_subject: subject,
          template_body: body,
          difficulty
        })
      });
      setShowModal(false);
      setName('');
      loadSimulations();
    } catch (e) {
      alert("Failed to launch simulation.");
    }
  };

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Send className="w-3.5 h-3.5" />
            Simulated Social Engineering Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white">Phishing Simulation Training Platform</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Simulation</span>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
            Enterprise Training Campaigns & Telemetry
          </h3>
          <span className="text-xs font-mono text-slate-400">{simulations.length} Campaigns Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                <th className="p-3">Campaign Name</th>
                <th className="p-3">Target Group</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Sent</th>
                <th className="p-3">Clicked (Failed)</th>
                <th className="p-3">Reported (Passed)</th>
                <th className="p-3">Click Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {simulations.map((sim) => {
                const clickRate = Math.round((sim.clicked_count / Math.max(1, sim.total_sent)) * 100);
                return (
                  <tr key={sim.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-200">{sim.name}</td>
                    <td className="p-3 text-slate-300">{sim.target_group}</td>
                    <td className="p-3 text-sky-400 truncate max-w-xs">{sim.template_subject}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {sim.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{sim.total_sent}</td>
                    <td className="p-3 text-rose-400 font-bold">{sim.clicked_count}</td>
                    <td className="p-3 text-emerald-400 font-bold">{sim.reported_count}</td>
                    <td className="p-3 text-amber-400 font-bold">{clickRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-mono">Create Simulation Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Q4 Executive Benefits Audit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Target Department</label>
                  <input
                    type="text"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard (AiTM Mock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Simulated Email Body</label>
                <textarea
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer"
                >
                  Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
