// API Client for myTutor
// Bridges the React frontend with the Java Spring Boot backend.
// Implements resilient fallback to localStorage/mock data if the backend is unreachable.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getChatWebSocketUrl = (roomCode) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Fallback to localhost:8080 if environment variable not set
  const apiHost = import.meta.env.VITE_API_WS_URL || 'localhost:8080';
  return `${wsProtocol}//${apiHost}/chat?room=${roomCode}`;
};

// ==========================================
// MOCK FALLBACK DATABASE (for local offline run)
// ==========================================
const MOCK_DB = {
  profile: {
    id: 1,
    username: "11101",
    name: "Jonathan Doe",
    email: "11101@divine.edu",
    phone: "+1 (555) 111-2222",
    location: "Pretoria, South Africa",
    bio: "Third-year Computer Science student passionate about distributed systems and AI. Currently maintaining a 3.8 GPA while working as a teaching assistant for Mathematics 101. I love solving complex algorithmic problems and building tools that make academic life easier for students.",
    tags: ["Computer Science", "Data Analytics", "Mathematics", "Python", "React"],
    modulesEnrolled: 5,
    creditsEarned: 48,
    assignmentsDone: 24
  },
  modules: [
    { id: 1, name: 'Mathematics 101', lecturer: 'Dr. Andrea Vine', progress: 75, color: 'text-blue-600', bgColor: 'bg-blue-600', icon: 'Σ', code: 'MATH101', schedule: 'Mon, Wed • 10:00 AM' },
    { id: 2, name: 'Computer Science 201', lecturer: 'Prof. Vincent Taylor', progress: 45, color: 'text-indigo-600', bgColor: 'bg-indigo-600', icon: '💻', code: 'CSC201', schedule: 'Tue, Thu • 02:00 PM' },
    { id: 3, name: 'Physics 101', lecturer: 'Dr. Mya Zya', progress: 90, color: 'text-purple-600', bgColor: 'bg-purple-600', icon: '⚛️', code: 'PHY101', schedule: 'Fri • 09:00 AM' },
    { id: 4, name: 'Statistics 101', lecturer: 'Prof. Emily Davis', progress: 30, color: 'text-green-600', bgColor: 'bg-green-600', icon: '📊', code: 'STATS101', schedule: 'Mon, Wed • 11:30 AM' },
    { id: 5, name: 'Academic Writing', lecturer: 'Ms. Lisa Miller', progress: 60, color: 'text-orange-600', bgColor: 'bg-orange-600', icon: '✍️', code: 'ENG101', schedule: 'Thu • 10:00 AM' }
  ],
  assignments: [
    { id: 1, title: 'Calculus Assignment 2', module: 'MATH101', dueDate: 'Oct 25, 2026', status: 'Pending', priority: 'high', weight: '15%' },
    { id: 2, title: 'Data Structures Lab 4', module: 'CSC201', dueDate: 'Oct 28, 2026', status: 'Submitted', priority: 'medium', weight: '10%' },
    { id: 3, title: 'Quantum Physics Report', module: 'PHY101', dueDate: 'Nov 02, 2026', status: 'Pending', priority: 'medium', weight: '20%' },
    { id: 4, title: 'Statistical Analysis Project', module: 'STATS101', dueDate: 'Nov 10, 2026', status: 'Late', priority: 'high', weight: '25%' },
    { id: 5, title: 'Technical Writing Essay', module: 'ENG101', dueDate: 'Oct 20, 2026', status: 'Graded', priority: 'low', weight: '10%', mark: '85%' }
  ],
  assessments: [
    { id: 1, type: 'Assignment 1', module: 'Mathematics 101', date: '2026-03-15', mark: 88, weight: '15%', status: 'Graded', trend: 'up' },
    { id: 2, type: 'Test 1', module: 'Computer Science 201', date: '2026-03-20', mark: 75, weight: '20%', status: 'Graded', trend: 'up' },
    { id: 3, type: 'Lab Report', module: 'Physics 101', date: '2026-03-25', mark: 62, weight: '10%', status: 'Graded', trend: 'down' },
    { id: 4, type: 'Assignment 2', module: 'Statistics 101', date: '2026-04-01', mark: 45, weight: '15%', status: 'Attention', trend: 'down' },
    { id: 5, type: 'Midterm Exam', module: 'Mathematics 101', date: '2026-04-10', mark: null, weight: '30%', status: 'Pending', trend: 'none' }
  ],
  marksData: [
    { module: 'MATH101', mark: 85, status: 'Distinction' },
    { module: 'CSC201', mark: 72, status: 'Pass' },
    { module: 'PHY101', mark: 64, status: 'Pass' },
    { module: 'STATS101', mark: 48, status: 'Fail' },
    { module: 'ENG101', mark: 92, status: 'Distinction' }
  ],
  contentFolders: [
    { id: 1, name: 'Lecture Notes', count: 4, active: true },
    { id: 2, name: 'Past Papers', count: 0 },
    { id: 3, name: 'Assignments', count: 0 },
    { id: 4, name: 'Readings', count: 0 },
    { id: 5, name: 'Video Recordings', count: 0 }
  ],
  contentFiles: [
    { id: 1, name: 'Calculus_Week1_Intro.pdf', size: '2.4 MB', date: 'Oct 12, 2026', type: 'pdf', folderName: 'Lecture Notes' },
    { id: 2, name: 'Linear_Algebra_Notes.pdf', size: '1.8 MB', date: 'Oct 15, 2026', type: 'pdf', folderName: 'Lecture Notes' },
    { id: 3, name: 'Practice_Problems_Set1.docx', size: '450 KB', date: 'Oct 18, 2026', type: 'doc', folderName: 'Lecture Notes' },
    { id: 4, name: 'Formula_Sheet_Final.pdf', size: '890 KB', date: 'Oct 20, 2026', type: 'pdf', folderName: 'Lecture Notes' }
  ],
  classmates: [
    { id: 1, name: 'Alice Thompson', email: 'alice.t@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Student' },
    { id: 2, name: 'Bob Wilson', email: 'bob.w@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'Student' },
    { id: 3, name: 'Charlie Davis', email: 'charlie.d@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', role: 'Class Rep' },
    { id: 4, name: 'Diana Miller', email: 'diana.m@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', role: 'Student' },
    { id: 5, name: 'Edward Brown', email: 'edward.b@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edward', role: 'Student' },
    { id: 6, name: 'Fiona Garcia', email: 'fiona.g@student.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona', role: 'Student' }
  ],
  liveSessions: [
    { id: 1, title: 'Calculus: Integration by Parts', time: '10:00 AM - 11:30 AM', status: 'Live', module: 'MATH101', studentCount: 45 },
    { id: 2, title: 'Data Structures: Trees', time: '02:00 PM - 03:30 PM', status: 'Upcoming', module: 'CSC201', studentCount: 38 },
    { id: 3, title: 'Physics: Thermodynamics', time: 'Tomorrow, 09:00 AM', status: 'Scheduled', module: 'PHY101', studentCount: 120 }
  ],
  notifications: [
    { id: 1, type: 'mark', title: 'New Mark Released', desc: 'Your mark for Mathematics Assignment 2 has been released. You scored 88%.', time: '2 hours ago', isNew: true, color: 'emerald' },
    { id: 2, type: 'content', title: 'New Study Material', desc: 'Dr. Andrea Vine uploaded "Week 8: Vector Calculus" to Mathematics 101.', time: '5 hours ago', isNew: true, color: 'indigo' },
    { id: 3, type: 'deadline', title: 'Approaching Deadline', desc: 'Computer Science Lab 4 is due in 24 hours. Don\'t forget to submit!', time: '1 day ago', isNew: false, color: 'rose' },
    { id: 4, type: 'ai', title: 'Smart Insight', desc: 'Your performance in Physics 101 has increased by 15% this month. Great job!', time: '2 days ago', isNew: false, color: 'amber' },
    { id: 5, type: 'system', title: 'System Maintenance', desc: 'DacBoard will be offline for maintenance on Saturday from 02:00 to 04:00 AM.', time: '3 days ago', isNew: false, color: 'slate' }
  ],
  announcements: [
    { id: 1, title: 'Welcome to Divine University!', content: 'Welcome to the new academic term on DacBoard. Please review your module syllabus documents in the Content section. Contact your course lecturer if you have any questions.', date: 'Oct 10, 2026', moduleCode: 'MATH101', createdBy: 'Dr. Andrea Vine' },
    { id: 2, title: 'Upcoming Integration Quiz', content: 'We will have a quiz on Integration by Parts next Monday. Preparation materials have been uploaded to the Lecture Notes folder.', date: '2 hours ago', moduleCode: 'MATH101', createdBy: 'Dr. Andrea Vine' },
    { id: 3, title: 'Lab 4 Extension', content: 'Due to power outages, the deadline for Data Structures Lab 4 has been extended by 48 hours.', date: '5 hours ago', moduleCode: 'CSC201', createdBy: 'Prof. Vincent Taylor' }
  ],
  videoRecordings: [],
  users: [
    { username: 'TeachAndie', password: 'TAndie@123', name: 'Dr. Andrea Vine', role: 'LECTURER', email: 'andrea.vine@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andie' },
    { username: 'TeachVine', password: 'TVine@123', name: 'Prof. Vincent Taylor', role: 'LECTURER', email: 'vincent.taylor@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vine' },
    { username: 'TeachMya', password: 'TZya@123', name: 'Dr. Mya Zya', role: 'LECTURER', email: 'mya.zya@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mya' },
    { username: '11101', password: 'STVine@123', name: 'Jonathan Doe', role: 'STUDENT', email: '11101@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { username: '11201', password: 'STAndie@123', name: 'Sarah Connor', role: 'STUDENT', email: '11201@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { username: '11301', password: 'STZya@123', name: 'Marcus Wright', role: 'STUDENT', email: '11301@divine.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' }
  ]
};

// Initialize Mock DB in localStorage if it doesn't exist
const initMockLocalStorage = () => {
  if (!localStorage.getItem('mytutor_db_v2_initialized')) {
    localStorage.setItem('mytutor_profile', JSON.stringify(MOCK_DB.profile));
    localStorage.setItem('mytutor_modules', JSON.stringify(MOCK_DB.modules));
    localStorage.setItem('mytutor_assignments', JSON.stringify(MOCK_DB.assignments));
    localStorage.setItem('mytutor_assessments', JSON.stringify(MOCK_DB.assessments));
    localStorage.setItem('mytutor_marksData', JSON.stringify(MOCK_DB.marksData));
    localStorage.setItem('mytutor_folders', JSON.stringify(MOCK_DB.contentFolders));
    localStorage.setItem('mytutor_files', JSON.stringify(MOCK_DB.contentFiles));
    localStorage.setItem('mytutor_classmates', JSON.stringify(MOCK_DB.classmates));
    localStorage.setItem('mytutor_liveSessions', JSON.stringify(MOCK_DB.liveSessions));
    localStorage.setItem('mytutor_notifications', JSON.stringify(MOCK_DB.notifications));
    localStorage.setItem('mytutor_announcements', JSON.stringify(MOCK_DB.announcements));
    localStorage.setItem('mytutor_videoRecordings', JSON.stringify(MOCK_DB.videoRecordings));
    localStorage.setItem('mytutor_users', JSON.stringify(MOCK_DB.users));
    localStorage.setItem('mytutor_db_v2_initialized', 'true');
  }
};
initMockLocalStorage();

const getMockData = (key) => JSON.parse(localStorage.getItem(key));
const saveMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Safe fetch wrapper that catches connection errors and uses fallbacks
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    console.warn(`Backend API unreachable at ${url}. Falling back to local storage. Error:`, error.message);
    throw error; // Let the caller deal with the fallback
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================

export const api = {
  // 0. Authentication
  login: async (username, password) => {
    try {
      return await safeFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch (err) {
      const users = getMockData('mytutor_users') || [];
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        return {
          token: "simulated-jwt-token-for-" + user.username,
          id: Date.now(),
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          avatar: user.avatar
        };
      }
      throw new Error("Invalid username or password");
    }
  },

  // 1. Profile
  getProfile: async (username) => {
    try {
      const url = username ? `${API_BASE_URL}/profile?username=${encodeURIComponent(username)}` : `${API_BASE_URL}/profile`;
      return await safeFetch(url);
    } catch {
      if (username) {
        const key = `mytutor_profile_${username}`;
        let p = localStorage.getItem(key);
        if (!p) {
          const users = getMockData('mytutor_users') || [];
          const u = users.find(usr => usr.username === username);
          const defaultProfile = {
            id: Date.now(),
            username: username,
            name: u ? u.name : username,
            email: u ? u.email : `${username}@divine.edu`,
            phone: "+1 (555) 111-2222",
            location: "Not Set",
            bio: "A member of Divine University.",
            tags: ["React", "Java"],
            modulesEnrolled: 3,
            creditsEarned: 12,
            assignmentsDone: 5
          };
          localStorage.setItem(key, JSON.stringify(defaultProfile));
          return defaultProfile;
        }
        return JSON.parse(p);
      }
      return getMockData('mytutor_profile');
    }
  },
  updateProfile: async (profileData, username) => {
    try {
      const url = username ? `${API_BASE_URL}/profile?username=${encodeURIComponent(username)}` : `${API_BASE_URL}/profile`;
      return await safeFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
    } catch {
      if (username) {
        const key = `mytutor_profile_${username}`;
        const currentProfile = JSON.parse(localStorage.getItem(key)) || {};
        const profile = { ...currentProfile, ...profileData };
        localStorage.setItem(key, JSON.stringify(profile));
        return profile;
      }
      const profile = { ...getMockData('mytutor_profile'), ...profileData };
      saveMockData('mytutor_profile', profile);
      return profile;
    }
  },

  // 2. Modules
  getModules: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/modules`);
    } catch {
      return getMockData('mytutor_modules');
    }
  },
  enrollModule: async (moduleData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData)
      });
    } catch {
      const modules = getMockData('mytutor_modules');
      const newModule = {
        id: Date.now(),
        progress: 0,
        lecturer: 'TBD Lecturer',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-600',
        icon: '📚',
        schedule: 'TBD Schedule',
        ...moduleData
      };
      modules.push(newModule);
      saveMockData('mytutor_modules', modules);

      // Increment profile stats locally
      const profile = getMockData('mytutor_profile');
      profile.modulesEnrolled += 1;
      saveMockData('mytutor_profile', profile);

      return newModule;
    }
  },

  // 3. Assignments
  getAssignments: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/assignments`);
    } catch {
      return getMockData('mytutor_assignments');
    }
  },
  uploadAssignment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await safeFetch(`${API_BASE_URL}/assignments/${id}/upload`, {
        method: 'POST',
        body: formData
      });
    } catch {
      const assignments = getMockData('mytutor_assignments');
      const index = assignments.findIndex(a => a.id === Number(id));
      if (index !== -1) {
        const oldStatus = assignments[index].status;
        assignments[index].status = 'Submitted';
        assignments[index].submissionFileName = file.name;
        saveMockData('mytutor_assignments', assignments);

        if (oldStatus !== 'Submitted' && oldStatus !== 'Graded') {
          const profile = getMockData('mytutor_profile');
          profile.assignmentsDone += 1;
          saveMockData('mytutor_profile', profile);
        }

        // Add mock notification
        const notifications = getMockData('mytutor_notifications');
        notifications.unshift({
          id: Date.now(),
          type: 'system',
          title: 'Submission Successful (Local Fallback)',
          desc: `Your file '${file.name}' was successfully uploaded locally.`,
          time: 'Just now',
          isNew: true,
          color: 'indigo'
        });
        saveMockData('mytutor_notifications', notifications);
      }
      return assignments[index];
    }
  },
  getAssignmentBriefUrl: (id) => {
    return `${API_BASE_URL}/assignments/${id}/download`;
  },

  // 4. Marks & Assessments
  getMarksDistribution: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/marks/distribution`);
    } catch {
      return getMockData('mytutor_marksData');
    }
  },
  getAssessments: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/marks/assessments`);
    } catch {
      return getMockData('mytutor_assessments');
    }
  },
  updateAssessment: async (id, assessmentData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/marks/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
    } catch {
      const assessments = getMockData('mytutor_assessments');
      const index = assessments.findIndex(a => a.id === Number(id));
      if (index !== -1) {
        assessments[index] = { ...assessments[index], ...assessmentData };
        if (assessmentData.mark === null) {
          assessments[index].status = 'Pending';
        } else if (assessmentData.mark < 50) {
          assessments[index].status = 'Attention';
        } else {
          assessments[index].status = 'Graded';
        }
        saveMockData('mytutor_assessments', assessments);
        return assessments[index];
      }
      return null;
    }
  },
  addAssessment: async (assessmentData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/marks/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
    } catch {
      const assessments = getMockData('mytutor_assessments');
      const newAssessment = {
        id: Date.now(),
        status: assessmentData.mark === null ? 'Pending' : (assessmentData.mark < 50 ? 'Attention' : 'Graded'),
        trend: 'none',
        ...assessmentData
      };
      assessments.push(newAssessment);
      saveMockData('mytutor_assessments', assessments);
      return newAssessment;
    }
  },
  deleteAssessment: async (id) => {
    try {
      await safeFetch(`${API_BASE_URL}/marks/assessments/${id}`, { method: 'DELETE' });
    } catch {
      const assessments = getMockData('mytutor_assessments');
      const updated = assessments.filter(a => a.id !== Number(id));
      saveMockData('mytutor_assessments', updated);
    }
  },
  requestRemark: async (moduleCode, assessmentType) => {
    try {
      return await safeFetch(`${API_BASE_URL}/marks/remark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: moduleCode, assessmentType })
      });
    } catch {
      const notifications = getMockData('mytutor_notifications');
      notifications.unshift({
        id: Date.now(),
        type: 'system',
        title: 'Remark Requested (Local Fallback)',
        desc: `You requested a remark for ${assessmentType} in ${moduleCode}.`,
        time: 'Just now',
        isNew: true,
        color: 'slate'
      });
      saveMockData('mytutor_notifications', notifications);
      return { status: 'success', message: 'Remark request logged locally' };
    }
  },

  // 5. Content Files & Folders
  getContentFolders: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/content/folders`);
    } catch {
      return getMockData('mytutor_folders');
    }
  },
  getFolderFiles: async (folderName) => {
    try {
      return await safeFetch(`${API_BASE_URL}/content/folders/${encodeURIComponent(folderName)}/files`);
    } catch {
      return getMockData('mytutor_files').filter(f => f.folderName === folderName);
    }
  },
  getFileDownloadUrl: (id) => {
    return `${API_BASE_URL}/content/files/${id}/download`;
  },
  uploadContentFile: async (folderName, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await safeFetch(`${API_BASE_URL}/content/folders/${encodeURIComponent(folderName)}/upload`, {
        method: 'POST',
        body: formData
      });
    } catch {
      const files = getMockData('mytutor_files');
      const ext = file.name.substring(file.name.lastIndexOf('.') + 1) || 'dat';

      const newFile = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: ext.toLowerCase(),
        folderName
      };
      files.push(newFile);
      saveMockData('mytutor_files', files);

      // Increment folder count
      const folders = getMockData('mytutor_folders');
      const idx = folders.findIndex(f => f.name === folderName);
      if (idx !== -1) {
        folders[idx].count += 1;
        saveMockData('mytutor_folders', folders);
      }

      // Add notification
      const notifications = getMockData('mytutor_notifications');
      notifications.unshift({
        id: Date.now(),
        type: 'content',
        title: 'New Study Material (Local Fallback)',
        desc: `A new file '${file.name}' was uploaded to ${folderName} locally.`,
        time: 'Just now',
        isNew: true,
        color: 'indigo'
      });
      saveMockData('mytutor_notifications', notifications);

      return newFile;
    }
  },

  // 6. Classlist
  getClassList: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/classlist`);
    } catch {
      return getMockData('mytutor_classmates');
    }
  },
  communicateWithClassmate: async (studentName, channel) => {
    try {
      return await safeFetch(`${API_BASE_URL}/classlist/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, channel })
      });
    } catch {
      return { status: 'success', message: `Simulated ${channel} logged locally to ${studentName}` };
    }
  },

  // 7. Live Sessions & Recordings
  getLiveSessions: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/live-classes`);
    } catch {
      return getMockData('mytutor_liveSessions');
    }
  },
  createLiveSession: async (sessionData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/live-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
    } catch {
      const sessions = getMockData('mytutor_liveSessions');
      const newSession = {
        id: Date.now(),
        studentCount: 0,
        status: 'Live',
        time: 'Now',
        ...sessionData
      };
      sessions.push(newSession);
      saveMockData('mytutor_liveSessions', sessions);
      return newSession;
    }
  },
  deleteLiveSession: async (id) => {
    try {
      await safeFetch(`${API_BASE_URL}/live-classes/${id}`, { method: 'DELETE' });
    } catch {
      const sessions = getMockData('mytutor_liveSessions');
      const updated = sessions.filter(s => s.id !== Number(id));
      saveMockData('mytutor_liveSessions', updated);
    }
  },
  getLiveChatHistory: async (id) => {
    try {
      return await safeFetch(`${API_BASE_URL}/live-classes/${id}/chat-history`);
    } catch {
      const localChat = localStorage.getItem(`mytutor_chat_${id}`);
      return localChat ? JSON.parse(localChat) : [];
    }
  },
  saveLocalChatHistory: (id, messages) => {
    localStorage.setItem(`mytutor_chat_${id}`, JSON.stringify(messages));
  },
  joinLiveSession: async (id) => {
    try {
      return await safeFetch(`${API_BASE_URL}/live-classes/${id}/join`, {
        method: 'POST'
      });
    } catch {
      const sessions = getMockData('mytutor_liveSessions');
      const idx = sessions.findIndex(s => s.id === Number(id));
      if (idx !== -1) {
        sessions[idx].studentCount += 1;
        saveMockData('mytutor_liveSessions', sessions);
        return sessions[idx];
      }
      return null;
    }
  },

  // 7b. Video Recordings (for student view/lecturer save)
  getRecordings: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/recordings`);
    } catch {
      return getMockData('mytutor_videoRecordings');
    }
  },
  getRecordingsByModule: async (moduleCode) => {
    try {
      return await safeFetch(`${API_BASE_URL}/recordings/module/${moduleCode}`);
    } catch {
      const recs = getMockData('mytutor_videoRecordings') || [];
      return recs.filter(r => r.moduleCode === moduleCode);
    }
  },
  saveRecording: async (recordingData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/recordings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordingData)
      });
    } catch {
      const recs = getMockData('mytutor_videoRecordings') || [];
      const newRec = {
        id: Date.now(),
        uploadDate: new Date().toISOString().split('T')[0],
        ...recordingData
      };
      recs.push(newRec);
      saveMockData('mytutor_videoRecordings', recs);
      return newRec;
    }
  },
  uploadVideo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file, 'recording.webm');
      return await safeFetch(`${API_BASE_URL}/recordings/upload`, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.warn("Local fallback for video upload");
      const localUrl = URL.createObjectURL(file);
      return { videoUrl: localUrl };
    }
  },
  deleteRecording: async (id) => {
    try {
      await safeFetch(`${API_BASE_URL}/recordings/${id}`, { method: 'DELETE' });
    } catch {
      const recs = getMockData('mytutor_videoRecordings') || [];
      const updated = recs.filter(r => r.id !== Number(id));
      saveMockData('mytutor_videoRecordings', updated);
    }
  },
  updateRecording: async (id, recordingData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/recordings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordingData)
      });
    } catch {
      const recs = getMockData('mytutor_videoRecordings') || [];
      const index = recs.findIndex(r => r.id === Number(id));
      if (index !== -1) {
        recs[index] = { ...recs[index], ...recordingData };
        saveMockData('mytutor_videoRecordings', recs);
        return recs[index];
      }
      return null;
    }
  },

  // 8. Notifications
  getNotifications: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/notifications`);
    } catch {
      return getMockData('mytutor_notifications');
    }
  },
  createNotification: async (notificationData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
    } catch (err) {
      const list = getMockData('mytutor_notifications') || [];
      const newNotif = {
        id: Date.now(),
        isNew: true,
        ...notificationData
      };
      list.unshift(newNotif);
      saveMockData('mytutor_notifications', list);
      return newNotif;
    }
  },
  markAllNotificationsRead: async () => {
    try {
      await safeFetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT' });
    } catch {
      const notifications = getMockData('mytutor_notifications');
      notifications.forEach(n => n.isNew = false);
      saveMockData('mytutor_notifications', notifications);
    }
  },
  markNotificationRead: async (id) => {
    try {
      return await safeFetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const notifications = getMockData('mytutor_notifications');
      const idx = notifications.findIndex(n => n.id === Number(id));
      if (idx !== -1) {
        notifications[idx].isNew = false;
        saveMockData('mytutor_notifications', notifications);
        return notifications[idx];
      }
      return null;
    }
  },
  deleteNotification: async (id) => {
    try {
      await safeFetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
    } catch {
      const notifications = getMockData('mytutor_notifications');
      const updated = notifications.filter(n => n.id !== Number(id));
      saveMockData('mytutor_notifications', updated);
    }
  },
  clearAllNotifications: async () => {
    try {
      await safeFetch(`${API_BASE_URL}/notifications/clear-all`, { method: 'DELETE' });
    } catch {
      saveMockData('mytutor_notifications', []);
    }
  },

  // 9. Announcements
  getAnnouncements: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/announcements`);
    } catch {
      return getMockData('mytutor_announcements');
    }
  },
  getAnnouncementsByModule: async (moduleCode) => {
    try {
      return await safeFetch(`${API_BASE_URL}/announcements/module/${moduleCode}`);
    } catch {
      const list = getMockData('mytutor_announcements') || [];
      return list.filter(a => a.moduleCode === moduleCode);
    }
  },
  createAnnouncement: async (announcementData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });
    } catch {
      const list = getMockData('mytutor_announcements') || [];
      const newAnn = {
        id: Date.now(),
        date: "Just now",
        ...announcementData
      };
      list.unshift(newAnn);
      saveMockData('mytutor_announcements', list);
      return newAnn;
    }
  },
  deleteAnnouncement: async (id) => {
    try {
      await safeFetch(`${API_BASE_URL}/announcements/${id}`, { method: 'DELETE' });
    } catch {
      const list = getMockData('mytutor_announcements') || [];
      const updated = list.filter(a => a.id !== Number(id));
      saveMockData('mytutor_announcements', updated);
    }
  }
};
