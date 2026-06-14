import React, { useState, useEffect } from 'react';
import { Search, Mail, MessageSquare, MoreVertical, GraduationCap } from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function ClassList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadClassmates() {
      try {
        const data = await api.getClassList();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClassmates();
  }, []);

  const handleCommunicate = async (studentName, channel) => {
    try {
      const response = await api.communicateWithClassmate(studentName, channel);
      alert(response.message || `Communication initiated with ${studentName}!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to send simulated ${channel}`);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Class List</h1>
          <p className="text-slate-400 mt-1">Mathematics 101 • Section A • {students.length} Students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search classmates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            onClick={() => alert("Simulating launch of group chat channel...")}
            className="btn-primary"
          >
            Group Chat
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="glass-card text-center py-12 text-slate-400 font-medium">
          No classmates found matching search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="glass-card hover-scale group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-slate-100 ring-slate-800 group-hover:ring-indigo-500/30 transition-all">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-950 rounded-full" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-white truncate group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      student.role === 'Class Rep' ? "bg-indigo-100 text-indigo-700 bg-indigo-500/20 text-indigo-400" : "bg-slate-900 text-slate-400 bg-slate-800 text-slate-400"
                    )}>
                      {student.role}
                    </span>
                  </div>
                </div>
                
                <button className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleCommunicate(student.name, 'email')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-xs font-bold hover:bg-indigo-50 hover:bg-indigo-900/30 hover:text-indigo-600 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button 
                  onClick={() => handleCommunicate(student.name, 'chat')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-xs font-bold hover:bg-indigo-50 hover:bg-indigo-900/30 hover:text-indigo-600 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card flex items-center justify-center py-12 border-dashed border-2 border-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-400">View more students...</h4>
          <button 
            onClick={() => alert("Load all students logic triggered.")}
            className="mt-4 text-white font-bold hover:underline"
          >
            Load all 45 students
          </button>
        </div>
      </div>
    </div>
  );
}

