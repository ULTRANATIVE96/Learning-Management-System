import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Clock, 
  Award, 
  Play, 
  CheckCircle, 
  ChevronRight, 
  HelpCircle, 
  AlertTriangle,
  Lock,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

export default function Activities({ searchQuery }) {
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('Available'); // Available, In Progress, Completed
  const [loading, setLoading] = useState(true);
  
  // Examination Mode state
  const [activeActivity, setActiveActivity] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: value }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examFinishedData, setExamFinishedData] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('mytutor_user') || '{}');
  const studentUsername = currentUser.username || '11101';

  useEffect(() => {
    async function loadData() {
      try {
        const [acts, subs] = await Promise.all([
          api.getActivities(),
          api.getActivitySubmissions()
        ]);
        setActivities(acts);
        // Filter submissions for this student
        setSubmissions(subs.filter(s => s.username === studentUsername));
      } catch (err) {
        console.error("Failed to load activities", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentUsername]);

  // Countdown timer effect
  useEffect(() => {
    if (!activeActivity || timeLeft <= 0) {
      if (activeActivity && timeLeft === 0) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeActivity, timeLeft]);

  const handleStartActivity = (activity) => {
    setActiveActivity(activity);
    setAnswers({});
    setTimeLeft(activity.duration * 60);
    setCurrentQuestionIndex(0);
    setShowSubmitModal(false);
    setExamFinishedData(null);
  };

  const handleSelectAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    if (!activeActivity) return { score: 0, total: 0 };
    let score = 0;
    activeActivity.questions.forEach(q => {
      const studentAns = answers[q.id];
      if (studentAns && String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
        score += q.points;
      }
    });
    return { score, total: activeActivity.totalMarks };
  };

  const handleSubmitExam = async () => {
    if (!activeActivity) return;
    
    const { score, total } = calculateScore();
    try {
      setLoading(true);
      const sub = await api.submitActivity(
        activeActivity.id,
        studentUsername,
        answers,
        score,
        total
      );

      // Refresh list
      const subs = await api.getActivitySubmissions();
      setSubmissions(subs.filter(s => s.username === studentUsername));
      
      setExamFinishedData({
        score,
        total,
        percentage: Math.round((score / total) * 100)
      });
      setShowSubmitModal(false);
    } catch (err) {
      alert("Failed to submit activity: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("⏰ Time is up! Your activity will be submitted automatically.");
    handleSubmitExam();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Tabs filtering
  const completedIds = submissions.map(s => s.activityId);
  const inProgressIds = []; // we can define started activities if we saved unfinished state in localStorage

  const filteredActivities = activities.filter(act => {
    // Search filter
    const matchesSearch = searchQuery 
      ? act.title.toLowerCase().includes(searchQuery.toLowerCase()) || act.module.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    if (!matchesSearch) return false;

    if (activeTab === 'Completed') {
      return completedIds.includes(act.id);
    } else if (activeTab === 'In Progress') {
      return inProgressIds.includes(act.id);
    } else {
      // Available (Not completed, and not in progress)
      return !completedIds.includes(act.id) && !inProgressIds.includes(act.id);
    }
  });

  if (loading && !activeActivity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================
  // RENDER: EXAM MODE UI (FULL-SCREEN OVERLAY)
  // ==========================================
  if (activeActivity) {
    const currentQuestion = activeActivity.questions[currentQuestionIndex];
    const totalQuestions = activeActivity.questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="fixed inset-0 z-50 bg-slate-955 overflow-y-auto flex flex-col text-slate-100 font-sans transition-colors duration-300">
        {/* Sticky Exam Header */}
        <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
              📝
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white truncate max-w-xs md:max-w-md">{activeActivity.title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeActivity.module} • {activeActivity.type}</p>
            </div>
          </div>

          {/* Timer and Submit Controls */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border tracking-wider transition-colors duration-300",
              timeLeft < 120 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse" 
                : "bg-slate-950 border-slate-800 text-amber-400"
            )}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95"
            >
              Submit Activity
            </button>
          </div>
        </header>

        {/* Exam Container */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-6">
          {/* Progress Indicator */}
          <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span className="uppercase tracking-wider">Progress</span>
              <span>Question {currentQuestionIndex + 1} of {totalQuestions} ({answeredCount} answered)</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Exam Screen Content */}
          {examFinishedData ? (
            /* Exam Result Screen */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Activity Submitted Successfully!</h3>
                <p className="text-slate-400">Your answers have been graded. Here is your result:</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto space-y-4">
                <div className="flex justify-between border-b border-slate-800/50 pb-3 text-sm">
                  <span className="text-slate-400 font-medium">Earned Marks</span>
                  <span className="font-bold text-white">{examFinishedData.score} / {examFinishedData.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-slate-400 font-medium">Final Percentage</span>
                  <span className={cn(
                    "text-xl font-black",
                    examFinishedData.percentage >= 75 ? "text-emerald-400" :
                    examFinishedData.percentage < 50 ? "text-rose-400" : "text-indigo-400"
                  )}>{examFinishedData.percentage}%</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveActivity(null)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
              >
                Return to Hub
              </button>
            </div>
          ) : (
            /* Question Layout */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
              {/* Question Text */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-slate-950 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-800">
                    Points: {currentQuestion?.points || 10}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">QID: #{currentQuestion?.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white leading-relaxed">
                  {currentQuestion?.text}
                </h3>
              </div>

              {/* Answers Fields */}
              <div className="space-y-3">
                {currentQuestion?.type === 'MCQ' || currentQuestion?.type === 'TF' ? (
                  currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = answers[currentQuestion.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-between group",
                          isSelected 
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-600/5" 
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-300"
                        )}
                      >
                        <span>{opt}</span>
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "border-indigo-400 bg-indigo-500 text-white text-xs" : "border-slate-750"
                        )}>
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  /* Written input */
                  <textarea
                    rows={4}
                    placeholder="Type your structured evaluation response here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                    className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl text-sm focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-600 text-slate-100"
                  />
                )}
              </div>

              {/* Prev / Next Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous Question
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-6 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Review & Submit
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle className="w-8 h-8 shrink-0" />
                <h3 className="text-xl font-bold text-white">Submit Activity?</h3>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed">
                You are about to submit your answers. You have answered <span className="font-bold text-white">{answeredCount}</span> of <span className="font-bold text-white">{totalQuestions}</span> questions.
              </p>

              <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs text-slate-400">You cannot modify your answers once the activity is submitted.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20"
                >
                  Confirm Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: HUB VIEW
  // ==========================================
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Online Activities Hub
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Take time-bound webtests, structured assessments, and interactive academic quizzes.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800/80">
        {['Available', 'In Progress', 'Completed'].map((tab) => {
          let count = 0;
          if (tab === 'Available') {
            count = activities.filter(a => !completedIds.includes(a.id)).length;
          } else if (tab === 'Completed') {
            count = submissions.length;
          }

          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative py-4 px-6 text-sm font-extrabold transition-all border-b-2 uppercase tracking-wider flex items-center gap-2",
                isActive 
                  ? "border-indigo-500 text-indigo-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black",
                  isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-450"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 glass-card">
            <ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-400">No Activities Found</h4>
            <p className="text-sm text-slate-500 mt-1">There are no academic activities in this section.</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const hasSub = submissions.find(s => s.activityId === act.id);
            const typeBadgeStyle = 
              act.type === 'Quiz' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              act.type === 'Webtest' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-purple-500/10 text-purple-400 border border-purple-500/20';

            return (
              <div 
                key={act.id} 
                className="glass-card flex flex-col justify-between hover-scale group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Badge & Meta */}
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider", typeBadgeStyle)}>
                      {act.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{act.dueDate ? `Due: ${act.dueDate}` : 'No due date'}</span>
                  </div>

                  {/* Title & Module */}
                  <div>
                    <h3 className="text-lg font-black text-white leading-snug group-hover:text-indigo-400 transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{act.module}</span>
                    </p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-800/50 text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{act.duration} Min</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Award className="w-4 h-4 text-slate-500" />
                      <span>{act.totalMarks} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Submit / Results Actions */}
                <div className="mt-6 pt-4">
                  {hasSub ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-850">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> Grade Scored:
                        </span>
                        <span className="font-extrabold text-emerald-400">{hasSub.score} / {hasSub.totalMarks} ({Math.round((hasSub.score / hasSub.totalMarks) * 100)}%)</span>
                      </div>
                      <button
                        onClick={() => alert(`Review Mode: You scored ${hasSub.score}/${hasSub.totalMarks}. Correct answers will be discussed in class.`)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        View Review Panel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartActivity(act)}
                      className="w-full py-2.5 btn-primary text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-indigo-600/10"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Activity</span>
                    </button>
                  )}
                </div>

                {/* Muted background card icons */}
                <div className="absolute -right-6 -bottom-6 w-20 h-20 text-slate-900 group-hover:text-indigo-950 opacity-15 pointer-events-none transition-colors">
                  <ClipboardList className="w-full h-full" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
