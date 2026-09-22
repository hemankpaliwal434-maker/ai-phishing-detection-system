import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Mail, 
  QrCode, 
  Image as ImageIcon, 
  LayoutDashboard, 
  AlertTriangle, 
  GraduationCap, 
  Send, 
  Code2, 
  Activity,
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenChat }) {
  const navItems = [
    { id: 'scanner', label: 'URL X-Ray', icon: Search },
    { id: 'soc', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Threat Log', icon: AlertTriangle },
    { id: 'awareness', label: 'Security Hub', icon: GraduationCap },
    { id: 'email', label: 'Email Scan', icon: Mail },
    { id: 'qr', label: 'QR Scan', icon: QrCode },
    { id: 'visual', label: 'Visual AI', icon: ImageIcon },
    { id: 'simulation', label: 'Phish Sim', icon: Send },
    { id: 'api', label: 'Model API', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-midnight-ink/70 backdrop-blur-2xl border-b border-glass-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('scanner')}
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-violet to-deep-indigo shadow-glow-violet transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-glass-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <ShieldAlert className="w-5 h-5 text-warm-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-warm-white to-lavender">
                  PHISHGUARD AI
                </span>
              </div>
              <p className="text-[10px] text-aqua/70 font-mono tracking-widest uppercase">Autonomous SOC Engine</p>
            </div>
          </motion.div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 overflow-hidden group ${
                    isActive
                      ? 'text-aqua'
                      : 'text-lavender/60 hover:text-warm-white'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-aqua/10 border border-aqua/30 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-aqua' : 'text-lavender/40 group-hover:text-lavender'}`} />
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Chat Assistant & Status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-deep-indigo/40 border border-glass-border text-[10px] font-mono text-aqua/80 uppercase tracking-widest backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua"></span>
              </span>
              Neural Net Live
            </div>

            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-violet/20 hover:bg-neon-violet/40 border border-neon-violet/50 text-warm-white text-xs font-bold tracking-widest uppercase shadow-glow-violet transition-all duration-300"
            >
              <Cpu className="w-4 h-4 text-warm-white" />
              <span className="hidden sm:inline">AI Investigator</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Subnav */}
        <div className="flex xl:hidden overflow-x-auto py-3 gap-2 border-t border-glass-border no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-colors duration-300 ${
                  isActive
                    ? 'bg-aqua/10 text-aqua border border-aqua/30'
                    : 'bg-glass-bg text-lavender/60 border border-glass-border hover:text-warm-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
