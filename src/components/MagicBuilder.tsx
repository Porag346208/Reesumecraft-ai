import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { ResumeData } from '../types';

interface MagicBuilderProps {
  onGenerate: (data: ResumeData) => void;
}

export default function MagicBuilder({ onGenerate }: MagicBuilderProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);

  const loadingMessages = [
    "Analyzing your professional background...",
    "Drafting an impactful executive summary...",
    "Formulating action-oriented work experience bullet points...",
    "Compiling critical technical skills and toolsets...",
    "Formatting projects and educational details...",
    "Polishing and structuring the final layout..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadStep(0);
      interval = setInterval(() => {
        setLoadStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleMagicBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim() || !targetRole.trim()) {
      setError("Please fill out both your background summary and your target job title.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/magic-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt, targetRole })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate resume");
      }

      const generatedData = await response.json();
      onGenerate(generatedData);
      setUserPrompt('');
      setTargetRole('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSamplePrompt = () => {
    setUserPrompt(
      "I'm a software developer with 4 years at Innovate Labs. I worked with React and Express APIs. I led a team of 3 developers to speed up our analytics dashboard by 40% and secure our databases. I graduated in Computer Science and hold an AWS solutions architect certification. I want a Senior Full Stack Engineer role."
    );
    setTargetRole("Senior Full Stack Engineer");
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Magic Builder</h3>
          <p className="text-xs text-zinc-400">Input a quick paragraph and generate an entire resume draft instantly.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <Sparkles className="absolute h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">Generating Resume Draft</h4>
          <p className="text-sm text-indigo-400 font-medium animate-pulse max-w-sm">
            {loadingMessages[loadStep]}
          </p>
          <p className="text-xs text-zinc-500 mt-4 max-w-xs">
            This typically takes around 15-20 seconds. Please do not close this window.
          </p>
        </div>
      ) : (
        <form onSubmit={handleMagicBuild} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Your Professional Background (Quick Bio)
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., I have 3 years of marketing experience at RetailCo. I specialized in email campaigns that grew click rates by 18% and managed a budget of $50k. BBA graduate. Wanting to apply for a Growth Marketing Specialist role."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 text-sm placeholder-zinc-500 text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Desired Target Job Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-sm placeholder-zinc-500 text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadSamplePrompt}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-all cursor-pointer border border-indigo-500/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try Sample Prompt</span>
              </button>

              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Magic Draft</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
