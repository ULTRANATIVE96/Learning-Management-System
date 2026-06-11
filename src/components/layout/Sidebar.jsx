import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Layers, 
  Users, 
  Video, 
  Bell, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: BookOpen, label: 'My Modules', id: 'modules' },
  { icon: GraduationCap, label: 'Marks', id: 'marks' },
  { icon: FileText, label: 'Assignments', id: 'assignments' },
  { icon: Layers, label: 'Content', id: 'content' },
  { icon: Users, label: 'Class List', id: 'classlist' },
  { icon: Video, label: 'Live Classes', id: 'live', active: true },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: UserIcon, label: 'Profile', id: 'profile' },
];

const lecturerMenuItems = [
  { icon: LayoutDashboard, label: 'Lecturer Dashboard', id: 'lecturer_dashboard' },
  { icon: FileCheck, label: 'Manage Marks', id: 'manage_marks' },
  { icon: PlusCircle, label: 'Upload Resources', id: 'upload_resources' },
  { icon: Video, label: 'Host Live Class', id: 'host_live' },
  { icon: Bell, label: 'Announcements', id: 'manage_announcements' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: UserIcon, label: 'Profile', id: 'profile' },
];

export default function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed, isMobile, onClose, user, onLogout }) {
  const isLecturer = user?.role === 'LECTURER';
  const menuItems = isLecturer ? lecturerMenuItems : studentMenuItems;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-900 text-slate-400 transition-all duration-300 z-50 flex flex-col border-r border-slate-800/50",
        isCollapsed && !isMobile ? "w-20" : "w-64",
        isMobile ? "relative" : "fixed"
      )}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-between">
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center gap-3 font-bold text-white text-xl tracking-tight group cursor-pointer" onClick={() => setActivePage(isLecturer ? 'lecturer_dashboard' : 'dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">DacBoard</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20 hover:rotate-12 transition-transform cursor-pointer" onClick={() => setActivePage(isLecturer ? 'lecturer_dashboard' : 'dashboard')}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        )}
        
        {isMobile && (
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "sidebar-item w-full flex items-center gap-3 group relative py-3 px-4 rounded-xl transition-all",
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-semibold" 
                  : "hover:bg-slate-800/40 hover:text-slate-200 text-slate-400",
                isCollapsed && !isMobile && "justify-center px-0"
              )}
              title={isCollapsed && !isMobile ? item.label : ""}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
              )} />
              {(!isCollapsed || isMobile) && (
                <span className="text-sm transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full lg:hidden" />
              )}
              
              {(!isCollapsed || isMobile) && item.active && (
                <span className="ml-auto flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/50">
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-item w-full flex items-center gap-3 mb-4 hover:bg-slate-800/50 py-2 px-4 rounded-xl text-slate-500 hover:text-slate-300"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse Menu</span>
              </>
            )}
          </button>
        )}
        
        {(!isCollapsed || isMobile) && (
          <div className="p-3 bg-slate-800/30 rounded-2xl flex items-center gap-3 border border-slate-700/30">
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl bg-slate-800 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold truncate">{user?.role || 'Guest'}</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
