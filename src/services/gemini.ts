import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getCareerAdvice(userSkills: string[], interests: string[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `As an expert career mentor, analyze these skills: ${userSkills.join(", ")} and interests: ${interests.join(", ")}. 
  Suggest 3 suitable career paths and explain why. Return in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            career: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateRoadmap(goal: string, currentSkills: string[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a 3-month skill roadmap for a student who wants to become a ${goal}. 
  Current skills: ${currentSkills.join(", ")}. 
  Provide specific topics and learning resources for each month. Return in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeSkillGap(goal: string, currentSkills: string[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `Compare these student skills: ${currentSkills.join(", ")} with the industry requirements for a ${goal}. 
  Identify missing skills and suggest a priority order. Return in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          analysis: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}
