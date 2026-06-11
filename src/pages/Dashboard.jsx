import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Lightbulb,
  Calendar,
  Play,
  Sparkles,
  Layers,
  Users,
  Video,
  Megaphone
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

const defaultChartData = [
  { name: 'Week 1', mark: 65 },
  { name: 'Week 2', mark: 72 },
  { name: 'Week 3', mark: 68 },
  { name: 'Week 4', mark: 85 },
  { name: 'Week 5', mark: 78 },
  { name: 'Week 6', mark: 92 },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profData, modsData, asgData, annData] = await Promise.all([
          api.getProfile(),
          api.getModules(),
          api.getAssignments(),
          api.getAnnouncements()
        ]);
        setProfile(profData);
        setModules(modsData);
        setAssignments(asgData);
        setAnnouncements(annData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Derive stats
  const activeModulesCount = modules.length;
  const completedTasksCount = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
  const pendingAssignments = assignments.filter(a => a.status === 'Pending' || a.status === 'Late');
  
  // Format deadlines
  const deadlinesList = pendingAssignments.slice(0, 3).map(a => ({
    id: a.id,
    title: a.title,
    module: a.module,
    priority: a.priority || 'medium',
    date: a.dueDate.split(',')[0], // e.g. "Oct 25"
    timeLeft: a.status === 'Late' ? 'Late / Overdue' : 'Pending'
  }));

  const studentName = profile?.name ? profile.name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-indigo-600">{studentName}!</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Your academic journey is looking <span className="font-bold text-green-500">strong</span> this semester.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            View Schedule
          </button>
          <button className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-xl shadow-indigo-600/20">
            <Play className="w-4 h-4 fill-current" />
            Join Live Class
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Average Mark" value="78.5%" icon={TrendingUp} trend={12} color="indigo" />
        <StatCard title="Active Modules" value={activeModulesCount.toString()} icon={BookOpen} color="blue" />
        <StatCard title="Completed Tasks" value={completedTasksCount.toString()} icon={CheckCircle} trend={5} color="green" />
        <StatCard title="Study Hours" value="128h" icon={Clock} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 glass-card border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Performance Analytics</h3>
              <p className="text-sm text-slate-500 mt-1">Consistency over time</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <option>All Modules</option>
              <option>Mathematics</option>
              <option>Computer Science</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={defaultChartData}>
                <defs>
                  <linearGradient id="colorMark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: '#fff',
                    padding: '12px'
                  }} 
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="mark" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorMark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass-card bg-indigo-600 border-none relative overflow-hidden group flex flex-col justify-between">
          <div className="relative z-10 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Smart Insights</h3>
            <p className="text-indigo-100 text-sm mb-6">Powered by myTutor AI</p>
            
            <div className="space-y-4">
              {[
                { text: "You're struggling with Calculus derivatives. Try the new practice paper.", tag: "Mathematics 101" },
                { text: "Your mark in CSC201 improved by 15%! Keep up the consistent study habit.", tag: "Achievement" }
              ].map((insight, i) => (
                <div key={i} className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group/item">
                  <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">{insight.tag}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transform translate-x-0 group-hover/item:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="relative z-10 mt-8 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-xl hover:shadow-white/20 transition-all active:scale-95">
            Optimize Learning Path
          </button>
          
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Deadlines</h3>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <div className="space-y-4">
            {deadlinesList.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                <div className={cn(
                  "w-1.5 h-10 rounded-full shrink-0",
                  item.priority === 'high' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                  item.priority === 'medium' ? "bg-orange-500" : "bg-blue-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.module}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.date}</p>
                  <p className={cn(
                    "text-[10px] font-bold mt-0.5 uppercase",
                    item.priority === 'high' ? "text-red-500" : "text-slate-400"
                  )}>{item.timeLeft}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-100 dark:border-slate-800 pt-6">
            View Academic Calendar
          </button>
        </div>

        {/* Announcements Feed Widget */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Announcements</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-8">No announcements posted yet.</p>
            ) : (
              announcements.slice(0, 4).map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-850 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      {ann.moduleCode}
                    </span>
                    <span className="text-[10px] text-slate-450 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs mt-2">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Quick Shortcuts</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              <Lightbulb className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Upload Note', icon: Layers, color: 'bg-indigo-500', desc: 'Add content' },
              { label: 'View Marks', icon: TrendingUp, color: 'bg-green-500', desc: 'Grade book' },
              { label: 'Class List', icon: Users, color: 'bg-blue-500', desc: 'Classmates' },
              { label: 'Live Chat', icon: Video, color: 'bg-purple-500', desc: 'Tutor help' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all hover-scale group">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300", 
                  action.color
                )}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3">{action.label}</span>
                <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-medium">{action.desc}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-white font-bold text-xs">New feature available!</h4>
              <p className="text-slate-400 text-[10px] mt-0.5">Check out AI content summarizer.</p>
            </div>
            <button className="relative z-10 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-500 transition-colors">
              Try it
            </button>
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl translate-x-5 -translate-y-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
