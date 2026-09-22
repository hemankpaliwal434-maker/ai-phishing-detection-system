import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UrlScanner from './pages/UrlScanner';
import EmailScanner from './pages/EmailScanner';
import QrScanner from './pages/QrScanner';
import VisualScanner from './pages/VisualScanner';
import SocDashboard from './pages/SocDashboard';
import IncidentManagement from './pages/IncidentManagement';
import AwarenessHub from './pages/AwarenessHub';
import PhishingSimulation from './pages/PhishingSimulation';
import DeveloperApi from './pages/DeveloperApi';
import AIChatbotDrawer from './components/AIChatbotDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState(null);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <UrlScanner
            onOpenChat={() => setChatOpen(true)}
            setChatContext={setChatContext}
          />
        );
      case 'email':
        return <EmailScanner />;
      case 'qr':
        return <QrScanner />;
      case 'visual':
        return <VisualScanner />;
      case 'soc':
        return <SocDashboard />;
      case 'incidents':
        return <IncidentManagement />;
      case 'awareness':
        return <AwarenessHub />;
      case 'simulation':
        return <PhishingSimulation />;
      case 'api':
        return <DeveloperApi />;
      default:
        return <UrlScanner onOpenChat={() => setChatOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-midnight-ink text-warm-white flex flex-col selection:bg-neon-violet/30 selection:text-aqua overflow-x-hidden font-sans">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] rounded-full bg-deep-indigo/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-aqua/5 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-neon-violet/10 blur-[150px]" />
      </div>

      {/* Navigation Bar */}
      <div className="relative z-50">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenChat={() => setChatOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full mx-auto pb-12 pt-4">
        {renderActivePage()}
      </main>

      {/* Floating / Sliding AI Security Analyst Chatbot */}
      <AIChatbotDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        scanContext={chatContext}
      />

      {/* Premium Footer */}
      <footer className="relative z-20 border-t border-glass-border bg-midnight-ink/80 backdrop-blur-xl py-8 text-center text-[11px] text-lavender/50 font-mono tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} PHISHGUARD AI. All Systems Operational.</span>
          <span className="text-aqua/70 font-bold">Neural Engine v2.0 Active</span>
        </div>
      </footer>
    </div>
  );
}
