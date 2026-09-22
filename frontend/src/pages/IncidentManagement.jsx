import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, CheckCircle2, Shield, RefreshCw, Filter } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function IncidentManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reportType, setReportType] = useState('phishing');
  const [notes, setNotes] = useState('');

  const loadReports = async () => {
    try {
      const resp = await fetch(`${API_BASE}/soc/reports`);
      if (resp.ok) {
        setReports(await resp.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    try {
      await fetch(`${API_BASE}/soc/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: newUrl,
          reporter_name: reporterName || "Anonymous",
          reporter_email: reporterEmail || "",
          report_type: reportType,
          notes: notes
        })
      });
      setShowModal(false);
      setNewUrl('');
      setNotes('');
      loadReports();
    } catch (e) {
      alert("Failed to submit report.");
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await fetch(`${API_BASE}/soc/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadReports();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Confirmed': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Blocked': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Resolved': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Investigating': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            SOC Case Management Workflow
          </div>
          <h1 className="text-3xl font-extrabold text-white">Incident Response & Threat Reporting</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Threat</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
            Active Incident Reports & Workflow State
          </h3>
          <span className="text-xs font-mono text-slate-400">{reports.length} Incidents Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                <th className="p-3">ID</th>
                <th className="p-3">Target URL</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status Lifecycle</th>
                <th className="p-3">Update State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-400 font-bold">#{r.id}</td>
                  <td className="p-3 text-sky-400 max-w-xs truncate">{r.target_url}</td>
                  <td className="p-3 text-slate-300">{r.reporter_name}</td>
                  <td className="p-3 text-slate-300 uppercase">{r.report_type}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-mono">Submit Security Threat Report</h3>
            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Suspicious URL</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="http://malicious-login.xyz"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Reporter Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Report Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="phishing">Phishing Attack</option>
                    <option value="false_positive">False Positive</option>
                    <option value="false_negative">False Negative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Investigation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Received in fake SMS..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
