import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Marks from './pages/Marks';
import Content from './pages/Content';
import ClassList from './pages/ClassList';
import LiveClass from './pages/LiveClass';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Lecturer Pages
import LecturerDashboard from './pages/LecturerDashboard';
import ManageMarks from './pages/ManageMarks';
import UploadResources from './pages/UploadResources';
import HostLiveClass from './pages/HostLiveClass';
import ManageAnnouncements from './pages/ManageAnnouncements';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mytutor_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activePage, setActivePage] = useState(() => {
    const saved = localStorage.getItem('mytutor_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.role === 'LECTURER' ? 'lecturer_dashboard' : 'dashboard';
    }
    return 'dashboard';
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-route on direct URL query parameter (e.g. ?page=live)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      setActivePage(pageParam);
    }
  }, []);

  // Clear search on page navigation
  useEffect(() => {
    setSearchQuery('');
  }, [activePage]);

  // Persistence for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keep local storage in sync
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mytutor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mytutor_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage(user.role === 'LECTURER' ? 'lecturer_dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      // Student Pages
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} />;
      case 'modules':
        return <Modules searchQuery={searchQuery} />;
      case 'marks':
        return <Marks searchQuery={searchQuery} />;
      case 'content':
        return <Content searchQuery={searchQuery} />;
      case 'classlist':
        return <ClassList searchQuery={searchQuery} />;
      case 'live':
        return <LiveClass searchQuery={searchQuery} />;
      case 'assignments':
        return <Assignments searchQuery={searchQuery} />;
      case 'profile':
        return <Profile user={currentUser} />;
      case 'notifications':
        return <Notifications searchQuery={searchQuery} setActivePage={setActivePage} />;

      // Lecturer Pages
      case 'lecturer_dashboard':
        return <LecturerDashboard user={currentUser} setActivePage={setActivePage} searchQuery={searchQuery} />;
      case 'manage_marks':
        return <ManageMarks searchQuery={searchQuery} />;
      case 'upload_resources':
        return <UploadResources searchQuery={searchQuery} />;
      case 'host_live':
        return <HostLiveClass user={currentUser} searchQuery={searchQuery} />;
      case 'manage_announcements':
        return <ManageAnnouncements user={currentUser} searchQuery={searchQuery} />;

      default:
        return currentUser?.role === 'LECTURER' ? (
          <LecturerDashboard user={currentUser} setActivePage={setActivePage} searchQuery={searchQuery} />
        ) : (
          <Dashboard searchQuery={searchQuery} />
        );
    }
  };

  // If no user is logged in, show the login portal screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isLecturer = currentUser.role === 'LECTURER';

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      user={currentUser}
      onLogout={handleLogout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="animate-in fade-in duration-500">
        {renderPage()}
      </div>
      
      {/* Global Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <div className="absolute bottom-16 right-0 scale-0 group-hover:scale-100 transition-all origin-bottom-right space-y-3 pb-4">
          <div className="flex items-center gap-3 justify-end" onClick={() => setActivePage(isLecturer ? 'manage_announcements' : 'dashboard')}>
            <span className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              {isLecturer ? 'Post Announcement' : 'Ask AI'}
            </span>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">✨</div>
          </div>
          <div className="flex items-center gap-3 justify-end" onClick={() => setActivePage(isLecturer ? 'upload_resources' : 'assignments')}>
            <span className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              {isLecturer ? 'Upload Note' : 'New Assignment'}
            </span>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">📝</div>
          </div>
          <div className="flex items-center gap-3 justify-end" onClick={() => setActivePage(isLecturer ? 'host_live' : 'live')}>
            <span className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              {isLecturer ? 'Host Class' : 'Join Class'}
            </span>
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">🎥</div>
          </div>
        </div>
        <span className="text-2xl font-bold">+</span>
      </button>
    </Layout>
  );
}

export default App;
