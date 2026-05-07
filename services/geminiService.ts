import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { Gig, ProjectPlan } from '../types';

export const getGeminiApiKey = () => localStorage.getItem('user_gemini_api_key') || '';

const getAI = () => {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error('Please provide your Gemini API key to use this feature.');
  }
  return new GoogleGenAI({ apiKey: key });
};

// Helper to clean JSON string from Markdown code blocks
const cleanJson = (text: string): string => {
  if (!text) return '[]';
  // Remove markdown code blocks if present (e.g. ```json ... ```)
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  return clean.trim();
};

// Define the schema for a list of Gigs to ensure strict JSON output
const gigSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      clientVibe: { type: Type.STRING },
      recommendedStack: { type: Type.STRING },
      stackCost: { type: Type.STRING, enum: ['Free', 'Paid'] },
      duration: { type: Type.STRING, enum: ['Easy (< 1 hr)', 'Medium (2-4 hrs)', 'Hard (> 8 hrs)'] },
      payout: { type: Type.STRING },
      category: { type: Type.STRING, enum: ['Web App', 'Chrome Extension', 'Data Visualizer', 'Automation', 'Game'] },
      customerPain: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['Headache', 'Migraine'] },
          painLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'], nullable: true },
          repeatability: { type: Type.STRING, enum: ['Constant', 'Daily', 'Weekly', 'Monthly', 'Once'], nullable: true }
        },
        required: ['type']
      },
      approach: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            instruction: { type: Type.STRING }
          },
          required: ['stepNumber', 'instruction']
        }
      }
    },
    required: ['id', 'title', 'clientVibe', 'recommendedStack', 'stackCost', 'duration', 'payout', 'category', 'customerPain', 'approach']
  }
};

const missionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      emoji: { type: Type.STRING },
      text: { type: Type.STRING }
    },
    required: ['emoji', 'text']
  }
};

const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tools: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['name', 'url', 'reason']
      }
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['id', 'title', 'description']
      }
    }
  },
  required: ['tools', 'tasks']
};

export const generateSocialGigs = async (cause: string): Promise<Gig[]> => {
  const ai = getAI();
  const prompt = `
    You are an expert Architect for "Skilled Volunteering" and "Vibe Coding".
    
    The user wants to help with the following social cause: "${cause}".
    
    Generate 6 distinct, high-impact technical "Gigs" (projects) that a "Vibe Coder" (someone using AI tools like Cursor, v0, Replit) could build to help this cause.
    
    Think like Patagonia Action Works: practical, impactful, and grassroots.
    
    Constraints:
    1.  **Variety**: Include at least 1 Web App, 1 Automation, and 1 Data Visualizer.
    2.  **Difficulty**: 
        - 3 gigs must be "Easy (< 1 hr)" (Headaches)
        - 2 gigs must be "Medium (2-4 hrs)"
        - 1 gig must be "Hard (> 8 hrs)" (Migraines)
    3.  **Customer Pain**:
        - "Migraine" problems are recurring, critical issues (e.g., "Daily coordination chaos").
        - "Headache" problems are annoying but temporary (e.g., "One-off data cleanup").
    4.  **Payout**: Since these are social impact, the "payout" should be phrased as impact metrics or volunteer credits (e.g., "500 Karma Points", "Non-Profit tax receipt", "Eternal Gratitude").
    5.  **Stack**: Recommend modern AI tools (Bolt, Lovable, Replit, Cursor, Gemini, Claude).
    
    Return pure JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: gigSchema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text)) as Gig[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error generating gigs:", error);
    return [];
  }
};

export const generateMissionExamples = async (): Promise<{ emoji: string; text: string }[]> => {
  const ai = getAI();
  const prompt = `
    Generate 6 diverse, modern, and specific "Social Impact Coding Mission" ideas.
    These should be short, punchy 1-sentence prompts that a developer might type into an AI generator.
    Examples of themes: Climate, Education, Poverty, Health, Justice, Wildlife.
    
    Format: JSON array of objects with 'emoji' and 'text'.
    Example: [{"emoji": "🌊", "text": "Track plastic waste in local rivers"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: missionSchema,
      }
    });
    
    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error generating missions:", error);
    return [];
  }
};

export const generateProposal = async (gig: Gig, coderNote: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Act as a "Vibe Coder" volunteering for a social impact project.
    
    Gig: ${gig.title}
    Cause/Vibe: ${gig.clientVibe}
    
    User Note: "${coderNote}"
    
    Write a short, passionate proposal (max 150 words) to the Non-Profit. 
    Explain how you will use AI tools to solve their problem efficiently. 
    Tone: Empathetic, energetic, and competent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    return response.text || "Failed to generate proposal.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating proposal.";
  }
};

// --- New Features for the Guide ---

export const generateProjectPlan = async (gig: Gig): Promise<ProjectPlan> => {
  const ai = getAI();
  const prompt = `
    You are a Senior Technical Product Manager breaking down a "Vibe Coding" project.
    
    Project: ${gig.title}
    Stack: ${gig.recommendedStack}
    Vibe: ${gig.clientVibe}
    
    1. List 3-5 specific software tools/services the user needs to sign up for or install (e.g. VS Code, Cursor, Replit, Supabase, OpenAI API). Provide the real main URL.
    2. Break the project into 5-8 granular, actionable development tasks. Each task should be clear enough for an intermediate developer to execute.
    
    Return strict JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text)) as ProjectPlan;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini API Error generating plan:", error);
    // Return empty plan but don't throw, allowing UI to handle partial state
    return { tools: [], tasks: [] };
  }
};

export const createGigChat = (gig: Gig): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a friendly, expert "Vibe Coding" Mentor. 
      You are guiding a user to build the project: "${gig.title}".
      The recommended stack is: ${gig.recommendedStack}.
      Your goal is to unblock them, provide code snippets when asked, and explain concepts simply.
      Keep answers concise and actionable.`
    }
  });
};