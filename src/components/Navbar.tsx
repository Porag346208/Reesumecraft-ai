import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, RefreshCw, Trash2, LogOut, Layout, User, Award } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  onClear: () => void;
  activeView: 'landing' | 'dashboard' | 'editor' | 'auth' | 'pricing';
  setView: (view: 'landing' | 'dashboard' | 'editor' | 'auth' | 'pricing') => void;
  onSaveCloud?: () => void;
  isSaving?: boolean;
  appTheme?: 'dark' | 'white' | 'cream';
  setAppTheme?: (theme: 'dark' | 'white' | 'cream') => void;
}

export default function Navbar({ 
  onLoadSample, 
  onClear, 
  activeView, 
  setView,
  onSaveCloud,
  isSaving,
  appTheme = 'dark'
}: NavbarProps) {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setView('landing');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isDark = appTheme === 'dark';
  const isCream = appTheme === 'cream';

  return (
    <header id="main-header" className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
      isDark 
        ? 'border-white/10 bg-[#09090b]/85 text-white' 
        : isCream
          ? 'border-[#e4ded0] bg-[#fcfaf2]/85 text-[#2d2922]'
          : 'border-zinc-200 bg-[#ffffff]/85 text-zinc-800'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => setView('landing')} 
          className="flex cursor-pointer items-center space-x-2.5 hover:opacity-95 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className={`text-lg font-bold tracking-tight ${
              isDark ? 'text-white' : isCream ? 'text-[#403a2f]' : 'text-zinc-900'
            }`}>
              ResumesCraft AI
            </span>
            <div className={`flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest leading-none ${
              isDark ? 'text-indigo-400' : isCream ? 'text-[#8c7b64]' : 'text-indigo-600'
            }`}>
              <span>ATS-OPTIMIZED</span>
              <span className={`inline-block h-1 w-1 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span className="flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" /> AI Powered</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Main View Buttons */}
          <button
            onClick={() => setView('landing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeView === 'landing' 
                ? (isDark ? 'bg-white/15 text-white' : isCream ? 'bg-[#403a2f]/10 text-[#403a2f]' : 'bg-zinc-100 text-zinc-900') 
                : (isDark ? 'text-zinc-400 hover:text-white' : isCream ? 'text-[#706757] hover:text-[#2d2922]' : 'text-zinc-500 hover:text-zinc-900')
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setView('pricing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeView === 'pricing' 
                ? (isDark ? 'bg-white/15 text-white' : isCream ? 'bg-[#403a2f]/10 text-[#403a2f]' : 'bg-zinc-100 text-zinc-900') 
                : (isDark ? 'text-zinc-400 hover:text-white' : isCream ? 'text-[#706757] hover:text-[#2d2922]' : 'text-zinc-500 hover:text-zinc-900')
            }`}
          >
            Pricing
          </button>

          {user ? (
            <button
              onClick={() => setView('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                activeView === 'dashboard' 
                  ? (isDark 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : isCream 
                        ? 'bg-[#8c7b64]/20 text-[#403a2f] border border-[#8c7b64]/30' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100') 
                  : (isDark ? 'text-zinc-400 hover:text-white' : isCream ? 'text-[#706757] hover:text-[#2d2922]' : 'text-zinc-500 hover:text-zinc-900')
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>Workspace</span>
            </button>
          ) : (
            <button
              onClick={() => setView('auth')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                activeView === 'auth' 
                  ? (isDark ? 'bg-white/15 text-white' : isCream ? 'bg-[#403a2f]/10 text-[#403a2f]' : 'bg-zinc-100 text-zinc-900') 
                  : (isDark ? 'text-zinc-400 hover:text-white' : isCream ? 'text-[#706757] hover:text-[#2d2922]' : 'text-zinc-500 hover:text-zinc-900')
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={() => setView('editor')}
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
              activeView === 'editor'
                ? (isDark 
                    ? 'text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10' 
                    : isCream 
                      ? 'text-[#403a2f] hover:text-black bg-[#403a2f]/5 hover:bg-[#403a2f]/10 border border-[#e4ded0]' 
                      : 'text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200')
                : (isDark 
                    ? 'text-black bg-white hover:bg-zinc-200 shadow-md' 
                    : isCream 
                      ? 'text-[#fcfaf2] bg-[#403a2f] hover:bg-[#534b3d] shadow-md' 
                      : 'text-white bg-zinc-900 hover:bg-zinc-800 shadow-md')
            }`}
          >
            {activeView === 'editor' ? 'View Workspace' : 'Editor Draft'}
          </button>

          {/* Editor-specific quick controls */}
          {activeView === 'editor' && (
            <>
              {user && onSaveCloud && (
                <button
                  onClick={onSaveCloud}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full border transition-all cursor-pointer ${
                    isDark
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'text-emerald-700 bg-emerald-600/10 border-emerald-600/20 hover:bg-emerald-600/20'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save to Cloud'}</span>
                </button>
              )}

              <button
                onClick={onLoadSample}
                title="Load professional sample data"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20'
                    : 'text-indigo-700 bg-indigo-600/10 border-indigo-600/20 hover:bg-indigo-600/20'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5 animate-hover-spin" />
                <span className="hidden md:inline">Sample</span>
              </button>

              <button
                onClick={onClear}
                title="Clear all fields"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/25'
                    : 'text-rose-700 bg-rose-600/10 border-rose-600/20 hover:bg-rose-600/20'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Clear</span>
              </button>
            </>
          )}

          {/* User Logged In Profile indicator */}
          {user && (
            <div className={`flex items-center gap-2 pl-2 border-l ${
              isDark ? 'border-white/10' : isCream ? 'border-[#e4ded0]' : 'border-zinc-200'
            }`}>
              {profile?.plan === 'premium' && (
                <Award className="h-4 w-4 text-amber-400" title="Premium Active" />
              )}
              <button
                onClick={handleLogout}
                title="Log out of account"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isDark 
                    ? 'text-zinc-500 hover:text-white hover:bg-white/5' 
                    : isCream
                      ? 'text-[#706757] hover:text-[#2d2922] hover:bg-[#403a2f]/5'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
