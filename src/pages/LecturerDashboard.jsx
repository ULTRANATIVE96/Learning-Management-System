import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, BarChart3, Megaphone, PlusCircle, Video, ShieldCheck, ArrowRight, Sparkles, AlertCircle, ClipboardList, Plus, X } from 'lucide-react';
import { api } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';

export default function LecturerDashboard({ user, setActivePage }) {
  const [modules, setModules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for course creation & sequential syllabus module provisioning
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSchedule, setNewCourseSchedule] = useState('');

  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [newSyllabusModuleName, setNewSyllabusModuleName] = useState('');

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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;
    try {
      const colors = ['text-blue-600', 'text-indigo-600', 'text-purple-600', 'text-green-600', 'text-orange-600'];
      const bgColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600'];
      const icons = ['Σ', '💻', '⚛️', '📊', '✍️', '🧪', '⚙️'];
      const randIdx = Math.floor(Math.random() * colors.length);
      
      const enrolled = await api.enrollModule({
        code: newCourseCode.toUpperCase(),
        name: newCourseName,
        lecturer: user?.name || 'Dr. Andrea Vine',
        schedule: newCourseSchedule || 'Mon, Wed • 12:00 PM',
        progress: 0,
        color: colors[randIdx],
        bgColor: bgColors[randIdx],
        icon: icons[randIdx % icons.length],
        syllabusModules: "Module 1: Introduction"
      });
      setModules(prev => [...prev, enrolled]);
      setShowCreateCourseModal(false);
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseSchedule('');
    } catch (err) {
      console.error("Failed to create course", err);
    }
  };

  const handleAddSyllabusModule = async (e) => {
    e.preventDefault();
    if (!newSyllabusModuleName.trim() || !selectedCourseDetails) return;
    try {
      const currentSyllabus = selectedCourseDetails.syllabusModules 
        ? selectedCourseDetails.syllabusModules + ';' + newSyllabusModuleName.trim()
        : newSyllabusModuleName.trim();
      
      const updated = await api.updateModule(selectedCourseDetails.id, {
        ...selectedCourseDetails,
        syllabusModules: currentSyllabus
      });
      
      if (updated) {
        setModules(prev => prev.map(m => m.id === updated.id ? updated : m));
        setSelectedCourseDetails(updated);
        setNewSyllabusModuleName('');
      }
    } catch (err) {
      console.error("Failed to add syllabus module", err);
    }
  };

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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.name || 'Lecturer'}</span>
            <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0" />
          </h1>
          <p className="text-slate-400 mt-1">
            Divine University Instructor Portal • DacBoard management panel.
          </p>
        </div>
        <div className="p-1 px-3 bg-indigo-900/30 rounded-xl border border-indigo-100 border-indigo-800/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
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
          <div className="bg-slate-900 border border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-5">Quick Management Controls</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActivePage('host_live')}
                className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl flex flex-col justify-between items-start gap-4 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 group text-left w-full"
              >
                <div className="p-2.5 bg-slate-900/10 rounded-xl">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Broadcast Session</span>
                  <span className="text-[10px] text-indigo-200 mt-0.5 block">Go live stream & webcam record</span>
                </div>
              </button>

              <button
                onClick={() => setActivePage('manage_marks')}
                className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800/50 rounded-2xl flex flex-col justify-between items-start gap-4 transition-all active:scale-95 text-left group w-full"
              >
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">Grade Book</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Update inline marks & weightages</span>
                </div>
              </button>

              <button
                onClick={() => setActivePage('manage_activities')}
                className="p-5 bg-slate-955 bg-slate-955 bg-slate-950 hover:bg-slate-900 border border-slate-800/50 rounded-2xl flex flex-col justify-between items-start gap-4 transition-all active:scale-95 text-left group w-full"
              >
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">Activities Creator</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Quizzes, webtests, exams builder</span>
                </div>
              </button>

              <button
                onClick={() => setActivePage('upload_resources')}
                className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800/50 rounded-2xl flex flex-col justify-between items-start gap-4 transition-all active:scale-95 text-left group w-full"
              >
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">Publish Notes</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Upload slides and past papers</span>
                </div>
              </button>
            </div>
          </div>

          {/* Courses / Modules Taught */}
          <div className="bg-slate-900 border border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Your Course Directory</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Click a course card to manage sequential modules</p>
              </div>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Course</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setSelectedCourseDetails(mod)}
                  className="bg-slate-950 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-200 hover:border-slate-700/60 transition-all flex items-start justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md">
                      {mod.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{mod.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{mod.schedule}</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold bg-slate-900 w-10 h-10 border border-slate-800 rounded-xl flex items-center justify-center shadow-sm">
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
          <div className="bg-slate-900 border border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>Pending Remark Requests</span>
            </h2>

            <div className="space-y-4">
              {pendingRemarks.map((rem, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{rem.student}</span>
                    <span className="text-slate-400 font-medium">{rem.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{rem.module} • {rem.assessment}</span>
                    <span className="font-bold text-rose-500">Score: {rem.currentMark}%</span>
                  </div>
                  <button
                    onClick={() => setActivePage('manage_marks')}
                    className="w-full mt-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-400 font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>View Gradebook</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent announcements list */}
          <div className="bg-slate-900 border border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Recent Announcements</h2>
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
                  className="border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-100 bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-md">
                      {ann.moduleCode}
                    </span>
                    <h3 className="font-bold text-slate-200 text-xs truncate">{ann.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 1. Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setShowCreateCourseModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-6">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Course Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ASE301"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Course Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Advanced Software Engineering"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Schedule</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mon, Wed • 10:00 AM"
                  value={newCourseSchedule}
                  onChange={(e) => setNewCourseSchedule(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateCourseModal(false)}
                  className="flex-1 py-3 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Syllabus / Sequential Module Provisioning Modal */}
      {selectedCourseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setSelectedCourseDetails(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <span className="px-2.5 py-1 bg-indigo-900/30 text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                {selectedCourseDetails.code}
              </span>
              <h3 className="text-2xl font-black text-white mt-2">{selectedCourseDetails.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Configure and build sequential syllabus modules for this course.</p>
            </div>

            {/* Sequential syllabus modules list */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 no-scrollbar">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Syllabus Sequence</h4>
              {selectedCourseDetails.syllabusModules ? (
                selectedCourseDetails.syllabusModules.split(';').map((modName, index) => (
                  <div key={index} className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between group transition-all hover:border-indigo-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{modName}</span>
                    </div>
                    <span className="text-[9px] bg-slate-900 text-slate-500 font-bold uppercase px-2 py-0.5 rounded">Active</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs italic">
                  No syllabus modules provisioned yet.
                </div>
              )}
            </div>

            {/* Add sequential module form */}
            <form onSubmit={handleAddSyllabusModule} className="border-t border-slate-850 pt-5 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Add Next Syllabus Module</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Module 3: Advanced Optimization"
                    value={newSyllabusModuleName}
                    onChange={(e) => setNewSyllabusModuleName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
