import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Filter, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  BarChart2,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Marks() {
  const [marksData, setMarksData] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarks() {
      try {
        const [dist, assess] = await Promise.all([
          api.getMarksDistribution(),
          api.getAssessments()
        ]);
        setMarksData(dist);
        setAssessments(assess);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, []);

  const handleRequestRemark = async () => {
    const moduleCode = prompt("Enter Module code (e.g. MATH101):");
    if (!moduleCode) return;
    const assessmentType = prompt("Enter Assessment name (e.g. Assignment 1):");
    if (!assessmentType) return;
    
    try {
      const response = await api.requestRemark(moduleCode.toUpperCase(), assessmentType);
      alert(response.message || "Remark requested successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit remark request.");
    }
  };

  const handleDownloadTranscript = () => {
    alert("Simulated Transcript Download. Fetching academic records...");
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Module,Mark,Status", ...marksData.map(m => `${m.module},${m.mark}%,${m.status}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mytutor_transcript.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const distinctionCount = marksData.filter(m => m.status === 'Distinction').length;
  const failCount = marksData.filter(m => m.status === 'Fail').length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Performance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Track your grades and credit progress in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadTranscript}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all group"
          >
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            Download Transcript
          </button>
          <button 
            onClick={handleRequestRemark}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-xl shadow-indigo-600/20"
          >
            Request Remark
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Module Grade Distribution</h3>
              <p className="text-sm text-slate-500 mt-1">Current weighted averages</p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <BarChart2 className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="module" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: '#fff',
                    padding: '12px'
                  }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="mark" radius={[10, 10, 10, 10]} barSize={40}>
                  {marksData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.mark >= 75 ? "#4f46e5" : entry.mark >= 50 ? "#6366f1" : "#ef4444"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20 group hover:bg-indigo-100/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Completed</p>
                <h4 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                  {distinctionCount} distinctions
                </h4>
                <p className="text-[10px] text-indigo-400 mt-1 font-bold">Excellent Standing</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card bg-indigo-50/30 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 group hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Current GPA</p>
                <h4 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">3.84</h4>
                <p className="text-[10px] text-indigo-400 mt-1 font-bold">Top 5% of Class</p>
              </div>
            </div>
          </div>

          <div className="glass-card bg-rose-50 dark:bg-rose-500/10 border-rose-100/50 dark:border-rose-500/20 group hover:bg-rose-100/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">At Risk</p>
                <h4 className="text-3xl font-extrabold text-rose-900 dark:text-rose-100 mt-1">
                  {failCount > 0 ? `${failCount} Module` : '0 Modules'}
                </h4>
                <p className="text-[10px] text-rose-400 mt-1 font-bold">
                  {failCount > 0 ? 'Review performance warning' : 'Safe zone'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden p-0 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-slate-200/20">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assessment History</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 shadow-sm text-indigo-600">All</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600">Assignments</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600">Exams</button>
            </div>
            <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.15em] border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">Assessment</th>
                <th className="px-8 py-5">Module</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Weight</th>
                <th className="px-8 py-5 text-center">Result</th>
                <th className="px-8 py-5">Trend</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-300 group cursor-pointer">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{item.type}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">ID: #ASM-0{item.id}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-500">{item.module}</td>
                  <td className="px-8 py-6 text-sm text-slate-500">{item.date}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.weight}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {item.mark !== null ? (
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        item.mark >= 75 ? "text-indigo-600" : item.mark >= 50 ? "text-slate-700 dark:text-slate-200" : "text-rose-500"
                      )}>
                        {item.mark}%
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-50">Pending</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {item.trend === 'up' && <ArrowUpRight className="w-5 h-5 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-1 rounded" />}
                    {item.trend === 'down' && <ArrowDownRight className="w-5 h-5 text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-1 rounded" />}
                    {item.trend === 'none' && <Clock className="w-5 h-5 text-slate-300" />}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm",
                      item.status === 'Graded' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                      item.status === 'Attention' ? "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Load Previous Semester Records</button>
        </div>
      </div>
    </div>
  );
}
