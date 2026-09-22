import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  ChevronRight,
  Cpu,
  Lock,
  Globe,
  Activity,
  Fingerprint,
  Eye,
  Server
} from 'lucide-react';

import RiskGauge from '../components/RiskGauge';
import ThreatBreakdown from '../components/ThreatBreakdown';
import ExplainableAI from '../components/ExplainableAI';
import ThreatGraphVis from '../components/ThreatGraphVis';
import DeepForensicsTabs from '../components/DeepForensicsTabs';
import { API_BASE } from '../config/api';

export default function UrlScanner({ onOpenChat, setChatContext }) {
  const [urlInput, setUrlInput] = useState('http://secure-paypal-login-account-update.xyz/webscr?cmd=login_submit');
  const [deepScan, setDeepScan] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const sampleTargets = [
    { label: 'PayPal Spoof', url: 'http://secure-paypal-login-account-update.xyz/webscr?cmd=login_submit' },
    { label: 'Chase Banking', url: 'http://chase-bank-verify-ident-security-update.com/login.html' },
    { label: 'Homoglyph Attack', url: 'http://pDypal.com/security/login.html' },
    { label: 'Google Docs (Safe)', url: 'https://docs.google.com/document/d/sample-cybersecurity-paper' }
  ];

  const scanSteps = [
    "Extracting 30+ Lexical & Statistical URL Features...",
    "Running Gradient Boosting & Multi-Model Inference...",
    "Inspecting Domain WHOIS, DNS & SSL Certificates...",
    "Executing Safe Sandboxed Webpage Forensics...",
    "Detecting Brand Impersonation & Typosquatting...",
    "Autonomous AI SOC Analyst Correlating Evidence..."
  ];

  const handleScan = async (targetToScan) => {
    const url = targetToScan || urlInput;
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setScanResult(null);

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < scanSteps.length) {
        setActiveStep(currentStep);
      }
    }, 400);

    try {
      const resp = await fetch(`${API_BASE}/analyze-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), deep_scan: deepScan })
      });

      clearInterval(stepInterval);

      if (!resp.ok) {
        throw new Error(`Server returned status: ${resp.status}`);
      }

      const data = await resp.json();
      setScanResult(data);
      if (setChatContext) {
        setChatContext(data);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(`Scan failed: ${err.message}. Ensure backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!scanResult) return;
    try {
      const resp = await fetch(`${API_BASE}/report-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanResult)
      });
      const blob = await resp.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `PHISHGUARD_Investigation_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to generate PDF report.");
    }
  };

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-midnight-ink text-warm-white pb-24 relative overflow-hidden font-sans selection:bg-neon-violet/30 selection:text-aqua">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-aqua/5 blur-[100px] pointer-events-none" />
      
      {/* 1. HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pt-16 pb-12 max-w-5xl mx-auto text-center px-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-bg border border-glass-border shadow-glass mb-6 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
          <span className="text-aqua text-xs font-mono font-bold tracking-widest uppercase">PHISHGUARD AI Engine v2.0</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-warm-white via-lavender to-deep-indigo drop-shadow-lg mb-6">
          Don’t Trust the Link.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua to-neon-violet">Understand It.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-lavender/80 font-light leading-relaxed">
          The world's most advanced autonomous URL investigation platform. Watch as our neural networks dissect, correlate, and expose malicious intent in real-time.
        </p>
      </motion.div>

      {/* 2. URL SCANNER SECTION */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 mb-16">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={(e) => { e.preventDefault(); handleScan(); }}
          className="relative flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl bg-deep-indigo/40 backdrop-blur-xl border border-glass-border shadow-glass hover:shadow-glow-aqua transition-all duration-500 group"
        >
          <div className="flex items-center gap-4 flex-1 w-full pl-4">
            <Search className="w-5 h-5 text-aqua group-focus-within:text-neon-violet transition-colors duration-300" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Target URL for X-Ray Analysis..."
              className="w-full bg-transparent text-base text-warm-white placeholder-lavender/40 focus:outline-none font-mono tracking-wide"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto px-2">
            <label className="hidden sm:flex items-center gap-2 text-xs text-lavender/80 cursor-pointer hover:text-aqua transition-colors">
              <input
                type="checkbox"
                checked={deepScan}
                onChange={(e) => setDeepScan(e.target.checked)}
                className="w-4 h-4 rounded border-glass-border bg-midnight-ink text-aqua focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-mono uppercase tracking-wider text-[10px]">Deep Forensics</span>
            </label>

            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-violet to-deep-indigo hover:from-aqua hover:to-neon-violet text-warm-white text-xs font-bold uppercase tracking-widest shadow-glow-violet disabled:opacity-50 transition-all duration-500 overflow-hidden relative"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin relative z-10" />
                  <span className="relative z-10">Neural Scan...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">X-Ray Link</span>
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Quick Targets */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {sampleTargets.map((st, i) => (
            <button
              key={i}
              onClick={() => { setUrlInput(st.url); handleScan(st.url); }}
              className="px-3 py-1.5 rounded-full bg-glass-bg border border-glass-border hover:border-aqua hover:text-aqua text-[10px] font-mono tracking-wider text-lavender/60 transition-all duration-300"
            >
              {st.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* 3. AI INVESTIGATION (LOADING STATE) */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-3xl mx-auto px-4 mb-12"
          >
            <div className="p-8 rounded-3xl bg-glass-bg backdrop-blur-2xl border border-glass-border shadow-glass text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-deep-indigo">
                <motion.div 
                  className="h-full bg-gradient-to-r from-aqua to-neon-violet"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeStep + 1) / scanSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <Cpu className="w-10 h-10 text-aqua mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-mono text-warm-white mb-2 tracking-wide">
                {scanSteps[activeStep]}
              </h3>
              <p className="text-xs text-lavender/60 font-mono uppercase tracking-widest">
                PhishGuard Neural Core Active
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm font-mono text-red-200">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. INVESTIGATION ROOM (RESULTS) */}
      <AnimatePresence>
        {scanResult && !loading && (
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto px-4 space-y-8 relative z-20"
          >
            {/* COMMAND CENTER ACTION BAR */}
            <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass">
              <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-deep-indigo flex items-center justify-center border border-lavender/20 shrink-0">
                  <Globe className="w-4 h-4 text-aqua" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-lavender/60">Target Lock</p>
                  <p className="text-sm font-mono text-warm-white truncate max-w-[200px] sm:max-w-md">{scanResult.url}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onOpenChat}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neon-violet/20 hover:bg-neon-violet/40 border border-neon-violet/50 text-warm-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-glow-violet"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Interrogate AI</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-glass-border text-lavender text-xs font-bold uppercase tracking-wider transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Dossier PDF</span>
                </button>
              </div>
            </motion.div>

            {/* AI VERDICT & RISK RADAR */}
            <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 rounded-3xl bg-glass-bg backdrop-blur-xl border border-glass-border p-6 shadow-glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-aqua/10 rounded-full blur-3xl group-hover:bg-aqua/20 transition-all duration-700" />
                <h3 className="text-xs font-mono tracking-widest uppercase text-lavender/60 mb-6 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Risk Radar
                </h3>
                {/* We wrap the existing component but give it a premium container */}
                <div className="relative z-10 scale-95 origin-left">
                  <RiskGauge
                    score={scanResult.risk_score}
                    threatLevel={scanResult.threat_level}
                    classification={scanResult.classification}
                    confidence={scanResult.confidence_percentage}
                  />
                </div>
              </div>

              {/* SECURITY DNA (Threat Breakdown) */}
              <div className="lg:col-span-2 rounded-3xl bg-glass-bg backdrop-blur-xl border border-glass-border p-6 shadow-glass">
                <h3 className="text-xs font-mono tracking-widest uppercase text-lavender/60 mb-6 flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5" /> Security DNA Profiling
                </h3>
                <ThreatBreakdown breakdown={scanResult.breakdown} />
              </div>
            </motion.div>

            {/* AI EXPLANATION */}
            <motion.div variants={itemVars} className="rounded-3xl bg-midnight-ink/50 backdrop-blur-xl border border-glass-border shadow-glass overflow-hidden">
              <div className="bg-gradient-to-r from-deep-indigo to-midnight-ink p-1 border-b border-glass-border">
                {/* Embedded component already handles its own header nicely, but wrapping it adds depth */}
              </div>
              <ExplainableAI
                aiExplanation={scanResult.ai_explanation}
                evidence={scanResult.evidence}
                recommendations={scanResult.recommendations}
                attackType={scanResult.attack_type}
                brand={scanResult.targeted_brand}
              />
            </motion.div>

            {/* THREAT GRAPH */}
            <motion.div variants={itemVars} className="rounded-3xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass p-6">
               <h3 className="text-xs font-mono tracking-widest uppercase text-lavender/60 mb-6 flex items-center gap-2">
                  <Server className="w-3.5 h-3.5" /> Infrastructure Constellation
                </h3>
              <ThreatGraphVis graphData={scanResult.threat_graph} />
            </motion.div>

            {/* SECURITY PASSPORT (DEEP FORENSICS) */}
            <motion.div variants={itemVars} className="rounded-3xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass p-2">
              <DeepForensicsTabs
                domainInfo={scanResult.domain_info}
                dnsRecords={scanResult.dns_records}
                sslInfo={scanResult.ssl_info}
                contentForensics={scanResult.content_forensics}
                urlFeatures={scanResult.url_features}
              />
            </motion.div>
            
            {/* FINAL CTA */}
            <motion.div variants={itemVars} className="text-center pt-8 pb-12">
               <p className="text-sm font-mono text-lavender/60 mb-4">Investigation concluded by PhishGuard AI Core.</p>
               <button onClick={() => { setScanResult(null); setUrlInput(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 text-aqua hover:text-warm-white font-mono text-xs uppercase tracking-widest transition-colors duration-300">
                 Scan Another Target <ChevronRight className="w-4 h-4" />
               </button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
