import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Calendar, User, Sparkles, BookOpen, Send } from 'lucide-react';
import { api } from '../utils/api';

export default function ManageAnnouncements({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [annList, modList] = await Promise.all([
          api.getAnnouncements(),
          api.getModules()
        ]);
        setAnnouncements(annList);
        setModules(modList);
        if (modList.length > 0) {
          setModuleCode(modList[0].code);
        }
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !moduleCode) {
      setMessage("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const newAnn = await api.createAnnouncement({
        title,
        content,
        moduleCode,
        createdBy: user?.name || "Lecturer"
      });

      setAnnouncements([newAnn, ...announcements]);
      setTitle('');
      setContent('');
      setMessage("Announcement published successfully!");
    } catch (err) {
      setMessage("Failed to create announcement: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete announcement: " + err.message);
    }
  };

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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Publish university and module announcements for your students.
          </p>
        </div>
        <div className="p-1 px-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Divine University Portal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/50 dark:shadow-none sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              <span>Create Announcement</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {message && (
                <div className={`p-3.5 rounded-xl text-sm font-medium ${message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                  {message}
                </div>
              )}

              {/* Module selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Module</label>
                <div className="relative">
                  <select
                    value={moduleCode}
                    onChange={(e) => setModuleCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {modules.map((m) => (
                      <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                    ))}
                  </select>
                  <BookOpen className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Important updates on..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Content textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Content Body</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement details here..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Announcement</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-2">Active Announcements Feed</h2>
          
          {announcements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-12 text-center text-slate-400">
              <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="font-semibold text-slate-500 dark:text-slate-400">No Announcements Sent Yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Create one using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                          {ann.moduleCode}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {ann.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ann.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>By {ann.createdBy}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
