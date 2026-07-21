import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CheckCircle, ArrowRight, Loader2, Award, Shield, Sparkles } from 'lucide-react';

interface PricingPageProps {
  onBackToBuild: () => void;
  onSuccessUpgrade: () => void;
}

export default function PricingPage({ onBackToBuild, onSuccessUpgrade }: PricingPageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpgrade = async () => {
    if (!user) {
      alert("Please sign in or create an account to upgrade.");
      return;
    }
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'premium'
      });
      await refreshProfile();
      setSuccessMsg('Successfully upgraded to ResumesCraft Premium Pro! Enjoy unlimited resume saves and full AI drafts.');
      onSuccessUpgrade();
    } catch (e) {
      console.error(e);
      alert("Failed to complete premium upgrade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'free'
      });
      await refreshProfile();
      setSuccessMsg('Successfully reverted plan to Free tier.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#09090b] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 select-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            Pricing Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Elevate Your Career with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Premium Precision</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Choose a plan that matches your job application goals. Cancel or adjust anytime.
          </p>
        </div>

        {successMsg && (
          <div className="max-w-md mx-auto flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-medium">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Basic Draft</h3>
                <p className="text-xs text-zinc-400">Build and test your resume basics.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-zinc-500">Free forever</span>
              </div>

              <ul className="space-y-3 pt-4 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>5 Active Resume Drafts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>All 4 Professional Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Standard ATS Scoring & Checklist</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <span>❌ AI-powered full summaries</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {profile?.plan === 'free' ? (
                <div className="w-full text-center py-3 bg-white/5 border border-white/5 text-zinc-400 text-xs font-bold rounded-xl">
                  Your Current Plan
                </div>
              ) : (
                <button
                  onClick={handleDowngrade}
                  disabled={isLoading}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Switch to Basic
                </button>
              )}
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-zinc-900/40 border-2 border-indigo-500 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-indigo-600/10">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Recommended
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span>Premium Pro</span>
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </h3>
                <p className="text-xs text-zinc-400">Ultimate toolchain for active job seekers.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$19</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>

              <ul className="space-y-3 pt-4 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited Resume Drafts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Complete AI summary & accomplishments writer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Deep ATS keyword suggestions & scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>High density PDF print style preservation</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {profile?.plan === 'premium' ? (
                <div className="w-full text-center py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                  <Award className="h-4 w-4" /> Pro Plan Active
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Upgrade to Pro Mode</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Info notice */}
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={onBackToBuild}
            className="text-xs font-semibold text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            ← Back to Resume Editor
          </button>
        </div>

      </div>
    </div>
  );
}
