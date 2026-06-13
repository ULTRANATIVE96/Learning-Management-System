import React, { useState, useEffect } from 'react';
import { GraduationCap, Edit, Plus, Trash2, Check, AlertCircle, Save, Sparkles, X, Filter } from 'lucide-react';
import { api } from '../utils/api';

export default function ManageMarks() {
  const [assessments, setAssessments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('Mathematics 101');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
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

  useEffect(() => {
    async function loadData() {
      try {
        const [assessList, modList] = await Promise.all([
          api.getAssessments(),
          api.getModules()
        ]);
        setAssessments(assessList);
        setModules(modList);
      } catch (err) {
        console.error("Failed to load assessments", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

      const result = await api.updateAssessment(id, updatedData);
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
      await api.deleteAssessment(id);
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

      const result = await api.addAssessment(newAss);
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
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Assessment</span>
        </button>
      </div>

      {/* Module Selector Filter */}
      <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-900/30 text-indigo-400 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Filter Course</span>
            <span className="text-sm font-bold text-slate-300">Selected Module Gradebook</span>
          </div>
        </div>

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

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

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
                      {/* Name column */}
                      <td className="py-4 px-6 font-semibold text-slate-200 text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-full max-w-[200px]"
                          />
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
                            <button
                              onClick={() => handleEditClick(ass)}
                              className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:text-indigo-400 rounded-lg transition-all"
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
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 3, Test 2"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
