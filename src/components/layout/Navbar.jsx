import React from 'react';
import { Search, Bell, Menu, Sun, Moon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Navbar({ toggleMobileMenu, setActivePage, user, searchQuery, setSearchQuery }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2.5 text-slate-500 hover:bg-slate-800 rounded-xl transition-all active:scale-90"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search modules, notes, or announcements..." 
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-5 py-2.5 w-64 xl:w-[480px] bg-slate-900 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-slate-900 focus:bg-slate-950 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-bold text-slate-400 shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-bold text-slate-400 shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-5">
        <div className="hidden xl:flex flex-col items-end px-4 border-r border-slate-800">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-[0.2em]">Divine University</span>
          <span className="text-xs font-bold text-slate-400 mt-0.5">2026 Academic Year</span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={() => setActivePage('notifications')}
            className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:bg-indigo-900/30 rounded-xl transition-all group"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950" />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />

        <div 
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-3 pl-1 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 bg-indigo-900/30 p-0.5 ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all overflow-hidden shadow-lg shadow-indigo-500/10 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-950 rounded-full shadow-sm" />
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-extrabold text-slate-100 group-hover:text-indigo-600 transition-colors">{user?.name || 'User'}</p>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-all" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user?.username || 'Guest'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
