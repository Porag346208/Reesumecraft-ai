import React, { useRef } from 'react';
import { 
  Palette, Type, Space, Download, Phone, Mail, MapPin, 
  Globe, Linkedin, Github, FileText, Calendar, Award, ExternalLink 
} from 'lucide-react';
import { ResumeData, ResumeStyle, ResumeTemplate } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
  style: ResumeStyle;
  onChangeStyle: (style: ResumeStyle) => void;
}

const colors = [
  { id: 'indigo', hex: '#4f46e5', name: 'Indigo' },
  { id: 'slate', hex: '#334155', name: 'Slate' },
  { id: 'blue', hex: '#0284c7', name: 'Blue' },
  { id: 'emerald', hex: '#059669', name: 'Emerald' },
  { id: 'violet', hex: '#7c3aed', name: 'Violet' },
  { id: 'rose', hex: '#e11d48', name: 'Rose' },
];

const fonts = [
  { id: 'font-sans', name: 'Sans-Serif', class: 'font-sans' },
  { id: 'font-serif', name: 'Elegant Serif', class: 'font-serif' },
  { id: 'font-mono', name: 'Modern Mono', class: 'font-mono' },
];

export default function ResumePreview({ resumeData: rawResumeData, style, onChangeStyle }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  const getSpacingClass = () => {
    switch (style.spacing) {
      case 'compact': return 'space-y-2.5 gap-y-2';
      case 'loose': return 'space-y-6 gap-y-5';
      default: return 'space-y-4 gap-y-3.5';
    }
  };

  const getItemSpacingClass = () => {
    return style.spacing === 'compact' ? 'space-y-1' : style.spacing === 'loose' ? 'space-y-3' : 'space-y-2';
  };

  const getSectionHeadingStyle = (color: string) => {
    return {
      borderColor: color,
      color: color
    };
  };

  const getHeaderStyle = (color: string) => {
    return {
      backgroundColor: style.template === 'creative' ? `${color}10` : 'transparent',
      borderLeftColor: color
    };
  };

  // Helper to safely format multiline experience bullets
  const renderBullets = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      // Ensure line starts with bullet icon or clean string
      const displayLine = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')
        ? trimmed.substring(1).trim()
        : trimmed;

      return (
        <li key={i} className="flex items-start gap-1.5 text-slate-700">
          <span className="text-[10px] shrink-0 mt-1.5" style={{ color: style.primaryColor }}>•</span>
          <span className="leading-relaxed">{displayLine}</span>
        </li>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-white/10 shadow-inner overflow-hidden">
      {/* 1. STYLING CONTROL BAR (Hides on Print) */}
      <div className="bg-zinc-900/40 backdrop-blur-sm border-b border-white/10 p-4 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Palette className="h-4 w-4 text-indigo-400" />
            <span>Style Controls</span>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Print or Save PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-3">
          {/* Color Palette Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Primary Accent</label>
            <div className="flex items-center gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onChangeStyle({ ...style, primaryColor: color.hex })}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  className={`h-6 w-6 rounded-full border-2 cursor-pointer transition-all transform hover:scale-110 ${
                    style.primaryColor === color.hex ? 'border-white ring-2 ring-indigo-500 ring-offset-1' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Typography Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Font Style</label>
            <div className="flex gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onChangeStyle({ ...style, fontFamily: f.class })}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-all ${
                    style.fontFamily === f.class ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Density / Padding</label>
            <div className="flex gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/5">
              {(['compact', 'normal', 'loose'] as const).map((space) => (
                <button
                  key={space}
                  onClick={() => onChangeStyle({ ...style, spacing: space })}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md capitalize cursor-pointer transition-all ${
                    style.spacing === space ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {space}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Quick Select */}
        <div className="border-t border-white/5 pt-3">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Resume Template Layout</label>
          <div className="grid grid-cols-4 gap-2">
            {(['modern', 'professional', 'creative', 'minimalist'] as const).map((tpl) => (
              <button
                key={tpl}
                onClick={() => onChangeStyle({ ...style, template: tpl })}
                className={`py-2 text-xs font-bold rounded-lg border cursor-pointer capitalize transition-all ${
                  style.template === tpl
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-sm'
                    : 'bg-zinc-950/80 border-white/5 hover:bg-white/5 text-zinc-400'
                }`}
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LIVE SIMULATOR CANVAS (A4 Format) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-zinc-950 print:bg-white print:p-0">
        <div 
          id="printable-resume"
          ref={resumeRef}
          style={{ fontFamily: style.fontFamily === 'font-sans' ? '"Plus Jakarta Sans", system-ui, sans-serif' : style.fontFamily === 'font-serif' ? '"Playfair Display", Georgia, serif' : 'ui-monospace, monospace' }}
          className={`w-full max-w-[21cm] min-h-[29.7cm] bg-white text-slate-800 shadow-xl p-[1.5cm] flex flex-col justify-between overflow-hidden print:shadow-none print:p-0 print:m-0 print:w-full`}
        >
          {/* TEMPLATE RENDERING SWITCH */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* ---------- A. THE PROFESSIONAL TEMPLATE (Classic Executive) ---------- */}
              {style.template === 'professional' && (
                <div className={getSpacingClass()}>
                  {/* Header */}
                  <div className="text-center border-b pb-4 space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{resumeData.personalInfo.name || "Alex Morgan"}</h1>
                    <div className="text-sm font-semibold tracking-wide uppercase" style={{ color: style.primaryColor }}>
                      {resumeData.personalInfo.title || "Target Job Position"}
                    </div>
                    {/* Contact details list */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {resumeData.personalInfo.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {resumeData.personalInfo.location}</span>}
                      {resumeData.personalInfo.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {resumeData.personalInfo.website}</span>}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      {resumeData.personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> {resumeData.personalInfo.linkedin}</span>}
                      {resumeData.personalInfo.github && <span className="flex items-center gap-1"><Github className="h-3 w-3" /> {resumeData.personalInfo.github}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <div className="space-y-1.5">
                      <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-1" style={getSectionHeadingStyle(style.primaryColor)}>Professional Summary</h2>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-1" style={getSectionHeadingStyle(style.primaryColor)}>Work History</h2>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className={getItemSpacingClass()}>
                            <div className="flex justify-between items-baseline">
                              <div>
                                <span className="text-xs font-black text-slate-900">{exp.position}</span>
                                <span className="text-xs text-slate-500 mx-1.5">|</span>
                                <span className="text-xs font-bold text-slate-700">{exp.company}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 italic mb-1">{exp.location}</p>
                            <ul className="text-xs space-y-1">
                              {renderBullets(exp.description)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-1" style={getSectionHeadingStyle(style.primaryColor)}>Education</h2>
                      <div className="space-y-3">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between items-start">
                            <div className="text-xs">
                              <div className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                              <div className="text-slate-600">{edu.school} {edu.gpa && <span className="font-medium text-indigo-600">(GPA: {edu.gpa})</span>}</div>
                              <div className="text-[10px] text-slate-400">{edu.location}</div>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-1" style={getSectionHeadingStyle(style.primaryColor)}>Projects</h2>
                      <div className="grid grid-cols-1 gap-3">
                        {resumeData.projects.map((p) => (
                          <div key={p.id} className="text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-900">{p.name} — <span className="text-slate-500 font-medium italic">{p.role}</span></span>
                              {p.link && <span className="text-[10px] text-slate-400 font-normal flex items-center gap-0.5">{p.link}</span>}
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Section */}
                  {resumeData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-1" style={getSectionHeadingStyle(style.primaryColor)}>Core Competencies</h2>
                      <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                        {resumeData.skills.map((skill) => (
                          <span key={skill} className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certs and Languages row */}
                  {(resumeData.certifications.length > 0 || resumeData.languages.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {resumeData.certifications.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: style.primaryColor }}>Certifications</h3>
                          <ul className="text-xs space-y-1.5">
                            {resumeData.certifications.map((c) => (
                              <li key={c.id} className="flex justify-between items-center text-slate-600">
                                <span><span className="font-bold text-slate-800">{c.name}</span> — {c.issuer}</span>
                                <span className="text-[10px] font-mono shrink-0">{c.date}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeData.languages.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: style.primaryColor }}>Languages</h3>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {resumeData.languages.map((l) => (
                              <span key={l.id} className="px-2.5 py-0.5 rounded border text-slate-700 font-medium bg-white">
                                {l.name} <span className="text-[10px] text-slate-400">({l.level})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* ---------- B. THE MODERNIST TEMPLATE (Asymmetric Sidebar layout) ---------- */}
              {style.template === 'modern' && (
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Sidebar Column */}
                  <div className="col-span-4 border-r border-slate-100 pr-6 space-y-6">
                    {/* Brand Identifier */}
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: style.primaryColor }}>
                        {resumeData.personalInfo.name ? resumeData.personalInfo.name.charAt(0) : 'R'}
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{resumeData.personalInfo.name || "Your Name"}</h1>
                      <div className="text-[11px] font-bold tracking-widest uppercase leading-snug" style={{ color: style.primaryColor }}>
                        {resumeData.personalInfo.title || "Target Role"}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Get in Touch</h3>
                      <ul className="space-y-2.5 text-xs text-slate-600">
                        {resumeData.personalInfo.email && <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 opacity-60" /> <span className="truncate">{resumeData.personalInfo.email}</span></li>}
                        {resumeData.personalInfo.phone && <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 opacity-60" /> <span>{resumeData.personalInfo.phone}</span></li>}
                        {resumeData.personalInfo.location && <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 opacity-60" /> <span>{resumeData.personalInfo.location}</span></li>}
                        {resumeData.personalInfo.website && <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 opacity-60" /> <span className="truncate">{resumeData.personalInfo.website}</span></li>}
                      </ul>
                    </div>

                    {/* Skills tags */}
                    {resumeData.skills.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Core Expertise</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.map((skill) => (
                            <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg text-slate-700 border border-slate-200 bg-slate-50">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {resumeData.languages.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Languages</h3>
                        <ul className="space-y-1.5 text-xs">
                          {resumeData.languages.map((l) => (
                            <li key={l.id} className="text-slate-600">
                              <span className="font-bold text-slate-800">{l.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({l.level})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Primary Content Column */}
                  <div className="col-span-8 space-y-6">
                    {/* Summary */}
                    {resumeData.personalInfo.summary && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-600 leading-relaxed text-justify italic">
                          "{resumeData.personalInfo.summary}"
                        </p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1.5" style={{ borderColor: style.primaryColor }}>Experience History</h3>
                        <div className="space-y-5">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="space-y-1.5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{exp.position}</h4>
                                  <span className="text-xs font-semibold text-slate-500">{exp.company}</span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                  {exp.startDate} – {exp.current ? 'Current' : exp.endDate}
                                </span>
                              </div>
                              <ul className="text-xs space-y-1">
                                {renderBullets(exp.description)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1.5" style={{ borderColor: style.primaryColor }}>Education</h3>
                        <div className="space-y-3">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-start">
                              <div className="text-xs">
                                <h4 className="font-bold text-slate-900">{edu.degree} — {edu.fieldOfStudy}</h4>
                                <p className="text-slate-500">{edu.school} {edu.gpa && <span className="text-indigo-600 font-bold">(GPA: {edu.gpa})</span>}</p>
                              </div>
                              <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1.5" style={{ borderColor: style.primaryColor }}>Key Projects</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {resumeData.projects.map((p) => (
                            <div key={p.id} className="text-xs">
                              <div className="flex justify-between items-baseline font-bold text-slate-900">
                                <span>{p.name} <span className="text-[10px] text-slate-400 font-normal italic">({p.role})</span></span>
                                {p.link && <span className="text-[9px] text-indigo-600 font-normal">{p.link}</span>}
                              </div>
                              <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications list */}
                    {resumeData.certifications.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1.5" style={{ borderColor: style.primaryColor }}>Certifications</h3>
                        <ul className="text-xs space-y-1.5">
                          {resumeData.certifications.map((c) => (
                            <li key={c.id} className="flex justify-between text-slate-600 text-[11px]">
                              <span><span className="font-bold text-slate-800">{c.name}</span> | {c.issuer}</span>
                              <span className="font-mono text-[9px] text-slate-400">{c.date}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ---------- C. THE CREATIVE TEMPLATE (Bold Accents & Block layout) ---------- */}
              {style.template === 'creative' && (
                <div className={getSpacingClass()}>
                  {/* Decorative accent top header */}
                  <div className="p-6 rounded-2xl border-l-8 space-y-3" style={getHeaderStyle(style.primaryColor)}>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-none">{resumeData.personalInfo.name || "Your Name"}</h1>
                        <h2 className="text-sm font-bold uppercase tracking-widest mt-1.5" style={{ color: style.primaryColor }}>
                          {resumeData.personalInfo.title || "Your Target Job Role"}
                        </h2>
                      </div>
                      
                      <div className="text-xs text-slate-600 space-y-1">
                        {resumeData.personalInfo.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {resumeData.personalInfo.email}</div>}
                        {resumeData.personalInfo.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {resumeData.personalInfo.phone}</div>}
                        {resumeData.personalInfo.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {resumeData.personalInfo.location}</div>}
                      </div>
                    </div>

                    <div className="flex gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-200/50">
                      {resumeData.personalInfo.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {resumeData.personalInfo.website}</span>}
                      {resumeData.personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> {resumeData.personalInfo.linkedin}</span>}
                      {resumeData.personalInfo.github && <span className="flex items-center gap-1"><Github className="h-3 w-3" /> {resumeData.personalInfo.github}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">About Me</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience Grid */}
                  {resumeData.experience.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Work Portfolio</h3>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-1.5">
                            <div className="flex justify-between items-baseline flex-wrap">
                              <span className="text-xs font-black text-slate-800">{exp.position} at <span style={{ color: style.primaryColor }}>{exp.company}</span></span>
                              <span className="text-[10px] font-mono text-slate-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                            </div>
                            <ul className="text-xs space-y-1 mt-2">
                              {renderBullets(exp.description)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grid double columns for Education and Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Education</h3>
                        <div className="space-y-3">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id} className="text-xs space-y-0.5">
                              <h4 className="font-bold text-slate-800">{edu.degree} in {edu.fieldOfStudy}</h4>
                              <p className="text-slate-500">{edu.school}</p>
                              <p className="text-[10px] text-slate-400">{edu.startDate} - {edu.current ? 'Present' : edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills tags */}
                    {resumeData.skills.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Top Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.map((skill) => (
                            <span key={skill} className="text-xs px-2.5 py-1 rounded-xl font-bold text-slate-700 bg-slate-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ---------- D. THE MINIMALIST TEMPLATE (Elegant typography) ---------- */}
              {style.template === 'minimalist' && (
                <div className={getSpacingClass()}>
                  {/* Header */}
                  <div className="space-y-2 pb-6 border-b border-slate-100">
                    <h1 className="text-3xl font-light tracking-tight text-slate-900">{resumeData.personalInfo.name || "Your Name"}</h1>
                    <div className="text-xs font-mono tracking-widest uppercase text-slate-400">
                      {resumeData.personalInfo.title || "Your Profession"}
                    </div>
                    {/* Horizontal simple contact details */}
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500 font-light">
                      {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                      {resumeData.personalInfo.website && <span className="underline">{resumeData.personalInfo.website}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <p className="text-xs text-slate-600 leading-relaxed text-justify font-light">{resumeData.personalInfo.summary}</p>
                  )}

                  {/* Work Experience */}
                  {resumeData.experience.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Experience</h3>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-baseline font-medium text-slate-800">
                              <span className="text-xs font-bold text-slate-900">{exp.position} <span className="font-light text-slate-400">at</span> {exp.company}</span>
                              <span className="text-[10px] font-mono text-slate-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                            </div>
                            <ul className="text-xs space-y-1 font-light">
                              {renderBullets(exp.description)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Education</h3>
                      <div className="space-y-3">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between items-start text-xs font-light">
                            <div>
                              <span className="font-bold text-slate-800">{edu.degree}</span> in <span className="font-medium text-slate-700">{edu.fieldOfStudy}</span>
                              <div className="text-slate-500">{edu.school} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Projects</h3>
                      <div className="space-y-3">
                        {resumeData.projects.map((p) => (
                          <div key={p.id} className="text-xs font-light">
                            <div className="flex justify-between font-medium text-slate-800">
                              <span>{p.name} <span className="text-[10px] text-slate-400 font-light">({p.role})</span></span>
                              {p.link && <span className="text-[9px] text-slate-400">{p.link}</span>}
                            </div>
                            <p className="text-slate-500 leading-relaxed text-[11px] mt-0.5">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills tags */}
                  {resumeData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Technical Skillset</h3>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        {resumeData.skills.join('  •  ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Sign-off (Discreet placeholder) */}
            <div className="mt-12 pt-4 border-t border-slate-100 text-center text-[9px] text-slate-300 font-mono tracking-widest print:hidden">
              BUILT WITH RESUMESCRAFT AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
