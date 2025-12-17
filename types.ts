
export interface File {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'folder';
  isOpen?: boolean;
  children?: File[];
}

export interface ProjectVersion {
  id: string;
  timestamp: Date;
  message: string;
  files: File[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  lastModified: Date;
  files: File[];
  versions: ProjectVersion[];
}

export interface AIAction {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

export interface ChatAttachment {
  type: 'image' | 'text' | 'file';
  mimeType: string;
  name: string;
  data: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reasoning?: string;
  actions?: AIAction[];
  attachments?: ChatAttachment[];
  versionId?: string; // Links this message to a specific project snapshot
}

export type ViewMode = 'landing' | 'login' | 'dashboard' | 'editor';

export type AIProvider = 'auto' | 'gemini' | 'openai' | 'anthropic' | 'mistral';

export interface UserSettings {
  // Provider Settings
  activeProvider: AIProvider;
  autoMode: boolean; // Toggle for automatic selection logic
  
  // API Keys
  geminiApiKey?: string;
  openAiApiKey?: string;
  anthropicApiKey?: string;
  mistralApiKey?: string;
  
  // Preferences
  autoSave: boolean; // New Auto-Save Toggle
  customInstructions?: string;
  languagePreference: 'typescript' | 'javascript';
}

export interface AIResponse {
  reasoning?: string;
  message: string;
  actions: AIAction[];
}