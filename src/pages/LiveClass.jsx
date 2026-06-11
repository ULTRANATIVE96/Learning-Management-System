import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  ExternalLink,
  MessageSquare,
  Mic,
  Monitor,
  Send,
  Download,
  Search,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api, getChatWebSocketUrl } from '../utils/api';

export default function LiveClass({ searchQuery }) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [localSearch, setLocalSearch] = useState('');
  
  // Stream state
  const [hasJoinedStream, setHasJoinedStream] = useState(false);
  
  // Video player state (for previous recordings)
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState('');
  
  // Chat States
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' or 'sessions'
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const clientIdRef = useRef(Math.random().toString(36).substring(2, 9));
  const pcRef = useRef(null);
  const [liveStream, setLiveStream] = useState(null);
  const studentVideoRef = useRef(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [sessionData, profileData, recordingsData, modulesData] = await Promise.all([
          api.getLiveSessions(),
          api.getProfile(),
          api.getRecordings(),
          api.getModules()
        ]);
        setSessions(sessionData);
        setProfile(profileData);
        setRecordings(recordingsData);
        setModules(modulesData);
        
        // Check for direct URL parameter invitation (e.g. ?session=ID)
        const params = new URLSearchParams(window.location.search);
        const sessionParam = params.get('session');
        let initialActive = null;

        if (sessionParam) {
          initialActive = sessionData.find(s => s.id === Number(sessionParam));
          if (initialActive) {
            setActiveSession(initialActive);
            if (initialActive.status === 'Live') {
              setHasJoinedStream(true);
            }
          }
        }
        
        if (!initialActive) {
          // Default to the first 'Live' session, or the first session in the list
          const live = sessionData.find(s => s.status === 'Live') || sessionData[0];
          setActiveSession(live);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Sync with global navbar search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Reset join state when activeSession changes (unless it's direct route)
  useEffect(() => {
    setHasJoinedStream(false);
    setActiveVideoUrl(null);
  }, [activeSession]);

  // Handle WebSocket Connection based on active session
  useEffect(() => {
    if (!activeSession) return;

    // 1. Fetch past chat history for the active session
    async function loadHistory() {
      try {
        const history = await api.getLiveChatHistory(activeSession.id);
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    }
    loadHistory();

    // 2. Establish WebSocket connection
    const wsUrl = getChatWebSocketUrl(activeSession.module);
    console.log(`Connecting to WebSocket at: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected to live class room");
    };

    socket.onmessage = async (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        
        // Intercept SYSTEM_RTC signaling messages
        if (newMessage.sender === 'SYSTEM_RTC') {
          const signaling = JSON.parse(newMessage.content);
          
          // Only process signaling targeted to this specific student
          if (signaling.to === clientIdRef.current) {
            if (signaling.rtcType === 'offer') {
              console.log("WebRTC: Received Offer from lecturer, setting remote desc");
              if (pcRef.current) pcRef.current.close();
              
              const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
              });
              pcRef.current = pc;
              
              pc.ontrack = (e) => {
                console.log("WebRTC: Received remote track", e.streams[0]);
                setLiveStream(e.streams[0]);
              };
              
              pc.onicecandidate = (e) => {
                if (e.candidate) {
                  sendRtcMessage({
                    rtcType: 'candidate',
                    from: clientIdRef.current,
                    to: 'lecturer',
                    data: e.candidate
                  });
                }
              };
              
              await pc.setRemoteDescription(new RTCSessionDescription(signaling.data));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              sendRtcMessage({
                rtcType: 'answer',
                from: clientIdRef.current,
                to: 'lecturer',
                data: answer
              });
            } else if (signaling.rtcType === 'candidate') {
              console.log("WebRTC: Received candidate from lecturer");
              if (pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(signaling.data));
              }
            }
          }
          return; // Skip adding WebRTC signaling messages to chat history
        }

        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage];
          api.saveLocalChatHistory(activeSession.id, updated);
          return updated;
        });
      } catch (err) {
        console.error("Error parsing socket message", err);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected", event.reason);
    };

    return () => {
      if (socket) {
        socket.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [activeSession]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sidebarTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current || !activeSession) return;

    const username = profile?.name || 'Johnathan Doe';
    const messagePayload = {
      sender: username,
      content: typedMessage,
      sessionCode: activeSession.module,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
    } else {
      const mockSavedMessage = {
        ...messagePayload,
        id: Date.now()
      };
      setMessages(prev => {
        const updated = [...prev, mockSavedMessage];
        api.saveLocalChatHistory(activeSession.id, updated);
        return updated;
      });
    }

    setTypedMessage('');
  };

  const sendRtcMessage = (rtcData) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const msg = {
        sender: "SYSTEM_RTC",
        content: JSON.stringify(rtcData),
        sessionCode: activeSession.module,
        timestamp: new Date().toISOString()
      };
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    if (hasJoinedStream && activeSession && activeSession.status === 'Live') {
      console.log("WebRTC: Student joined stream, sending request-stream join message");
      
      const timer = setTimeout(() => {
        sendRtcMessage({
          rtcType: 'join',
          from: clientIdRef.current,
          to: 'lecturer'
        });
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
      };
    }
  }, [hasJoinedStream, activeSession]);

  useEffect(() => {
    if (studentVideoRef.current && liveStream) {
      studentVideoRef.current.srcObject = liveStream;
    }
  }, [liveStream, hasJoinedStream]);

  useEffect(() => {
    if (!hasJoinedStream) {
      setLiveStream(null);
    }
  }, [hasJoinedStream]);

  const handleJoinClass = async (id) => {
    try {
      const updated = await api.joinLiveSession(id);
      if (updated) {
        setSessions(prev => prev.map(s => s.id === id ? updated : s));
        if (activeSession && activeSession.id === id) {
          setActiveSession(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Active live sessions
  const activeLiveSessions = sessions.filter(s => s.status === 'Live');

  // Filter recordings: if search query is entered, search across ALL modules. Otherwise, filter by selected active session's module.
  const activeModuleCode = activeSession?.module || '';
  const filteredRecordings = recordings.filter((rec) => {
    const q = localSearch.trim().toLowerCase();
    
    // If no search filter is active, only show recordings for the currently active/selected module
    if (!q) {
      return rec.moduleCode === activeModuleCode;
    }
    
    // Otherwise, search across all course recordings
    const titleMatch = rec.title ? rec.title.toLowerCase().includes(q) : false;
    const moduleMatch = rec.moduleCode ? rec.moduleCode.toLowerCase().includes(q) : false;
    return titleMatch || moduleMatch;
  });

  const activeModuleObj = modules.find(m => m.code === activeModuleCode);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            Live Classes
            {activeLiveSessions.length > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">
                Live Now
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join active broadcasts or view scheduled lectures.</p>
        </div>
        <button 
          onClick={() => alert("Simulating full calendar view loading...")}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Full Schedule
        </button>
      </div>

      {/* Active Live Sessions list (If multiple are running) */}
      {activeLiveSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Active Live Broadcasts ({activeLiveSessions.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLiveSessions.map((session) => {
              const mObj = modules.find(m => m.code === session.module);
              const isCurrentlySelected = activeSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSession(session);
                    setHasJoinedStream(true);
                  }}
                  className={cn(
                    "p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 flex items-start gap-4 group relative overflow-hidden",
                    isCurrentlySelected ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200/60 dark:border-slate-800"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 animate-pulse">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-wider bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
                      Live
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1.5 group-hover:text-indigo-600 transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{session.module} • {mObj?.lecturer || 'Lecturer'}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Stream and Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Live Session Focus */}
        {activeSession && (
          <div className="lg:col-span-2 glass-card border-indigo-600/30 overflow-hidden group">
            {hasJoinedStream && activeSession.status === 'Live' ? (
              /* Simulated Active Livestream Video Feed */
              <div className="relative aspect-video bg-slate-955 rounded-xl overflow-hidden mb-6 shadow-2xl">
                <video
                  ref={studentVideoRef}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
                
                {/* Floatings stream indicators */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg tracking-wider animate-pulse flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Live Stream Feed</span>
                </div>
                
                <button
                  onClick={() => setHasJoinedStream(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-rose-600 hover:bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors shadow-lg flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Leave Room</span>
                </button>
              </div>
            ) : activeVideoUrl ? (
              /* Custom Video Player view for recordings */
              <div className="relative aspect-video bg-slate-955 rounded-xl overflow-hidden mb-6 shadow-2xl">
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-white text-[10px] sm:text-xs font-bold max-w-[60%] truncate" title={activeVideoTitle}>
                  Now Watching: {activeVideoTitle}
                </div>
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-rose-600 hover:bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-colors shadow-lg cursor-pointer"
                >
                  Close Player
                </button>
              </div>
            ) : (
              /* Standard livestream join screen */
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6 group-hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  {activeSession.status === 'Live' ? (
                    <div className="text-center space-y-4 relative z-10">
                      <p className="text-indigo-400 font-extrabold text-[10px] tracking-widest uppercase bg-indigo-500/10 px-3 py-1 rounded-full w-max mx-auto animate-pulse">
                        Class Broadcast Active
                      </p>
                      <h3 className="text-white text-lg font-bold">Live Stream Ready</h3>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleJoinClass(activeSession.id);
                          setHasJoinedStream(true);
                        }}
                        className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg"
                      >
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </button>
                      <p className="text-xs text-slate-400 mt-2">Click to join stream and view webcam feed</p>
                    </div>
                  ) : (
                    <div className="text-slate-400 font-bold text-center p-6 bg-slate-955/80 backdrop-blur-md rounded-2xl">
                      Class Scheduled for {activeSession.time}
                    </div>
                  )}
                </div>
                
                {/* Overlay Info */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded",
                    activeSession.status === 'Live' ? "bg-red-500 text-white" : "bg-indigo-600 text-white"
                  )}>
                    {activeSession.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-medium rounded flex items-center gap-1">
                    <Users className="w-3 h-3" /> {activeSession.studentCount} Students
                  </span>
                </div>
                
                {/* Control Bar Mockup */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"><Mic className="w-5 h-5" /></button>
                  <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"><Video className="w-5 h-5" /></button>
                  <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"><Monitor className="w-5 h-5" /></button>
                  <div className="w-px h-6 bg-white/20" />
                  <button 
                    onClick={() => setSidebarTab('chat')}
                    className={cn("p-2 rounded-lg transition-colors", sidebarTab === 'chat' ? "text-indigo-400" : "text-white hover:bg-white/20")}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleJoinClass(activeSession.id);
                      setHasJoinedStream(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    JOIN
                  </button>
                </div>
              </div>
            )}

            {/* Subject Code, Module Name, Topic and Lecturer info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{activeSession.title}</h2>
                <div className="text-xs font-semibold text-slate-500 space-y-1 pt-1">
                  <p className="flex items-center gap-2">
                    <span className="font-extrabold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/30">
                      {activeSession.module}
                    </span>
                    <span>• {activeModuleObj?.name || 'Class Session'}</span>
                  </p>
                  <p className="text-slate-400 dark:text-slate-550 font-bold">
                    Lecturer/Group: <span className="text-slate-700 dark:text-slate-350">{activeModuleObj?.lecturer || 'Dr. Andrea Vine'}</span>
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleJoinClass(activeSession.id);
                  setHasJoinedStream(true);
                }}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto shrink-0 cursor-pointer"
              >
                Enter Room
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Previous Session Recordings Catalog */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Previous Session Recordings</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {localSearch ? "Showing search results across all modules" : `Showing recorded lectures for ${activeSession.module}`}
                  </p>
                </div>
                
                {/* Search recordings input */}
                <div className="relative shrink-0 w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recordings..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {filteredRecordings.length === 0 ? (
                <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-center text-slate-400 dark:text-slate-500 text-xs italic">
                  {localSearch ? "No recordings matched your search." : `No recorded lectures available for ${activeSession.module}.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredRecordings.map((rec) => {
                    const recModuleObj = modules.find(m => m.code === rec.moduleCode);
                    return (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setActiveVideoUrl(rec.videoUrl);
                          setActiveVideoTitle(rec.title);
                        }}
                        className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-3.5 group relative"
                      >
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                        <div className="overflow-hidden pr-10">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {rec.title}
                          </h4>
                          <div className="flex flex-col text-[10px] text-slate-400 font-semibold mt-1 space-y-0.5">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[9px]">
                              {rec.moduleCode} — {recModuleObj?.name || 'Class Session'}
                            </span>
                            <span className="truncate">Lecturer/Group: {recModuleObj?.lecturer || 'Dr. Andrea Vine'}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-normal">
                              {rec.duration} • {rec.size} • {rec.uploadDate}
                            </span>
                          </div>
                        </div>

                        {/* Download button */}
                        <a 
                          href={rec.videoUrl} 
                          download={rec.title}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // Prevent playing video on click
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-150 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 rounded-xl text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center"
                          title="Download Recording"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Tabs (Chat & Schedule) */}
        <div className="flex flex-col space-y-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <button 
              onClick={() => setSidebarTab('chat')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg",
                sidebarTab === 'chat' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Class Chat
            </button>
            <button 
              onClick={() => setSidebarTab('sessions')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg",
                sidebarTab === 'sessions' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Schedule
            </button>
          </div>
          
          {sidebarTab === 'chat' ? (
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-[32px] overflow-hidden h-[450px]">
              {/* Chat Message History */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] no-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs font-medium p-4">
                    Welcome to the chat! Type a message below to start real-time conversation.
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender === (profile?.name || 'Johnathan Doe');
                    return (
                      <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">{msg.sender}</span>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed shadow-sm",
                          isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800/50"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 font-bold">{msg.timestamp}</span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-2">
                <input 
                  type="text" 
                  placeholder={`Send message to ${activeSession?.module || 'class'}...`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
                <button 
                  type="submit" 
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-semibold">
              {sessions.filter(s => activeSession ? s.id !== activeSession.id : true).map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => setActiveSession(session)}
                  className="glass-card hover-scale group cursor-pointer border border-slate-200/50 dark:border-slate-800/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      session.status === 'Live' ? "bg-red-100 text-red-650" :
                      session.status === 'Upcoming' ? "bg-indigo-100 text-indigo-600" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {session.status}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                      <Users className="w-3 h-3" />
                      {session.studentCount}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-sm mb-2 group-hover:text-indigo-600 transition-colors">{session.title}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Video className="w-3 h-3" />
                      <span>{session.module} Room</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="glass-card bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50">
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2">Need Help?</h4>
                <p className="text-xs text-indigo-750 dark:text-indigo-400 mb-4">Contact your module tutor if you're having trouble joining the live session.</p>
                <button 
                  onClick={() => alert("Contacting tutor support...")}
                  className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-750 transition-all cursor-pointer"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
