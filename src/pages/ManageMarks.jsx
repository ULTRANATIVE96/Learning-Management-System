import React, { useState, useEffect } from 'react';
import { GraduationCap, Edit, Plus, Trash2, Check, AlertCircle, Save, Sparkles, X, Filter, Lock, TrendingUp, Award } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

export default function ManageMarks({ user }) {
  const [assessments, setAssessments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('Mathematics 101');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Student selector & Group Authorization states
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [lecturerInfo, setLecturerInfo] = useState(user);

  // Inline editing state
  const [editId, setEditId] = useState(null);
  const [editMark, setEditMark] = useState('');
  const [editType, setEditType] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  // Add new assessment modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('');
  const [newWeight, setNewWeight] = useState('10%');
  const [newMark, setNewMark] = useState('');
  const [newDate, setNewDate] = useState('');

  const lecturerName = user?.name || 'Dr. Andrea Vine';

  useEffect(() => {
    async function loadData() {
      try {
        const [modList, studList, lectList] = await Promise.all([
          api.getModules(),
          api.getStudents(),
          api.getLecturers()
        ]);
        setModules(modList);
        setStudents(studList);

        const currentLecturerObj = lectList.find(l => l.name === lecturerName || l.username === user?.username);
        if (currentLecturerObj) {
          setLecturerInfo(currentLecturerObj);
        }

        if (studList.length > 0) {
          const allowed = currentLecturerObj?.groupList
            ? studList.filter(s => currentLecturerObj.groupList.includes(s.group))
            : studList;
          const firstStudentVal = allowed.length > 0 
            ? (allowed[0].username || allowed[0].name) 
            : (studList[0].username || studList[0].name);
          setSelectedStudent(firstStudentVal);
          const assessList = await api.getAssessments(firstStudentVal);
          setAssessments(assessList);
        }
      } catch (err) {
        console.error("Failed to load grade book data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lecturerName]);

  // Load assessments whenever student changes
  useEffect(() => {
    if (!selectedStudent) return;
    async function loadStudentAssessments() {
      try {
        setLoading(true);
        const assessList = await api.getAssessments(selectedStudent);
        setAssessments(assessList);
      } catch (err) {
        console.error("Failed to load assessments for student " + selectedStudent, err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentAssessments();
  }, [selectedStudent]);

  const selectedModDetails = modules.find(m => m.name === selectedModule);
  const isLecturerInCharge = selectedModDetails ? selectedModDetails.lecturer === lecturerName : false;

  const selectedStudentObj = students.find(s => s.username === selectedStudent || s.name === selectedStudent);
  const studentGroup = selectedStudentObj ? selectedStudentObj.group : 'Group A';
  const isStudentInGroupList = lecturerInfo?.groupList ? lecturerInfo.groupList.includes(studentGroup) : true;
  const canEditMarks = isLecturerInCharge && isStudentInGroupList;

  const handleEditClick = (ass) => {
    setEditId(ass.id);
    setEditMark(ass.mark !== null ? ass.mark : '');
    setEditType(ass.type);
    setEditWeight(ass.weight);
    setEditDate(ass.date);
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedData = {
        type: editType,
        module: selectedModule,
        date: editDate,
        mark: editMark === '' ? null : Number(editMark),
        weight: editWeight
      };

      const result = await api.updateAssessment(id, updatedData, selectedStudent);
      setAssessments(assessments.map(a => a.id === id ? result : a));
      setEditId(null);
      showTemporaryMessage("Grade updated successfully!");
    } catch (err) {
      alert("Failed to update grade: " + err.message);
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;

    try {
      await api.deleteAssessment(id, selectedStudent);
      setAssessments(assessments.filter(a => a.id !== id));
      showTemporaryMessage("Assessment deleted successfully.");
    } catch (err) {
      alert("Failed to delete assessment: " + err.message);
    }
  };

  const handleAddAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!newType || !newDate) {
      alert("Please fill in assessment type and date");
      return;
    }

    try {
      const newAss = {
        type: newType,
        module: selectedModule,
        date: newDate,
        mark: newMark === '' ? null : Number(newMark),
        weight: newWeight
      };

      const result = await api.addAssessment(newAss, selectedStudent);
      setAssessments([...assessments, result]);
      setShowAddModal(false);
      setNewType('');
      setNewMark('');
      setNewDate('');
      showTemporaryMessage("New assessment added!");
    } catch (err) {
      alert("Failed to add assessment: " + err.message);
    }
  };

  const showTemporaryMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredAssessments = assessments.filter(a => a.module === selectedModule);

  const parseWeight = (w) => {
    if (!w) return 0;
    const parsed = parseFloat(w.toString().replace('%', ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const gradedAssessments = filteredAssessments.filter(a => a.mark !== null);
  const totalWeight = gradedAssessments.reduce((sum, a) => sum + parseWeight(a.weight), 0);
  const predicateMark = totalWeight > 0 
    ? Math.round(gradedAssessments.reduce((sum, a) => sum + (a.mark * parseWeight(a.weight)), 0) / totalWeight) 
    : null;

  const qualificationStatus = predicateMark !== null
    ? (predicateMark >= 40 ? 'QUALIFIED' : 'DUE (Did Not Qualify)')
    : 'DUE (Did Not Qualify)';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Student Marks</h1>
          <p className="text-slate-400 mt-1">
            Update, insert, and delete module grades and assessment weightages.
          </p>
        </div>
        <button
          onClick={() => {
            if (!canEditMarks) {
              if (!isLecturerInCharge) {
                alert("🔒 Access Denied: Only the lecturer in charge of this module can add assessments.");
              } else {
                alert(`🔒 Access Denied: Student is in ${studentGroup}, which is not in your assigned Group List.`);
              }
              return;
            }
            setShowAddModal(true);
          }}
          disabled={!canEditMarks}
          className={cn(
            "px-5 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 self-start md:self-auto",
            canEditMarks 
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20" 
              : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none"
          )}
        >
          <Plus className="w-5 h-5" />
          <span>Add Assessment</span>
        </button>
      </div>

      {/* Read-Only Warning Banner (Lecturer not in charge) */}
      {!isLecturerInCharge && selectedModDetails && (
        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-5 rounded-2xl flex items-start gap-3.5 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-white block">🔒 Read-only Gradebook Mode</span>
            <span className="text-slate-400 text-xs mt-1 block">
              This module is taught by <span className="font-bold text-amber-400">{selectedModDetails.lecturer}</span>. 
              Only the lecturer in charge has authorization to insert, modify, or delete marks for students enrolled in this course.
            </span>
          </div>
        </div>
      )}

      {/* Read-Only Warning Banner (Student not in Group List) */}
      {isLecturerInCharge && !isStudentInGroupList && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-450 p-5 rounded-2xl flex items-start gap-3.5 text-sm animate-in fade-in duration-300">
          <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-white block">🔒 Grading Locked (Out of Group List)</span>
            <span className="text-slate-400 text-xs mt-1 block leading-relaxed">
              This student belongs to <span className="font-bold text-rose-400">{studentGroup}</span>. 
              Your grading permissions only allow editing students under your Group List: <span className="font-bold text-indigo-400">{lecturerInfo?.groupList?.join(', ') || 'No Groups'}</span>.
            </span>
          </div>
        </div>
      )}

      {/* Module & Student Selector Filters */}
      <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-900/30 text-indigo-400 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Configure Filters</span>
            <span className="text-sm font-bold text-slate-300">Gradebook Module & Student Selection</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Module/Subject</label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setEditId(null);
              }}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setEditId(null);
              }}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            >
              {(lecturerInfo?.groupList
                ? students.filter(s => lecturerInfo.groupList.includes(s.group))
                : students
              ).map((s) => (
                <option key={s.id || s.name} value={s.username || s.name}>
                  {s.name} ({s.group || 'Group A'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Predicate Mark & Exam Qualification Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800/50 rounded-2xl p-6 shadow-lg animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Running Predicate Mark</span>
            <span className="text-3xl font-extrabold text-white">
              {predicateMark !== null ? `${predicateMark}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Calculated from {gradedAssessments.length} graded task{gradedAssessments.length === 1 ? '' : 's'} (Total Weight: {totalWeight}%)
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-left md:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Exam Qualification Status</span>
            <span className="text-xs text-slate-500 mt-1 block">Requires minimum 40% Year Mark</span>
          </div>
          <div>
            {predicateMark !== null && predicateMark >= 40 ? (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> QUALIFIED
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" /> DUE (Did Not Qualify)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-slate-900 border border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">Assessment Name</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Grade Mark (%)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-12 h-12 text-slate-300 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-500">No Assessment Records Found</p>
                    <p className="text-xs text-slate-400 mt-1">Add a new grade row for {selectedModule} using the button above.</p>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((ass) => {
                  const isEditing = editId === ass.id;
                  return (
                    <tr key={ass.id} className="hover:bg-slate-950/50 hover:bg-slate-950/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200 text-sm">
                        {isEditing ? (
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-full max-w-[200px] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            {!["Quiz", "WebTest", "Online Assessment"].includes(editType) && (
                              <option value={editType}>{editType}</option>
                            )}
                            <option value="Quiz">Quiz</option>
                            <option value="WebTest">WebTest</option>
                            <option value="Online Assessment">Online Assessment</option>
                          </select>
                        ) : ass.type}
                      </td>

                      {/* Date column */}
                      <td className="py-4 px-6 text-slate-400 text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-full max-w-[150px]"
                          />
                        ) : ass.date}
                      </td>

                      {/* Weight column */}
                      <td className="py-4 px-6 text-slate-400 text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-full max-w-[80px]"
                          />
                        ) : ass.weight}
                      </td>

                      {/* Mark column */}
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editMark}
                              onChange={(e) => setEditMark(e.target.value)}
                              placeholder="Pending"
                              className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-20 text-center font-bold"
                            />
                            <span className="text-slate-400 font-bold text-sm">%</span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs ${
                            ass.mark === null 
                              ? 'bg-slate-800 text-slate-500' 
                              : ass.mark >= 75 
                              ? 'bg-emerald-500/10 text-emerald-600 text-emerald-400' 
                              : ass.mark < 50 
                              ? 'bg-rose-500/10 text-rose-600 text-rose-400' 
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {ass.mark !== null ? `${ass.mark}%` : 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Actions column */}
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(ass.id)}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                              title="Save Changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {canEditMarks ? (
                              <>
                                <button
                                  onClick={() => handleEditClick(ass)}
                                  className="p-1.5 hover:bg-slate-800 text-slate-550 text-slate-500 hover:text-indigo-400 rounded-lg transition-all"
                                  title="Edit Grade"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssessment(ass.id)}
                                  className="p-1.5 hover:bg-rose-50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span 
                                title={!isLecturerInCharge ? "Only the lecturer in charge of this module can edit marks." : `Student is in ${studentGroup}, which is not in your assigned Group List.`}
                                className="text-[10px] bg-slate-950 text-slate-550 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-855 border-slate-850 flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-help"
                              >
                                <Lock className="w-3 h-3 text-slate-500" /> Read-Only
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assessment Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>New Assessment row</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssessmentSubmit} className="space-y-4">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assessment Type / Name</label>
                <select
                  required
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="Quiz">Quiz</option>
                  <option value="WebTest">WebTest</option>
                  <option value="Online Assessment">Online Assessment</option>
                </select>
              </div>

              {/* Weight & Mark side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Weightage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15%"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Score (%) (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Pending"
                    value={newMark}
                    onChange={(e) => setNewMark(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
