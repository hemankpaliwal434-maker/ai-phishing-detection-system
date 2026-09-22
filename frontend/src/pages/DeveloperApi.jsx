import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, ExternalLink, Play } from 'lucide-react';
import { API_BASE, BACKEND_URL } from '../config/api';

export default function DeveloperApi() {
  const [copiedTab, setCopiedTab] = useState('');
  const [testUrl, setTestUrl] = useState('http://secure-paypal-login-account-update.xyz/webscr');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(''), 2000);
  };

  const curlSnippet = `curl -X POST "${API_BASE}/analyze-url" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "http://secure-paypal-login-account-update.xyz/webscr",
    "deep_scan": true
  }'`;

  const pythonSnippet = `import requests

url = "${API_BASE}/analyze-url"
payload = {
    "url": "http://secure-paypal-login-account-update.xyz/webscr",
    "deep_scan": True
}
response = requests.post(url, json=payload)
data = response.json()

print(f"Classification: {data['classification']}")
print(f"Risk Score: {data['risk_score']}/100")
print(f"Attack Category: {data['attack_type']}")`;

  const jsSnippet = `const response = await fetch("${API_BASE}/analyze-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "http://secure-paypal-login-account-update.xyz/webscr",
    deep_scan: true
  })
});
const data = await response.json();
console.log("Verdict:", data.classification, "Risk Score:", data.risk_score);`;

  const handleTestApi = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      const resp = await fetch(`${API_BASE}/analyze-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl, deep_scan: true })
      });
      const data = await resp.json();
      setApiResponse(data);
    } catch (e) {
      setApiResponse({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5" />
            Public REST API & Integrations
          </div>
          <h1 className="text-3xl font-extrabold text-white">Developer API & Webhook Suite</h1>
        </div>

        <a
          href={`${BACKEND_URL}/docs`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-all"
        >
          <span>Swagger OpenAPI Docs</span>
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
        </a>
      </div>

      {/* Code Snippets Box */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
          Quickstart Integration SDK
        </h3>

        {/* cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold">cURL Command</span>
            <button
              onClick={() => copyToClipboard(curlSnippet, 'curl')}
              className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
            >
              {copiedTab === 'curl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
            {curlSnippet}
          </pre>
        </div>

        {/* Python */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold">Python (requests)</span>
            <button
              onClick={() => copyToClipboard(pythonSnippet, 'python')}
              className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
            >
              {copiedTab === 'python' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'python' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            {pythonSnippet}
          </pre>
        </div>

        {/* JavaScript */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold">JavaScript / Node.js (fetch)</span>
            <button
              onClick={() => copyToClipboard(jsSnippet, 'js')}
              className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
            >
              {copiedTab === 'js' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'js' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
            {jsSnippet}
          </pre>
        </div>
      </div>

      {/* Live API Tester */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          Interactive API Console
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleTestApi}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading ? "Sending..." : "Execute POST"}</span>
          </button>
        </div>

        {apiResponse && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Response JSON:</span>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
