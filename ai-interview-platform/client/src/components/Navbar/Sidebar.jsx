import React from 'react';
import { Home, Settings, Mic, Code2, Award, Cpu, ShieldCheck, LogOut } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }) {
  const menuItems = [
    { id: 'home', name: 'Home Portal', icon: Home, color: 'text-blue-400' },
    { id: 'setup', name: 'Interview Setup', icon: Settings, color: 'text-purple-400' },
    { id: 'session', name: 'AI Mock Session', icon: Mic, color: 'text-cyan-400' },
    { id: 'coding', name: 'Coding Test Round', icon: Code2, color: 'text-indigo-400' },
    { id: 'result', name: 'Result Analytics', icon: Award, color: 'text-emerald-400' },
  ];

  // Dynamic initials extraction
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = user ? user.name : 'Soumadeep Dev';
  const displayInitials = getInitials(displayName);

  return (
    <aside className="w-72 bg-[#090d16]/80 border-r border-indigo-950/40 min-h-screen flex flex-col justify-between p-6 shrink-0 relative z-20 backdrop-blur-xl">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        {/* Brand/Logo Section */}
        <div className="flex items-center space-x-3 mb-10 pb-4 border-b border-indigo-950/30">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20 animate-float">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent font-outfit">
              CAMSENSE AI
            </h1>
            <span className="text-[10px] tracking-widest text-cyan-400 font-semibold block uppercase">
              Interview Engine
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 mb-3">
            Core Modules
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950/50 to-indigo-900/30 text-white border-l-2 border-indigo-500 shadow-md shadow-indigo-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border-l-2 border-transparent'
                }`}
              >
                {/* Active Hover Ambient Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-10 pointer-events-none blur-sm"></div>
                )}
                
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-300 ${item.color}`} />
                <span className="font-medium text-[13.5px] font-outfit tracking-wide">{item.name}</span>
                
                {/* Micro indicators */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section / Health Indicator */}
      <div className="mt-auto pt-6 border-t border-indigo-950/30">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800/40 flex items-center justify-center font-bold text-indigo-400 font-outfit">
                {displayInitials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate font-outfit">{displayName}</p>
              <div className="flex items-center space-x-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-[10px] text-cyan-400 font-medium tracking-wide">AI Connected</span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout session"
              className="p-2 bg-slate-950 hover:bg-rose-950/40 border border-indigo-950 hover:border-rose-900/30 rounded-lg text-slate-400 hover:text-rose-400 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
