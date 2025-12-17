
export interface File {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'folder';
  isOpen?: boolean;
  children?: File[];
}

export interface Project {
  id: string;
  name: string;
  lastModified: Date;
  files: File[];
}

export interface AIAction {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: AIAction[]; // Added to support "Actions taken" UI
}

export type ViewMode = 'landing' | 'login' | 'dashboard' | 'editor';

export interface AIResponse {
  message: string;
  actions: AIAction[];
}
