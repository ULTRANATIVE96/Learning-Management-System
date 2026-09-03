import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Layers, CheckCircle, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../utils/api';

export default function StudentCourseBrowser({ user }) {
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);

  const fetchData = async () => {
    try {
      const [allCourses, myApps] = await Promise.all([
        api.getAllCourses(),
        api.getStudentApplications(user.username)
      ]);
      setCourses(allCourses || []);
      setApplications(myApps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApply = async (courseId, moduleId) => {
    try {
      await api.applyForCourse({
        studentUsername: user.username,
        courseId: courseId,
        moduleId: moduleId // if null, applying for full course
      });
      alert("Application submitted successfully!");
      fetchData(); // Refresh applications
    } catch (err) {
      alert("Failed to submit application");
    }
  };

  const getApplicationStatus = (courseId, moduleId) => {
    // Find if there's an application for this specific course and module
    const app = applications.find(a => 
      a.course.id === courseId && 
      (moduleId ? a.module?.id === moduleId : !a.module)
    );
    return app ? app.status : null; // PENDING, ACCEPTED, REJECTED, or null
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">Rejected</span>;
      default:
        return null;
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Course Browser</h1>
          <p className="text-sm font-bold text-slate-400 mt-2">Discover and apply for courses and modules.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="glass-card py-16 text-center border border-slate-800/50 border-dashed">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredCourses.map(course => {
            const courseStatus = getApplicationStatus(course.id, null);
            const isExpanded = expandedCourse === course.id;
            
            return (
              <div key={course.id} className="glass-card border border-slate-800 hover:border-indigo-500/30 transition-all duration-300">
                <div 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{course.name}</h2>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">{course.code}</span>
                      {getStatusBadge(courseStatus)}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 md:line-clamp-1">{course.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs text-slate-400 font-bold">Lecturer: {course.owner?.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{course.modules?.length || 0} Modules</p>
                    </div>
                    
                    {!courseStatus ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleApply(course.id, null); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Apply for Course
                      </button>
                    ) : (
                      <div className="w-[140px] text-center" /> // Spacer for alignment
                    )}
                    
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Modules in this Course
                    </h3>
                    
                    {(!course.modules || course.modules.length === 0) ? (
                      <p className="text-sm text-slate-500 italic ml-6">No modules available for this course yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.modules.map(module => {
                          const modStatus = getApplicationStatus(course.id, module.id);
                          return (
                            <div key={module.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                              <div className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-200">{module.name}</h4>
                                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{module.code}</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {getStatusBadge(modStatus)}
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  {/* Just a placeholder info */}
                                  Standard Module
                                </span>
                                {!modStatus && !courseStatus && (
                                  <button 
                                    onClick={() => handleApply(course.id, module.id)}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Apply
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
