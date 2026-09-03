import React, { useState, useEffect } from 'react';
import { Book, Plus, Users, Layout, Activity, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function ManageCourses({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Course State
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  
  // Create Module State
  const [showCreateModule, setShowCreateModule] = useState(null); // courseId
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleCode, setNewModuleCode] = useState('');
  
  // Assign Lecturer State
  const [showAssignLecturer, setShowAssignLecturer] = useState(null); // moduleId
  const [assignLecturerId, setAssignLecturerId] = useState('');
  const [assignGroupList, setAssignGroupList] = useState('');

  const fetchCourses = async () => {
    try {
      const data = await api.getOwnedCourses(user.username);
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse({
        name: newCourseName,
        code: newCourseCode,
        description: newCourseDescription,
        owner: { username: user.username }
      });
      setShowCreateCourse(false);
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseDescription('');
      fetchCourses();
    } catch (err) {
      alert("Failed to create course");
    }
  };

  const handleCreateModule = async (e, courseId) => {
    e.preventDefault();
    try {
      await api.createModule(courseId, {
        name: newModuleName,
        code: newModuleCode,
        // Provide some defaults since they were required in the original Module model
        progress: 0,
        color: "text-indigo-600",
        bgColor: "bg-indigo-600",
        icon: "📚",
        schedule: "TBD",
        outline: ""
      });
      setShowCreateModule(null);
      setNewModuleName('');
      setNewModuleCode('');
      fetchCourses();
    } catch (err) {
      alert("Failed to create module");
    }
  };

  const handleAssignLecturer = async (e, moduleId) => {
    e.preventDefault();
    try {
      await api.assignLecturerToModule({
        moduleId: moduleId,
        lecturerId: assignLecturerId,
        groupList: assignGroupList
      });
      setShowAssignLecturer(null);
      setAssignLecturerId('');
      setAssignGroupList('');
      alert("Invitation sent to lecturer!");
    } catch (err) {
      alert("Failed to assign lecturer. Ensure the Lecturer ID is correct.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manage Courses</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Create courses and modules, and assign lecturers.</p>
        </div>
        <button 
          onClick={() => setShowCreateCourse(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {showCreateCourse && (
        <div className="glass-card mb-8 border border-indigo-500/30">
          <h2 className="text-lg font-bold text-white mb-4">New Course Details</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Course Name</label>
                <input required type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Bachelor of Science in IT" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Course Code</label>
                <input required type="text" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., BSCIT" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea required value={newCourseDescription} onChange={e => setNewCourseDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Course description..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateCourse(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl">Create</button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="glass-card py-16 text-center border border-slate-800/50 border-dashed">
          <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Courses Created</h3>
          <p className="text-sm text-slate-400">You haven't created any courses yet. Click "Create Course" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course.id} className="glass-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{course.name}</h2>
                    <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">{course.code}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{course.description}</p>
                </div>
                <button 
                  onClick={() => setShowCreateModule(showCreateModule === course.id ? null : course.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Module
                </button>
              </div>

              {showCreateModule === course.id && (
                <form onSubmit={(e) => handleCreateModule(e, course.id)} className="bg-slate-900/50 p-4 rounded-xl mb-6 border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Module Name</label>
                      <input required type="text" value={newModuleName} onChange={e => setNewModuleName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g., Mathematics 101" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Module Code</label>
                      <input required type="text" value={newModuleCode} onChange={e => setNewModuleCode(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g., MATH101" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowCreateModule(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg">Save Module</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Modules in this Course</h3>
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map(module => (
                    <div key={module.id} className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-white font-bold">{module.name} <span className="text-slate-400 text-sm ml-2">({module.code})</span></h4>
                        </div>
                        <button 
                          onClick={() => setShowAssignLecturer(showAssignLecturer === module.id ? null : module.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Assign Lecturer
                        </button>
                      </div>

                      {showAssignLecturer === module.id && (
                        <form onSubmit={(e) => handleAssignLecturer(e, module.id)} className="bg-slate-950 p-4 rounded-xl mb-4 border border-slate-800 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lecturer ID</label>
                              <input required type="text" value={assignLecturerId} onChange={e => setAssignLecturerId(e.target.value)} className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g., jbd-123" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Group List</label>
                              <input required type="text" value={assignGroupList} onChange={e => setAssignGroupList(e.target.value)} className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g., Group A, Group B" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAssignLecturer(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                            <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg">Send Invite</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No modules added yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
