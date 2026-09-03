import React, { useState, useEffect } from 'react';
import { Mail, Check, X, ShieldAlert, BookOpen } from 'lucide-react';
import { api } from '../utils/api';

export default function LecturerInvitations({ user }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const data = await api.getLecturerInvitations(user.username);
      setInvitations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  const handleUpdateStatus = async (assignmentId, status) => {
    try {
      await api.updateInvitationStatus(assignmentId, status);
      fetchInvitations();
    } catch (err) {
      alert("Failed to update invitation status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingInvites = invitations.filter(inv => inv.status === 'PENDING');
  const pastInvites = invitations.filter(inv => inv.status !== 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Module Invitations</h1>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Manage your invitations to lecture modules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            Pending Invitations ({pendingInvites.length})
          </h2>

          {pendingInvites.length === 0 ? (
            <div className="glass-card py-12 text-center border border-slate-800/50 border-dashed">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No pending invitations.</p>
            </div>
          ) : (
            pendingInvites.map(inv => (
              <div key={inv.id} className="glass-card border border-indigo-500/20 shadow-lg shadow-indigo-900/10 hover-scale">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{inv.module?.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Course: {inv.module?.course?.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 bg-slate-800/50 inline-block px-2 py-1 rounded">Groups: {inv.groupList}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => handleUpdateStatus(inv.id, 'ACCEPTED')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(inv.id, 'DECLINED')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Past Invitations</h2>
          
          <div className="space-y-4">
            {pastInvites.length === 0 ? (
              <div className="glass-card py-12 text-center border border-slate-800/50 border-dashed">
                <p className="text-sm text-slate-400">No past invitations.</p>
              </div>
            ) : (
              pastInvites.map(inv => (
                <div key={inv.id} className="glass-card bg-slate-900/40 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-slate-300 font-bold text-sm">{inv.module?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Groups: {inv.groupList}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                      inv.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
