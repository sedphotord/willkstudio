import { create } from 'zustand';
import { Project, File, ViewMode, ChatMessage } from '../types';
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
  projects: Project[];
  activeProjectId: string | null;
  activeFile: File | null;
  activeProjectFiles: File[];
  messages: ChatMessage[];
  
  // Actions
  setView: (view: ViewMode) => void;
  login: () => void;
  logout: () => void;
  createProject: () => void;
  selectProject: (project: Project) => void;
  updateFileContent: (path: string, content: string) => void;
  toggleFolder: (path: string) => void;
  setActiveFile: (file: File | null) => void;
  addMessage: (message: ChatMessage) => void;
  setProjectFiles: (files: File[]) => void;
  
  // File Explorer Actions
  addFile: (parentPath: string | null, name: string, type: 'file' | 'folder') => void;
  deleteFile: (path: string) => void;
  renameFile: (path: string, newName: string) => void;
  duplicateFile: (path: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  view: 'landing',
  user: null,
  projects: [
    { id: '1', name: 'finance-dashboard', lastModified: new Date(), files: JSON.parse(JSON.stringify(INITIAL_FILES)) },
    { id: '2', name: 'portfolio-site', lastModified: new Date(Date.now() - 86400000), files: JSON.parse(JSON.stringify(INITIAL_FILES)) },
  ],
  activeProjectId: null,
  activeFile: null,
  activeProjectFiles: [],
  messages: [{ id: '1', role: 'assistant', content: 'Ready to code. What shall we build?', timestamp: new Date() }],

  setView: (view) => set({ view }),

  login: () => set({ 
    user: { name: 'Demo User', email: 'demo@willkstudio.com', avatar: 'https://github.com/shadcn.png' },
    view: 'dashboard'
  }),

  logout: () => set({ user: null, view: 'landing' }),

  createProject: () => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `project-${Math.floor(Math.random() * 1000)}`,
      lastModified: new Date(),
      files: JSON.parse(JSON.stringify(INITIAL_FILES))
    };
    set((state) => ({ 
      projects: [newProject, ...state.projects],
      activeProjectId: newProject.id,
      activeProjectFiles: newProject.files,
      view: 'editor',
      messages: [{ id: '1', role: 'assistant', content: 'New project created. What\'s the plan?', timestamp: new Date() }]
    }));
  },

  selectProject: (project) => {
    set({
      activeProjectId: project.id,
      activeProjectFiles: project.files,
      view: 'editor',
      activeFile: findFile(project.files, '/src/App.js'), // Default open file updated to JS
      messages: [{ id: '1', role: 'assistant', content: `Opened ${project.name}. How can I help?`, timestamp: new Date() }]
    });
  },

  updateFileContent: (path, content) => {
    set((state) => {
      const newFiles = updateFileInTree(state.activeProjectFiles, path, content);
      
      // Also update the currently active file if it matches
      const newActiveFile = state.activeFile?.path === path 
        ? { ...state.activeFile, content } 
        : state.activeFile;

      return {
        activeProjectFiles: newFiles,
        activeFile: newActiveFile
      };
    });
  },

  toggleFolder: (path) => {
    set((state) => ({
      activeProjectFiles: toggleFolderInTree(state.activeProjectFiles, path)
    }));
  },

  setActiveFile: (file) => set({ activeFile: file }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setProjectFiles: (files) => set({ activeProjectFiles: files }),

  // --- CRUD Actions ---
  
  addFile: (parentPath, name, type) => {
    set((state) => {
       const basePath = parentPath === null ? '' : parentPath;
       const newPath = `${basePath}/${name}`;
       
       const newNode: File = {
           name,
           path: newPath,
           type,
           content: type === 'file' ? '' : undefined,
           children: type === 'folder' ? [] : undefined,
           isOpen: true
       };

       const newFiles = addNodeToTree(state.activeProjectFiles, parentPath, newNode);
       return { activeProjectFiles: newFiles };
    });
  },

  deleteFile: (path) => {
      set((state) => {
          const newFiles = removeNodeFromTree(state.activeProjectFiles, path);
          // If active file is deleted, close it
          const newActiveFile = state.activeFile?.path === path ? null : state.activeFile;
          return { activeProjectFiles: newFiles, activeFile: newActiveFile };
      });
  },

  renameFile: (path, newName) => {
      set((state) => {
          const newFiles = renameNodeInTree(state.activeProjectFiles, path, newName);
          // If active file was renamed, we need to find it again with the new path
          return { activeProjectFiles: newFiles, activeFile: null };
      });
  },

  duplicateFile: (path) => {
      set((state) => {
          const newFiles = duplicateNodeInTree(state.activeProjectFiles, path);
          return { activeProjectFiles: newFiles };
      });
  }
}));