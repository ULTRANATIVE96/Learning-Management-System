import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  User, 
  BookOpen, 
  Clock, 
  Search, 
  Filter, 
  Plus,
  ChevronRight,
  Book,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLecturer, setNewLecturer] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  useEffect(() => {
    async function loadModules() {
      try {
        const data = await api.getModules();
        setModules(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    try {
      const colors = ['text-blue-600', 'text-indigo-600', 'text-purple-600', 'text-green-600', 'text-orange-600'];
      const bgColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600'];
      const icons = ['Σ', '💻', '⚛️', '📊', '✍️', '🧪', '🧬', '⚙️'];
      
      const randomIndex = Math.floor(Math.random() * colors.length);
      const randomIconIndex = Math.floor(Math.random() * icons.length);

      const enrolled = await api.enrollModule({
        code: newCode.toUpperCase(),
        name: newName,
        lecturer: newLecturer || 'Dr. TBD Lecturer',
        schedule: newSchedule || 'Mon, Wed • 12:00 PM',
        progress: 0,
        color: colors[randomIndex],
        bgColor: bgColors[randomIndex],
        icon: icons[randomIconIndex]
      });

      setModules(prev => [...prev, enrolled]);
      setShowModal(false);
      setNewCode('');
      setNewName('');
      setNewLecturer('');
      setNewSchedule('');
    } catch (err) {
      console.error("Failed to enroll module", err);
    }
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Modules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Manage your current semester workload and tracking.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search modules..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Enroll in Module
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div 
            key={module.id} 
            className="glass-card hover-scale group border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
          >
            <div className="flex items-start justify-between mb-8">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/5 relative overflow-hidden group-hover:scale-110 transition-transform duration-500")}>
                <div className={cn("absolute inset-0 opacity-10", module.bgColor)} />
                <span className="relative z-10">{module.icon}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {module.code}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
              {module.name}
            </h3>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">{module.lecturer}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium">{module.schedule}</span>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Syllabus Progress</span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{module.progress}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/20 dark:border-slate-700/20">
                <div 
                  className={cn("h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]", module.bgColor)}
                  style={{ width: `${module.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all">
                <Book className="w-4 h-4" />
                Resources
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 group-hover:gap-3">
                Enter
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => setShowModal(true)}
          className="glass-card border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12 hover:border-indigo-400 transition-all group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
            <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Add New Module</h4>
          <p className="text-sm text-slate-400 mt-2">Expand your semester catalog</p>
        </div>
      </div>

      {/* Enroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Enroll in new Module</h3>
            
            <form onSubmit={handleEnroll} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Module Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. MATH201"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Module Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Calculus II"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lecturer Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Robert Smith"
                  value={newLecturer}
                  onChange={(e) => setNewLecturer(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lecture Schedule</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mon, Wed • 10:00 AM"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

