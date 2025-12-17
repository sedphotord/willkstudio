import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { AIResponseSchema, ValidatedAIResponse } from '../lib/schemas';

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

export const generateCode = async (
  userPrompt: string, 
  currentFilesContext: string
): Promise<ValidatedAIResponse> => {
  const ai = getClient();
  if (!ai) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const prompt = `
    Current File Context:
    ${currentFilesContext}

    User Request:
    ${userPrompt}
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
