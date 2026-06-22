import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '../../utils/cn';
import { Sparkles } from 'lucide-react';

export default function Layout({ children, activePage, setActivePage, user, onLogout, searchQuery, setSearchQuery, onSwitchRole }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-955 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          user={user}
          onLogout={onLogout}
        />
      </div>
      
      <div className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        {/* Prototyping View Switcher Banner */}
        <div className="bg-slate-900 border-b border-indigo-500/20 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Rapid Prototyping Sandbox
            </span>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button 
              onClick={() => onSwitchRole('STUDENT')}
              className={cn(
                "px-4 py-1.5 rounded-lg font-extrabold transition-all text-[11px] uppercase tracking-wider",
                user?.role === 'STUDENT' 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Student Portal View
            </button>
            <button 
              onClick={() => onSwitchRole('LECTURER')}
              className={cn(
                "px-4 py-1.5 rounded-lg font-extrabold transition-all text-[11px] uppercase tracking-wider",
                user?.role === 'LECTURER' 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Lecturer Desk View
            </button>
          </div>
        </div>

        <Navbar 
          toggleMobileMenu={() => setIsMobileMenuOpen(true)} 
          setActivePage={setActivePage}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar 
              activePage={activePage} 
              setActivePage={(p) => { setActivePage(p); setIsMobileMenuOpen(false); }} 
              isMobile={true}
              onClose={() => setIsMobileMenuOpen(false)}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
