import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, ArrowRight, Sparkles, Plus, Copy, Check } from 'lucide-react';
import { ResumeData, ATSResult } from '../types';

interface ATSCheckerProps {
  resumeData: ResumeData;
  onApplySummary: (summary: string) => void;
  onAddSkills: (skills: string[]) => void;
}

export default function ATSChecker({ resumeData: rawResumeData, onApplySummary, onAddSkills }: ATSCheckerProps) {
  const resumeData = {
    personalInfo: {
      name: rawResumeData?.personalInfo?.name || "",
      title: rawResumeData?.personalInfo?.title || "",
      email: rawResumeData?.personalInfo?.email || "",
      phone: rawResumeData?.personalInfo?.phone || "",
      location: rawResumeData?.personalInfo?.location || "",
      website: rawResumeData?.personalInfo?.website || "",
      linkedin: rawResumeData?.personalInfo?.linkedin || "",
      github: rawResumeData?.personalInfo?.github || "",
      summary: rawResumeData?.personalInfo?.summary || ""
    },
    experience: rawResumeData?.experience || [],
    education: rawResumeData?.education || [],
    projects: rawResumeData?.projects || [],
    skills: rawResumeData?.skills || [],
    certifications: rawResumeData?.certifications || [],
    languages: rawResumeData?.languages || []
  };

  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Convert current resume to a plain text representation for analysis
  const getResumeText = () => {
    let text = `Name: ${resumeData.personalInfo.name}\nTitle: ${resumeData.personalInfo.title}\n`;
    text += `Summary: ${resumeData.personalInfo.summary}\n\n`;
    
    text += `EXPERIENCE:\n`;
    resumeData.experience.forEach(exp => {
      text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n${exp.description}\n\n`;
    });

    text += `EDUCATION:\n`;
    resumeData.education.forEach(edu => {
      text += `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (GPA: ${edu.gpa})\n\n`;
    });

    text += `PROJECTS:\n`;
    resumeData.projects.forEach(p => {
      text += `${p.name} (${p.role}): ${p.description}\n\n`;
    });

    text += `SKILLS:\n${resumeData.skills.join(', ')}\n`;
    return text;
  };

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste the job description first to analyze compliance.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const resumeText = getResumeText();
      const response = await fetch('/api/gemini/analyze-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze compliance");
      }

      const scanResult = await response.json();
      setResult(scanResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan resume. Make sure Gemini is properly configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 75) return 'stroke-emerald-400';
    if (score >= 50) return 'stroke-amber-400';
    return 'stroke-rose-400';
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">ATS Compliance Checker</h3>
          <p className="text-xs text-zinc-400">Scan your resume against any job description to match key recruiter terms.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Target Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description or requirements section here..."
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 text-sm placeholder-zinc-500 text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleScan}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Simulating Recruiter ATS Scan...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Scan & Score Resume</span>
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="border-t border-white/10 pt-6 space-y-6">
            {/* Score Banner and Analysis */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-white/5 bg-white/5">
              {/* Radial score ring */}
              <div className="relative flex items-center justify-center h-24 w-24 shrink-0">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-zinc-800 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className={`fill-none transition-all duration-1000 ${getScoreRingColor(result.score)}`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-black text-white">{result.score}%</span>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${getScoreColor(result.score)}`}>
                  {result.score >= 75 ? 'Strong Match' : result.score >= 50 ? 'Average Match' : 'Weak Match'}
                </div>
                <h4 className="text-sm font-bold text-zinc-100">ATS Compliance Score</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{result.matchAnalysis}</p>
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Crucial Missing Keywords</h4>
                {result.missingKeywords.length > 0 && (
                  <button
                    onClick={() => {
                      onAddSkills(result.missingKeywords);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add all to skills
                  </button>
                )}
              </div>
              
              {result.missingKeywords.length === 0 ? (
                <p className="text-xs text-zinc-400">Amazing! Your resume covers all key terms parsed from the job description.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-white/5 rounded-lg border border-white/5"
                    >
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Recommendations to Improve</h4>
              <ul className="space-y-2">
                {result.suggestedChanges.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tailored Summary */}
            {result.tailoredSummary && (
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>AI Tailored Professional Summary</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(result.tailoredSummary || '')}
                      title="Copy tailored summary"
                      className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    
                    <button
                      onClick={() => {
                        onApplySummary(result.tailoredSummary || '');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all cursor-pointer"
                    >
                      Apply to Resume
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "{result.tailoredSummary}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
