import React, { useState, useEffect } from 'react';
import { BookOpen, Users, UserCheck, Save, Sparkles, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

export default function ManageGroupsSubjects({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects'); // subjects, students, lecturers_groups
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Local state copies for edits
  const [moduleLecturers, setModuleLecturers] = useState({});
  const [studentGroups, setStudentGroups] = useState({});
  const [lecturerGroups, setLecturerGroups] = useState({});

  const availableGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    async function loadData() {
      try {
        const [lectList, studList, modList] = await Promise.all([
          api.getLecturers(),
          api.getStudents(),
          api.getModules()
        ]);
        setLecturers(lectList);
        setStudents(studList);
        setModules(modList);

        // Prepopulate editing maps
        const modMap = {};
        modList.forEach(m => {
          modMap[m.code] = m.lecturer;
        });
        setModuleLecturers(modMap);

        const studMap = {};
        studList.forEach(s => {
          studMap[s.id || s.name] = s.group || 'Group A';
        });
        setStudentGroups(studMap);

        const lectMap = {};
        lectList.forEach(l => {
          lectMap[l.name] = l.groupList || [];
        });
        setLecturerGroups(lectMap);
      } catch (err) {
        console.error("Failed to load academic configs", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showFeedback = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSaveSubjects = async () => {
    try {
      setLoading(true);
      // For each module, update the lecturer mapping in the db
      for (const m of modules) {
        const newLecturer = moduleLecturers[m.code];
        if (newLecturer && newLecturer !== m.lecturer) {
          await api.updateLecturerSubjects(newLecturer, [m.code]);
        }
      }
      // Reload modules
      const modList = await api.getModules();
      setModules(modList);
      showFeedback("Subject lecturers updated successfully!");
    } catch (err) {
      showFeedback("Failed to update subjects: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudents = async () => {
    try {
      setLoading(true);
      for (const s of students) {
        const sKey = s.id || s.name;
        const newGroup = studentGroups[sKey];
        if (newGroup && newGroup !== s.group) {
          await api.updateStudentGroup(sKey, newGroup);
        }
      }
      const studList = await api.getStudents();
      setStudents(studList);
      showFeedback("Student groups mapped successfully!");
    } catch (err) {
      showFeedback("Failed to update student groups: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLecturerGroups = async () => {
    try {
      setLoading(true);
      for (const l of lecturers) {
        const groups = lecturerGroups[l.name] || [];
        await api.updateLecturerGroups(l.name, groups);
      }
      const lectList = await api.getLecturers();
      setLecturers(lectList);
      showFeedback("Lecturer group lists updated successfully!");
    } catch (err) {
      showFeedback("Failed to update group lists: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleLecturerGroup = (lecturerName, groupName) => {
    const current = lecturerGroups[lecturerName] || [];
    let updated;
    if (current.includes(groupName)) {
      updated = current.filter(g => g !== groupName);
    } else {
      updated = [...current, groupName];
    }
    setLecturerGroups({
      ...lecturerGroups,
      [lecturerName]: updated
    });
  };

  if (loading && lecturers.length === 0) {
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
            <span>Groups & Subjects Manager</span>
            <Sparkles className="w-6 h-6 text-indigo-500 shrink-0" />
          </h1>
          <p className="text-slate-400 mt-1">
            Assign instructors to modules, divide students into specific groups, and allocate group lists to lecturers.
          </p>
        </div>
      </div>

      {message && (
        <div className={cn(
          "border px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in",
          messageType === 'success' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {messageType === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('subjects')}
          className={cn(
            "py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
            activeTab === 'subjects' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Subject Assignments</span>
        </button>
        
        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            "py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
            activeTab === 'students' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Student Groups</span>
        </button>

        <button
          onClick={() => setActiveTab('lecturers_groups')}
          className={cn(
            "py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
            activeTab === 'lecturers_groups' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <UserCheck className="w-4.5 h-4.5" />
          <span>Lecturer Group Lists</span>
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="glass-card p-0 overflow-hidden border-slate-800/50">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div>
                <h3 className="text-base font-extrabold text-white">Subject-to-Instructor Assignments</h3>
                <p className="text-xs text-slate-400 mt-1">Allocate modules to their primary teaching lecturers.</p>
              </div>
              <button
                onClick={handleSaveSubjects}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-950/20 border-b border-slate-800">
                    <th className="px-8 py-5">Subject Code</th>
                    <th className="px-8 py-5">Subject Name</th>
                    <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5">Assigned Lecturer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modules.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-950/20 transition-all">
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-450 border border-slate-700/30 rounded text-xs font-black uppercase">
                          {m.code}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-slate-100">{m.name}</td>
                      <td className="px-8 py-6 text-sm text-slate-400">{m.schedule}</td>
                      <td className="px-8 py-6">
                        <select
                          value={moduleLecturers[m.code] || ''}
                          onChange={(e) => setModuleLecturers({
                            ...moduleLecturers,
                            [m.code]: e.target.value
                          })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="TBD Lecturer">TBD Lecturer</option>
                          {lecturers.map((l) => (
                            <option key={l.username} value={l.name}>{l.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="glass-card p-0 overflow-hidden border-slate-800/50">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div>
                <h3 className="text-base font-extrabold text-white">Student Group Configurator</h3>
                <p className="text-xs text-slate-400 mt-1">Organize student rosters into tutorial groups.</p>
              </div>
              <button
                onClick={handleSaveStudents}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-950/20 border-b border-slate-800">
                    <th className="px-8 py-5">Student Details</th>
                    <th className="px-8 py-5">Email Address</th>
                    <th className="px-8 py-5">Role Type</th>
                    <th className="px-8 py-5">Assigned Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((s) => {
                    const sKey = s.id || s.name;
                    return (
                      <tr key={sKey} className="hover:bg-slate-950/20 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-lg bg-slate-800" />
                            <span className="font-bold text-slate-100 text-sm">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-400">{s.email}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            s.role === 'Class Rep' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-450'
                          )}>
                            {s.role || 'Student'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <select
                            value={studentGroups[sKey] || 'Group A'}
                            onChange={(e) => setStudentGroups({
                              ...studentGroups,
                              [sKey]: e.target.value
                            })}
                            className="px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {availableGroups.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lecturers_groups' && (
        <div className="space-y-6">
          <div className="glass-card p-0 overflow-hidden border-slate-800/50">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div>
                <h3 className="text-base font-extrabold text-white">Lecturer Group List Authorization</h3>
                <p className="text-xs text-slate-400 mt-1">Assign student grading pools (groups list) to each instructor.</p>
              </div>
              <button
                onClick={handleSaveLecturerGroups}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-950/20 border-b border-slate-800">
                    <th className="px-8 py-5">Lecturer Details</th>
                    <th className="px-8 py-5">Email Address</th>
                    <th className="px-8 py-5">Group List Grading Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {lecturers.map((l) => (
                    <tr key={l.username} className="hover:bg-slate-950/20 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img src={l.avatar} alt={l.name} className="w-8 h-8 rounded-lg bg-slate-800" />
                          <span className="font-bold text-slate-100 text-sm">{l.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-400">{l.email}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap items-center gap-4">
                          {availableGroups.map((group) => {
                            const isChecked = (lecturerGroups[l.name] || []).includes(group);
                            return (
                              <label key={group} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-350">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleLecturerGroup(l.name, group)}
                                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                                />
                                <span>{group}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 p-5 rounded-2xl flex items-start gap-3.5 text-sm animate-in fade-in duration-300">
            <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-white block">Academic Segregation Policy Active</span>
              <span className="text-slate-400 text-xs mt-1 block leading-relaxed">
                By setting the group grading permissions, you limit which students each lecturer can view and grade. 
                If a student does not belong to a lecturer's assigned Group List, that lecturer is prohibited from inserting, editing, or deleting their performance assessments or marks in the grade book and online activities portal.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
