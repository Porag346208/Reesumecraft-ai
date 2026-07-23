import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Target, HelpCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import ATSChecker from './components/ATSChecker';
import MagicBuilder from './components/MagicBuilder';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import PricingPage from './components/PricingPage';
import { sampleResume } from './data/sampleResume';
import { ResumeData, ResumeStyle, ResumeTemplate } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { doc, updateDoc, addDoc, collection, Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

const emptyResume: ResumeData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: ""
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: []
};

const normalizeResumeData = (data: Partial<ResumeData> | null | undefined): ResumeData => {
  if (!data) return emptyResume;
  return {
    personalInfo: {
      name: data.personalInfo?.name || "",
      title: data.personalInfo?.title || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      location: data.personalInfo?.location || "",
      website: data.personalInfo?.website || "",
      linkedin: data.personalInfo?.linkedin || "",
      github: data.personalInfo?.github || "",
      summary: data.personalInfo?.summary || ""
    },
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
    skills: data.skills || [],
    certifications: data.certifications || [],
    languages: data.languages || []
  };
};

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'dashboard' | 'editor' | 'auth' | 'pricing'>('landing');
  
  // Cloud Sync Resume States
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string>('My Resume Draft');
  const [isSaving, setIsSaving] = useState(false);

  // Resume Editor States
  const [resumeData, _setResumeData] = useState<ResumeData>(normalizeResumeData(sampleResume));
  const setResumeData = (data: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    if (typeof data === 'function') {
      _setResumeData(prev => normalizeResumeData(data(prev)));
    } else {
      _setResumeData(normalizeResumeData(data));
    }
  };
  const [style, setStyle] = useState<ResumeStyle>({
    template: 'professional',
    primaryColor: '#4f46e5',
    fontFamily: 'font-sans',
    spacing: 'normal'
  });

  // App Theme state ('dark' | 'white' | 'cream')
  const [appTheme, setAppTheme] = useState<'dark' | 'white' | 'cream'>('dark');
  const isDarkMode = appTheme === 'dark';

  // Controls the active tab inside the editor panel (left column)
  const [editorSubMode, setEditorSubMode] = useState<'fields' | 'ats' | 'magic'>('fields');

  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto load latest resume when user authenticates
  useEffect(() => {
    const loadLatestUserResume = async (uid: string) => {
      try {
        const q = query(
          collection(db, 'resumes'),
          where('userId', '==', uid),
          orderBy('updatedAt', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          const resData = latestDoc.data();
          setCurrentResumeId(latestDoc.id);
          if (resData.name) setResumeName(resData.name);
          if (resData.data) setResumeData(resData.data);
          if (resData.style) setStyle(resData.style);
        }
      } catch (e: any) {
        console.warn("Unable to load latest resume from cloud (offline mode or network error):", e?.message || e);
      }
    };

    if (user) {
      loadLatestUserResume(user.uid);
    } else {
      setCurrentResumeId(null);
      setResumeName('My Resume Draft');
    }
  }, [user]);

  // Load samples
  const handleLoadSample = () => {
    setResumeData(sampleResume);
    setEditorSubMode('fields');
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const executeClear = () => {
    setResumeData(emptyResume);
    setShowClearConfirm(false);
  };

  const handleStartBuilding = (template?: ResumeTemplate) => {
    if (template) {
      setStyle((prev) => ({ ...prev, template }));
    }
    setView('editor');
  };

  const handleApplySummary = (summary: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        summary
      }
    }));
    setEditorSubMode('fields'); // switch back to see summary
  };

  const handleAddSkills = (newSkills: string[]) => {
    setResumeData((prev) => {
      const filtered = newSkills.filter(s => !prev.skills.includes(s));
      return {
        ...prev,
        skills: [...prev.skills, ...filtered]
      };
    });
    setEditorSubMode('fields'); // switch back to see skills
  };

  const handleMagicGenerate = (generatedData: ResumeData) => {
    setResumeData(generatedData);
    setEditorSubMode('fields'); // Switch back to editing fields
    setView('editor'); // Force editor view
  };

  // Cloud Save Implementation
  const handleSaveCloud = async () => {
    if (!user) {
      alert("You need to be logged in to save to the cloud.");
      setView('auth');
      return;
    }

    setIsSaving(true);
    try {
      if (currentResumeId) {
        const docRef = doc(db, 'resumes', currentResumeId);
        await updateDoc(docRef, {
          data: resumeData,
          style: style,
          updatedAt: Timestamp.now()
        });
      } else {
        // Create new document in cloud
        const docRef = await addDoc(collection(db, 'resumes'), {
          userId: user.uid,
          name: resumeName,
          data: resumeData,
          style: style,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        setCurrentResumeId(docRef.id);
      }
      // Brief feedback
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed bottom-4 left-4 z-50 bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg animate-bounce';
      alertDiv.innerText = '✓ Resume saved successfully!';
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 2500);
    } catch (e) {
      console.error(e);
      alert("Failed to save resume. Please verify your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // Launch Editor with saved resume
  const handleEditResume = (resumeId: string, data: ResumeData, resumeStyle: ResumeStyle) => {
    setCurrentResumeId(resumeId);
    setResumeData(data);
    setStyle(resumeStyle);
    setEditorSubMode('fields');
    setView('editor');
  };

  // Route protection redirect
  useEffect(() => {
    if (!loading && !user && view === 'dashboard') {
      setView('auth');
    }
  }, [user, view, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-4 animate-bounce">
          <FileText className="h-6 w-6" />
        </div>
        <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase">Initializing Craft engine...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      appTheme === 'dark' 
        ? 'bg-[#09090b] text-zinc-100' 
        : appTheme === 'cream'
          ? 'bg-[#fcfaf2] text-[#2d2922]'
          : 'bg-[#ffffff] text-zinc-800'
    }`}>
      {/* Navbar */}
      <Navbar 
        onLoadSample={handleLoadSample} 
        onClear={handleClear} 
        activeView={view} 
        setView={setView}
        onSaveCloud={handleSaveCloud}
        isSaving={isSaving}
        appTheme={appTheme}
        setAppTheme={setAppTheme}
      />

      {/* VIEW DELEGATION */}
      {view === 'landing' && (
        <div className="flex-1 flex flex-col">
          <Hero onStartBuilding={handleStartBuilding} />
          
          {/* Quick interactive section on home for premium feel */}
          <section className={`py-16 border-t transition-colors ${
            appTheme === 'dark' 
              ? 'bg-zinc-950 border-white/10' 
              : appTheme === 'cream'
                ? 'bg-[#fbf7ee] border-[#e4ded0]'
                : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <Target className="h-3.5 w-3.5" />
                    <span>Exceed ATS Filters</span>
                  </div>
                  <h2 className={`text-3xl font-black tracking-tight leading-tight ${
                    appTheme === 'dark' 
                      ? 'text-white' 
                      : appTheme === 'cream'
                        ? 'text-[#403a2f]'
                        : 'text-zinc-900'
                  }`}>
                    Real-time Keywords & ATS Scoring Analyzer
                  </h2>
                  <p className={`text-sm leading-relaxed ${
                    appTheme === 'dark' 
                      ? 'text-zinc-400' 
                      : appTheme === 'cream'
                        ? 'text-[#706757]'
                        : 'text-zinc-600'
                  }`}>
                    Most companies use Applicant Tracking Systems (ATS) to filter out candidates. With ResumesCraft AI, you can paste any job description, scan your draft instantly, identify critical missing keywords, and let Gemini rewrite your executive summary to optimize match scores.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setView('editor');
                        setEditorSubMode('ats');
                      }}
                      className={`inline-flex items-center gap-2 px-5 py-3 font-semibold rounded-xl text-sm transition-all cursor-pointer ${
                        appTheme === 'dark' 
                          ? 'bg-white hover:bg-zinc-200 text-black' 
                          : appTheme === 'cream'
                            ? 'bg-[#403a2f] hover:bg-[#534b3d] text-[#fcfaf2] shadow-md'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                      }`}
                    >
                      <span>Try ATS Scanner</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                  appTheme === 'dark' 
                    ? 'bg-zinc-900/40 border-white/10' 
                    : appTheme === 'cream'
                      ? 'bg-[#fbf7ee] border-[#e4ded0]'
                      : 'bg-white border-zinc-200'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
                    appTheme === 'dark' 
                      ? 'border-white/5' 
                      : appTheme === 'cream'
                        ? 'border-[#eedfc7]'
                        : 'border-zinc-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">ats_score_simulator.js</span>
                  </div>

                  <div className="space-y-4">
                    <div className={`flex justify-between items-center p-4 rounded-xl border ${
                      appTheme === 'cream'
                        ? 'bg-[#eedfc7]/30 border-[#e4ded0]'
                        : 'bg-emerald-500/5 border-emerald-500/15'
                    }`}>
                      <div>
                        <h4 className={`text-sm font-bold ${
                          appTheme === 'dark' 
                            ? 'text-white' 
                            : appTheme === 'cream'
                              ? 'text-[#403a2f]'
                              : 'text-zinc-900'
                        }`}>Software Engineer II</h4>
                        <p className="text-xs text-zinc-500">Google Cloud Platform, Kubernetes, GraphQL</p>
                      </div>
                      <div className="h-12 w-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 font-black text-sm bg-emerald-500/10">
                        94%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`text-xs font-bold ${
                        appTheme === 'dark' 
                          ? 'text-zinc-300' 
                          : appTheme === 'cream'
                            ? 'text-[#5d5446]'
                            : 'text-zinc-700'
                      }`}>Missing Key Competencies Identified:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/10 text-[10px] font-bold rounded-md">Distributed Systems</span>
                        <span className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/10 text-[10px] font-bold rounded-md">AWS IAM</span>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold rounded-md">React Context</span>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold rounded-md">TypeScript</span>
                      </div>
                    </div>

                    <p className={`text-xs italic border-l-2 pl-3 py-1 ${
                      appTheme === 'cream' ? 'text-[#706757] border-[#8c7b64]/50' : 'text-zinc-500 border-indigo-500/45'
                    }`}>
                      "Candidate demonstrates elite execution in web caching layers but is weak on cloud deployment pipeline terms..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Elegant Footer */}
          <footer className={`mt-auto border-t transition-colors py-8 text-center text-xs ${
            appTheme === 'dark' 
              ? 'border-white/10 bg-zinc-950 text-zinc-500' 
              : appTheme === 'cream'
                ? 'border-[#e4ded0] bg-[#eedfc7]/20 text-[#706757]'
                : 'border-zinc-200 bg-zinc-100 text-zinc-500'
          }`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-medium">© 2026 ResumesCraft AI. Built with precision.</span>
              <div className="flex gap-4">
                <span className="hover:text-indigo-500 transition-colors cursor-pointer">Terms of Service</span>
                <span className="hover:text-indigo-500 transition-colors cursor-pointer">Privacy Policy</span>
                <span className="hover:text-indigo-500 transition-colors cursor-pointer">Support Desk</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard 
          onEditResume={handleEditResume} 
          onOpenPricing={() => setView('pricing')}
          onCreateNew={handleLoadSample}
          appTheme={appTheme}
        />
      )}

      {view === 'auth' && (
        <AuthScreen 
          onSuccess={() => {
            setView('editor');
            setEditorSubMode('fields');
          }} 
          onBack={() => setView('landing')}
        />
      )}

      {view === 'pricing' && (
        <PricingPage 
          onBackToBuild={() => setView('editor')} 
          onSuccessUpgrade={() => {
            setTimeout(() => setView('dashboard'), 1500);
          }}
        />
      )}

      {view === 'editor' && (
        /* WORKSPACE INTERACTIVE DASHBOARD */
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4.5rem)] overflow-hidden print:p-0 print:h-auto print:overflow-visible">
          
          {/* LEFT PANEL: Control Tab & Active Workspace Tool (6 columns) */}
          <div className="lg:col-span-6 flex flex-col h-full overflow-hidden print:hidden">
            
            {/* Document Title Editor */}
            {user && (
              <div className="mb-3 px-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Document Name:</span>
                  <input 
                    type="text" 
                    value={resumeName} 
                    onChange={(e) => setResumeName(e.target.value)}
                    className={`bg-transparent border-b text-xs font-bold focus:border-indigo-500 focus:outline-none py-0.5 px-1 truncate max-w-[200px] ${
                      appTheme === 'dark' 
                        ? 'text-zinc-200 border-white/10' 
                        : appTheme === 'cream'
                          ? 'text-[#403a2f] border-[#e4ded0] focus:border-[#8c7b64]'
                          : 'text-zinc-700 border-zinc-200'
                    }`}
                  />
                </div>
                {currentResumeId && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                    Cloud Synced
                  </span>
                )}
              </div>
            )}

            {/* Horizontal Sub-view Select Toggles */}
            <div className={`flex p-1 rounded-2xl border mb-4 shrink-0 ${
              appTheme === 'dark' 
                ? 'bg-zinc-950/60 border-white/10' 
                : appTheme === 'cream'
                  ? 'bg-[#eedfc7]/30 border-[#e4ded0]'
                  : 'bg-zinc-50 border-zinc-200'
            }`}>
              <button
                onClick={() => setEditorSubMode('fields')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  editorSubMode === 'fields'
                    ? (appTheme === 'dark' 
                        ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                        : appTheme === 'cream'
                          ? 'bg-[#eedfc7] text-[#403a2f] shadow-sm border border-[#e4ded0]'
                          : 'bg-white text-zinc-900 shadow-sm border border-zinc-200')
                    : (appTheme === 'cream' ? 'text-[#706757] hover:text-[#403a2f]' : 'text-zinc-400 hover:text-zinc-600')
                }`}
              >
                <FileText className="h-4 w-4 text-indigo-500" />
                <span>📝 Edit Fields</span>
              </button>

              <button
                onClick={() => setEditorSubMode('ats')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  editorSubMode === 'ats'
                    ? (appTheme === 'dark' 
                        ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                        : appTheme === 'cream'
                          ? 'bg-[#eedfc7] text-[#403a2f] shadow-sm border border-[#e4ded0]'
                          : 'bg-white text-zinc-900 shadow-sm border border-zinc-200')
                    : (appTheme === 'cream' ? 'text-[#706757] hover:text-[#403a2f]' : 'text-zinc-400 hover:text-zinc-600')
                }`}
              >
                <Target className="h-4 w-4 text-emerald-500" />
                <span>🎯 ATS Scanner</span>
              </button>

              <button
                onClick={() => setEditorSubMode('magic')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  editorSubMode === 'magic'
                    ? (appTheme === 'dark' 
                        ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                        : appTheme === 'cream'
                          ? 'bg-[#eedfc7] text-[#403a2f] shadow-sm border border-[#e4ded0]'
                          : 'bg-white text-zinc-900 shadow-sm border border-zinc-200')
                    : (appTheme === 'cream' ? 'text-[#706757] hover:text-[#403a2f]' : 'text-zinc-400 hover:text-zinc-600')
                }`}
              >
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>✨ AI Magic Draft</span>
              </button>
            </div>

            {/* Active Content rendering */}
            <div className="flex-1 overflow-hidden h-full">
              {editorSubMode === 'fields' && (
                <div className={
                  appTheme === 'dark' 
                    ? 'workspace-form-override h-full' 
                    : appTheme === 'cream' 
                      ? 'workspace-form-override-cream h-full' 
                      : 'h-full'
                }>
                  <ResumeForm 
                    resumeData={resumeData} 
                    onChange={setResumeData} 
                  />
                </div>
              )}

              {editorSubMode === 'ats' && (
                <div className="h-full overflow-y-auto pr-1">
                  <ATSChecker 
                    resumeData={resumeData}
                    onApplySummary={handleApplySummary}
                    onAddSkills={handleAddSkills}
                  />
                </div>
              )}

              {editorSubMode === 'magic' && (
                <div className="h-full overflow-y-auto pr-1">
                  <MagicBuilder 
                    onGenerate={handleMagicGenerate}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Live PDF Page Simulator (6 columns) */}
          <div className="lg:col-span-6 h-full overflow-hidden print:w-full print:col-span-12 print:h-auto print:overflow-visible">
            <ResumePreview 
              resumeData={resumeData} 
              style={style} 
              onChangeStyle={setStyle}
            />
          </div>
        </main>
      )}

      {/* Floating Theme Switcher Pill */}
      <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-1 p-1 rounded-full border shadow-2xl transition-all ${
        appTheme === 'dark'
          ? 'bg-zinc-900/90 border-white/10 text-white'
          : appTheme === 'cream'
            ? 'bg-[#eedfc7]/95 border-[#e4ded0] text-[#2d2922]'
            : 'bg-white/95 border-zinc-200 text-zinc-800'
      }`}>
        <button
          onClick={() => setAppTheme('dark')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
            appTheme === 'dark'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:bg-zinc-500/10 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Dark Theme"
        >
          <Moon className="h-3 w-3" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          onClick={() => setAppTheme('white')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
            appTheme === 'white'
              ? 'bg-zinc-900 text-white shadow-md'
              : appTheme === 'cream'
                ? 'text-[#706757] hover:text-[#2d2922] hover:bg-[#403a2f]/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          title="White Theme"
        >
          <Sun className="h-3 w-3" />
          <span className="hidden sm:inline">White</span>
        </button>

        <button
          onClick={() => setAppTheme('cream')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
            appTheme === 'cream'
              ? 'bg-[#403a2f] text-[#fcfaf2] shadow-md'
              : appTheme === 'dark'
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-[#eedfc7]/40'
          }`}
          title="Cream Theme"
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="hidden sm:inline">Cream</span>
        </button>
      </div>

      {/* Clear Draft Confirmation Modal */}
      {showClearConfirm && (
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
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Clear Resume Draft?</h3>
                <p className="text-xs text-zinc-400">This will reset all current fields to blank.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to clear your current resume details in the editor?
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeClear}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md cursor-pointer"
              >
                Clear All Fields
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
