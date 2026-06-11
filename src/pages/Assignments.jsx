import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active'); // Active, Submitted, Graded
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsgId, setSelectedAsgId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchAssignments = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDownload = (id) => {
    window.open(api.getAssignmentBriefUrl(id), '_blank');
  };

  const triggerUpload = (id) => {
    setSelectedAsgId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedAsgId) return;

    setUploading(true);
    try {
      await api.uploadAssignment(selectedAsgId, file);
      await fetchAssignments(); // refresh list
      alert(`Assignment submitted successfully!`);
    } catch (err) {
      console.error("Failed to upload assignment", err);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setUploading(false);
      setSelectedAsgId(null);
      e.target.value = null; // reset input
    }
  };

  // Derive stats
  const todoCount = assignments.filter(a => a.status === 'Pending' || a.status === 'Late').length;
  const completedCount = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
  const overdueCount = assignments.filter(a => a.status === 'Late').length;

  // Filter list
  const filteredAssignments = assignments.filter(item => {
    // 1. Search term match
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Tab match
    if (activeTab === 'Active') {
      return item.status === 'Pending' || item.status === 'Late';
    } else if (activeTab === 'Submitted') {
      return item.status === 'Submitted';
    } else if (activeTab === 'Graded') {
      return item.status === 'Graded';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assignments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Track your submissions and upcoming academic deadlines.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => {
              // Submit the first pending assignment
              const firstPending = assignments.find(a => a.status === 'Pending' || a.status === 'Late');
              if (firstPending) {
                triggerUpload(firstPending.id);
              } else {
                alert("No pending assignments found!");
              }
            }}
            className="btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            <Upload className="w-4 h-4" />
            Submit New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">To Do</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {String(todoCount).padStart(2, '0')}
              </h4>
            </div>
          </div>
        </div>
        <div className="glass-card bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Completed</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {String(completedCount).padStart(2, '0')}
              </h4>
            </div>
          </div>
        </div>
        <div className="glass-card bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Overdue</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {String(overdueCount).padStart(2, '0')}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="p-4 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-slate-800 flex items-center gap-3 animate-pulse">
          <Upload className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-bold">Uploading file to Spring Boot backend...</span>
        </div>
      )}

      <div className="glass-card p-0 overflow-hidden border-slate-200/50 dark:border-slate-800/50">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">All Assessments</span>
          </div>
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {['Active', 'Submitted', 'Graded'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  tab === activeTab ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              No assignments found in this section.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/30 dark:bg-slate-900/30">
                  <th className="px-8 py-5">Assessment Name</th>
                  <th className="px-8 py-5">Module</th>
                  <th className="px-8 py-5">Due Date</th>
                  <th className="px-8 py-5">Weight</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.submissionFileName ? `Submitted file: ${item.submissionFileName}` : `ID: #ASG-${item.id}290`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-slate-500">{item.module}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {item.dueDate}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500">{item.weight}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                        item.status === 'Submitted' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                        item.status === 'Late' ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                        item.status === 'Graded' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" :
                        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      )}>
                        {item.status}
                      </span>
                      {item.mark && <span className="ml-2 text-sm font-black text-indigo-600">{item.mark}</span>}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" 
                          title="Download Brief"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (item.status === 'Submitted' || item.status === 'Graded') {
                              alert(`This assignment has already been submitted.`);
                            } else {
                              triggerUpload(item.id);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-600/20 group/btn"
                        >
                          {item.status === 'Submitted' || item.status === 'Graded' ? 'View' : 'Upload'}
                          <ChevronRight className="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

