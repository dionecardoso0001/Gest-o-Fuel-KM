import React from 'react';
import { Flag, LayoutDashboard, Settings, Fuel, FileText, Car } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Cockpit' },
    { id: 'refuels', icon: Fuel, label: 'Abastecimentos' },
    { id: 'vehicles', icon: Car, label: 'Veículos' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-racing-black text-gray-200 font-sans selection:bg-racing-red selection:text-white pb-20 md:pb-0">
      {/* Top Bar - Mobile Header */}
      <div className="md:hidden h-16 bg-racing-panel border-b border-racing-red/30 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Flag className="text-racing-red w-6 h-6" />
            <span className="font-bold text-lg tracking-tighter italic">FUEL<span className="text-racing-red">RACING</span></span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-racing-panel border-r border-racing-red/20">
          <div className="p-6 flex items-center gap-3 border-b border-gray-800">
            <Flag className="text-racing-red w-8 h-8" />
            <div>
              <h1 className="font-bold text-2xl tracking-tighter italic text-white">FUEL<span className="text-racing-red">RACING</span></h1>
              <p className="text-xs text-gray-500 tracking-widest">SCUDERIA EDITION</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group
                  ${activeTab === item.id 
                    ? 'bg-racing-red text-white shadow-[0_0_15px_rgba(255,43,43,0.4)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_white]" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="bg-gradient-to-br from-gray-800 to-black p-4 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">SYSTEM STATUS</div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-mono">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                ONLINE
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-racing-panel border-t border-gray-800 flex justify-around p-3 z-50 safe-area-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeTab === item.id ? 'text-racing-red' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};