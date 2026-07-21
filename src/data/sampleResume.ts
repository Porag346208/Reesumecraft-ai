import { ResumeData } from '../types';

export const sampleResume: ResumeData = {
  personalInfo: {
    name: "Alex Morgan",
    title: "Senior Full Stack Engineer",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    summary: "Senior Full Stack Engineer with over 6 years of experience building scalable web applications and high-performance APIs. Proven record of leading cross-functional teams, optimizing cloud architecture, and improving frontend performance by up to 40%. Passionate about creating elegant, user-centric solutions using React, Node.js, and cloud native technologies."
  },
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions",
      position: "Lead Full Stack Developer",
      location: "San Francisco, CA",
      startDate: "2023-03",
      endDate: "",
      current: true,
      description: "• Spearheaded the migration of a legacy monolithic platform to a modern microservices architecture using Node.js, TypeScript, and AWS, reducing operational overhead by 25%.\n• Built and maintained critical responsive user interfaces using React, Next.js, and Tailwind CSS, increasing page load speeds and boosting user engagement by 35%.\n• Designed and optimized complex PostgreSQL queries and Redis caching layers, accelerating database transaction speeds by 50%.\n• Mentored 5 junior developers, established modern CI/CD pipelines, and conducted comprehensive code reviews to maintain high quality standards."
    },
    {
      id: "exp-2",
      company: "Innovate Labs",
      position: "Senior Software Engineer",
      location: "Oakland, CA",
      startDate: "2020-06",
      endDate: "2023-02",
      current: false,
      description: "• Led the frontend development of a real-time data analytics dashboard utilizing React, Recharts, and WebSockets, rendering over 10,000 data updates per second efficiently.\n• Developed and secure-scaled REST and GraphQL APIs handling upwards of 5 million requests daily with Express.js and Apollo Server.\n• Implemented unit, integration, and end-to-end testing suites using Jest and Playwright, lifting test coverage from 40% to 88% and eliminating critical production bugs."
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science & Engineering",
      location: "Berkeley, CA",
      startDate: "2016-09",
      endDate: "2020-05",
      current: false,
      gpa: "3.85/4.0"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "CloudScale Analytics",
      role: "Creator & Lead Developer",
      description: "A self-hosted, lightweight website analytics suite utilizing React and Node.js with privacy-first tracking. Currently monitoring 500+ websites with an average response time under 15ms.",
      link: "https://github.com/alexmorgan/cloudscale"
    },
    {
      id: "proj-2",
      name: "ScribeAI Editor",
      role: "Co-Developer",
      description: "An AI-powered markdown editor integrating natural language processing to suggest summaries, alternative tones, and spelling corrections in real-time.",
      link: "https://github.com/alexmorgan/scribe-ai"
    }
  ],
  skills: [
    "JavaScript/TypeScript", "React/Next.js", "Node.js (Express)", "Python", 
    "PostgreSQL", "MongoDB", "GraphQL", "AWS (S3/EC2/Lambda)", 
    "Docker", "Tailwind CSS", "Git/CI-CD", "Redis"
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2024-01"
    },
    {
      id: "cert-2",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2022-11"
    }
  ],
  languages: [
    { id: "lang-1", name: "English", level: "Native" },
    { id: "lang-2", name: "Spanish", level: "Conversational" }
  ]
};
