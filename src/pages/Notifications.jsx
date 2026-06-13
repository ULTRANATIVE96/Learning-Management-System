import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  FileText, 
  MessageSquare,
  Clock,
  Trash2,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Notifications({ setActivePage }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkRead(notif.id);
    if (
      notif.title.toLowerCase().includes("live class") || 
      notif.desc.toLowerCase().includes("live class") || 
      notif.type === 'video'
    ) {
      if (setActivePage) {
        const match = notif.desc.match(/Session ID: (\d+)/);
        if (match && match[1]) {
          const url = new URL(window.location);
          url.searchParams.set('page', 'live');
          url.searchParams.set('session', match[1]);
          window.history.pushState({}, '', url);
        }
        setActivePage('live');
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent mark read trigger
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'mark': return CheckCircle2;
      case 'content': return BookOpen;
      case 'deadline': return AlertCircle;
      case 'ai': return Sparkles;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 bg-emerald-500/10 text-emerald-400 border-emerald-100 border-emerald-500/20",
    indigo: "bg-indigo-50 text-indigo-600 bg-indigo-500/10 text-indigo-400 border-indigo-100 border-indigo-500/20",
    rose: "bg-rose-50 text-rose-600 bg-rose-500/10 text-rose-400 border-rose-100 border-rose-500/20",
    amber: "bg-amber-50 text-amber-600 bg-amber-500/10 text-amber-400 border-amber-100 border-amber-500/20",
    slate: "bg-slate-950 text-slate-400 bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const iconColorMap = {
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    indigo: "bg-indigo-500 shadow-indigo-500/20",
    rose: "bg-rose-500 shadow-rose-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    slate: "bg-slate-500 shadow-slate-500/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Stay updated with your latest academic activity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold shadow-sm hover:bg-slate-950 transition-all text-slate-300"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </button>
          <button 
            onClick={handleClearAll}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear all notifications"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card text-center py-12 text-slate-400 font-medium">
            You have no notifications. Keep up the good work!
          </div>
        ) : (
          notifications.map((notif) => {
            const IconComponent = getIcon(notif.type);
            const color = notif.color || 'indigo';
            return (
              <div 
                key={notif.id} 
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  "group relative overflow-hidden glass-card p-6 border transition-all duration-300 cursor-pointer",
                  notif.isNew ? "ring-2 ring-indigo-500/20 border-indigo-200 border-indigo-800 bg-slate-900" : "opacity-80 hover:opacity-100"
                )}
              >
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500",
                    iconColorMap[color]
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        notif.isNew ? "text-white" : "text-slate-300"
                      )}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{notif.time}</span>
                        <button 
                          onClick={(e) => handleDelete(e, notif.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      {notif.desc}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:underline"
                      >
                        View Details
                      </button>
                      {notif.isNew && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Background Accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-full opacity-[0.03] transition-opacity group-hover:opacity-[0.07]",
                  color === 'emerald' ? "bg-emerald-500" : 
                  color === 'indigo' ? "bg-indigo-500" : 
                  color === 'rose' ? "bg-rose-500" : "bg-slate-500"
                )} style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
              </div>
            );
          })
        )}
      </div>
      
      <div className="text-center py-8">
        <button 
          onClick={() => alert("Older notifications load simulated.")}
          className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
        >
          Load older notifications
        </button>
      </div>
    </div>
  );
}

