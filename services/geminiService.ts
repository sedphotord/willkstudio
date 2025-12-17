import { GoogleGenAI } from "@google/genai";
import { BASE_SYSTEM_PROMPT as SYSTEM_INSTRUCTION } from '../lib/ai/prompts';
import { AIResponseSchema, ValidatedAIResponse } from '../lib/schemas';
import { File } from '../types';

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found in environment variables.");
      return null;
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// Helper to list just paths for the AI to "Review"
const getFilePaths = (filesStr: string): string => {
    try {
        const files = JSON.parse(filesStr) as File[];
        const paths: string[] = [];
        const traverse = (nodes: File[]) => {
            nodes.forEach(n => {
                paths.push(n.path);
                if(n.children) traverse(n.children);
            });
        };
        traverse(files);
        return paths.join('\n');
    } catch {
        return "Unable to parse file list";
    }
}

export const generateCode = async (
  userPrompt: string, 
  currentFilesContext: string
): Promise<ValidatedAIResponse> => {
  const ai = getClient();
  if (!ai) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const filePaths = getFilePaths(currentFilesContext);

  const prompt = `
    REVIEW THESE EXISTING FILES CAREFULLY:
    ${filePaths}

    FULL FILE CONTEXT (Content):
    ${currentFilesContext}

    USER REQUEST:
    ${userPrompt}

    INSTRUCTIONS:
    - If the user wants a new app, OVERWRITE /src/App.tsx.
    - Check the list above. If a file exists, use 'update'. If not, use 'create'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }

    try {
        const parsedJSON = JSON.parse(text);
        // CRITICAL: Validate with Zod
        const validated = AIResponseSchema.parse(parsedJSON);
        return validated;
    } catch (e) {
        console.error("Validation Failed", e);
        throw new Error("AI response did not match expected schema.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};