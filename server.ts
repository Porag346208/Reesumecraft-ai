import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI client to avoid crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------- API ROUTES -----------------

// 1. Enhance Summary
app.post("/api/gemini/enhance-summary", async (req, res) => {
  try {
    const { currentSummary, targetJob } = req.body;
    const ai = getAI();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert executive resume writer. Enhance the following professional summary to make it highly engaging, impactful, and tailored for the target job title of "${targetJob || "target role"}". 
      
      Current Summary: "${currentSummary || ""}"
      
      Requirements:
      - Write in a professional, active, recruiter-friendly voice.
      - Keep it between 3-4 sentences (approx. 50-80 words).
      - Highlight achievements, measurable impact, and core expertise.
      - Return ONLY the enhanced summary text, without introductory words, quotes, or markdown wrappers.`,
    });

    const enhancedSummary = response.text?.trim() || "";
    res.json({ enhancedSummary });
  } catch (error: any) {
    console.error("Enhance Summary Error:", error);
    res.status(500).json({ error: error.message || "Failed to enhance summary" });
  }
});

// 2. Enhance Bullet Point
app.post("/api/gemini/enhance-bullet-point", async (req, res) => {
  try {
    const { currentBullet, context } = req.body;
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert career coach. Transform the following resume bullet point to make it more impactful using the X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]). Make sure it begins with a strong action verb and integrates measurable metrics or business value if possible.
      
      Current Bullet Point: "${currentBullet || ""}"
      Optional Role/Context: "${context || ""}"
      
      Requirements:
      - Start with a strong action verb (e.g., Spearheaded, Orchestrated, Optimized).
      - Ensure it reads naturally and professionally.
      - Do NOT make up unrealistic credentials, but frame it with typical metrics like percentage increases or time saved.
      - Return ONLY the single enhanced bullet point string (with a leading bullet "• "). No markdown wrappers or conversational intro/outro.`,
    });

    const enhancedBullet = response.text?.trim() || "";
    res.json({ enhancedBullet });
  } catch (error: any) {
    console.error("Enhance Bullet Point Error:", error);
    res.status(500).json({ error: error.message || "Failed to enhance bullet point" });
  }
});

// 3. Suggest Skills
app.post("/api/gemini/suggest-skills", async (req, res) => {
  try {
    const { jobTitle } = req.body;
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Provide a list of 12 highly relevant hard skills, soft skills, and toolsets for a candidate aiming for the job title: "${jobTitle || "Software Engineer"}". Return the response as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const skills = JSON.parse(response.text?.trim() || "[]");
    res.json({ skills });
  } catch (error: any) {
    console.error("Suggest Skills Error:", error);
    res.status(500).json({ error: error.message || "Failed to suggest skills" });
  }
});

// 4. ATS Match Analyzer
app.post("/api/gemini/analyze-ats", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an advanced Applicant Tracking System (ATS) parser and recruiter. Analyze the following candidate's resume content against the provided target job description. Give an ATS match percentage (0-100), key missing keywords that recruiters seek in this description, suggested structural or content updates to improve alignment, and a tailored professional summary optimized for this job description.
      
      Resume Content:
      ---
      ${resumeText}
      ---
      
      Job Description:
      ---
      ${jobDescription}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "ATS Match Score percentage between 0 and 100 based on keyword match, relevant skills, and experience alignment."
            },
            matchAnalysis: {
              type: Type.STRING,
              description: "A professional 2-3 sentence overview analyzing how well the candidate matches the job description."
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 5-8 crucial keywords, technologies, or competencies present in the job description but missing or weak in the resume."
            },
            suggestedChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 high-priority actionable recommendations for the candidate to tailor their work history and skills to match this job."
            },
            tailoredSummary: {
              type: Type.STRING,
              description: "An optimized, highly tailored 3-4 sentence professional summary that the candidate could use for this specific application."
            }
          },
          required: ["score", "matchAnalysis", "missingKeywords", "suggestedChanges", "tailoredSummary"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("ATS Match Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze ATS alignment" });
  }
});

// 5. Magic Full Resume Generator
app.post("/api/gemini/magic-generate", async (req, res) => {
  try {
    const { userPrompt, targetRole } = req.body;
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an elite executive resume crafter. Generate a complete, beautifully structured, highly persuasive, professional resume draft based on the user's quick description of their experience and their desired target role.
      
      User's Quick Background: "${userPrompt || ""}"
      Desired Target Role: "${targetRole || ""}"
      
      Ensure you create robust, fully-fleshed out sections. Do NOT use placeholders. Generate realistic company names, metrics-driven bullet points, real educational milestones, and top-tier industry skills related to their field. Return the output strictly conforming to the JSON schema specified.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                summary: { type: Type.STRING, description: "An engaging, metric-focused 3-4 sentence professional summary." }
              },
              required: ["name", "title", "email", "phone", "location", "summary"]
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING, description: "YYYY-MM format" },
                  endDate: { type: Type.STRING, description: "YYYY-MM format, or empty if current" },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING, description: "3-4 highly detailed, metrics-focused bullet points starting with strong action verbs, separated by newlines (e.g. '• Spearheaded...\\n• Optimized...')" }
                },
                required: ["company", "position", "startDate", "current", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING, description: "YYYY-MM format" },
                  endDate: { type: Type.STRING, description: "YYYY-MM format" },
                  current: { type: Type.BOOLEAN },
                  gpa: { type: Type.STRING }
                },
                required: ["school", "degree", "fieldOfStudy", "startDate", "endDate", "current"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["name", "role", "description"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 8-12 professional hard/soft skills tailored to the role."
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING, description: "YYYY-MM format" }
                },
                required: ["name", "issuer"]
              }
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING }
                },
                required: ["name", "level"]
              }
            }
          },
          required: ["personalInfo", "experience", "education", "projects", "skills", "certifications", "languages"]
        }
      }
    });

    const fullResume = JSON.parse(response.text?.trim() || "{}");
    // Generate unique IDs for experience, education, projects, certifications, languages
    if (fullResume.experience) {
      fullResume.experience = fullResume.experience.map((e: any, index: number) => ({ ...e, id: `exp-gen-${index}` }));
    }
    if (fullResume.education) {
      fullResume.education = fullResume.education.map((e: any, index: number) => ({ ...e, id: `edu-gen-${index}` }));
    }
    if (fullResume.projects) {
      fullResume.projects = fullResume.projects.map((p: any, index: number) => ({ ...p, id: `proj-gen-${index}` }));
    }
    if (fullResume.certifications) {
      fullResume.certifications = fullResume.certifications.map((c: any, index: number) => ({ ...c, id: `cert-gen-${index}` }));
    }
    if (fullResume.languages) {
      fullResume.languages = fullResume.languages.map((l: any, index: number) => ({ ...l, id: `lang-gen-${index}` }));
    }

    res.json(fullResume);
  } catch (error: any) {
    console.error("Magic Generate Error:", error);
    res.status(500).json({ error: error.message || "Failed to auto-generate resume" });
  }
});

// 6. Parse PDF Resume
app.post("/api/pdf/parse", async (req, res) => {
  try {
    const { base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "Missing PDF base64Data" });
    }
    const ai = getAI();

    const pdfPart = {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        pdfPart,
        "Extract all the content of this resume PDF and structure it exactly as a ResumesCraft JSON object with the exact fields: personalInfo, experience, education, projects, skills, certifications, languages. Standardize the output, fill in details carefully based on the document. Return the output strictly as valid JSON conforming to the schema."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["name"]
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING }
                },
                required: ["company", "position"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN }
                },
                required: ["school", "degree"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["name"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING }
                },
                required: ["name"]
              }
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING }
                },
                required: ["name"]
              }
            }
          }
        }
      }
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    
    // Auto-generate IDs
    if (parsedJson.experience) {
      parsedJson.experience = parsedJson.experience.map((e: any, idx: number) => ({ ...e, id: `exp-pdf-${idx}` }));
    }
    if (parsedJson.education) {
      parsedJson.education = parsedJson.education.map((e: any, idx: number) => ({ ...e, id: `edu-pdf-${idx}` }));
    }
    if (parsedJson.projects) {
      parsedJson.projects = parsedJson.projects.map((p: any, idx: number) => ({ ...p, id: `proj-pdf-${idx}` }));
    }
    if (parsedJson.certifications) {
      parsedJson.certifications = parsedJson.certifications.map((c: any, idx: number) => ({ ...c, id: `cert-pdf-${idx}` }));
    }
    if (parsedJson.languages) {
      parsedJson.languages = parsedJson.languages.map((l: any, idx: number) => ({ ...l, id: `lang-pdf-${idx}` }));
    }

    res.json(parsedJson);
  } catch (error: any) {
    console.error("PDF Parsing error:", error);
    res.status(500).json({ error: error.message || "Failed to parse PDF resume" });
  }
});

// ----------------- STATIC SERVING / VITE MIDDLEWARE -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
