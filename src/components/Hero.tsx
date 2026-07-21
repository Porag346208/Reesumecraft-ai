import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Target, 
  Award, 
  ArrowRight, 
  Star, 
  Heart, 
  TrendingUp, 
  Shield, 
  Zap, 
  HelpCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { ResumeTemplate } from '../types';

interface HeroProps {
  onStartBuilding: (template?: ResumeTemplate) => void;
}

export default function Hero({ onStartBuilding }: HeroProps) {
  const templates: { id: ResumeTemplate; name: string; desc: string; color: string; dot: string }[] = [
    {
      id: 'professional',
      name: 'The Executive',
      desc: 'Classic, highly dense standard corporate layout.',
      color: 'from-slate-600 to-slate-800',
      dot: 'bg-slate-400'
    },
    {
      id: 'modern',
      name: 'The Modernist',
      desc: 'Elegant asymmetric layout with subtle side column.',
      color: 'from-indigo-600 to-blue-600',
      dot: 'bg-indigo-400'
    },
    {
      id: 'creative',
      name: 'The Creative',
      desc: 'Bold styling, rich tag layout & clean structures.',
      color: 'from-violet-600 to-purple-600',
      dot: 'bg-violet-400'
    },
    {
      id: 'minimalist',
      name: 'The Minimalist',
      desc: 'Sleek, high-contrast typography layouts.',
      color: 'from-emerald-600 to-teal-600',
      dot: 'bg-emerald-400'
    }
  ];

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the ATS Scanner work?",
      a: "Our ATS Scanner analyzes high-frequency keywords and domain-specific phrases directly from the job description you paste. It computes a semantic relevance score and highlights precisely which core competencies are missing from your resume."
    },
    {
      q: "Can I export my resume as a PDF?",
      a: "Yes! Using our A4 layout simulator, clicking 'Print or Save PDF' uses customized CSS rules specifically written to render exact physical printing pages, bypass browser headers, and produce a flawless PDF using standard print-to-PDF functions."
    },
    {
      q: "Is my personal data safe and private?",
      a: "Absolutely. All resume drafts are stored in secure cloud-hosted Firebase instances protected by enterprise-grade access control rules. Your private credentials, email, and work history can only be read and updated by you."
    },
    {
      q: "What are the limitations of the Free Plan?",
      a: "The Free Plan provides access to all four designer layouts, our real-time interactive editors, and allows saving 1 active resume draft. Upgrading to Premium unlocks unlimited drafts, AI-powered summary generators, and deep keyword optimizations."
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
      title: "AI-Powered Magic Drafts",
      desc: "Instantly draft summary overviews and bulleted accomplishments optimized for your industry."
    },
    {
      icon: <Target className="h-5 w-5 text-emerald-400" />,
      title: "Real-time ATS Scoring",
      desc: "Compare your resume against your dream job's description to unlock an immediate optimization report."
    },
    {
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      title: "Instant Multi-Layout Engine",
      desc: "Toggle between modern, professional, minimalist, or creative designs with one tap without losing data."
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-400" />,
      title: "Secure Cloud Storage",
      desc: "Your data is saved to Firestore under strict security permissions, accessible on any browser."
    }
  ];

  const testimonials = [
    {
      quote: "ResumesCraft AI took my match score from 64% to 92%. I got interviews at both AWS and Stripe within two weeks!",
      author: "Alex Rodriguez",
      role: "Cloud Architect at Amazon",
      initial: "A",
      bg: "bg-orange-500/20",
      text: "text-orange-400"
    },
    {
      quote: "The live print simulator is spectacular. The page-break rules kept my portfolio beautifully structured on a single page.",
      author: "Maya Patel",
      role: "UX Lead at Figma",
      initial: "M",
      bg: "bg-blue-500/20",
      text: "text-blue-400"
    },
    {
      quote: "I loved how easy it was to drop in a job description and see exactly what skills recruiters are searching for.",
      author: "Taylor Smith",
      role: "Senior DevOps at Netflix",
      initial: "T",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400"
    }
  ];

  return (
    <div id="hero-section" className="relative overflow-hidden bg-[#09090b] text-white py-8 lg:py-12 flex-1 space-y-20">
      
      {/* 1. HERO BENTO SECTION */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Background Graphic Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden opacity-40 select-none">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Bento Block 1: Hero Card */}
          <section className="md:col-span-8 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>New Gemini v4.5 Engine Active</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Craft your dream <br/>
                career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">AI precision.</span>
              </h1>
              
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
                The ultimate AI-powered resume builder that designs, enhances, and optimizes your professional story for modern Applicant Tracking Systems.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onStartBuilding('professional')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Build My Resume Now</span>
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('templates-anchor');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-2xl font-bold text-sm border border-white/5 transition-all cursor-pointer"
                >
                  View Templates
                </button>
              </div>
            </div>
          </section>

          {/* Bento Block 2: ATS Score Radial Visualizer */}
          <div className="md:col-span-4 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full"></div>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="390" strokeDashoffset="39" strokeLinecap="round" className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">92%</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">ATS MATCH</span>
              </div>
            </div>
            
            <h3 className="mt-5 font-bold text-sm text-zinc-200">Compliance Optimizer</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-[200px] leading-relaxed">
              Scan your resume instantly to match high-frequency recruiter terminology.
            </p>
            <p className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ready for Big Tech Review
            </p>
          </div>

          {/* Bento Block 3: Statistics */}
          <div className="md:col-span-4 bg-gradient-to-br from-indigo-500/90 to-purple-600 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group shadow-lg shadow-indigo-600/10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Global Matches Made</p>
              <p className="text-3xl font-black text-white tracking-tight">45.2k+</p>
              <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                <span>+12% average score increase</span>
              </p>
            </div>
            
            <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-400 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">JD</div>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-400 bg-zinc-700 flex items-center justify-center text-[10px] font-bold">MK</div>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-400 bg-zinc-600 flex items-center justify-center text-[10px] font-bold">SR</div>
            </div>
          </div>

          {/* Bento Block 4: Template Quick Select */}
          <div id="templates-anchor" className="md:col-span-4 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Premium Layouts</p>
              <div className="flex flex-col gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => onStartBuilding(tpl.id)}
                    className="w-full text-left h-11 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-between px-3.5 transition-all hover:translate-x-0.5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${tpl.dot}`}></div>
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">{tpl.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 group-hover:text-indigo-400 transition-colors">Select →</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-4 italic">
              All templates are pre-parsed for seamless system compatibility.
            </p>
          </div>

          {/* Bento Block 5: AI Keywords */}
          <div className="md:col-span-4 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">AI Smart Cloud</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-[10px] font-semibold">Strategic Leadership</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[10px] font-semibold">Full-Stack Architecture</span>
                <span className="px-2.5 py-1 bg-zinc-800 border border-white/5 rounded-lg text-zinc-300 text-[10px] font-semibold">Agile Methodologies</span>
                <span className="px-2.5 py-1 bg-zinc-800 border border-white/5 rounded-lg text-zinc-300 text-[10px] font-semibold">Cloud Integration</span>
                <span className="px-2.5 py-1 bg-zinc-800 border border-white/5 rounded-lg text-zinc-300 text-[10px] font-semibold">GraphQL</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-zinc-950/65 rounded-xl border border-indigo-500/10 text-left">
              <p className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest mb-1">AI Recommendation</p>
              <p className="text-[11px] text-zinc-400 leading-normal italic">
                "Insert 'Cross-functional Collaboration' to score 95% on PM jobs."
              </p>
            </div>
          </div>

        </main>
      </div>

      {/* 2. CORE FEATURES SECTION */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Everything You Need to Land the Interview</h2>
          <p className="text-sm text-zinc-400">Professional-grade building tools coupled with advanced keyword modeling.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feat, i) => (
            <div key={i} className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                {feat.icon}
              </div>
              <h3 className="font-bold text-sm text-white">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TESTIMONIALS SECTION */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Endorsed by Top-tier Professionals</h2>
          <p className="text-sm text-zinc-400">See how real engineers and coordinators crafted their stories to success.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {testimonials.map((test, i) => (
            <div key={i} className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                "{test.quote}"
              </p>
              
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className={`w-8 h-8 rounded-full ${test.bg} flex items-center justify-center ${test.text} text-xs font-bold shrink-0`}>
                  {test.initial}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.author}</h4>
                  <p className="text-[10px] text-zinc-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FAQ SECTION */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-zinc-400">Quick answers about our builder, PDF layout, and secure databases.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-bold text-white cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openFaq === i ? 'max-h-40 border-t border-white/5' : 'max-h-0'
                }`}
              >
                <div className="p-5 text-xs text-zinc-400 leading-relaxed bg-zinc-950/40">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
