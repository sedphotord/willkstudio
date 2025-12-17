import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, File, ViewMode, ChatMessage, ProjectVersion, ChatAttachment, UserSettings } from '../types';
import { INITIAL_FILES } from '../constants';
import { updateFileInTree, toggleFolderInTree, findFile, addNodeToTree, removeNodeFromTree, renameNodeInTree, duplicateNodeInTree } from './utils';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface StoreState {
  view: ViewMode;
  user: User | null;
  settings: UserSettings;
  projects: Project[];
  activeProjectId: string | null;
  activeFile: File | null;
  activeProjectFiles: File[];
  messages: ChatMessage[];
  pendingPrompt: string | null;
  pendingAttachments: ChatAttachment[];
  
  // Actions
  setView: (view: ViewMode) => void;
  login: () => void;
  logout: () => void;
  createProject: (initialPrompt?: string, attachments?: ChatAttachment[]) => void;
  renameProject: (projectId: string, newName: string) => void; // New Action
  selectProject: (project: Project) => void;
  updateFileContent: (path: string, content: string) => void;
  toggleFolder: (path: string) => void;
  setActiveFile: (file: File | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageVersion: (messageId: string, versionId: string) => void;
  setProjectFiles: (files: File[]) => void;
  setPendingPrompt: (prompt: string | null) => void;
  setPendingAttachments: (atts: ChatAttachment[]) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // History Actions
  saveSnapshot: (message: string) => string | null; // Returns version ID
  restoreSnapshot: (versionId: string) => void;
  
  // File Explorer Actions
  addFile: (parentPath: string | null, name: string, type: 'file' | 'folder') => void;
  deleteFile: (path: string) => void;
  renameFile: (path: string, newName: string) => void;
  duplicateFile: (path: string) => void;
}

// --- Sample Projects Generator ---
const createSampleProject = (id: string, name: string, description: string, mainContent: string): Project => {
    const files = JSON.parse(JSON.stringify(INITIAL_FILES)) as File[];
    const updateApp = (nodes: File[]) => {
        nodes.forEach(n => {
            if (n.path === '/src/App.tsx') n.content = mainContent;
            if (n.children) updateApp(n.children);
        });
    };
    updateApp(files);

    return {
        id,
        name,
        description,
        lastModified: new Date(),
        files,
        versions: []
    };
};

const SAMPLE_PROJECTS: Project[] = [
    createSampleProject('fintech-demo', 'Fintech Dashboard', 'A modern financial dashboard with charts and tables', `import React from 'react';
import { DollarSign, TrendingUp, Activity, CreditCard } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Finance Overview</h1>
        <p className="text-slate-400">Welcome back, Alex</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Balance', value: '$24,560.00', icon: DollarSign, color: 'bg-blue-500' },
          { label: 'Income', value: '+$4,200.00', icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Expenses', value: '-$1,200.00', icon: CreditCard, color: 'bg-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.color}/20\`}>
              <stat.icon className={\`w-6 h-6 \${stat.color.replace('bg-', 'text-')}\`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`),
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      view: 'landing',
      user: null,
      settings: {
          activeProvider: 'gemini', // Default to Gemini
          autoMode: true,
          geminiApiKey: '',
          openAiApiKey: '',
          anthropicApiKey: '',
          languagePreference: 'typescript',
          customInstructions: ''
      },
      projects: SAMPLE_PROJECTS,
      activeProjectId: null,
      activeFile: null,
      activeProjectFiles: [],
      messages: [{ id: '1', role: 'assistant', content: 'Ready to code. What shall we build?', timestamp: new Date() }],
      pendingPrompt: null,
      pendingAttachments: [],

      setView: (view) => set({ view }),

      login: () => set({ 
        user: { name: 'Demo User', email: 'demo@willkstudio.com', avatar: 'https://github.com/shadcn.png' },
        view: 'dashboard'
      }),

      logout: () => set({ user: null, view: 'landing' }),

      updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings }
      })),

      createProject: (initialPrompt?: string, attachments?: ChatAttachment[]) => {
        const newProject: Project = {
          id: Math.random().toString(36).substr(2, 9),
          name: `project-${Math.floor(Math.random() * 1000)}`,
          description: initialPrompt?.slice(0, 50) + '...' || 'New Project',
          lastModified: new Date(),
          files: JSON.parse(JSON.stringify(INITIAL_FILES)),
          versions: []
        };
        
        set((state) => ({ 
          projects: [newProject, ...state.projects],
          activeProjectId: newProject.id,
          activeProjectFiles: newProject.files,
          view: 'editor',
          messages: initialPrompt 
            ? [] 
            : [{ id: '1', role: 'assistant', content: 'New project created. What\'s the plan?', timestamp: new Date() }],
          pendingPrompt: initialPrompt || null,
          pendingAttachments: attachments || []
        }));
      },
      
      renameProject: (projectId, newName) => {
          set((state) => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, name: newName } : p)
          }));
      },

      setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
      setPendingAttachments: (atts) => set({ pendingAttachments: atts }),

      selectProject: (project) => {
        set({
          activeProjectId: project.id,
          activeProjectFiles: project.files,
          view: 'editor',
          activeFile: findFile(project.files, '/src/App.tsx'),
          messages: [{ id: '1', role: 'assistant', content: `Opened ${project.name}. How can I help?`, timestamp: new Date() }]
        });
      },

      // --- Version Control Logic ---
      
      saveSnapshot: (message: string) => {
          let newVersionId: string | null = null;
          set((state) => {
              const projectId = state.activeProjectId;
              if (!projectId) return {};
              
              const projectIndex = state.projects.findIndex(p => p.id === projectId);
              if (projectIndex === -1) return {};

              newVersionId = Date.now().toString();
              const newVersion: ProjectVersion = {
                  id: newVersionId,
                  timestamp: new Date(),
                  message,
                  files: JSON.parse(JSON.stringify(state.activeProjectFiles))
              };

              const updatedProject = {
                  ...state.projects[projectIndex],
                  versions: [newVersion, ...state.projects[projectIndex].versions].slice(0, 20)
              };

              const updatedProjects = [...state.projects];
              updatedProjects[projectIndex] = updatedProject;

              return { projects: updatedProjects };
          });
          return newVersionId;
      },

      restoreSnapshot: (versionId: string) => {
          set((state) => {
              const projectId = state.activeProjectId;
              const project = state.projects.find(p => p.id === projectId);
              if (!project) return {};

              const version = project.versions.find(v => v.id === versionId);
              if (!version) return {};

              return { 
                  activeProjectFiles: JSON.parse(JSON.stringify(version.files)),
                  activeFile: null
              };
          });
      },

      // --- File Operations ---

      updateFileContent: (path, content) => {
        set((state) => {
          const newFiles = updateFileInTree(state.activeProjectFiles, path, content);
          const newActiveFile = state.activeFile?.path === path 
            ? { ...state.activeFile, content } 
            : state.activeFile;
          const updatedProjects = state.projects.map(p => 
             p.id === state.activeProjectId ? { ...p, files: newFiles, lastModified: new Date() } : p
          );
          return { activeProjectFiles: newFiles, activeFile: newActiveFile, projects: updatedProjects };
        });
      },

      toggleFolder: (path) => {
        set((state) => ({
          activeProjectFiles: toggleFolderInTree(state.activeProjectFiles, path)
        }));
      },

      setActiveFile: (file) => set({ activeFile: file }),

      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

      updateMessageVersion: (messageId, versionId) => {
          set((state) => ({
              messages: state.messages.map(m => m.id === messageId ? { ...m, versionId } : m)
          }));
      },

      setProjectFiles: (files) => set({ activeProjectFiles: files }),

      addFile: (parentPath, name, type) => {
        set((state) => {
           const basePath = parentPath === null ? '' : parentPath;
           const newPath = `${basePath}/${name}`;
           const newNode: File = {
               name, path: newPath, type,
               content: type === 'file' ? '' : undefined,
               children: type === 'folder' ? [] : undefined,
               isOpen: true
           };
           const newFiles = addNodeToTree(state.activeProjectFiles, parentPath, newNode);
           const updatedProjects = state.projects.map(p => 
                p.id === state.activeProjectId ? { ...p, files: newFiles } : p
           );
           return { activeProjectFiles: newFiles, projects: updatedProjects };
        });
      },

      deleteFile: (path) => {
          set((state) => {
              const newFiles = removeNodeFromTree(state.activeProjectFiles, path);
              const newActiveFile = state.activeFile?.path === path ? null : state.activeFile;
              const updatedProjects = state.projects.map(p => 
                p.id === state.activeProjectId ? { ...p, files: newFiles } : p
              );
              return { activeProjectFiles: newFiles, activeFile: newActiveFile, projects: updatedProjects };
          });
      },

      renameFile: (path, newName) => {
          set((state) => {
              const newFiles = renameNodeInTree(state.activeProjectFiles, path, newName);
              const updatedProjects = state.projects.map(p => 
                p.id === state.activeProjectId ? { ...p, files: newFiles } : p
              );
              return { activeProjectFiles: newFiles, activeFile: null, projects: updatedProjects };
          });
      },

      duplicateFile: (path) => {
          set((state) => {
              const newFiles = duplicateNodeInTree(state.activeProjectFiles, path);
              const updatedProjects = state.projects.map(p => 
                p.id === state.activeProjectId ? { ...p, files: newFiles } : p
              );
              return { activeProjectFiles: newFiles, projects: updatedProjects };
          });
      }
    }),
    {
      name: 'willkstudio-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          user: state.user,
          projects: state.projects,
          settings: state.settings
      }),
    }
  )
);