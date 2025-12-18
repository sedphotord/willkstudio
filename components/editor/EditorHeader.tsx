
import React from 'react';
import { 
  ArrowLeft, Code2, Layout, Monitor, Download, Github, Globe, X,
  Edit2
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/utils';

interface EditorHeaderProps {
  viewMode: 'code' | 'preview' | 'split';
  setViewMode: (mode: 'code' | 'preview' | 'split') => void;
  isRenamingProject: boolean;
  setIsRenamingProject: (val: boolean) => void;
  projectNameInput: string;
  setProjectNameInput: (val: string) => void;
  handleProjectRename: () => void;
  handleDownloadZip: () => void;
  setView: (view: any) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  viewMode, setViewMode, isRenamingProject, setIsRenamingProject,
  projectNameInput, setProjectNameInput, handleProjectRename,
  handleDownloadZip, setView
}) => {
  const { projects, activeProjectId } = useStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <header className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className="hover:bg-zinc-800 p-1.5 rounded-md transition-colors flex items-center gap-2 text-zinc-400 hover:text-white" title="Back to Dashboard">
                <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">willkstudio</span>
                <span className="text-zinc-600">/</span>
                {isRenamingProject ? (
                    <input 
                        type="text" 
                        value={projectNameInput} 
                        onChange={(e) => setProjectNameInput(e.target.value)} 
                        onBlur={handleProjectRename} 
                        onKeyDown={(e) => e.key === 'Enter' && handleProjectRename()} 
                        autoFocus 
                        className="bg-zinc-900 text-zinc-200 border border-blue-500/50 rounded px-1.5 py-0.5 outline-none font-medium min-w-[100px]" 
                    />
                ) : (
                    <span 
                        onClick={() => setIsRenamingProject(true)} 
                        className="text-zinc-200 font-medium hover:text-blue-400 cursor-pointer hover:bg-zinc-900/50 px-1.5 py-0.5 rounded transition-colors"
                    >
                        {activeProject?.name || 'Untitled'}
                    </span>
                )}
                <div className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">Public</div>
            </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button onClick={() => setViewMode('code')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300')} title="Code Only"><Code2 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('split')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300')} title="Split View"><Layout className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('preview')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300')} title="Preview Only"><Monitor className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-3">
            <button onClick={handleDownloadZip} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Download ZIP"><Download className="w-4 h-4" /></button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-medium rounded-full transition-colors border border-zinc-800"><Github className="w-3.5 h-3.5" /></button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20"><Globe className="w-3.5 h-3.5" /> Publish</button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-zinc-900 shadow-md"></div>
        </div>
    </header>
  );
};