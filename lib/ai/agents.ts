import { GoogleGenAI } from "@google/genai";
import { AIResponseSchema, RouterSchema, ValidatedAIResponse, RouterResponse } from '../schemas';
import { ROUTER_PROMPT, CODE_AGENT_PROMPT, FIX_AGENT_PROMPT, UI_AGENT_PROMPT } from './prompts';
import { File } from '../../types';

// --- Singleton Client ---
let client: GoogleGenAI | null = null;
const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
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
  protected ai: GoogleGenAI;
  protected abstract systemPrompt: string;
  protected abstract name: string;

  constructor() {
    this.ai = getClient();
  }

  protected async callGemini<T>(
    prompt: string, 
    schema: any, // Zod Schema
    context?: string
  ): Promise<T> {
    const fullPrompt = context 
      ? `
        CONTEXT FILES (Read Only):
        ${getFilePaths(context)}

        FULL FILE CONTENT:
        ${context}

        USER REQUEST:
        ${prompt}
      ` 
      : prompt;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
        config: {
          systemInstruction: this.systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temp for precision
        }
      });

      const text = response.text;
      if (!text) throw new Error(`${this.name}: No response`);

      let json = JSON.parse(text);
      
      // FALLBACK: If the agent returns an array (common hallucination), wrap it
      // expected schema is { message: string, actions: [] }
      if (Array.isArray(json) && this.name !== 'Router') {
          console.warn(`[${this.name}] Received array instead of object. Wrapping in default structure.`);
          json = {
              message: "Here are the changes you requested.",
              actions: json
          };
      }

      return schema.parse(json); // Zod Validation
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      throw error;
    }
  }

  abstract execute(input: string, context: string): Promise<ValidatedAIResponse>;
}

// --- Specific Agents ---

class RouterAgent extends BaseAgent {
  protected name = "Router";
  protected systemPrompt = ROUTER_PROMPT;

  // This one returns a RouterResponse, not standard AIResponse
  async route(input: string): Promise<RouterResponse> {
    return this.callGemini<RouterResponse>(input, RouterSchema);
  }

  // Not used directly, but required by abstract class
  async execute(input: string, context: string): Promise<ValidatedAIResponse> {
    throw new Error("Router does not execute code changes");
  }
}

class CodeAgent extends BaseAgent {
  protected name = "CodeAgent";
  protected systemPrompt = CODE_AGENT_PROMPT;

  async execute(input: string, context: string): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context);
  }
}

class UIAgent extends BaseAgent {
  protected name = "UIAgent";
  protected systemPrompt = UI_AGENT_PROMPT;

  async execute(input: string, context: string): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context);
  }
}

class FixAgent extends BaseAgent {
  protected name = "FixAgent";
  protected systemPrompt = FIX_AGENT_PROMPT;

  async execute(input: string, context: string): Promise<ValidatedAIResponse> {
    return this.callGemini<ValidatedAIResponse>(input, AIResponseSchema, context);
  }
}

// --- Manager ---

export class AgentManager {
  private router: RouterAgent;
  private agents: { [key: string]: BaseAgent };

  constructor() {
    this.router = new RouterAgent();
    this.agents = {
      CODE: new CodeAgent(),
      UI: new UIAgent(),
      FIX: new FixAgent(),
    };
  }

  async processRequest(input: string, context: string): Promise<ValidatedAIResponse> {
    try {
      // 1. Route the request
      console.log("Thinking...");
      const { target, reasoning } = await this.router.route(input);
      console.log(`Selected Agent: ${target} (${reasoning})`);

      // 2. Select Agent
      const agent = this.agents[target];
      if (!agent) throw new Error("Invalid agent selected");

      // 3. Execute
      const response = await agent.execute(input, context);
      
      // 4. Enrich response (Optional: prepend agent signature)
      return {
        ...response,
        message: `[${target}] ${response.message}`
      };

    } catch (error) {
      console.error("AgentManager failed:", error);
      // Fallback response instead of crashing
      return {
        message: "I encountered an error processing your request. Please try again.",
        actions: []
      };
    }
  }
}

export const agentManager = new AgentManager();