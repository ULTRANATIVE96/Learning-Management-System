import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '../../utils/cn';

export default function Layout({ children, activePage, setActivePage, user, onLogout, searchQuery, setSearchQuery }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-300">
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
