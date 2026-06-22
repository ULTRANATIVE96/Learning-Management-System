import React, { useState, useEffect } from 'react';
import { Search, Mail, MessageSquare, MoreVertical, GraduationCap, Users, Lock } from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function ClassList({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [lecturerInfo, setLecturerInfo] = useState(null);

  const isLecturer = user?.role === 'LECTURER';

  useEffect(() => {
    async function loadClassmates() {
      try {
        const [data, lectList] = await Promise.all([
          api.getStudents(),
          api.getLecturers()
        ]);
        setStudents(data);
        if (isLecturer) {
          const currentLecturerObj = lectList.find(l => l.name === user.name || l.username === user.username);
          if (currentLecturerObj) {
            setLecturerInfo(currentLecturerObj);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClassmates();
  }, [user, isLecturer]);

  const handleCommunicate = async (studentName, channel) => {
    try {
      const response = await api.communicateWithClassmate(studentName, channel);
      alert(response.message || `Communication initiated with ${studentName}!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to send simulated ${channel}`);
    }
  };

  const allowedStudents = isLecturer && !showAllStudents
    ? students.filter(s => lecturerInfo?.groupList ? lecturerInfo.groupList.includes(s.group) : true)
    : students;

  const filteredStudents = allowedStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.role && student.role.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <p className="text-slate-400 mt-1">Mathematics 101 • Section A • {filteredStudents.length} Students</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isLecturer && (
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors">
              <input 
                type="checkbox" 
                checked={showAllStudents}
                onChange={(e) => setShowAllStudents(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-650 focus:ring-indigo-500 bg-slate-950 border-slate-800"
              />
              <span className="font-bold text-slate-350">List All Students</span>
            </label>
          )}

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search classmates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

      {isLecturer && !showAllStudents && (
        <div className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 p-5 rounded-2xl flex items-start gap-3.5 text-sm animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Active Group List Segregation</span>
            <span className="text-slate-400 text-xs mt-1 block leading-relaxed">
              Currently showing only students belonging to your authorized Group List: <span className="font-bold text-indigo-400">{lecturerInfo?.groupList?.join(', ') || 'No Groups'}</span>.
              Check <span className="font-bold text-white">"List All Students"</span> in the header to view the entire student catalog.
            </span>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <div className="glass-card text-center py-12 text-slate-400 font-medium">
          No classmates found matching search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id || student.name} className="glass-card hover-scale group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-slate-800 group-hover:ring-indigo-500/30 transition-all">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-950 rounded-full" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-white truncate group-hover:text-indigo-650 transition-colors">{student.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      student.role === 'Class Rep' ? "bg-indigo-500/20 text-indigo-455 text-indigo-400 font-black" : "bg-slate-950 text-slate-400"
                    )}>
                      {student.role || 'Student'}
                    </span>
                    <span className="text-[9px] bg-slate-950 text-indigo-400 font-bold px-2 py-0.5 rounded border border-slate-850">
                      {student.group || 'Group A'}
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
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-xs font-bold hover:bg-indigo-900/30 hover:text-indigo-400 transition-all text-slate-350"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button 
                  onClick={() => handleCommunicate(student.name, 'chat')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-xs font-bold hover:bg-indigo-900/30 hover:text-indigo-400 transition-all text-slate-350"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!isLecturer || showAllStudents) && (
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
      )}
    </div>
  );
}
