import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Settings,
  Shield,
  Bell,
  Clock,
  Camera,
  Edit2,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile(user?.username);
      setProfile(data);
      if (data) {
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setLocation(data.location);
        setBio(data.bio);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name, email, phone, location, bio }, user?.username);
      await fetchProfile();
      setShowEditModal(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Modules Enrolled', value: String(profile?.modulesEnrolled || 0).padStart(2, '0'), icon: BookOpen, color: 'text-blue-500' },
    { label: 'Credits Earned', value: String(profile?.creditsEarned || 0).padStart(2, '0'), icon: Award, color: 'text-emerald-500' },
    { label: 'Assignments Done', value: String(profile?.assignmentsDone || 0).padStart(2, '0'), icon: GraduationCap, color: 'text-indigo-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header / Cover */}
      <div className="relative group">
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>
        
        <div className="absolute -bottom-16 left-8 md:left-12 flex flex-col md:flex-row items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-slate-900 p-1.5 shadow-2xl shadow-indigo-600/20 ring-4 ring-slate-950 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-[34px] bg-slate-900"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-slate-950">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4 md:mb-6">
            <h1 className="text-3xl font-black text-white tracking-tight">{profile?.name}</h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Verified Student Account • 2024001
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowEditModal(true)}
          className="absolute top-6 right-6 px-5 py-2.5 bg-slate-900/20 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-900/30 transition-all border border-white/20"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Personal Info</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                  <p className="text-sm font-bold truncate">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                  <p className="text-sm font-bold truncate">{profile?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                  <p className="text-sm font-bold truncate">{profile?.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-6">Quick Settings</h3>
            <div className="space-y-3">
              {[
                { icon: Bell, label: 'Notifications', status: 'On', color: 'indigo' },
                { icon: Shield, label: 'Security', status: 'Strong', color: 'emerald' },
                { icon: Clock, label: 'Activity Logs', status: 'View', color: 'slate' },
              ].map((item) => (
                <button key={item.label} onClick={() => alert("Setting option toggled.")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-700 rounded-lg text-slate-500">
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card group hover-scale text-center">
                <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-slate-800 mb-4 group-hover:bg-indigo-50 group-hover:bg-indigo-900/20 transition-all")}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <h4 className="text-3xl font-black text-white">{stat.value}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* About Section */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Academic Bio</h3>
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              {profile?.bio}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {profile?.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-indigo-50 bg-indigo-900/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-8">Recent Activity</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
              {[
                { title: 'Submitted Assignment', desc: 'Data Structures Lab 4 successfully uploaded.', time: '2 hours ago', icon: GraduationCap },
                { title: 'Logged in from New Device', desc: 'Pretoria, Chrome on MacOS.', time: 'Yesterday', icon: Shield },
                { title: 'Mark Received', desc: '88% for Mathematics Assignment 2.', time: '2 days ago', icon: Award },
              ].map((activity, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-500 shadow-sm z-10">
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{activity.title}</h5>
                    <p className="text-xs text-slate-400 mt-1">{activity.desc}</p>
                    <span className="text-[10px] font-black text-slate-300 uppercase mt-2 block">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 rounded-[32px] p-8 border border-slate-800/50 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-black text-white mb-6">Edit Profile Info</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Location</label>
                <input 
                  type="text" 
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Academic Bio</label>
                <textarea 
                  rows={4}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

