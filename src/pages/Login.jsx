import React, { useState } from 'react';
import { LogIn, Shield, User, Lock, AlertCircle, Sparkles, UserPlus, Mail, Briefcase } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await api.login(username, password);
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regUsername || !regEmail || !regPassword) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.register({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole
      });
      setSuccessMsg(`Registration successful! ${response.lecturerId ? `Your Lecturer ID is ${response.lecturerId}. Please save this.` : 'You can now log in.'}`);
      setTimeout(() => {
        setIsLogin(true);
        setUsername(regUsername);
        setPassword(regPassword);
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialHintClick = (user, pass) => {
    setIsLogin(true);
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-75" />

      <div className="w-full max-w-lg z-10">
        {/* Logo and title header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 mb-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight">
            Divine University
          </h1>
          <p className="text-indigo-300 mt-2 font-medium tracking-wide">
            Access your DacBoard Portal
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 transition-all duration-300">
          
          {/* Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 shadow-inner border border-slate-800/80">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                isLogin ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                !isLogin ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-pulse">
              <Shield className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Username / ID Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or student ID"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="johndoe123"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@divine.edu"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                    disabled={loading}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                  </select>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Register button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick seeded credentials panel (only on login view) */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Portal Access Accounts (Select to Quick-Fill)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Account Seed list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Lecturer Credentials</span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleCredentialHintClick('TeachAndie', 'TAndie@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>TeachAndie</span>
                      <span className="text-[10px] text-slate-500">TAndie@123</span>
                    </button>
                    <button
                      onClick={() => handleCredentialHintClick('TeachVine', 'TVine@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>TeachVine</span>
                      <span className="text-[10px] text-slate-500">TVine@123</span>
                    </button>
                    <button
                      onClick={() => handleCredentialHintClick('TeachMya', 'TZya@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>TeachMya</span>
                      <span className="text-[10px] text-slate-500">TZya@123</span>
                    </button>
                  </div>
                </div>

                {/* Student Account Seed list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Student Credentials</span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleCredentialHintClick('11101', 'STVine@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>11101 (Jonathan)</span>
                      <span className="text-[10px] text-slate-500">STVine@123</span>
                    </button>
                    <button
                      onClick={() => handleCredentialHintClick('11201', 'STAndie@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>11201 (Sarah)</span>
                      <span className="text-[10px] text-slate-500">STAndie@123</span>
                    </button>
                    <button
                      onClick={() => handleCredentialHintClick('11301', 'STZya@123')}
                      className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/30 p-2 rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center"
                    >
                      <span>11301 (Marcus)</span>
                      <span className="text-[10px] text-slate-500">STZya@123</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
