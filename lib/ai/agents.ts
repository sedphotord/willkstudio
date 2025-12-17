import { GoogleGenAI } from "@google/genai";
import { AIResponseSchema, RouterSchema, SuggestionsSchema, ValidatedAIResponse, RouterResponse } from '../schemas';
import { ROUTER_PROMPT, CODE_AGENT_PROMPT, FIX_AGENT_PROMPT, UI_AGENT_PROMPT, SUGGESTION_PROMPT, ENHANCE_PROMPT } from './prompts';
import { File, ChatAttachment } from '../../types';
import { useStore } from '../store';

// --- Client Factory ---
const getClient = () => {
  // Try to get from store first
  const state = useStore.getState();
  const apiKey = state.settings.geminiApiKey || process.env.API_KEY;
  
  if (!apiKey) throw new Error("API Key not found. Please add it in Settings.");
  return new GoogleGenAI({ apiKey });
};

// --- Helper: Context Builder ---
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

// --- Abstract Base Agent ---
abstract class BaseAgent {
  protected abstract systemPrompt: string;
  protected abstract name: string;

  protected async callGemini<T>(
    prompt: string, 
    schema: any, // Zod Schema
    context?: string,
    responseMimeType: string = 'application/json',
    attachments: ChatAttachment[] = []
  ): Promise<T> {
    
    const ai = getClient();
    const settings = useStore.getState().settings;

    // Construct the multimodal content parts
    const contentParts: any[] = [];

    // 1. Add Context (Files)
    if (context) {
        const contextStr = `
        CONTEXT FILES (Read Only):
        ${getFilePaths(context)}

        FULL FILE CONTENT:
        ${context}
        `;
        contentParts.push({ text: contextStr });
    }

    // 2. Add Settings / Custom Instructions
    let fullSystemPrompt = this.systemPrompt;
    if (settings.languagePreference) {
        fullSystemPrompt += `\n\nPREFERENCE: The user prefers ${settings.languagePreference.toUpperCase()} code.`;
    }
    if (settings.customInstructions) {
        fullSystemPrompt += `\n\nCUSTOM USER RULES:\n${settings.customInstructions}`;
    }

    // 3. Add User Input
    contentParts.push({ text: `USER REQUEST: ${prompt}` });

    // 4. Add Attachments
    attachments.forEach(att => {
        if (att.type === 'image' || att.mimeType === 'application/pdf') {
            const base64Data = att.data.includes('base64,') 
                ? att.data.split('base64,')[1] 
                : att.data;
            contentParts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: base64Data
                }
            });
        } else {
            contentParts.push({
                text: `\n--- ATTACHED FILE: ${att.name} ---\n${att.data}\n--- END ATTACHMENT ---\n`
            });
        }
    });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contentParts },
        config: {
          systemInstruction: fullSystemPrompt,
          responseMimeType: responseMimeType,
          temperature: 0.2,
        }
      });

      const text = response.text;
      if (!text) throw new Error(`${this.name}: No response`);

      if (responseMimeType === 'text/plain') {
          return text as T;
      }

      let json = JSON.parse(text);
      
      if (Array.isArray(json) && this.name !== 'Router') {
          console.warn(`[${this.name}] Received array instead of object. Wrapping in default structure.`);
          json = {
              reasoning: "Action processed.",
              message: "Here are the changes you requested.",
              actions: json
          };
      }

      return schema.parse(json); 
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      throw error;
    }
  }

  abstract execute(input: string, context: string, attachments?: ChatAttachment[]): Promise<ValidatedAIResponse>;
}

// --- Specific Agents ---

class RouterAgent extends BaseAgent {
  protected name = "Router";
  protected systemPrompt = ROUTER_PROMPT;

  async route(input: string): Promise<RouterResponse> {
    return this.callGemini<RouterResponse>(input, RouterSchema);
  }

  async execute(input: string, context: string): Promise<ValidatedAIResponse> {
    throw new Error("Router does not execute code changes");
  }
}

class CodeAgent extends BaseAgent {
  protected name = "CodeAgent";
  protected systemPrompt = CODE_AGENT_PROMPT;

  async execute(input: string, context: string, attachments: ChatAttachment[] = []): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context, 'application/json', attachments);
  }
}

class UIAgent extends BaseAgent {
  protected name = "UIAgent";
  protected systemPrompt = UI_AGENT_PROMPT;

  async execute(input: string, context: string, attachments: ChatAttachment[] = []): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context, 'application/json', attachments);
  }
}

class FixAgent extends BaseAgent {
  protected name = "FixAgent";
  protected systemPrompt = FIX_AGENT_PROMPT;

  async execute(input: string, context: string, attachments: ChatAttachment[] = []): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context, 'application/json', attachments);
  }
}

class SuggestionAgent extends BaseAgent {
    protected name = "Suggestion";
    protected systemPrompt = SUGGESTION_PROMPT;

    async execute(input: string, context: string): Promise<ValidatedAIResponse> {
        throw new Error("Suggestion agent returns strings, not AIResponse");
    }

    async suggest(context: string): Promise<string[]> {
        const res = await this.callGemini<{suggestions: string[]}>("Generate 3 suggestions based on the context.", SuggestionsSchema, context);
        return res.suggestions;
    }
}

class PromptEnhancerAgent extends BaseAgent {
    protected name = "PromptEnhancer";
    protected systemPrompt = ENHANCE_PROMPT;

    async execute(input: string, context: string): Promise<ValidatedAIResponse> {
        throw new Error("Not implemented");
    }

    async enhance(input: string): Promise<string> {
        return this.callGemini<string>(input, null, undefined, 'text/plain');
    }
}

// --- Manager ---

export class AgentManager {
  private router: RouterAgent;
  private suggester: SuggestionAgent;
  private enhancer: PromptEnhancerAgent;
  private agents: { [key: string]: BaseAgent };

  constructor() {
    this.router = new RouterAgent();
    this.suggester = new SuggestionAgent();
    this.enhancer = new PromptEnhancerAgent();
    this.agents = {
      CODE: new CodeAgent(),
      UI: new UIAgent(),
      FIX: new FixAgent(),
    };
  }

  async processRequest(input: string, context: string, attachments: ChatAttachment[] = []): Promise<ValidatedAIResponse> {
    try {
      console.log("Thinking...");
      const { target, reasoning } = await this.router.route(input);
      console.log(`Selected Agent: ${target} (${reasoning})`);

      const agent = this.agents[target];
      if (!agent) throw new Error("Invalid agent selected");

      const response = await agent.execute(input, context, attachments);
      
      return {
        ...response,
        message: `[${target}] ${response.message}`
      };

    } catch (error) {
      console.error("AgentManager failed:", error);
      // Nice error handling
      let msg = "I encountered an error.";
      if (error instanceof Error && error.message.includes("API Key")) {
          msg = "API Key missing or invalid. Please check Settings.";
      }
      return {
        reasoning: "System encountered an error.",
        message: msg,
        actions: []
      };
    }
  }

  async getSuggestions(context: string): Promise<string[]> {
      try {
          return await this.suggester.suggest(context);
      } catch (e) {
          return ["Fix bugs", "Add styling", "Create new component"];
      }
  }

  async enhancePrompt(input: string): Promise<string> {
      try {
          return await this.enhancer.enhance(input);
      } catch (e) {
          return input;
      }
  }
}

export const agentManager = new AgentManager();