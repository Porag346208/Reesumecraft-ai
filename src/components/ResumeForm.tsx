import React, { useState } from 'react';
import { 
  User, FileText, Briefcase, GraduationCap, Code, FolderGit2, Award, 
  Plus, Trash2, Sparkles, HelpCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { ResumeData, Experience, Education, Project, Certificate, Language } from '../types';

interface ResumeFormProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

type TabType = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'more';

export default function ResumeForm({ resumeData, onChange }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('contact');
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [targetJobTitle, setTargetJobTitle] = useState(resumeData.personalInfo.title || '');
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Experience Bullet enhancer state tracker
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'contact', label: 'Contact', icon: <User className="h-4 w-4" /> },
    { id: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="h-4 w-4" /> },
    { id: 'more', label: 'More', icon: <Award className="h-4 w-4" /> },
  ];

  // Helper to update personal info nested fields
  const updatePersonalInfo = (field: keyof typeof resumeData.personalInfo, value: string) => {
    const updated = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    };
    onChange(updated);
    if (field === 'title') {
      setTargetJobTitle(value);
    }
  };

  // Enhance Professional Summary with AI
  const handleEnhanceSummary = async () => {
    if (!resumeData.personalInfo.summary.trim()) {
      setError("Please write a draft or keyword summary first so the AI can build upon it.");
      return;
    }
    setEnhancingSummary(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/enhance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSummary: resumeData.personalInfo.summary,
          targetJob: targetJobTitle || resumeData.personalInfo.title
        })
      });

      if (!response.ok) throw new Error("Failed to enhance summary");
      const data = await response.json();
      updatePersonalInfo('summary', data.enhancedSummary);
    } catch (err: any) {
      console.error(err);
      setError("Could not optimize summary. Make sure Gemini is enabled.");
    } finally {
      setEnhancingSummary(false);
    }
  };

  // Enhance Experience Bullet Point with AI
  const handleEnhanceBullet = async (expId: string, currentBulletText: string) => {
    if (!currentBulletText.trim()) {
      setError("Bullet point content is empty. Please enter some text to optimize.");
      return;
    }
    setEnhancingBulletId(expId);
    setError(null);
    try {
      const expItem = resumeData.experience.find(e => e.id === expId);
      const positionContext = expItem ? `${expItem.position} at ${expItem.company}` : '';

      const response = await fetch('/api/gemini/enhance-bullet-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBullet: currentBulletText,
          context: positionContext || targetJobTitle
        })
      });

      if (!response.ok) throw new Error("Failed to optimize bullet points");
      const data = await response.json();

      // Replace or update bullet point list in the description
      const updatedExperience = resumeData.experience.map(exp => {
        if (exp.id === expId) {
          // If the description has multiple bullets, replace or append. We will just append or swap.
          // Since it's a textarea, let's show the enhanced bullet clearly or let the user replace it.
          // To make it easy, we replace the line or append it. Let's merge it:
          const lines = exp.description.split('\n');
          const finalLines = lines.map(line => {
            if (line.includes(currentBulletText)) {
              return data.enhancedBullet;
            }
            return line;
          });
          
          // If it was not matching exactly, just append or set as the new description
          const descriptionVal = exp.description.trim() === currentBulletText.trim()
            ? data.enhancedBullet
            : exp.description + '\n' + data.enhancedBullet;

          return { ...exp, description: descriptionVal };
        }
        return exp;
      });

      onChange({ ...resumeData, experience: updatedExperience });
    } catch (err: any) {
      console.error(err);
      setError("Failed to optimize bullet point. Please try again.");
    } finally {
      setEnhancingBulletId(null);
    }
  };

  // EXPERIENCE CRUD
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '• '
    };
    onChange({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = resumeData.experience.map(exp => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onChange({ ...resumeData, experience: updated });
  };

  const deleteExperience = (id: string) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  // EDUCATION CRUD
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: ''
    };
    onChange({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const updated = resumeData.education.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onChange({ ...resumeData, education: updated });
  };

  const deleteEducation = (id: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  // PROJECTS CRUD
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      role: '',
      description: '',
      link: ''
    };
    onChange({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = resumeData.projects.map(proj => {
      if (proj.id === id) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const deleteProject = (id: string) => {
    onChange({
      ...resumeData,
      projects: resumeData.projects.filter(proj => proj.id !== id)
    });
  };

  // SKILLS CRUD
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    
    // Split on commas to add multiple skills at once
    const newSkills = skillInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !resumeData.skills.includes(s));

    if (newSkills.length > 0) {
      onChange({
        ...resumeData,
        skills: [...resumeData.skills, ...newSkills]
      });
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Suggest Skills based on job title
  const handleSuggestSkills = async () => {
    const title = targetJobTitle || resumeData.personalInfo.title;
    if (!title.trim()) {
      setError("Please specify your Target Job Title first to get accurate skill suggestions.");
      return;
    }
    setSuggestingSkills(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: title })
      });
      if (!response.ok) throw new Error("Failed to suggest skills");
      const data = await response.json();
      
      // Add unique suggested skills
      const uniqueNewSkills = data.skills.filter((s: string) => !resumeData.skills.includes(s));
      onChange({
        ...resumeData,
        skills: [...resumeData.skills, ...uniqueNewSkills]
      });
    } catch (err: any) {
      console.error(err);
      setError("Could not fetch skill suggestions. Verify server capabilities.");
    } finally {
      setSuggestingSkills(false);
    }
  };

  // CERTIFICATIONS AND LANGUAGES CRUD
  const addCertification = () => {
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: ''
    };
    onChange({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert]
    });
  };

  const updateCertification = (id: string, field: keyof Certificate, value: string) => {
    const updated = resumeData.certifications.map(c => {
      if (c.id === id) return { ...c, [field]: value };
      return c;
    });
    onChange({ ...resumeData, certifications: updated });
  };

  const deleteCertification = (id: string) => {
    onChange({
      ...resumeData,
      certifications: resumeData.certifications.filter(c => c.id !== id)
    });
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      level: 'Professional'
    };
    onChange({
      ...resumeData,
      languages: [...resumeData.languages, newLang]
    });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    const updated = resumeData.languages.map(l => {
      if (l.id === id) return { ...l, [field]: value };
      return l;
    });
    onChange({ ...resumeData, languages: updated });
  };

  const deleteLanguage = (id: string) => {
    onChange({
      ...resumeData,
      languages: resumeData.languages.filter(l => l.id !== id)
    });
  };

  return (
    <div className="workspace-form-override flex flex-col bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-white/10 shadow-sm overflow-hidden h-full">
      {/* Tab Select Header */}
      <div className="flex border-b border-white/10 bg-zinc-950/60 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Editor Body */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Personal & Contact Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.name}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  placeholder="e.g., Lead Project Manager"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="e.g., jane.doe@email.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="e.g., +1 (555) 019-2834"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="e.g., New York, NY"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Website / Portfolio</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.website}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  placeholder="e.g., https://janedoe.me"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="e.g., https://linkedin.com/in/janedoe"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">GitHub Profile URL</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="e.g., https://github.com/janedoe"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Professional Summary</h3>
              
              <button
                type="button"
                onClick={handleEnhanceSummary}
                disabled={enhancingSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:bg-indigo-50 font-bold rounded-lg text-xs transition-all cursor-pointer border border-indigo-100/30"
              >
                {enhancingSummary ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>AI Tailoring...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-indigo-600" />
                    <span>AI Enhance Summary</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 italic">
              Tip: Write a short draft summarizing your key skills and achievements. Then click the AI Enhance button to polish it with rich action keywords tailored to your target job title.
            </p>

            <div>
              <div className="flex gap-2 mb-2 items-center">
                <span className="text-xs font-semibold text-slate-600">Tailoring Role:</span>
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g., Lead Full Stack Engineer"
                  className="px-2 py-1 rounded text-xs border border-slate-200 w-full max-w-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <textarea
                value={resumeData.personalInfo.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                rows={7}
                placeholder="Write your professional summary here..."
                className="w-full rounded-lg border border-slate-200 p-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 3. EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Work Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Job
              </button>
            </div>

            {resumeData.experience.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-500">No experiences listed. Click Add Job to get started.</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Job Position #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Experience"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="e.g., Google"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Job Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="e.g., Senior Systems Engineer"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Job Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="e.g., Mountain View, CA"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            disabled={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-job-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => {
                            updateExperience(exp.id, 'current', e.target.checked);
                            if (e.target.checked) updateExperience(exp.id, 'endDate', '');
                          }}
                          className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`current-job-${exp.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                          I currently work in this role
                        </label>
                      </div>
                    </div>

                    {/* Bullet description with AI optimizer */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-600">Roles, Responsibilities & Accomplishments</label>
                        
                        {/* Bullet optimizer helper */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Send the last line or highlighted text
                              const lines = exp.description.split('\n');
                              const lastLine = lines[lines.length - 1].replace('• ', '').trim();
                              handleEnhanceBullet(exp.id, lastLine || exp.description);
                            }}
                            disabled={enhancingBulletId !== null}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:bg-indigo-50 rounded transition-all cursor-pointer border border-indigo-100/30"
                            title="Optimize the last line with X-Y-Z metrics"
                          >
                            {enhancingBulletId === exp.id ? (
                              <>
                                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                <span>Enhancing bullet...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                                <span>AI Optimize Bullet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={5}
                        placeholder="• Spearheaded product redesign leading to a 20% increase in clicks.&#10;• Designed scalable database architectures."
                        className="w-full rounded-lg border border-slate-200 p-3.5 text-xs font-mono focus:border-indigo-500 focus:outline-none transition-all leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-400">
                        Pro-tip: Start each line with a bullet "• ". Highlight or write your raw draft on the last line, then click "AI Optimize Bullet" to make it highly metrics-driven!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Education Details</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Education
              </button>
            </div>

            {resumeData.education.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-500">No education milestones added. Click Add Education to insert.</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Milestone #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteEducation(edu.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          placeholder="e.g., Harvard University"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g., Master of Science"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                          placeholder="e.g., Computer Science"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">GPA (optional)</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          placeholder="e.g., 3.9/4.0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">School Location</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                          placeholder="e.g., Cambridge, MA"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            disabled={edu.current}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-500 disabled:bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-edu-${edu.id}`}
                          checked={edu.current}
                          onChange={(e) => {
                            updateEducation(edu.id, 'current', e.target.checked);
                            if (e.target.checked) updateEducation(edu.id, 'endDate', '');
                          }}
                          className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`current-edu-${edu.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                          I am currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Core Technical & Professional Skills</h3>
              
              <button
                type="button"
                onClick={handleSuggestSkills}
                disabled={suggestingSkills}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:bg-indigo-50 font-bold rounded-lg text-xs transition-all cursor-pointer border border-indigo-100/30"
              >
                {suggestingSkills ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Analyzing role...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-indigo-600" />
                    <span>AI Suggest Skills</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              List keywords like technologies, frameworks, soft skills, or methodology tools. Add comma-separated terms to insert in bulk.
            </p>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., Python, Kubernetes, Agility, AWS (press enter)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Active Skills Rendering */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No skills listed yet. Add some tags above.</span>
                ) : (
                  resumeData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-xl text-xs border border-indigo-100/40"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-indigo-400 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Featured Projects</h3>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Project
              </button>
            </div>

            {resumeData.projects.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-500">No projects added. Click Add Project to showcase your build history.</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {resumeData.projects.map((proj, index) => (
                  <div key={proj.id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Project #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteProject(proj.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                          placeholder="e.g., My Portfolio Hub"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Your Role / Contribution</label>
                        <input
                          type="text"
                          value={proj.role}
                          onChange={(e) => updateProject(proj.id, 'role', e.target.value)}
                          placeholder="e.g., Solo Architect & Developer"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Project Demo / Repository URL</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                          placeholder="e.g., https://github.com/myusername/project"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Project Description & Core Tech stack</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                          rows={3}
                          placeholder="Describe the objective, methodology, and outcome of this project..."
                          className="w-full rounded-lg border border-slate-200 p-3.5 text-xs focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. MORE TAB (CERTIFICATIONS & LANGUAGES) */}
        {activeTab === 'more' && (
          <div className="space-y-6">
            {/* Certifications Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800">Certifications & Accreditations</h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Certificate
                </button>
              </div>

              {resumeData.certifications.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No certifications added. Showcase certificates to bolster your resume.</p>
              ) : (
                <div className="space-y-3">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="flex gap-3 items-end p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Certificate Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            placeholder="e.g., AWS Architect"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Issuing Authority</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                            placeholder="e.g., Amazon"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Date Earned</label>
                          <input
                            type="month"
                            value={cert.date}
                            onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-indigo-500 bg-white"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCertification(cert.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-100 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Languages Block */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800">Languages</h3>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Language
                </button>
              </div>

              {resumeData.languages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No languages added. Click Add Language to list languages you speak.</p>
              ) : (
                <div className="space-y-3">
                  {resumeData.languages.map((lang) => (
                    <div key={lang.id} className="flex gap-3 items-end p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Language</label>
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                            placeholder="e.g., German"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Proficiency Level</label>
                          <select
                            value={lang.level}
                            onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 bg-white focus:outline-none"
                          >
                            <option value="Native">Native / Bilingual</option>
                            <option value="Fluent">Professional / Fluent</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Elementary">Elementary / Basic</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteLanguage(lang.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-100 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
