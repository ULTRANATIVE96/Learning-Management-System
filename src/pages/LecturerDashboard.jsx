import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, BarChart3, Megaphone, PlusCircle, Video, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';

export default function LecturerDashboard({ user, setActivePage }) {
  const [modules, setModules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded stats representing lecturer activities
  const stats = [
    { title: "Students Enrolled", value: "128", icon: Users, change: "+12% this semester", color: "bg-blue-500", text: "text-blue-600" },
    { title: "Modules Taught", value: "3", icon: BookOpen, change: "Active load", color: "bg-indigo-500", text: "text-indigo-600" },
    { title: "Remark Requests", value: "2", icon: Clock, change: "Requires action", color: "bg-amber-500", text: "text-amber-600" },
    { title: "Average Class Mark", value: "73.4%", icon: BarChart3, change: "Target: 75.0%", color: "bg-emerald-500", text: "text-emerald-600" }
  ];

  // Hardcoded pending remarks
  const pendingRemarks = [
    { student: "Bob Wilson", id: "11201", module: "MATH101", assessment: "Assignment 2", currentMark: 45, date: "2 hours ago" },
    { student: "Sarah Connor", id: "11202", module: "CSC201", assessment: "Test 1", currentMark: 75, date: "1 day ago" }
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [modList, annList] = await Promise.all([
          api.getModules(),
          api.getAnnouncements()
        ]);
        setModules(modList);
        setAnnouncements(annList.slice(0, 3)); // show top 3 recent
      } catch (err) {
        console.error("Failed to load lecturer dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.name || 'Lecturer'}</span>
            <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Divine University Instructor Portal • DacBoard management panel.
          </p>
        </div>
        <div className="p-1 px-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lecture Mode</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            color={stat.color}
            text={stat.text}
          />
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick actions & Modules */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Quick Management Controls</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActivePage('host_live')}
                className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl flex flex-col justify-between items-start gap-4 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 group text-left"
              >
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Broadcast Session</span>
                  <span className="text-[10px] text-indigo-200 mt-0.5 block">Go live stream & webcam record</span>
                </div>
              </button>

              <button
                onClick={() => setActivePage('manage_marks')}
                className="p-5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between items-start gap-4 transition-all active:scale-95 text-left group"
              >
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">Grade Book</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Update inline marks & weightages</span>
                </div>
              </button>

              <button
                onClick={() => setActivePage('upload_resources')}
                className="p-5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between items-start gap-4 transition-all active:scale-95 text-left group"
              >
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">Publish Notes</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Upload slides and past papers</span>
                </div>
              </button>
            </div>
          </div>

          {/* Courses / Modules Taught */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Your Course Directory</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.slice(0, 4).map((mod) => (
                <div
                  key={mod.id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 hover:border-slate-200 dark:hover:border-slate-700/60 transition-all flex items-start justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      {mod.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{mod.name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{mod.schedule}</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold bg-white dark:bg-slate-900 w-10 h-10 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                    {mod.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pending remark requests & Announcements */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Pending Remark Requests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>Pending Remark Requests</span>
            </h2>

            <div className="space-y-4">
              {pendingRemarks.map((rem, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rem.student}</span>
                    <span className="text-slate-400 font-medium">{rem.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{rem.module} • {rem.assessment}</span>
                    <span className="font-bold text-rose-500">Score: {rem.currentMark}%</span>
                  </div>
                  <button
                    onClick={() => setActivePage('manage_marks')}
                    className="w-full mt-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>View Gradebook</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent announcements list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Announcements</h2>
              <button
                onClick={() => setActivePage('manage_announcements')}
                className="text-indigo-600 hover:text-indigo-500 text-xs font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      {ann.moduleCode}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{ann.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
