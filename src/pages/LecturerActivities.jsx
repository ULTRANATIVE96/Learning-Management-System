import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Award, 
  PlusCircle, 
  X, 
  BookOpen, 
  Activity, 
  Eye, 
  Send,
  UserCheck,
  CheckCircle2,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

export default function LecturerActivities({ user }) {
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('activities'); // activities, submissions
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [type, setType] = useState('Quiz'); // Quiz, Assessment, Webtest
  const [mode, setMode] = useState('Individual'); // Individual, Group Work
  const [duration, setDuration] = useState(20);
  const [totalMarks, setTotalMarks] = useState(20);
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState([]);

  // Question Builder Helper State
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('MCQ'); // MCQ, TF, Written
  const [qPoints, setQPoints] = useState(10);
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectAnswer, setQCorrectAnswer] = useState('');

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [lecturerInfo, setLecturerInfo] = useState(user);

  const lecturerName = user?.name || 'Dr. Andrea Vine';

  const loadData = async () => {
    try {
      setLoading(true);
      const [acts, subs, mods, studs, lects] = await Promise.all([
        api.getActivities(),
        api.getActivitySubmissions(),
        api.getModules(),
        api.getStudents(),
        api.getLecturers()
      ]);
      setActivities(acts.filter(a => a.createdBy === lecturerName));
      setSubmissions(subs);
      setModules(mods);
      setStudentsList(studs);

      const currentLecturerObj = lects.find(l => l.name === lecturerName || l.username === user?.username);
      if (currentLecturerObj) {
        setLecturerInfo(currentLecturerObj);
      }

      if (mods.length > 0 && !selectedModule) {
        setSelectedModule(mods[0].name);
      }
    } catch (err) {
      console.error("Failed to load lecturer activities data", err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentGroup = (sub) => {
    if (sub.mode === 'Group Work' && sub.groupName) {
      return sub.groupName;
    }
    const match = studentsList.find(s => String(s.username) === String(sub.username) || s.name === sub.studentName || String(s.id) === String(sub.username));
    return match ? match.group : 'Group A';
  };

  useEffect(() => {
    loadData();
  }, [lecturerName]);

  const handleAddQuestion = () => {
    if (!qText.trim()) {
      alert("Please enter question text");
      return;
    }

    let finalOptions = [];
    if (qType === 'MCQ') {
      finalOptions = qOptions.filter(o => o.trim() !== '');
      if (finalOptions.length < 2) {
        alert("Please provide at least 2 options for Multiple Choice questions.");
        return;
      }
      if (!qCorrectAnswer || !finalOptions.includes(qCorrectAnswer)) {
        alert("Correct Answer must match one of the options.");
        return;
      }
    } else if (qType === 'TF') {
      finalOptions = ['True', 'False'];
      if (qCorrectAnswer !== 'True' && qCorrectAnswer !== 'False') {
        alert("Correct Answer for True/False must be 'True' or 'False'.");
        return;
      }
    } else {
      // Written type question
      if (!qCorrectAnswer.trim()) {
        alert("Please specify a reference correct answer.");
        return;
      }
    }

    const newQuestion = {
      id: Date.now() + Math.random(),
      type: qType,
      text: qText,
      options: finalOptions,
      correctAnswer: qCorrectAnswer,
      points: Number(qPoints)
    };

    setQuestions([...questions, newQuestion]);

    // Reset helper state
    setQText('');
    setQPoints(10);
    setQOptions(['', '', '', '']);
    setQCorrectAnswer('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateActivitySubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      alert("Please fill in the title and due date");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question to the activity.");
      return;
    }

    const calculatedTotal = questions.reduce((sum, q) => sum + q.points, 0);

    const newActivityData = {
      title,
      module: selectedModule,
      type,
      mode,
      duration: Number(duration),
      totalMarks: calculatedTotal,
      dueDate,
      createdBy: lecturerName,
      status: 'Published',
      questions
    };

    try {
      setLoading(true);
      await api.createActivity(newActivityData);
      await loadData();
      
      // Reset form
      setTitle('');
      setType('Quiz');
      setMode('Individual');
      setDuration(20);
      setQuestions([]);
      setShowCreateForm(false);
      alert("Activity published successfully!");
    } catch (err) {
      alert("Failed to create activity: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGrading = (sub) => {
    setSelectedSubmission(sub);
    setGradingScore(sub.score !== null ? sub.score : '');
    setGradingFeedback(sub.feedback || '');
  };

  const handleSaveGrading = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    if (gradingScore === '' || isNaN(gradingScore)) {
      alert("Please enter a valid numeric grade.");
      return;
    }

    const scoreNum = Number(gradingScore);
    if (scoreNum < 0 || scoreNum > selectedSubmission.totalMarks) {
      alert(`Score must be between 0 and ${selectedSubmission.totalMarks}`);
      return;
    }

    try {
      setLoading(true);
      await api.gradeActivitySubmission(
        selectedSubmission.id,
        scoreNum,
        gradingFeedback
      );
      await loadData();
      setSelectedSubmission(null);
      alert("Submission graded successfully!");
    } catch (err) {
      alert("Failed to save grading: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get submission stats for lecturer's activities
  const activityIds = activities.map(a => a.id);
  const relevantSubmissions = submissions.filter(s => activityIds.includes(s.activityId));
  const submissionsCount = relevantSubmissions.length;
  const averageScore = submissionsCount > 0
    ? Math.round((relevantSubmissions.reduce((sum, s) => sum + (s.score / s.totalMarks), 0) / submissionsCount) * 100)
    : 0;

  const selectedSubGroup = selectedSubmission ? getStudentGroup(selectedSubmission) : '';
  const selectedSubAllowed = selectedSubmission 
    ? (lecturerInfo?.groupList ? lecturerInfo.groupList.includes(selectedSubGroup) : true)
    : true;

  if (loading && !selectedSubmission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Manage Activities</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Create, view, and grade time-bound webtests, quizzes, and group evaluations.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setQuestions([]);
          }}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 self-start md:self-auto"
        >
          {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showCreateForm ? 'Cancel Creation' : 'Create Activity'}</span>
        </button>
      </div>

      {/* Stats Board */}
      {!showCreateForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card flex items-center gap-4 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Activities</p>
              <h4 className="text-2xl font-black text-white">{activities.length}</h4>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Submissions</p>
              <h4 className="text-2xl font-black text-white">{submissionsCount}</h4>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Score</p>
              <h4 className="text-2xl font-black text-white">{averageScore}%</h4>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher (only show if not creating) */}
      {!showCreateForm && (
        <div className="flex border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('activities')}
            className={cn(
              "relative py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
              activeTab === 'activities' 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <span>Published Activities</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-450">{activities.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={cn(
              "relative py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
              activeTab === 'submissions' 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <span>Submissions & Grading</span>
            {submissionsCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                {submissionsCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ==========================================
          CREATOR FORM & QUESTION BUILDER
          ========================================== */}
      {showCreateForm && (
        <form onSubmit={handleCreateActivitySubmit} className="glass-card space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>Create New Academic Activity</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure specification details and construct the questions stack.</p>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Activity Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Calculus Derivatives Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-955 bg-slate-905 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 animate-in"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Module / Subject</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 outline-none"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4 col-span-1 md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Activity Format</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 outline-none"
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Webtest">Webtest</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Submission Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 outline-none"
                >
                  <option value="Individual">Individual Work</option>
                  <option value="Group Work">Group Work</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Duration (Min)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC QUESTION BUILDER */}
          <div className="border-t border-slate-800 pt-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Question Builder</h4>
              <p className="text-xs text-slate-400 mt-0.5">Build MCQ, True/False, or written response questions dynamically.</p>
            </div>

            {/* Question Entry Form */}
            <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Question Format</label>
                  <select
                    value={qType}
                    onChange={(e) => {
                      setQType(e.target.value);
                      setQCorrectAnswer('');
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TF">True / False</option>
                    <option value="Written">Short Written Response</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Question Text</label>
                  <input
                    type="text"
                    placeholder="Type the question content..."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Options Builder (only for MCQ) */}
              {qType === 'MCQ' && (
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Multiple Choice Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-bold">{String.fromCharCode(65 + idx)})</span>
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...qOptions];
                            newOpts[idx] = e.target.value;
                            setQOptions(newOpts);
                          }}
                          className="flex-1 px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Correct Answer / Reference Key</label>
                  {qType === 'TF' ? (
                    <select
                      value={qCorrectAnswer}
                      onChange={(e) => setQCorrectAnswer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="">Select option</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : qType === 'MCQ' ? (
                    <select
                      value={qCorrectAnswer}
                      onChange={(e) => setQCorrectAnswer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="">Select correct option text</option>
                      {qOptions.filter(o => o.trim() !== '').map((o, idx) => (
                        <option key={idx} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Stack is LIFO, Queue is FIFO"
                      value={qCorrectAnswer}
                      onChange={(e) => setQCorrectAnswer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Point Weight</label>
                  <input
                    type="number"
                    min="1"
                    value={qPoints}
                    onChange={(e) => setQPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-indigo-500" />
                <span>Add Question to List</span>
              </button>
            </div>

            {/* Questions Array List Preview */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Added Questions Array ({questions.length})</h5>
              {questions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No questions added yet. Use the question builder above.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-955 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                          Question {idx + 1} • {q.type} • Points: {q.points}
                        </p>
                        <p className="text-sm font-bold text-white mt-1">{q.text}</p>
                        {q.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx} className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-[10px] text-slate-400">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          Correct Key: <span className="text-emerald-400 font-bold">{q.correctAnswer}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-800 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Publish Activity
            </button>
          </div>
        </form>
      )}

      {/* ==========================================
          ACTIVITIES LIST TAB
          ========================================== */}
      {!showCreateForm && activeTab === 'activities' && (
        <div className="glass-card p-0 overflow-hidden border-slate-800/50">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-955 bg-slate-950/30">
            <h3 className="text-base font-extrabold text-white">Your Published Activities</h3>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
              {lecturerName}
            </span>
          </div>

          <div className="overflow-x-auto">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-400">No Published Activities Found</p>
                <p className="text-xs text-slate-500 mt-1">Create and publish tests using the button above.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-950/20 border-b border-slate-800">
                    <th className="px-8 py-5">Title</th>
                    <th className="px-8 py-5">Module</th>
                    <th className="px-8 py-5">Format</th>
                    <th className="px-8 py-5">Mode</th>
                    <th className="px-8 py-5">Due Date</th>
                    <th className="px-8 py-5">Marks</th>
                    <th className="px-8 py-5">Duration</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activities.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-950/40 transition-all">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-100">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Questions count: {item.questions?.length || 0}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-400">{item.module}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          item.type === 'Quiz' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          item.type === 'Webtest' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        )}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border",
                          item.mode === 'Group Work' 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        )}>
                          {item.mode || 'Individual'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-450 font-semibold">
                        {item.dueDate}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-xs font-bold text-indigo-400">
                          {item.totalMarks} Pts
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-400 font-semibold">
                        {item.duration} Min
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => alert(`Activity: ${item.title}\nQuestions: ${item.questions.map((q, i) => `\n${i+1}. ${q.text}`).join('')}`)}
                          className="p-2 text-slate-550 hover:text-indigo-400 hover:bg-indigo-50 hover:bg-indigo-900/30 rounded-lg transition-all"
                          title="Preview Questions"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          SUBMISSIONS & GRADING TAB
          ========================================== */}
      {!showCreateForm && activeTab === 'submissions' && (
        <div className="glass-card p-0 overflow-hidden border-slate-800/50">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
            <h3 className="text-base font-extrabold text-white">Student Submissions Log</h3>
            <span className="text-xs text-slate-400 font-semibold">Ready to Grade / Evaluated</span>
          </div>

          <div className="overflow-x-auto">
            {relevantSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <UserCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-400">No Submissions Logged</p>
                <p className="text-xs text-slate-500 mt-1">Students have not completed any activities yet.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-950/20 border-b border-slate-800">
                    <th className="px-8 py-5">Student / Group Name</th>
                    <th className="px-8 py-5">Activity Title</th>
                    <th className="px-8 py-5">Work Format</th>
                    <th className="px-8 py-5">Sub Date</th>
                    <th className="px-8 py-5">Grade / Marks</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {relevantSubmissions.map((sub) => {
                    const activity = activities.find(a => a.id === sub.activityId);
                    const studentGroup = getStudentGroup(sub);
                    const isAllowedToGrade = lecturerInfo?.groupList ? lecturerInfo.groupList.includes(studentGroup) : true;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-950/40 transition-all">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-100">{sub.studentName}</p>
                          <p className="text-[10px] text-slate-550 text-slate-500 mt-0.5">User ID(s): {sub.username} • {studentGroup}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-350">{activity?.title || 'Unknown Activity'}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{activity?.module}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold border",
                            sub.mode === 'Group Work' 
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                              : "bg-slate-950 text-slate-400 border-slate-800"
                          )}>
                            {sub.mode || 'Individual'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-450 font-medium">
                          {sub.date}
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-black",
                            sub.status === 'Graded' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-slate-950 text-slate-550 border border-slate-850"
                          )}>
                            {sub.score !== null ? `${sub.score} / ${sub.totalMarks}` : 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider",
                            sub.status === 'Graded' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                          )}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {isAllowedToGrade ? (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95"
                            >
                              {sub.status === 'Graded' ? 'Re-Grade' : 'Grade'}
                            </button>
                          ) : (
                            <span 
                              title={`This student/group is in ${studentGroup}, which is not in your assigned Group List.`}
                              className="inline-flex items-center gap-1.5 text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-2.5 py-2 rounded-xl font-bold uppercase tracking-wider cursor-help"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" /> Locked: {studentGroup}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          GRADING EVALUATOR MODAL
          ========================================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedSubmission(null)} />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <span>Grade Submission Sheet</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluating <span className="font-bold text-white">{selectedSubmission.studentName}</span> for activity <span className="font-bold text-white">"{activities.find(a => a.id === selectedSubmission.activityId)?.title}"</span>.
                </p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedSubAllowed && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-4.5 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in duration-300">
                <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-white block">🔒 Grading Locked (Out of Group List)</span>
                  <span className="text-slate-400 mt-1 block leading-relaxed">
                    This student is in <span className="font-bold text-rose-400">{selectedSubGroup}</span>. 
                    You can only grade students under your Group List: <span className="font-bold text-indigo-400">{lecturerInfo?.groupList?.join(', ') || 'None'}</span>.
                  </span>
                </div>
              </div>
            )}

            {/* Details Banner */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Submission Mode</span>
                <span className={cn(
                  "inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-black border",
                  selectedSubmission.mode === 'Group Work' 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                    : "bg-slate-900 text-slate-400 border-slate-800"
                )}>
                  {selectedSubmission.mode || 'Individual'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Date Submitted</span>
                <span className="font-bold text-slate-200 mt-1 block">{selectedSubmission.date}</span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Maximum Marks</span>
                <span className="font-bold text-indigo-400 mt-1 block">{selectedSubmission.totalMarks} Points</span>
              </div>
            </div>

            {/* Answer Sheets Preview */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Student Answers Sheet</h4>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {activities.find(a => a.id === selectedSubmission.activityId)?.questions.map((q, idx) => {
                  const studentAns = selectedSubmission.answers[q.id];
                  const isCorrect = studentAns && String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                  
                  return (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="font-bold text-indigo-400">Question {idx + 1} ({q.points} Pts)</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                          isCorrect ? "bg-emerald-500/10 text-emerald-400" : 
                          q.type === 'Written' ? "bg-indigo-500/10 text-indigo-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                          {isCorrect ? 'Auto-Correct' : q.type === 'Written' ? 'Requires Manual Review' : 'Auto-Incorrect'}
                        </span>
                      </div>
                      
                      <p className="font-bold text-white text-sm">{q.text}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-slate-900/50">
                        <div>
                          <span className="text-slate-550 text-slate-500 block uppercase tracking-wider text-[9px]">Student Answer</span>
                          <span className={cn(
                            "font-bold mt-1 block",
                            isCorrect ? "text-emerald-400" : q.type === 'Written' ? "text-slate-200" : "text-rose-400"
                          )}>
                            {studentAns || 'No Answer / Left Blank'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Reference Answer</span>
                          <span className="font-bold text-slate-400 mt-1 block">{q.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrading} className="border-t border-slate-800 pt-6 space-y-5">
              {selectedSubmission.mode === 'Group Work' && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-4 rounded-2xl flex items-start gap-3 text-xs">
                  <Users className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block">👥 Group Work Grading Context</span>
                    <span className="text-slate-400 mt-0.5 block leading-relaxed">
                      This is a group submission. Grading this entry will apply the score <span className="font-bold text-purple-400">{gradingScore || 'X'}</span> and feedback to all registered members in this group log ({selectedSubmission.studentName}).
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Assign Marks</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      disabled={!selectedSubAllowed}
                      min="0"
                      max={selectedSubmission.totalMarks}
                      value={gradingScore}
                      onChange={(e) => setGradingScore(e.target.value)}
                      placeholder="Score"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-center font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-slate-500 font-bold">/ {selectedSubmission.totalMarks}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Feedback remarks</label>
                  <input
                    type="text"
                    disabled={!selectedSubAllowed}
                    placeholder={selectedSubAllowed ? "Provide constructive feedback for evaluation..." : "Grading is disabled (student out of group list)"}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-bold rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSubAllowed}
                  className={cn(
                    "px-6 py-2.5 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all",
                    selectedSubAllowed 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  )}
                >
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
