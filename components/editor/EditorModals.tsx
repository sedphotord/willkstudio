
import React, { useState, useEffect } from 'react';
import { 
  X, Settings, Key, Zap, Check, Lock, ToggleRight, ToggleLeft, Bot, Box, Boxes,
  History, RotateCcw, Clock, FileDiff, Search, FileCode
} from 'lucide-react';
import { Command } from 'cmdk';
import { DiffEditor } from '@monaco-editor/react';
import { useStore } from '../../lib/store';
import { AIProvider, File } from '../../types';
import { cn } from '../../lib/utils';

// --- Command Palette ---
export const CommandPalette = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { activeProjectFiles, setActiveFile, projects, selectProject } = useStore();
    const [search, setSearch] = useState('');
    useEffect(() => {
        const down = (e: KeyboardEvent) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onOpenChange(!open); } }
        document.addEventListener('keydown', down); return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);
    const allFiles: File[] = [];
    const traverse = (nodes: File[]) => { nodes.forEach(n => { if (n.type === 'file') allFiles.push(n); if (n.children) traverse(n.children); }); }
    traverse(activeProjectFiles);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                <Command className="w-full">
                    <div className="flex items-center border-b border-zinc-800 px-3"><Search className="w-4 h-4 text-zinc-500 mr-2" /><Command.Input value={search} onValueChange={setSearch} placeholder="Search files or commands..." className="flex-1 h-12 bg-transparent outline-none text-zinc-200 placeholder:text-zinc-500 text-sm" /></div>
                    <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none"><Command.Empty className="py-6 text-center text-sm text-zinc-500">No results found.</Command.Empty><Command.Group heading="Files" className="text-xs text-zinc-500 font-medium mb-2 px-2">{allFiles.map(file => (<Command.Item key={file.path} onSelect={() => { setActiveFile(file); onOpenChange(false); }} className="flex items-center gap-2 px-2 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors text-sm aria-selected:bg-zinc-800 aria-selected:text-white"><FileCode className="w-4 h-4 text-zinc-500" /><span>{file.name}</span><span className="ml-auto text-xs text-zinc-600">{file.path}</span></Command.Item>))}</Command.Group><Command.Group heading="Projects" className="text-xs text-zinc-500 font-medium mb-2 px-2 mt-2">{projects.map(p => (<Command.Item key={p.id} onSelect={() => { selectProject(p); onOpenChange(false); }} className="flex items-center gap-2 px-2 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors text-sm aria-selected:bg-zinc-800 aria-selected:text-white"><Box className="w-4 h-4 text-blue-500" /><span>{p.name}</span></Command.Item>))}</Command.Group></Command.List>
                </Command>
            </div>
        </div>
    );
};

// --- Settings Modal ---
export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
    const { settings, updateSettings } = useStore();
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState<'general' | 'models'>('general');
    const [selectedProviderId, setSelectedProviderId] = useState<AIProvider | 'auto'>('gemini');

    const handleSave = () => {
        updateSettings(localSettings);
        onClose();
    };
    
    const providers = [
        { id: 'gemini', name: 'Google Gemini 2.5', icon: Box, keyProp: 'geminiApiKey' },
        { id: 'openai', name: 'OpenAI GPT-4o', icon: Bot, keyProp: 'openAiApiKey' },
        { id: 'anthropic', name: 'Anthropic Claude 3.5', icon: Boxes, keyProp: 'anthropicApiKey' },
        { id: 'mistral', name: 'Mistral AI', icon: Zap, keyProp: 'mistralApiKey' },
    ] as const;

    const currentProvider = providers.find(p => p.id === selectedProviderId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 w-full max-w-3xl rounded-xl border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Settings className="w-4 h-4 text-zinc-400" /> Editor Settings
                    </h3>
                    <button onClick={onClose}><X className="w-4 h-4 text-zinc-400 hover:text-white" /></button>
                </div>
                
                <div className="flex flex-1 min-h-0">
                    <div className="w-48 border-r border-zinc-800 bg-zinc-900/50 p-2 space-y-1">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors", activeTab === 'general' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")}
                        >
                            <Settings className="w-4 h-4" /> General
                        </button>
                        <button 
                            onClick={() => setActiveTab('models')}
                            className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors", activeTab === 'models' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")}
                        >
                            <Key className="w-4 h-4" /> Models & Keys
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-zinc-950/30">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-zinc-200">Auto Save</label>
                                        <p className="text-xs text-zinc-500">Automatically save changes to local storage</p>
                                    </div>
                                    <button onClick={() => setLocalSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))} className="text-zinc-400 hover:text-white transition-colors">
                                        {localSettings.autoSave ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Custom System Instructions</label>
                                    <textarea value={localSettings.customInstructions || ''} onChange={(e) => setLocalSettings({...localSettings, customInstructions: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none h-32 resize-none" placeholder="e.g., Always use arrow functions..." />
                                </div>
                            </div>
                        )}

                        {activeTab === 'models' && (
                            <div className="flex h-full gap-6">
                                <div className="w-1/3 space-y-2">
                                     <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Providers</h4>
                                     <button onClick={() => setLocalSettings({...localSettings, autoMode: !localSettings.autoMode})} className={cn("w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all mb-4", localSettings.autoMode ? "bg-purple-500/10 border-purple-500/50 text-purple-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                                        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /><span>Auto Mode</span></div>{localSettings.autoMode && <Check className="w-3.5 h-3.5" />}
                                     </button>
                                     {providers.map(p => {
                                         // @ts-ignore
                                         const hasKey = !!localSettings[p.keyProp];
                                         const isActive = localSettings.activeProvider === p.id && !localSettings.autoMode;
                                         return (
                                             <button key={p.id} onClick={() => setSelectedProviderId(p.id as any)} className={cn("w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all", selectedProviderId === p.id ? "bg-blue-600/10 border-blue-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                                                <div className="flex items-center gap-2"><p.icon className="w-4 h-4" /><span>{p.name}</span></div>
                                                <div className="flex items-center gap-2">{isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}{hasKey ? <Lock className="w-3 h-3 text-zinc-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>}</div>
                                             </button>
                                         );
                                     })}
                                </div>
                                <div className="flex-1 border-l border-zinc-800 pl-6">
                                    {currentProvider && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center"><currentProvider.icon className="w-5 h-5 text-blue-400" /></div><div><h3 className="font-semibold text-white">{currentProvider.name}</h3></div></div>
                                            <div className="space-y-2"><label className="text-xs font-medium text-zinc-400 uppercase">API Key</label><input type="password" value={(localSettings as any)[currentProvider.keyProp] || ''} onChange={(e) => setLocalSettings({...localSettings, [currentProvider.keyProp]: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all" /></div>
                                            <div className="pt-4 border-t border-zinc-800"><button onClick={() => setLocalSettings({...localSettings, activeProvider: currentProvider.id as any, autoMode: false})} disabled={!(localSettings as any)[currentProvider.keyProp]} className={cn("w-full py-2 rounded-lg text-sm font-medium transition-colors border", localSettings.activeProvider === currentProvider.id && !localSettings.autoMode ? "bg-green-500/10 border-green-500/50 text-green-400 cursor-default" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800")}>{localSettings.activeProvider === currentProvider.id && !localSettings.autoMode ? "Currently Active" : "Set as Active Provider"}</button></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end shrink-0 bg-zinc-900">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">Save & Close</button>
                </div>
            </div>
        </div>
    );
};

// --- History Modal ---
export const HistoryModal = ({ onClose }: { onClose: () => void }) => {
    const { projects, activeProjectId, restoreSnapshot } = useStore();
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 w-full max-w-2xl rounded-xl border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0"><h3 className="font-semibold text-white flex items-center gap-2"><History className="w-4 h-4 text-zinc-400" /> Project History</h3><button onClick={onClose}><X className="w-4 h-4 text-zinc-400 hover:text-white" /></button></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">{project.versions.length === 0 ? (<div className="text-center py-10 text-zinc-500">No history snapshots available.</div>) : (project.versions.map((version) => (<div key={version.id} className="flex items-start gap-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"><div className="mt-1 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0"><Clock className="w-4 h-4 text-blue-400" /></div><div className="flex-1 min-w-0"><div className="flex justify-between items-start mb-1"><p className="font-medium text-zinc-200 text-sm">{version.message || 'Auto-save snapshot'}</p><span className="text-xs text-zinc-500 whitespace-nowrap">{new Date(version.timestamp).toLocaleString()}</span></div><p className="text-xs text-zinc-500 mb-3">{version.files.length} files • {version.id.slice(-6)}</p><button onClick={() => { restoreSnapshot(version.id); onClose(); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> Restore this version</button></div></div>)))}</div>
            </div>
        </div>
    );
};

// --- Diff Modal ---
export const DiffModal = ({ original, modified, language, path, onClose }: { original: string, modified: string, language: string, path: string, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] w-full h-full max-w-6xl rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900 shrink-0"><div className="flex items-center gap-2 text-sm text-zinc-300"><FileDiff className="w-4 h-4 text-blue-400" /><span className="font-medium">Diff:</span><span className="font-mono text-zinc-500">{path}</span></div><button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button></div>
                <div className="flex-1 relative"><DiffEditor original={original} modified={modified} language={language} theme="vs-dark" options={{ renderSideBySide: true, readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, }} /></div>
                <div className="h-10 border-t border-zinc-800 bg-zinc-900 flex items-center justify-end px-4 gap-2"><button onClick={onClose} className="px-4 py-1.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700">Close</button></div>
            </div>
        </div>
    )
};
