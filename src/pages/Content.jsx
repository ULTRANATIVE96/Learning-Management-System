import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  Search, 
  Download, 
  Eye, 
  MoreVertical,
  ChevronRight,
  File,
  Upload,
  Plus
} from 'lucide-react';
import { cn } from '../utils/cn';
import { api } from '../utils/api';

export default function Content() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeFolder, setActiveFolder] = useState('Lecture Notes');
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchFolders = async () => {
    try {
      const data = await api.getContentFolders();
      setFolders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async (folderName) => {
    setFilesLoading(true);
    try {
      const data = await api.getFolderFiles(folderName);
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      await fetchFolders();
      await fetchFiles(activeFolder);
      setLoading(false);
    }
    loadInitial();
  }, []);

  const handleFolderClick = async (folderName) => {
    setActiveFolder(folderName);
    // Update folder counts
    setFolders(prev => prev.map(f => ({ ...f, active: f.name === folderName })));
    await fetchFiles(folderName);
  };

  const handleDownload = (id) => {
    window.open(api.getFileDownloadUrl(id), '_blank');
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.uploadContentFile(activeFolder, file);
      await Promise.all([
        fetchFolders(),
        fetchFiles(activeFolder)
      ]);
      alert(`File '${file.name}' uploaded successfully to ${activeFolder}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Module Content</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Mathematics 101 • Section A</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            onClick={triggerUpload}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Content</span>
          </button>
        </div>
      </div>

      {uploading && (
        <div className="p-4 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-slate-800 flex items-center gap-3 animate-pulse">
          <Upload className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-bold">Uploading new resource to Spring Boot...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Folder List */}
        <div className="lg:col-span-1 space-y-2">
          {folders.map((folder) => {
            const isActive = folder.name === activeFolder;
            return (
              <button 
                key={folder.name}
                onClick={() => handleFolderClick(folder.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-indigo-600"
                )}
              >
                <Folder className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500")} />
                <span className="flex-1 text-left text-sm font-medium">{folder.name}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                  {folder.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Viewer / File List */}
        <div className="lg:col-span-3 glass-card flex flex-col p-0">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Content</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="font-bold">{activeFolder}</span>
            </div>
            <button 
              onClick={triggerUpload}
              className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Resource
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar min-h-[300px]">
            {filesLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                No files found in this folder. Click 'Add Resource' to upload.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{file.type}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-slate-400 font-medium">{file.size}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-slate-400 font-medium">Added {file.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownload(file.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
