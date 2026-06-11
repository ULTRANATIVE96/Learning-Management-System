import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Send, 
  Users, 
  Power, 
  Play, 
  Camera, 
  Sparkles, 
  Check, 
  Info, 
  Monitor, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  X, 
  Search 
} from 'lucide-react';
import { api, getChatWebSocketUrl } from '../utils/api';

export default function HostLiveClass({ user, searchQuery }) {
  const [modules, setModules] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  // Setup forms
  const [topic, setTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  
  // Media states
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Chat / Socket states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [studentCount, setStudentCount] = useState(0);

  // Recordings states
  const [recordings, setRecordings] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  const [editingRecording, setEditingRecording] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editModule, setEditModule] = useState('');
  const [watchingRecording, setWatchingRecording] = useState(null);
  
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const originalStreamRef = useRef(null);
  const pcsRef = useRef({});
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const sessionStartTimeRef = useRef(null);

  // Load recordings
  const loadRecordings = async () => {
    try {
      const recList = await api.getRecordings();
      setRecordings(recList);
    } catch (err) {
      console.error("Failed to load recordings", err);
    }
  };

  useEffect(() => {
    async function loadModules() {
      try {
        const modList = await api.getModules();
        setModules(modList);
        if (modList.length > 0) {
          setSelectedModule(modList[0].code);
        }
      } catch (err) {
        console.error("Failed to load modules", err);
      }
    }
    loadModules();
    loadRecordings();
    
    return () => {
      // Clean up connections on unmount
      stopCamera();
      closeAllPeerConnections();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Sync with global navbar search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const createFallbackStream = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    const intervalId = setInterval(() => {
      if (!ctx) return;
      
      // Draw background - deep night-red theme
      ctx.fillStyle = '#180202';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Rotating gradient circle in the middle
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 - 20);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(-75, -75, 75, 75);
      grad.addColorStop(0, '#ef4444'); // Reddish
      grad.addColorStop(0.5, '#fbbf24'); // Yellow
      grad.addColorStop(1, '#dc2626'); // Dark Red
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Draw details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("myTutor LIVE Broadcast Feed", canvas.width / 2, canvas.height / 2 + 90);
      
      ctx.fillStyle = '#fde68a'; // Light yellow
      ctx.font = '13px sans-serif';
      ctx.fillText(`Subject Code: ${selectedModule} • Topic: ${topic || 'Class'}`, canvas.width / 2, canvas.height / 2 + 115);
      
      // Pulsing reddish soundwave
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 30; i++) {
        const x = canvas.width / 2 - 150 + i * 10;
        const y = canvas.height / 2 + 50 + Math.sin(angle * 5 + i) * 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      angle += 0.04;
    }, 1000 / 30);

    const stream = canvas.captureStream(30);
    stream._intervalId = intervalId;
    return stream;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setMicActive(true);
    } catch (err) {
      console.warn("Could not access camera/microphone. Initializing beautiful animated canvas stream:", err.message);
      const stream = createFallbackStream();
      setMediaStream(stream);
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setMicActive(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      if (mediaStream._intervalId) {
        clearInterval(mediaStream._intervalId);
      }
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      mediaStreamRef.current = null;
    }
    if (originalStreamRef.current) {
      if (originalStreamRef.current._intervalId) {
        clearInterval(originalStreamRef.current._intervalId);
      }
      originalStreamRef.current.getTracks().forEach(track => track.stop());
      originalStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  const closeAllPeerConnections = () => {
    Object.keys(pcsRef.current).forEach(studentId => {
      const pc = pcsRef.current[studentId];
      if (pc) {
        pc.close();
      }
    });
    pcsRef.current = {};
  };

  const sendRtcMessage = (rtcData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg = {
        sender: "SYSTEM_RTC",
        content: JSON.stringify(rtcData),
        sessionCode: selectedModule,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const handleStartScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // Save original camera stream so we can return to it
      originalStreamRef.current = mediaStream;

      setMediaStream(screenStream);
      mediaStreamRef.current = screenStream;
      setIsScreenSharing(true);

      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStopScreenShare(screenStream);
        };
      }
    } catch (err) {
      console.warn("Screen share cancelled or failed:", err.message);
    }
  };

  const handleStopScreenShare = (streamToStop) => {
    if (streamToStop) {
      streamToStop.getTracks().forEach(track => track.stop());
    }

    if (originalStreamRef.current) {
      setMediaStream(originalStreamRef.current);
      mediaStreamRef.current = originalStreamRef.current;
      originalStreamRef.current = null;
    } else {
      startCamera();
    }
    setIsScreenSharing(false);
  };

  // Keep video element srcObject synced with mediaStream changes and update WebRTC peer connections
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    
    // Update WebRTC senders with new tracks when mediaStream changes
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      
      Object.keys(pcsRef.current).forEach(studentId => {
        const pc = pcsRef.current[studentId];
        if (pc && pc.connectionState !== 'closed') {
          // Find video sender and replace track
          const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack);
          } else if (!videoSender && videoTrack) {
            try { pc.addTrack(videoTrack, mediaStream); } catch (e) {}
          }
          
          // Find audio sender and replace track
          const audioSender = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
          if (audioSender && audioTrack) {
            audioSender.replaceTrack(audioTrack);
          } else if (!audioSender && audioTrack) {
            try { pc.addTrack(audioTrack, mediaStream); } catch (e) {}
          }
        }
      });
    }
  }, [mediaStream]);

  // Manage MediaRecorder for live session recording
  useEffect(() => {
    if (activeSession && mediaStream) {
      console.log("WebRTC/Recording: Starting MediaRecorder on active stream");
      
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (e) {
          console.warn("Failed to stop previous recorder:", e);
        }
      }
      
      try {
        const hasAudio = mediaStream.getAudioTracks().length > 0;
        let options = {};
        
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (hasAudio && MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            options = { mimeType: 'video/webm;codecs=vp8' };
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm' };
          }
        }
        
        console.log("WebRTC/Recording: Initializing MediaRecorder with options:", options);
        const recorder = new MediaRecorder(mediaStream, options);
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
            console.log("Recorded chunk size:", e.data.size, "Total chunks:", chunksRef.current.length);
          }
        };
        
        recorder.onstop = () => {
          console.log("MediaRecorder stopped.");
        };
        
        recorder.start(1000); // chunk every 1 second
        recorderRef.current = recorder;
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
      }
    } else {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (e) {}
      }
    }
  }, [mediaStream, activeSession]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!topic || !selectedModule) return;

    try {
      // Create session on backend
      const sessionData = {
        title: topic,
        module: selectedModule,
        status: 'Live',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const session = await api.createLiveSession(sessionData);
      setActiveSession(session);
      setStudentCount(0);
      setMessages([]);
      chunksRef.current = [];
      sessionStartTimeRef.current = Date.now();

      // Start webcam preview
      await startCamera();

      // Initialize WebSocket connection
      connectWebSocket(selectedModule);
    } catch (err) {
      alert("Failed to start live session: " + err.message);
    }
  };

  const connectWebSocket = (roomCode) => {
    const wsUrl = getChatWebSocketUrl(roomCode);
    console.log("Connecting to WebSocket room:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established successfully");
      // Send join announcement
      const joinMsg = {
        sender: user?.name || "Lecturer",
        content: `Dr. ${user?.name || 'Lecturer'} joined the class as Host.`,
        sessionCode: roomCode,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Intercept SYSTEM_RTC signaling messages
        if (msg.sender === 'SYSTEM_RTC') {
          const signaling = JSON.parse(msg.content);
          
          // Only process signaling messages targeted to us (the lecturer)
          if (signaling.to === 'lecturer') {
            const studentId = signaling.from;
            
            if (signaling.rtcType === 'join') {
              console.log(`WebRTC: Student ${studentId} requested to join stream`);
              // 1. Create peer connection for student
              const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
              });
              pcsRef.current[studentId] = pc;
              
              // 2. Add local media stream tracks
              const activeStream = mediaStreamRef.current;
              if (activeStream) {
                activeStream.getTracks().forEach(track => pc.addTrack(track, activeStream));
              }
              
              // 3. Handle ICE candidates
              pc.onicecandidate = (e) => {
                if (e.candidate) {
                  sendRtcMessage({
                    rtcType: 'candidate',
                    from: 'lecturer',
                    to: studentId,
                    data: e.candidate
                  });
                }
              };
              
              // 4. Create and send Offer
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendRtcMessage({
                rtcType: 'offer',
                from: 'lecturer',
                to: studentId,
                data: offer
              });
            } else if (signaling.rtcType === 'answer') {
              console.log(`WebRTC: Received Answer from student ${studentId}`);
              const pc = pcsRef.current[studentId];
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(signaling.data));
              }
            } else if (signaling.rtcType === 'candidate') {
              console.log(`WebRTC: Received ICE candidate from student ${studentId}`);
              const pc = pcsRef.current[studentId];
              if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(signaling.data));
              }
            }
          }
          return; // Skip adding system WebRTC messages to chat list
        }

        setMessages(prev => [...prev, msg]);
        
        // Simulating incremental student joining
        if (msg.content.includes("joined the class")) {
          setStudentCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
    };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;

    const chatMsg = {
      sender: user?.name || "Lecturer",
      content: chatInput,
      sessionCode: selectedModule,
      timestamp: new Date().toISOString()
    };

    wsRef.current.send(JSON.stringify(chatMsg));
    setChatInput('');
  };

  const handleToggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  const handleToggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    const saveRecordingConfirm = window.confirm("Do you want to save a lecture video recording of this session for the students?");
    
    try {
      // 1. Terminate the active session on backend
      await api.deleteLiveSession(activeSession.id);

      // 2. Save video recording if lecturer agreed
      if (saveRecordingConfirm) {
        const recordingName = prompt("Enter a title for this video recording:", `${selectedModule}: ${topic} Session`);
        if (recordingName) {
          if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            try {
              recorderRef.current.stop();
            } catch (e) {}
          }
          
          await new Promise(resolve => setTimeout(resolve, 600));
          
          let videoUrl = null;
          let sizeStr = "0 MB";
          let durationStr = "0 secs";
          
          if (chunksRef.current.length > 0) {
            try {
              const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
              sizeStr = `${(videoBlob.size / (1024 * 1024)).toFixed(1)} MB`;
              
              if (sessionStartTimeRef.current) {
                const diffMs = Date.now() - sessionStartTimeRef.current;
                const diffMins = Math.floor(diffMs / 60000);
                const diffSecs = Math.floor((diffMs % 60000) / 1000);
                if (diffMins > 0) {
                  durationStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ${diffSecs} sec${diffSecs > 1 ? 's' : ''}`;
                } else {
                  durationStr = `${diffSecs} sec${diffSecs > 1 ? 's' : ''}`;
                }
              }
              
              alert("Uploading the recorded lecture video. Please click OK and wait for completion...");
              const uploadRes = await api.uploadVideo(videoBlob);
              if (uploadRes && uploadRes.videoUrl) {
                if (uploadRes.videoUrl.startsWith('blob:')) {
                  videoUrl = uploadRes.videoUrl;
                } else {
                  const backendHost = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';
                  videoUrl = `${backendHost}${uploadRes.videoUrl}`;
                }
                console.log("Uploaded video absolute URL:", videoUrl);
              }
            } catch (uploadErr) {
              console.error("Failed to upload video recording:", uploadErr);
              alert("Uploading recording failed.");
            }
          }
          
          if (!videoUrl) {
            alert("Unable to save recording: No video chunks were captured or the upload failed. Please verify your camera/audio permissions.");
          } else {
            const recordingData = {
              title: recordingName,
              videoUrl: videoUrl,
              moduleCode: selectedModule,
              duration: durationStr,
              size: sizeStr
            };
            await api.saveRecording(recordingData);
            alert("Recording published successfully under Previous Session Recordings!");
            loadRecordings(); // Refresh the list
          }
        }
      }

      // Close all active WebRTC connections
      closeAllPeerConnections();

      // 3. Clean up WebSocket
      if (wsRef.current) {
        // Send leave announcement
        const leaveMsg = {
          sender: user?.name || "Lecturer",
          content: `Lecturer ended the session.`,
          sessionCode: selectedModule,
          timestamp: new Date().toISOString()
        };
        try { wsRef.current.send(JSON.stringify(leaveMsg)); } catch {}
        wsRef.current.close();
      }

      // 4. Clean up Camera
      stopCamera();

      // 5. Reset states
      setActiveSession(null);
      setTopic('');
    } catch (err) {
      alert("Error ending live session: " + err.message);
    }
  };

  // Recordings operations
  const handleDeleteRecording = async (id) => {
    if (window.confirm("Are you sure you want to delete this recording permanently?")) {
      try {
        await api.deleteRecording(id);
        alert("Recording deleted successfully.");
        loadRecordings();
      } catch (err) {
        alert("Failed to delete recording: " + err.message);
      }
    }
  };

  const handleStartEdit = (rec) => {
    setEditingRecording(rec);
    setEditTitle(rec.title);
    setEditModule(rec.moduleCode || modules[0]?.code || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      await api.updateRecording(editingRecording.id, {
        title: editTitle,
        moduleCode: editModule
      });
      alert("Recording updated successfully.");
      setEditingRecording(null);
      loadRecordings();
    } catch (err) {
      alert("Failed to update recording: " + err.message);
    }
  };

  // Live invite operations
  const handleCopyInviteLink = () => {
    if (!activeSession) return;
    const directUrl = `${window.location.origin}/?page=live&session=${activeSession.id}`;
    navigator.clipboard.writeText(directUrl);
    alert(`Invite link copied to clipboard:\n${directUrl}`);
  };

  const handleSendStudentInvites = async () => {
    if (!activeSession) return;
    try {
      const inviteData = {
        type: 'video',
        title: 'Live Class Invitation',
        desc: `Dr. ${user?.name || 'Lecturer'} invited you to join the live session for ${selectedModule}: '${topic}'. Click to join! (Session ID: ${activeSession.id})`,
        time: 'Just now',
        color: 'rose'
      };
      await api.createNotification(inviteData);
      alert("Invitation notification sent to all students successfully!");
    } catch (err) {
      alert("Failed to send invitations: " + err.message);
    }
  };

  // Filter recordings by search box
  const filteredRecordings = recordings.filter((rec) => {
    if (!localSearch) return true;
    const query = localSearch.toLowerCase();
    const titleMatch = rec.title ? rec.title.toLowerCase().includes(query) : false;
    const moduleMatch = rec.moduleCode ? rec.moduleCode.toLowerCase().includes(query) : false;
    return titleMatch || moduleMatch;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Host Live Session</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Broadcast lectures using HTML5 webcam stream and manage recordings for students.
          </p>
        </div>
        <div className="p-1 px-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Divine University Live Hub</span>
        </div>
      </div>

      {!activeSession ? (
        /* Setup & Management panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configure broadcast card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/30 dark:shadow-none space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">Configure Broadcast Room</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select a course module and enter a topic to begin.</p>
                </div>
              </div>

              <form onSubmit={handleStartSession} className="space-y-4">
                {/* Select module */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Course Module</label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.code}>{m.code} - {m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lecture Topic */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Lecture Topic</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Integration by parts"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-xl p-3.5 text-[11px] leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                  <span>
                    <strong>Camera Permission:</strong> Starting this session will request your browser to access your webcam and mic.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Go Live Stream</span>
                </button>
              </form>
            </div>
          </div>

          {/* Recordings Management dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/30 dark:shadow-none space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-955 dark:text-white">Manage Saved Video Recordings</h2>
                  <p className="text-[11px] text-slate-505 mt-0.5">Watch, download, edit, or delete previous recordings.</p>
                </div>
                
                {/* Search bar */}
                <div className="relative shrink-0 w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recordings..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Recordings table */}
              <div className="overflow-x-auto no-scrollbar">
                {filteredRecordings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No matching saved recordings found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="pb-3 font-semibold">Subject</th>
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Details</th>
                        <th className="pb-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredRecordings.map((rec) => {
                        const moduleObj = modules.find(m => m.code === rec.moduleCode);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                            <td className="py-3.5 pr-2">
                              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">
                                {rec.moduleCode}
                              </span>
                              <span className="block text-[9px] text-slate-400 mt-0.5 font-semibold truncate max-w-[100px]" title={moduleObj?.name}>
                                {moduleObj?.name || 'Class Session'}
                              </span>
                            </td>
                            <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100 pr-2 max-w-[180px] truncate" title={rec.title}>
                              {rec.title}
                            </td>
                            <td className="py-3.5 text-slate-500 pr-2">
                              {rec.uploadDate}
                            </td>
                            <td className="py-3.5 text-slate-400 text-[10px] font-semibold pr-2">
                              {rec.duration} • {rec.size}
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setWatchingRecording(rec)}
                                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                  title="Watch Video"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={rec.videoUrl}
                                  download={rec.title}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 rounded-lg text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center"
                                  title="Download Video"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleStartEdit(rec)}
                                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                  title="Edit Info"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecording(rec.id)}
                                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                  title="Delete Recording"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active session broadcast layout */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Stream Video Column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="relative aspect-video bg-slate-955 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Webcam Video stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isScreenSharing ? '' : 'transform scale-x-[-1]'} ${(!cameraActive || !mediaStream) ? 'hidden' : ''}`}
              />
              {(!cameraActive || !mediaStream) && (
                <div className="text-center text-slate-600 space-y-3">
                  <VideoOff className="w-16 h-16 text-slate-700 mx-auto" />
                  <p className="font-bold text-slate-500">Camera Feed Disabled</p>
                </div>
              )}

              {/* Status floating tags */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg tracking-wider">
                  Live Broadcast
                </span>
                <span className="bg-indigo-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg tracking-wider">
                  {selectedModule}
                </span>
              </div>

              {/* Participants floating indicator */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{studentCount} student{studentCount === 1 ? '' : 's'}</span>
              </div>

              {/* Topic label bottom bar */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-white">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Lecture Topic</span>
                  <h3 className="text-base font-bold truncate">{topic}</h3>
                </div>
                
                {/* Control switches */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className={`p-3 rounded-xl transition-all ${cameraActive ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
                    title={cameraActive ? "Mute Camera" : "Unmute Camera"}
                  >
                    {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-3 rounded-xl transition-all ${micActive ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
                    title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={isScreenSharing ? () => handleStopScreenShare(mediaStream) : handleStartScreenShare}
                    className={`p-3 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400'}`}
                    title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Invite Controls Section */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Invite Students to Stream</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Let students know they can join this live session.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyInviteLink}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-750 dark:text-slate-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Copy Invite Link</span>
                </button>
                <button
                  onClick={handleSendStudentInvites}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Notification Invite</span>
                </button>
              </div>
            </div>

            {/* End session buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Room connection active • ws://localhost:8080/chat
              </span>
              <button
                onClick={handleEndSession}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-505 hover:shadow-lg hover:shadow-rose-600/20 active:scale-95 text-white font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Power className="w-4 h-4" />
                <span>End Session & Record</span>
              </button>
            </div>
          </div>

          {/* Active Chat Column */}
          <div className="xl:col-span-1 h-[500px] xl:h-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                <span>Lecture Chat Room</span>
              </h3>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded text-slate-500 dark:text-slate-400 uppercase">
                Active
              </span>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                  <p className="font-bold text-sm text-slate-500">Live chat is ready</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Students can ask questions here.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSelf = msg.sender === user?.name || msg.sender === 'Lecturer';
                  const isAlert = msg.content.includes("joined the class") || msg.content.includes("ended the session");

                  if (isAlert) {
                    return (
                      <div key={index} className="text-center py-1.5 px-3 bg-slate-50 dark:bg-slate-955/50 rounded-xl border border-slate-100 dark:border-slate-800/50 text-[10px] font-semibold text-slate-400">
                        {msg.content}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] space-y-1 ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message to room..."
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recording Modal */}
      {editingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/65 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edit Recording Metadata</h3>
              <button 
                onClick={() => setEditingRecording(null)} 
                className="p-1 text-slate-555 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recording Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Module</label>
                <select
                  value={editModule}
                  onChange={(e) => setEditModule(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-805 dark:text-slate-105 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecording(null)}
                  className="flex-1 py-2.5 bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Watch Video Modal */}
      {watchingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-2">
              <div>
                <span className="px-2 py-0.5 bg-indigo-600 text-[9px] font-bold uppercase rounded tracking-wider">
                  {watchingRecording.moduleCode}
                </span>
                <h3 className="font-bold text-sm mt-1">{watchingRecording.title}</h3>
              </div>
              <button 
                onClick={() => setWatchingRecording(null)} 
                className="p-1.5 bg-slate-800 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
              <video
                src={watchingRecording.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 font-semibold">
              <span>Uploaded: {watchingRecording.uploadDate}</span>
              <span>Size: {watchingRecording.size} • Duration: {watchingRecording.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
