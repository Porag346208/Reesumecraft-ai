export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Plain text or markdown bullets
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  link: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[]; // List of skills
  certifications: Certificate[];
  languages: Language[];
}

export type ResumeTemplate = 'modern' | 'professional' | 'creative' | 'minimalist';

export interface ResumeStyle {
  template: ResumeTemplate;
  primaryColor: string;
  fontFamily: string;
  spacing: 'compact' | 'normal' | 'loose';
}

export interface ATSResult {
  score: number;
  matchAnalysis: string;
  missingKeywords: string[];
  suggestedChanges: string[];
  tailoredSummary?: string;
}
