import React, { useState, useEffect } from 'react';
import { Upload, FileText, Folder, Check, AlertCircle, Trash2, Calendar, FileDown, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function UploadResources() {
  const [folders, setFolders] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [filesList, setFilesList] = useState([]);
  
  // Upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [folderList, moduleList] = await Promise.all([
          api.getContentFolders(),
          api.getModules()
        ]);
        setFolders(folderList);
        setModules(moduleList);
        if (folderList.length > 0) {
          setSelectedFolder(folderList[0].name);
        }
        if (moduleList.length > 0) {
          setSelectedModule(moduleList[0].code);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch files when folder changes
  useEffect(() => {
    if (!selectedFolder) return;
    
    async function loadFolderFiles() {
      setLoadingFiles(true);
      try {
        const files = await api.getFolderFiles(selectedFolder);
        setFilesList(files);
      } catch (err) {
        console.error("Failed to load folder files", err);
      } finally {
        setLoadingFiles(false);
      }
    }
    loadFolderFiles();
  }, [selectedFolder]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file to upload");
      return;
    }
    if (!selectedFolder) {
      setError("Please select a target folder");
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      // Append module details prefix if needed or upload straight away
      const uploadedFile = await api.uploadContentFile(selectedFolder, file);
      
      // Update files list locally
      setFilesList([...filesList, uploadedFile]);
      
      // Update folder count
      setFolders(folders.map(f => f.name === selectedFolder ? { ...f, count: f.count + 1 } : f));
      
      setMessage(`Successfully uploaded '${file.name}' to ${selectedFolder}!`);
      setFile(null);
      // Reset file input element
      e.target.reset();
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Resources</h1>
          <p className="text-slate-400 mt-1">
            Publish syllabus, slides, lecture notes, or past papers for students.
          </p>
        </div>
        <div className="p-1 px-3 bg-indigo-900/30 rounded-xl border border-indigo-100 border-indigo-800/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Divine University Portal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form and Folder Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Uploader Card */}
          <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/50 shadow-none">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-indigo-500" />
              <span>Add New Resource</span>
            </h2>

            <form onSubmit={handleUpload} className="space-y-5">
              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-emerald-400 px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm animate-fade-in">
                  <Check className="w-5 h-5 shrink-0 text-emerald-500" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-rose-400 px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Select folder */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 text-slate-500 uppercase tracking-wider block">Target Folder</label>
                <div className="relative">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                  <Folder className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Select module */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 text-slate-500 uppercase tracking-wider block">Associated Module</label>
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {modules.map((m) => (
                      <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                    ))}
                  </select>
                  <FileText className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* File selection box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 text-slate-500 uppercase tracking-wider block">Document File</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 hover:border-indigo-500 rounded-xl p-6 transition-all text-center relative cursor-pointer bg-slate-950/50 bg-slate-950/20">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-slate-400 block">
                    {file ? file.name : "Choose file or drag here"}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">PDF, DOCX, PPTX (Max 25MB)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Resource</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Folder contents viewing list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950 text-white mb-6 flex items-center justify-between">
              <span>Uploaded Resources in: <span className="text-indigo-400">{selectedFolder}</span></span>
              <span className="text-xs text-slate-400">{filesList.length} files</span>
            </h2>

            {loadingFiles ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : filesList.length === 0 ? (
              <div className="text-center text-slate-400 py-16">
                <Folder className="w-12 h-12 text-slate-300 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-500">No resources uploaded in this folder yet</p>
                <p className="text-xs text-slate-400 mt-1">Be the first to upload lecture resources using the panel.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filesList.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className="w-10 h-10 bg-indigo-900/30 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {fileItem.type || 'PDF'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-white text-sm truncate">{fileItem.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 text-slate-500 mt-0.5">
                          <span>{fileItem.size}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{fileItem.date}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={api.getFileDownloadUrl(fileItem.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-800 rounded-xl transition-all"
                        title="Download File"
                        download
                      >
                        <FileDown className="w-4 h-4" />
                      </a>
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
