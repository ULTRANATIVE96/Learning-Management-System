import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function CourseApplications({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getOwnedCourses(user.username);
        setCourses(data || []);
        if (data && data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedCourse) return;
      try {
        const data = await api.getCourseApplications(selectedCourse);
        setApplications(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApplications();
  }, [selectedCourse]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const fb = feedback[appId] || '';
      await api.updateApplicationStatus(appId, status, fb);
      alert(`Application ${status.toLowerCase()}!`);
      // Refresh applications
      const data = await api.getCourseApplications(selectedCourse);
      setApplications(data || []);
    } catch (err) {
      alert("Failed to update application");
    }
  };

  const handleFeedbackChange = (appId, val) => {
    setFeedback(prev => ({ ...prev, [appId]: val }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'PENDING');
  const pastApps = applications.filter(a => a.status !== 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Applications</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Review and manage course applications.</p>
        </div>
        <div className="w-full sm:w-auto min-w-[200px]">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {courses.length === 0 ? (
              <option value="">No courses available</option>
            ) : (
              courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))
            )}
          </select>
        </div>
      </div>

      {!selectedCourse ? (
        <div className="glass-card py-16 text-center border border-slate-800/50 border-dashed">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Courses Created</h3>
          <p className="text-sm text-slate-400">You need to create a course first to receive applications.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Pending Applications ({pendingApps.length})</h2>
            {pendingApps.length === 0 ? (
              <div className="glass-card py-12 text-center bg-slate-900/30">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pending applications for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApps.map(app => (
                  <div key={app.id} className="glass-card flex flex-col hover-scale">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
                        <img src={app.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.student?.username}`} alt="Student" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold truncate">{app.student?.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.student?.username}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 flex-1">
                      <p className="text-xs text-slate-400 mb-2">
                        Applied for: <strong className="text-slate-300">{app.module ? app.module.name : 'Full Course'}</strong>
                      </p>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 absolute top-2.5 left-3 text-slate-500" />
                        <textarea 
                          placeholder="Feedback (optional)" 
                          value={feedback[app.id] || ''}
                          onChange={(e) => handleFeedbackChange(app.id, e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-16"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                        className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Past Applications</h2>
            {pastApps.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No past applications.</p>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {pastApps.map(app => (
                        <tr key={app.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium text-slate-300">{app.student?.name}</td>
                          <td className="px-4 py-3 text-slate-400">{app.module ? app.module.name : 'Full Course'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                              app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-xs">{app.feedback || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
