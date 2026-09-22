import React, { useState } from 'react';
import { Globe, Lock, FileCode2, Link2, Server, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function DeepForensicsTabs({ domainInfo = {}, dnsRecords = {}, sslInfo = {}, contentForensics = {}, urlFeatures = {} }) {
  const [activeTab, setActiveTab] = useState('dns');

  const tabs = [
    { id: 'dns', label: 'DNS & Host Infrastructure', icon: Globe },
    { id: 'ssl', label: 'SSL/TLS Certificate', icon: Lock },
    { id: 'whois', label: 'WHOIS & Registration', icon: Server },
    { id: 'content', label: 'Webpage Forensics', icon: FileCode2 },
    { id: 'lexical', label: '30+ URL Features', icon: Link2 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-800 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* 1. DNS & Host Infrastructure */}
        {activeTab === 'dns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-2">
                A Records / IP Resolution
              </span>
              <div className="space-y-1.5 font-mono text-xs text-slate-200">
                <p>Primary IP: <span className="text-sky-400">{dnsRecords.ip_address || "Unresolved"}</span></p>
                <p>Hosting ASN: <span className="text-slate-300">{dnsRecords.asn || "Unknown"}</span></p>
                <p>Geolocation: <span className="text-slate-300">{dnsRecords.country || "Unknown"}</span></p>
                <p>DNS Status: <span className={dnsRecords.resolved ? "text-emerald-400" : "text-rose-400"}>{dnsRecords.resolved ? "Active / Resolved" : "Unresolved / Sinkholed"}</span></p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-2">
                Resolved IP Pool
              </span>
              {dnsRecords.a_records && dnsRecords.a_records.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {dnsRecords.a_records.map((ip, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                      {ip}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">No direct A-records resolved.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. SSL/TLS Certificate */}
        {activeTab === 'ssl' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Issuer Authority: <strong className="text-slate-200">{sslInfo.issuer || "None"}</strong></p>
              <p className="text-slate-400">Subject Common Name: <strong className="text-slate-200">{sslInfo.subject || "None"}</strong></p>
              <p className="text-slate-400">Certificate Status: <strong className={sslInfo.is_valid ? "text-emerald-400" : "text-rose-400"}>{sslInfo.is_valid ? "Valid" : "Invalid / Expired"}</strong></p>
              <p className="text-slate-400">Days Until Expiration: <strong className="text-sky-400">{sslInfo.days_until_expiry} days</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Self-Signed: <strong className={sslInfo.is_self_signed ? "text-rose-400" : "text-emerald-400"}>{sslInfo.is_self_signed ? "YES (High Risk)" : "No"}</strong></p>
              <p className="text-slate-400">SSL Risk Rating: <strong className={sslInfo.risk_score > 50 ? "text-rose-400" : "text-emerald-400"}>{sslInfo.risk_score}/100</strong></p>
              {sslInfo.flags && sslInfo.flags.length > 0 && (
                <div className="mt-2 text-rose-300 text-[11px]">
                  {sslInfo.flags.map((f, i) => <p key={i}>⚠️ {f}</p>)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. WHOIS & Registration */}
        {activeTab === 'whois' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Apex Domain: <strong className="text-sky-400">{domainInfo.domain}</strong></p>
              <p className="text-slate-400">Registrar: <strong className="text-slate-200">{domainInfo.registrar}</strong></p>
              <p className="text-slate-400">Organization: <strong className="text-slate-200">{domainInfo.organization}</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Domain Age: <strong className={domainInfo.is_newly_registered ? "text-rose-400" : "text-emerald-400"}>{domainInfo.domain_age_days} Days</strong></p>
              <p className="text-slate-400">Newly Registered Domain (NRD): <strong className={domainInfo.is_newly_registered ? "text-rose-400" : "text-emerald-400"}>{domainInfo.is_newly_registered ? "YES (< 30 days)" : "No"}</strong></p>
              <p className="text-slate-400">Created: <strong className="text-slate-300">{domainInfo.creation_date}</strong></p>
              <p className="text-slate-400">Expires: <strong className="text-slate-300">{domainInfo.expiration_date}</strong></p>
            </div>
          </div>
        )}

        {/* 4. Webpage Forensics */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Page Title: <strong className="text-slate-200">{contentForensics.page_title || "N/A"}</strong></p>
              <p className="text-slate-400">Login Form Detected: <strong className={contentForensics.has_login_form ? "text-rose-400" : "text-emerald-400"}>{contentForensics.has_login_form ? "YES" : "No"}</strong></p>
              <p className="text-slate-400">Password Input Fields: <strong className={contentForensics.has_password_field ? "text-rose-400" : "text-emerald-400"}>{contentForensics.password_field_count}</strong></p>
              <p className="text-slate-400">External Form Action: <strong className={contentForensics.form_action_external ? "text-rose-400" : "text-emerald-400"}>{contentForensics.form_action_external ? "YES (Exfiltration Risk)" : "No"}</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">External Asset Ratio: <strong className="text-slate-200">{Math.round((contentForensics.external_resources_ratio || 0) * 100)}%</strong></p>
              <p className="text-slate-400">Hidden Iframes: <strong className={contentForensics.hidden_iframes_count > 0 ? "text-rose-400" : "text-slate-300"}>{contentForensics.hidden_iframes_count}</strong></p>
              <p className="text-slate-400">Suspicious JavaScript: <strong className={contentForensics.suspicious_js_detected ? "text-rose-400" : "text-emerald-400"}>{contentForensics.suspicious_js_detected ? "YES" : "No"}</strong></p>
              <p className="text-slate-400">Fake CAPTCHA / Trap: <strong className={contentForensics.fake_captcha_detected ? "text-rose-400" : "text-emerald-400"}>{contentForensics.fake_captcha_detected ? "YES" : "No"}</strong></p>
            </div>
          </div>
        )}

        {/* 5. 30+ URL Features */}
        {activeTab === 'lexical' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {Object.entries(urlFeatures).filter(([k]) => !['detected_keywords', 'parsed_path', 'parsed_query'].includes(k)).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block truncate">{key}</span>
                <span className="text-xs font-mono font-bold text-sky-400">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
