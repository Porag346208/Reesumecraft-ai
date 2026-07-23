import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ResumeData, ResumeStyle, ResumeTemplate } from '../types';
import { sampleResume } from '../data/sampleResume';
import { 
  Sparkles, 
  Plus, 
  Grid, 
  List, 
  FileText, 
  Trash2, 
  Edit2, 
  Upload, 
  Download, 
  FileCheck, 
  Loader2, 
  Search, 
  User, 
  AlertCircle, 
  Folder, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface SavedResume {
  id: string;
  name: string;
  data: ResumeData;
  style: ResumeStyle;
  updatedAt: any;
}

interface DashboardProps {
  onEditResume: (resumeId: string, data: ResumeData, style: ResumeStyle) => void;
  onOpenPricing: () => void;
  onCreateNew: () => void;
  appTheme?: 'dark' | 'white' | 'cream';
}

export default function Dashboard({ onEditResume, onOpenPricing, onCreateNew, appTheme = 'dark' }: DashboardProps) {
  const { user, profile } = useAuth();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Resume Upload State
  const [uploadError, setUploadError] = useState('');
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; content: string; type: string }[]>([]);
  const [selectedUploadedFile, setSelectedUploadedFile] = useState<{ name: string; content: string; type: string } | null>(null);

  // Resume Delete Confirmation Modal State
  const [resumeToDelete, setResumeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetched: SavedResume[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        fetched.push({
          id: docSnap.id,
          name: item.name || 'Untitled Resume',
          data: item.data,
          style: item.style,
          updatedAt: item.updatedAt?.toDate() || new Date(),
        });
      });
      setResumes(fetched);
    } catch (err: any) {
      console.warn('Unable to fetch resumes (offline mode or network error):', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const handleCreateNewResume = async () => {
    if (!user) return;
    
    // Check limit for free users
    if (profile?.plan === 'free' && resumes.length >= 5) {
      alert("Free plan is limited to 5 saved resumes. Upgrade to Premium for unlimited storage!");
      onOpenPricing();
      return;
    }

    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, 'resumes'), {
        userId: user.uid,
        name: `Resume Draft #${resumes.length + 1}`,
        data: sampleResume,
        style: {
          template: 'professional',
          primaryColor: '#4f46e5',
          fontFamily: 'font-sans',
          spacing: 'normal'
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Fetch and transition to editor
      await fetchResumes();
      onEditResume(
        docRef.id, 
        sampleResume, 
        { template: 'professional', primaryColor: '#4f46e5', fontFamily: 'font-sans', spacing: 'normal' }
      );
    } catch (err) {
      console.error('Error creating resume:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteResume = (resume: SavedResume, e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeToDelete({ id: resume.id, name: resume.name });
  };

  const executeDeleteResume = async () => {
    if (!resumeToDelete) return;
    const targetId = resumeToDelete.id;
    setIsDeleting(true);

    // Optimistically filter from state so UI updates immediately
    setResumes((prev) => prev.filter((r) => r.id !== targetId));

    try {
      await deleteDoc(doc(db, 'resumes', targetId));
    } catch (err: any) {
      console.warn('Error removing resume from cloud:', err?.message || err);
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  const handleDeleteUploadedFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedUploadedFile?.name === fileToRemove?.name) {
      setSelectedUploadedFile(null);
    }
  };

  // Upload Resume file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (file.name.toLowerCase().endsWith('.pdf')) {
      setIsParsingPdf(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string;
          const base64Data = result.split(',')[1];
          if (!base64Data) {
            throw new Error("Could not read PDF contents.");
          }

          const res = await fetch('/api/pdf/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to analyze and extract details from this PDF.");
          }

          const parsed = await res.json();
          const contentStr = JSON.stringify(parsed, null, 2);

          setUploadedFiles(prev => [
            {
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB',
              content: contentStr,
              type: 'json'
            },
            ...prev
          ]);
          setSelectedUploadedFile({
            name: file.name,
            content: contentStr,
            type: 'json'
          });
        } catch (err: any) {
          console.error("PDF Parsing error:", err);
          setUploadError(err.message || "Failed to automatically parse PDF contents. Make sure it's a valid PDF resume.");
        } finally {
          setIsParsingPdf(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read the PDF file.');
        setIsParsingPdf(false);
      };
      reader.readAsDataURL(file);
    } else if (file.name.toLowerCase().endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            const dataContent = JSON.stringify(parsed, null, 2);
            setUploadedFiles(prev => [
              {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                content: dataContent,
                type: 'json'
              },
              ...prev
            ]);
            setSelectedUploadedFile({
              name: file.name,
              content: dataContent,
              type: 'json'
            });
          } else {
            setUploadError('Invalid JSON resume structure.');
          }
        } catch (err) {
          setUploadError('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadedFiles(prev => [
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            content: text,
            type: 'text'
          },
          ...prev
        ]);
        setSelectedUploadedFile({
          name: file.name,
          content: text,
          type: 'text'
        });
      };
      reader.readAsText(file);
    } else {
      // Just list as unreadable view-only attachment
      setUploadedFiles(prev => [
        {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          content: 'Uploaded file: Binary / Unsupported content. View-only mode for this file type shows metadata.',
          type: 'binary'
        },
        ...prev
      ]);
      setSelectedUploadedFile({
        name: file.name,
        content: 'Uploaded file: Binary / Unsupported content. View-only mode for this file type shows metadata.',
        type: 'binary'
      });
    }
  };

  const handleImportJsonToWorkspace = async (contentStr: string) => {
    // Check limit for free users
    if (profile?.plan === 'free' && resumes.length >= 5) {
      alert("Free plan is limited to 5 saved resumes. Upgrade to Premium for unlimited storage!");
      onOpenPricing();
      return;
    }

    try {
      const parsed = JSON.parse(contentStr);
      if (parsed.personalInfo) {
        // Create new resume document with this parsed data
        setIsCreating(true);
        const docRef = await addDoc(collection(db, 'resumes'), {
          userId: user?.uid,
          name: `Imported - ${selectedUploadedFile?.name || 'Resume'}`,
          data: parsed,
          style: {
            template: 'professional',
            primaryColor: '#4f46e5',
            fontFamily: 'font-sans',
            spacing: 'normal'
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        await fetchResumes();
        onEditResume(docRef.id, parsed, {
          template: 'professional',
          primaryColor: '#4f46e5',
          fontFamily: 'font-sans',
          spacing: 'normal'
        });
      } else {
        alert("The JSON does not seem to contain valid ResumesCraft format (missing personalInfo).");
      }
    } catch (e) {
      alert("Error parsing and importing the file.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 transition-colors duration-300 ${
      appTheme === 'dark' 
        ? 'bg-[#09090b] text-white' 
        : appTheme === 'cream'
          ? 'bg-[#fcfaf2] text-[#2d2922]'
          : 'bg-[#ffffff] text-zinc-800'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        
        {/* User Hub Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all ${
          appTheme === 'dark'
            ? 'bg-zinc-900/40 border-white/10 text-white'
            : appTheme === 'cream'
              ? 'bg-[#eedfc7]/30 border-[#e4ded0] text-[#2d2922]'
              : 'bg-zinc-50 border-zinc-200 text-zinc-800'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                appTheme === 'dark'
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  : 'bg-indigo-100 border-indigo-200 text-indigo-700'
              }`}>
                Logged In
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-zinc-500" />
                {user?.email}
              </span>
            </div>
            
            <h1 className={`text-3xl font-black tracking-tight ${
              appTheme === 'dark' ? 'text-white' : appTheme === 'cream' ? 'text-[#403a2f]' : 'text-zinc-900'
            }`}>Your Resume Workspace</h1>
            <p className="text-sm text-zinc-400">Create, customize, and match your resumes with job filters.</p>
          </div>

          <div className={`flex items-center gap-4 border px-4 py-3 rounded-2xl shrink-0 ${
            appTheme === 'dark'
              ? 'bg-zinc-950/65 border-white/5'
              : appTheme === 'cream'
                ? 'bg-[#fbf7ee] border-[#eedfc7]'
                : 'bg-white border-zinc-200'
          }`}>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Tier</p>
              <p className={`text-sm font-bold capitalize ${
                appTheme === 'dark' ? 'text-white' : appTheme === 'cream' ? 'text-[#403a2f]' : 'text-zinc-900'
              }`}>{profile?.plan || 'free'} Account</p>
            </div>
            {profile?.plan === 'free' ? (
              <button
                onClick={onOpenPricing}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Upgrade to Premium
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                ✓ Pro Mode Active
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Resumes List panel (Col: 8) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${
                  appTheme === 'dark' ? 'text-white' : appTheme === 'cream' ? 'text-[#403a2f]' : 'text-zinc-900'
                }`}>
                  <Folder className="h-4 w-4 text-indigo-400" />
                  <span>My Resumes</span>
                </h2>
                <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${
                  appTheme === 'dark' 
                    ? 'bg-white/5 border-white/5 text-zinc-400' 
                    : appTheme === 'cream'
                      ? 'bg-[#eedfc7]/40 border-[#e4ded0] text-[#706757]'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                }`}>
                  {resumes.length} total
                </span>
              </div>

              {/* View toggle and search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative h-9">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-full pl-8 pr-3 py-1.5 w-44 sm:w-56 bg-zinc-950/80 border border-white/10 rounded-xl text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all text-white"
                  />
                </div>

                <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isGridView ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      !isGridView ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="List View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleCreateNewResume}
                  disabled={isCreating}
                  className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCreating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm text-zinc-400">Loading your templates and drafts...</p>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="border border-dashed border-white/10 bg-zinc-900/10 p-10 rounded-3xl text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">No Resumes Found</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {searchQuery ? "No matches found for your search query." : "You haven't crafted any resumes yet. Start fresh with a smart draft."}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={handleCreateNewResume}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create My First Resume</span>
                  </button>
                )}
              </div>
            ) : isGridView ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredResumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => onEditResume(resume.id, resume.data, resume.style)}
                    className="group border border-white/10 bg-zinc-900/30 hover:border-indigo-500/50 p-5 rounded-2xl space-y-4 cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <button
                        onClick={(e) => confirmDeleteResume(resume, e)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors">
                        {resume.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        Edited {resume.updatedAt.toLocaleDateString()} at {resume.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span className="capitalize text-[10px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {resume.style.template} template
                      </span>
                      <span className="text-indigo-400 group-hover:underline flex items-center gap-1">
                        Edit Draft <Edit2 className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="border border-white/10 rounded-2xl bg-zinc-900/30 overflow-hidden divide-y divide-white/10">
                {filteredResumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => onEditResume(resume.id, resume.data, resume.style)}
                    className="group flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-zinc-100 group-hover:text-indigo-400 transition-colors">
                          {resume.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500">
                          Last updated {resume.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="hidden md:inline capitalize text-[10px] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 text-zinc-400">
                        Layout: {resume.style.template}
                      </span>
                      <button
                        onClick={(e) => confirmDeleteResume(resume, e)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right sidebar: Upload center & View-only reader (Col: 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Upload Box */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Upload Center</span>
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload your existing resume (.pdf, .json, .txt, or other formats) to preview or import into the designer.
              </p>

              {/* Drag n drop area */}
              {isParsingPdf ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-6 text-center transition-colors">
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
                  <span className="text-xs font-bold text-indigo-300">AI PDF Parser Active</span>
                  <span className="text-[10px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                    Gemini is extracting personal details, professional history, education, and skills...
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/40 bg-zinc-950/65 rounded-2xl p-6 text-center cursor-pointer transition-colors group">
                  <FileCheck className="h-8 w-8 text-zinc-500 group-hover:text-indigo-400 transition-colors mb-3" />
                  <span className="text-xs font-semibold text-zinc-300">Click or drag a resume file</span>
                  <span className="text-[10px] text-zinc-600 mt-1">Supports PDF, JSON, TXT, MD</span>
                  <input
                    type="file"
                    accept=".json,.txt,.md,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* List of uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Uploaded Files ({uploadedFiles.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {uploadedFiles.map((f, i) => (
                      <div 
                        key={i}
                        onClick={() => setSelectedUploadedFile({ name: f.name, content: f.content, type: f.type })}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border ${
                          selectedUploadedFile?.name === f.name 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                            : 'bg-white/5 border-transparent text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate font-medium">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] text-zinc-500 font-mono">{f.size}</span>
                          <button
                            onClick={(e) => handleDeleteUploadedFile(i, e)}
                            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View-Only display pane */}
            {selectedUploadedFile && (
              <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white truncate max-w-[150px]" title={selectedUploadedFile.name}>
                      {selectedUploadedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedUploadedFile(null)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Close View
                  </button>
                </div>

                <div className="bg-zinc-950/80 border border-white/5 p-3.5 rounded-xl text-xs font-mono max-h-56 overflow-y-auto text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {selectedUploadedFile.content}
                </div>

                {selectedUploadedFile.type === 'json' && (
                  <button
                    onClick={() => handleImportJsonToWorkspace(selectedUploadedFile.content)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Import to Workspace</span>
                  </button>
                )}
              </div>
            )}
          </aside>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-5 ${
            appTheme === 'dark' 
              ? 'bg-zinc-900 border-white/10 text-white' 
              : appTheme === 'cream'
                ? 'bg-[#fcfaf2] border-[#e4ded0] text-[#2d2922]'
                : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Resume?</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-indigo-400 font-bold">"{resumeToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setResumeToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteResume}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
