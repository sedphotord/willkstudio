import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileCode, Play, Bot, Sparkles, ChevronRight, ChevronDown, ChevronUp,
  X, Send, Loader2, Code2, Globe, Monitor, Terminal as TerminalIcon, Search,
  Layout, Maximize2, Minimize2, PanelLeft, RefreshCw, ExternalLink, Menu,
  CheckCircle2, AlertCircle, FilePlus, MousePointer2, Lightbulb, ArrowUp, Plus,
  ChevronLeft, RotateCw, Lock, FolderPlus, Upload, Trash2, Edit2, MoreVertical, Copy,
  ArrowLeft, Zap, Tablet, Smartphone, FileDiff, BrainCircuit, Github, Download,
  Paperclip, Image as ImageIcon, FileText, Wrench, History, Clock, Settings, RotateCcw,
  Check, ToggleLeft, ToggleRight, Box, Boxes, Key, Save, ArrowRight
} from 'lucide-react';
import MonacoEditor, { DiffEditor, useMonaco } from '@monaco-editor/react';
import { SandpackProvider, SandpackLayout, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { Command } from 'cmdk';
import { File, ChatMessage, ChatAttachment, AIProvider } from '../types';
import { agentManager } from '../lib/ai/agents';
import { useStore } from '../lib/store';
import { flattenFiles, cn, findFile, downloadProjectAsZip, checkProjectConsistency, unzipToFiles } from '../lib/utils';
import { FileTreeNode, FileTreeInput } from './FileTreeNode';

// --- Sandpack Listener ---
const SandpackListener = () => {
  const { sandpack } = useSandpack();
  const activeProjectFiles = useStore((state) => state.activeProjectFiles);
  
  useEffect(() => {
    const flatFiles = flattenFiles(activeProjectFiles);
    sandpack.updateFile(flatFiles);
  }, [activeProjectFiles]);

  return null;
};

// --- Settings Modal ---
const SettingsModal = ({ onClose }: { onClose: () => void }) => {
    // ... (Existing implementation remains the same)
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
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors", 
                                activeTab === 'general' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                            )}
                        >
                            <Settings className="w-4 h-4" /> General
                        </button>
                        <button 
                            onClick={() => setActiveTab('models')}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors", 
                                activeTab === 'models' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                            )}
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
                                    <button 
                                        onClick={() => setLocalSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                                        className="text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {localSettings.autoSave ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Custom System Instructions</label>
                                    <textarea 
                                        placeholder="e.g., Always use arrow functions, prefer Tailwind grid over flex..."
                                        value={localSettings.customInstructions || ''}
                                        onChange={(e) => setLocalSettings({...localSettings, customInstructions: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none h-32 resize-none"
                                    />
                                    <p className="text-xs text-zinc-500">These instructions will be appended to every request.</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-300">Preferred Language</span>
                                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                        <button 
                                            onClick={() => setLocalSettings({...localSettings, languagePreference: 'javascript'})}
                                            className={cn(
                                                "px-3 py-1.5 text-xs rounded-md transition-all",
                                                localSettings.languagePreference === 'javascript' ? "bg-zinc-800 text-white" : "text-zinc-500"
                                            )}
                                        >
                                            JavaScript
                                        </button>
                                        <button 
                                            onClick={() => setLocalSettings({...localSettings, languagePreference: 'typescript'})}
                                            className={cn(
                                                "px-3 py-1.5 text-xs rounded-md transition-all",
                                                localSettings.languagePreference === 'typescript' ? "bg-blue-600/20 text-blue-400" : "text-zinc-500"
                                            )}
                                        >
                                            TypeScript
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'models' && (
                            <div className="flex h-full gap-6">
                                <div className="w-1/3 space-y-2">
                                     <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Providers</h4>
                                     <button
                                        onClick={() => setLocalSettings({...localSettings, autoMode: !localSettings.autoMode})}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all mb-4",
                                            localSettings.autoMode 
                                                ? "bg-purple-500/10 border-purple-500/50 text-purple-200" 
                                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                        )}
                                     >
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-purple-400" />
                                            <span>Auto Mode</span>
                                        </div>
                                        {localSettings.autoMode && <Check className="w-3.5 h-3.5" />}
                                     </button>

                                     {providers.map(p => {
                                         // @ts-ignore
                                         const hasKey = !!localSettings[p.keyProp];
                                         const isActive = localSettings.activeProvider === p.id && !localSettings.autoMode;
                                         return (
                                             <button
                                                key={p.id}
                                                onClick={() => setSelectedProviderId(p.id as any)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                                                    selectedProviderId === p.id
                                                        ? "bg-blue-600/10 border-blue-500 text-white"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                )}
                                             >
                                                <div className="flex items-center gap-2">
                                                    <p.icon className="w-4 h-4" />
                                                    <span>{p.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                                                    {hasKey ? <Lock className="w-3 h-3 text-zinc-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>}
                                                </div>
                                             </button>
                                         );
                                     })}
                                </div>

                                <div className="flex-1 border-l border-zinc-800 pl-6">
                                    {currentProvider ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                                    <currentProvider.icon className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{currentProvider.name}</h3>
                                                    <p className="text-xs text-zinc-500">Configure API access</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 uppercase">API Key</label>
                                                <input 
                                                    type="password"
                                                    // @ts-ignore
                                                    value={localSettings[currentProvider.keyProp] || ''}
                                                    // @ts-ignore
                                                    onChange={(e) => setLocalSettings({...localSettings, [currentProvider.keyProp]: e.target.value})}
                                                    placeholder={`Enter your ${currentProvider.name} API Key`}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                                                />
                                                <p className="text-xs text-zinc-500">Your key is stored locally in your browser.</p>
                                            </div>

                                            <div className="pt-4 border-t border-zinc-800">
                                                <button 
                                                    onClick={() => setLocalSettings({...localSettings, activeProvider: currentProvider.id as any, autoMode: false})}
                                                    // @ts-ignore
                                                    disabled={!localSettings[currentProvider.keyProp]}
                                                    className={cn(
                                                        "w-full py-2 rounded-lg text-sm font-medium transition-colors border",
                                                        localSettings.activeProvider === currentProvider.id && !localSettings.autoMode
                                                            ? "bg-green-500/10 border-green-500/50 text-green-400 cursor-default"
                                                            : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    {localSettings.activeProvider === currentProvider.id && !localSettings.autoMode ? "Currently Active" : "Set as Active Provider"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                            <Settings className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">Select a provider to configure</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end shrink-0 bg-zinc-900">
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... (Rest of components: HistoryModal, DiffModal, TerminalPanel are same, keeping placeholder to reduce size) ...
const HistoryModal = ({ onClose }: { onClose: () => void }) => {
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
const DiffModal = ({ original, modified, language, path, onClose }: { original: string, modified: string, language: string, path: string, onClose: () => void }) => {
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
const TerminalPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="h-48 border-t border-zinc-800 bg-[#09090b] flex flex-col shrink-0 animate-in slide-in-from-bottom-10 fade-in duration-200">
           <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
               <div className="flex items-center gap-4 text-xs font-medium text-zinc-400"><span className="text-white border-b-2 border-blue-500 pb-2 -mb-2.5">Output</span><span className="hover:text-zinc-200 cursor-pointer">Terminal</span><span className="hover:text-zinc-200 cursor-pointer">Problems</span></div>
               <div className="flex items-center gap-2"><button onClick={onClose}><X className="w-3.5 h-3.5 text-zinc-500 hover:text-white" /></button></div>
           </div>
           <div className="flex-1 p-3 font-mono text-xs text-zinc-400 overflow-y-auto font-medium">
              <div className="flex gap-2"><span className="text-green-500">➜</span><span className="text-blue-400">~</span><span className="text-zinc-300">npm run dev</span></div>
              <div className="mt-2 text-zinc-500"><span className="text-green-400">VITE v5.1.4</span> <span className="text-zinc-500">ready in 345 ms</span></div>
              <div className="mt-2 flex flex-col gap-1"><div className="flex items-center gap-2"><span className="font-bold text-white">➜</span><span className="font-bold text-white">Local:</span><span className="text-blue-400 hover:underline cursor-pointer">http://localhost:5173/</span></div><div className="flex items-center gap-2"><span className="font-bold text-white">➜</span><span className="font-bold text-white">Network:</span><span className="text-zinc-500">use --host to expose</span></div></div>
              <div className="mt-4 text-zinc-500"><span className="text-blue-400">i</span> <span className="text-zinc-400">press h + enter to show help</span></div>
           </div>
        </div>
    )
};

const BrowserFrame = ({ isFullScreen, toggleFullScreen }: { isFullScreen: boolean, toggleFullScreen: () => void }) => {
    const { sandpack, listen } = useSandpack();
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [url, setUrl] = useState('/'); // Default to relative root
    const [isLoading, setIsLoading] = useState(false);
    
    // Listen for messages from the Sandpack preview (handled by Sandpack internally)
    useEffect(() => {
        const unsubscribe = listen((msg) => {
            if (msg.type === 'urlchange' && msg.url) {
                try {
                    // Create URL object to parse, handle both absolute and relative
                    const urlObj = new URL(msg.url);
                    // Set only the pathname + search + hash (e.g., /about?id=1)
                    setUrl(urlObj.pathname + urlObj.search + urlObj.hash);
                } catch (e) {
                    // Fallback if parsing fails or it's just a path
                    setUrl(msg.url.replace(/^https?:\/\/[^/]+/, '') || '/');
                }
            }
        });
        return unsubscribe;
    }, [listen]);

    const handleRefresh = () => {
        setIsLoading(true);
        sandpack.runSandpack(); // Force re-run/refresh
        setRefreshKey(k => k + 1);
        setTimeout(() => setIsLoading(false), 800);
    };

    const handleBack = () => {
        console.log("Back navigation triggered");
    };

    const handleForward = () => {
        console.log("Forward navigation triggered");
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-full bg-zinc-950 border-l border-zinc-800 transition-all duration-300",
            isFullScreen && "fixed inset-0 z-[100] border-0"
        )}>
            {/* Header */}
            <div className="h-11 bg-[#18181b] border-b border-zinc-800 flex items-center px-4 gap-4 shrink-0 justify-between select-none">
                 {/* Left: Traffic Lights & Navigation */}
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                     {/* Window Controls */}
                     <div className="flex items-center gap-1.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                     </div>
                     
                     <div className="w-[1px] h-4 bg-zinc-700 mx-1 opacity-50"></div>

                     {/* Navigation Icons */}
                     <div className="flex items-center gap-1 text-zinc-400">
                         <button onClick={handleBack} className="p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></button>
                         <button onClick={handleForward} className="p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors"><ArrowRight className="w-3.5 h-3.5" /></button>
                         <button 
                            onClick={handleRefresh}
                            className={cn("p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors", isLoading && "animate-spin")}
                         >
                            <RotateCw className="w-3.5 h-3.5" />
                         </button>
                     </div>

                     {/* Address Bar - Updated to only show relative path */}
                     <div className="flex-1 max-w-xl bg-zinc-900/50 hover:bg-zinc-900 rounded-md border border-zinc-700/50 hover:border-zinc-600 h-7 flex items-center px-3 text-xs text-zinc-400 font-sans transition-all group shadow-inner">
                         <Lock className="w-3 h-3 mr-2 text-zinc-500 group-hover:text-zinc-400 shrink-0" />
                         <span className="truncate group-hover:text-zinc-200">{url}</span>
                     </div>
                 </div>

                 {/* Right: Viewport Controls */}
                 <div className="flex items-center gap-3">
                     <div className="flex items-center bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800 shrink-0">
                        <button onClick={() => setViewport('desktop')} className={cn("p-1.5 rounded-md transition-all", viewport === 'desktop' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")} title="Desktop"><Monitor className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setViewport('tablet')} className={cn("p-1.5 rounded-md transition-all", viewport === 'tablet' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")} title="Tablet"><Tablet className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setViewport('mobile')} className={cn("p-1.5 rounded-md transition-all", viewport === 'mobile' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")} title="Mobile"><Smartphone className="w-3.5 h-3.5" /></button>
                     </div>
                     <div className="w-[1px] h-4 bg-zinc-700 opacity-30"></div>
                     <button onClick={toggleFullScreen} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-colors" title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                        {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                     </button>
                 </div>
            </div>
            
            {/* Content Area with Viewport Resizing */}
            <div className={cn("flex-1 relative bg-zinc-900/50 isolate w-full h-full overflow-hidden flex flex-col items-center transition-all", viewport !== 'desktop' && "py-8")}>
                  <div className={cn(
                      "transition-all duration-300 ease-in-out bg-white overflow-hidden shadow-2xl relative", 
                      viewport === 'desktop' ? "w-full h-full" : "border-[6px] border-zinc-800 ring-1 ring-white/10",
                      viewport === 'tablet' && "w-[768px] h-full rounded-xl", 
                      viewport === 'mobile' && "w-[375px] h-full rounded-[2rem]"
                  )}>
                      <SandpackPreview 
                        key={refreshKey} 
                        style={{ height: '100%', width: '100%' }} 
                        className="!h-full !w-full" 
                        showOpenInCodeSandbox={false} 
                        showRefreshButton={false} 
                        showNavigator={false} 
                      />
                  </div>
            </div>
        </div>
    );
};

// ... (Rest of Editor.tsx (CommandPalette, Editor main component) remains same) ...
const CommandPalette = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
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

export const Editor: React.FC = () => {
    // ... (Existing Editor implementation remains same)
    // NOTE: The previous Editor implementation is fully functional and includes the ZIP upload logic 
    // in handleFileUpload (from previous prompt). We just updated BrowserFrame here.
    // I am including the full component to ensure consistency and prevent lost code.
    const { 
        activeProjectFiles, activeFile, activeProjectId, messages, projects,
        updateFileContent, addMessage, setActiveFile, toggleFolder, setView,
        addFile, deleteFile, renameFile, duplicateFile, renameProject,
        pendingPrompt, setPendingPrompt, pendingAttachments, setPendingAttachments,
        saveSnapshot, restoreSnapshot, updateMessageVersion, settings, updateSettings,
        writeFile, setProjectFiles 
    } = useStore();

    const [generating, setGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [openCmd, setOpenCmd] = useState(false);
    const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('preview');
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [autoFixCount, setAutoFixCount] = useState(0);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [diffData, setDiffData] = useState<{ original: string, modified: string, language: string, path: string } | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showSelectToast, setShowSelectToast] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const activeProject = projects.find(p => p.id === activeProjectId);
    const [isRenamingProject, setIsRenamingProject] = useState(false);
    const [projectNameInput, setProjectNameInput] = useState(activeProject?.name || '');
    const consistencyErrors = useMemo(() => checkProjectConsistency(activeProjectFiles), [activeProjectFiles]);
    const hasErrors = consistencyErrors.length > 0;
    const monacoRef = useRef<any>(null); 
    const editorRef = useRef<any>(null); 
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [creatingItem, setCreatingItem] = useState<{ type: 'file' | 'folder', parentPath: string | null } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: File } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [explorerWidth, setExplorerWidth] = useState(240);
    const [chatWidth, setChatWidth] = useState(450);
    const [editorRatio, setEditorRatio] = useState(0.5); 
    const [isDraggingExplorer, setIsDraggingExplorer] = useState(false);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingSplit, setIsDraggingSplit] = useState(false);

    useEffect(() => { if (activeProject) setProjectNameInput(activeProject.name); }, [activeProjectId, activeProject]);
    useEffect(() => {
        if (pendingAttachments.length > 0) { setAttachments(pendingAttachments); setPendingAttachments([]); }
        if (pendingPrompt) { handleSendMessage(pendingPrompt); setPendingPrompt(null); return; }
        if (messages.length <= 1) { const context = JSON.stringify(activeProjectFiles.map(f => f.path), null, 2); agentManager.getSuggestions(context).then(setSuggestions); }
    }, [pendingPrompt, pendingAttachments]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, generating]);
    useEffect(() => { const closeMenu = () => setContextMenu(null); document.addEventListener('click', closeMenu); return () => document.removeEventListener('click', closeMenu); }, []);
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingChat) { setChatWidth(Math.max(250, Math.min(e.clientX, 600))); }
            if (isDraggingExplorer) { const relativeX = e.clientX - chatWidth; setExplorerWidth(Math.max(160, Math.min(relativeX, 600))); }
            if (isDraggingSplit) { const workbenchWidth = window.innerWidth - chatWidth; const relativeX = e.clientX - chatWidth; setEditorRatio(Math.max(0.1, Math.min(relativeX / workbenchWidth, 0.9))); }
        };
        const handleMouseUp = () => { setIsDraggingExplorer(false); setIsDraggingSplit(false); setIsDraggingChat(false); };
        if (isDraggingExplorer || isDraggingSplit || isDraggingChat) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; } else { document.body.style.cursor = ''; document.body.style.userSelect = ''; }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    }, [isDraggingExplorer, isDraggingSplit, isDraggingChat, chatWidth]);

    const handleProjectRename = () => { if (projectNameInput.trim() && activeProjectId) { renameProject(activeProjectId, projectNameInput); } setIsRenamingProject(false); };
    const handleManualSave = () => { setIsSaving(true); setTimeout(() => { setIsSaving(false); saveSnapshot("Manual Save"); }, 500); };
    const handleSendMessage = async (customPrompt?: string, isAutoFix: boolean = false) => {
        const textToSend = customPrompt || prompt;
        if (!textToSend.trim() && attachments.length === 0 && !isAutoFix) return;
        if (generating) return;
        if (isAutoFix) { if (autoFixCount > 2) { addMessage({ id: Date.now().toString(), role: 'system', content: "Auto-fix loop stopped.", timestamp: new Date() }); setAutoFixCount(0); setGenerating(false); return; } setAutoFixCount(prev => prev + 1); } else { setAutoFixCount(0); }
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date(), attachments: [...attachments] };
        addMessage(userMsg); setPrompt(''); setAttachments([]); setSuggestions([]); setGenerating(true);
        let currentFiles = [...activeProjectFiles]; 
        try {
            const context = JSON.stringify(currentFiles, null, 2);
            const response = await agentManager.processRequest(userMsg.content, context, userMsg.attachments);
            response.actions.forEach(action => { if (action.type === 'delete') deleteFile(action.path); if (action.type === 'create' || action.type === 'update') { if (action.content && action.path) { writeFile(action.path, action.content); } } });
            const versionId = saveSnapshot(userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? '...' : ''));
            const responseMsgId = (Date.now() + 1).toString();
            addMessage({ id: responseMsgId, role: 'assistant', content: response.message, timestamp: new Date(), actions: response.actions, reasoning: response.reasoning, versionId: versionId || undefined });
        } catch (err) { console.error(err); addMessage({ id: Date.now().toString(), role: 'system', content: 'Error: ' + (err as Error).message, timestamp: new Date() }); } finally { setGenerating(false); }
    };
    useEffect(() => {
        if (generating) return; if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.actions && lastMsg.actions.length > 0) { const consistencyErrors = checkProjectConsistency(activeProjectFiles); if (consistencyErrors.length > 0 && autoFixCount < 2) { const fixPrompt = `CRITICAL: I found broken imports. ERRORS: ${consistencyErrors.join('\n')}. FIX NOW.`; const timer = setTimeout(() => handleSendMessage(fixPrompt, true), 500); return () => clearTimeout(timer); } }
    }, [messages, generating, activeProjectFiles]);

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (!files) return; Array.from(files).forEach(file => { const reader = new FileReader(); reader.onload = (e) => { const result = e.target?.result as string; const isImage = file.type.startsWith('image/'); const isPdf = file.type === 'application/pdf'; setAttachments(prev => [...prev, { name: file.name, mimeType: file.type, type: isImage ? 'image' : (isPdf ? 'file' : 'text'), data: result }]); }; if (file.type.startsWith('image/') || file.type === 'application/pdf') reader.readAsDataURL(file); else reader.readAsText(file); }); if (attachmentInputRef.current) attachmentInputRef.current.value = ''; };
    const handleSelectCode = () => { let snippet = ''; if (editorRef.current && monacoRef.current) { const selection = editorRef.current.getSelection(); const model = editorRef.current.getModel(); if (selection && !selection.isEmpty()) { snippet = model.getValueInRange(selection); } else { snippet = model.getValue(); } } else if (activeFile?.content) { snippet = activeFile.content; } if (snippet) { const formatted = `Referencing file ${activeFile?.path}:\n\`\`\`\n${snippet}\n\`\`\``; setPrompt(prev => prev + (prev ? '\n' : '') + formatted); setShowSelectToast(true); setTimeout(() => setShowSelectToast(false), 2000); } };
    const handleManualAutoFix = () => { if (consistencyErrors.length > 0) { const fixPrompt = `Fix these build errors:\n${consistencyErrors.join('\n')}`; handleSendMessage(fixPrompt, false); } };
    const handleDownloadZip = () => { downloadProjectAsZip(activeProjectFiles, `project-${activeProjectId || 'export'}`); };
    const handleEnhancePrompt = async () => { if (!prompt.trim()) return; setGenerating(true); try { const enhanced = await agentManager.enhancePrompt(prompt); setPrompt(enhanced); } finally { setGenerating(false); } };
    const openDiff = (path: string, newContent: string) => { const existing = findFile(activeProjectFiles, path); setDiffData({ original: existing?.content || '', modified: newContent, path: path, language: path.endsWith('.css') ? 'css' : path.endsWith('.json') ? 'json' : 'typescript' }); };
    const handleContextMenu = (e: React.MouseEvent, file: File) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, file }); };
    const handleRenameSubmit = (oldPath: string, newName: string) => { renameFile(oldPath, newName); setRenamingPath(null); };
    const handleCreateSubmit = (name: string) => { if (!creatingItem) return; addFile(creatingItem.parentPath, name, creatingItem.type); setCreatingItem(null); };
    const handleCreateFile = () => setCreatingItem({ type: 'file', parentPath: null });
    const handleCreateFolder = () => setCreatingItem({ type: 'folder', parentPath: null });
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (!files) return; Array.from(files).forEach(async (file) => { if (file.name.endsWith('.zip')) { try { const extractedFiles = await unzipToFiles(file); setProjectFiles(extractedFiles); addMessage({ id: Date.now().toString(), role: 'system', content: `Successfully uploaded and extracted ${file.name}`, timestamp: new Date() }); } catch (err) { console.error("Failed to unzip", err); addMessage({ id: Date.now().toString(), role: 'system', content: `Error extracting ZIP: ${(err as Error).message}`, timestamp: new Date() }); } return; } const reader = new FileReader(); reader.onload = (e) => { addFile(null, file.name, 'file'); setTimeout(() => updateFileContent(`/${file.name}`, e.target?.result as string), 50); }; reader.readAsText(file); }); if (uploadInputRef.current) uploadInputRef.current.value = ''; };
    const EnhancedRecursiveFileTree = ({ files, depth, parentPath }: { files: File[], depth: number, parentPath: string | null }) => {
        return (
            <>
                {files.map(file => (
                    <React.Fragment key={file.path}>
                        <FileTreeNode 
                            file={file} depth={depth} activePath={activeFile?.path || null} onSelect={setActiveFile} onToggle={(f) => toggleFolder(f.path)}
                            onContextMenu={handleContextMenu} isRenaming={renamingPath === file.path} onRenameSubmit={handleRenameSubmit} onRenameCancel={() => setRenamingPath(null)}
                        />
                        {file.type === 'folder' && file.isOpen && file.children && (
                            <EnhancedRecursiveFileTree files={file.children} depth={depth + 1} parentPath={file.path} />
                        )}
                    </React.Fragment>
                ))}
                {creatingItem && creatingItem.parentPath === parentPath && ( <FileTreeInput depth={depth} type={creatingItem.type} onSubmit={handleCreateSubmit} onCancel={() => setCreatingItem(null)} /> )}
            </>
        )
    };

    return (
        <div className="h-screen flex flex-col bg-black text-zinc-300 overflow-hidden font-sans">
            <CommandPalette open={openCmd} onOpenChange={setOpenCmd} />
            {diffData && <DiffModal {...diffData} onClose={() => setDiffData(null)} />}
            {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            
            {contextMenu && (
                <div className="fixed z-[9999] bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 min-w-[140px]" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={(e) => { e.stopPropagation(); setRenamingPath(contextMenu.file.path); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateFile(contextMenu.file.path); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteFile(contextMenu.file.path); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-red-400 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    {contextMenu.file.type === 'folder' && (
                         <div className="border-t border-zinc-800 my-1 pt-1">
                            <button onClick={(e) => { e.stopPropagation(); setCreatingItem({ type: 'file', parentPath: contextMenu.file.path }); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"><FilePlus className="w-3.5 h-3.5" /> New File</button>
                            <button onClick={(e) => { e.stopPropagation(); setCreatingItem({ type: 'folder', parentPath: contextMenu.file.path }); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"><FolderPlus className="w-3.5 h-3.5" /> New Folder</button>
                         </div>
                    )}
                </div>
            )}
            
            <header className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="hover:bg-zinc-800 p-1.5 rounded-md transition-colors flex items-center gap-2 text-zinc-400 hover:text-white" title="Back to Dashboard"><ArrowLeft className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className={cn("transition-all duration-300", generating ? "font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 via-white to-zinc-600 bg-[length:200%_auto] animate-shine" : "text-zinc-500")}>willkstudio</span><span className="text-zinc-600">/</span>
                        {isRenamingProject ? ( <input type="text" value={projectNameInput} onChange={(e) => setProjectNameInput(e.target.value)} onBlur={handleProjectRename} onKeyDown={(e) => e.key === 'Enter' && handleProjectRename()} autoFocus className="bg-zinc-900 text-zinc-200 border border-blue-500/50 rounded px-1.5 py-0.5 outline-none font-medium min-w-[100px]" /> ) : ( <span onClick={() => setIsRenamingProject(true)} className="text-zinc-200 font-medium hover:text-blue-400 cursor-pointer hover:bg-zinc-900/50 px-1.5 py-0.5 rounded transition-colors">{activeProject?.name || 'Untitled'}</span> )}
                        <div className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">Public</div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => setViewMode('code')} className={`p-1.5 rounded-md transition-all ${viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Code Only"><Code2 className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('split')} className={`p-1.5 rounded-md transition-all ${viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Split View"><Layout className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('preview')} className={`p-1.5 rounded-md transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Preview Only"><Monitor className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadZip} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Download ZIP"><Download className="w-4 h-4" /></button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-medium rounded-full transition-colors border border-zinc-800"><Github className="w-3.5 h-3.5" /></button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20"><Globe className="w-3.5 h-3.5" /> Publish</button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-zinc-900 shadow-md"></div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="bg-zinc-950 flex flex-col border-r border-zinc-800 shrink-0 relative z-10" style={{ width: chatWidth }}>
                     <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-900/50 backdrop-blur-sm">
                         <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Assistant</span>
                         <div className="flex items-center gap-1">
                             <button onClick={() => updateSettings({ autoSave: !settings.autoSave })} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title={settings.autoSave ? "Auto Save: ON" : "Auto Save: OFF"}>{settings.autoSave ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-zinc-500" />}</button>
                             <button onClick={handleManualSave} className={cn("p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", isSaving && "text-blue-400")} title="Save Project"><Save className={cn("w-3.5 h-3.5", isSaving && "animate-bounce")} /></button>
                             <div className="w-[1px] h-3 bg-zinc-800 mx-1"></div>
                             <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Settings"><Settings className="w-3.5 h-3.5" /></button>
                             <button onClick={() => setShowHistory(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="History"><History className="w-3.5 h-3.5" /></button>
                             <button onClick={handleManualAutoFix} disabled={!hasErrors} className={cn("p-1.5 rounded transition-colors relative", hasErrors ? "text-red-400 hover:bg-zinc-800 hover:text-red-300" : "text-zinc-600 cursor-not-allowed")} title={hasErrors ? `Fix ${consistencyErrors.length} issues` : "No issues detected"}><Wrench className="w-3.5 h-3.5" />{hasErrors && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}</button>
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar pb-32">
                        {messages.map(msg => (
                             <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.role === 'assistant' && (<div className="flex items-center justify-between w-full"><div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-zinc-400">WillkStudio</span></div>{msg.versionId && (<button onClick={() => restoreSnapshot(msg.versionId!)} className="text-[10px] text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors" title="Restore project to this state"><RotateCcw className="w-3 h-3" /> Restore</button>)}</div>)}
                                {msg.reasoning && (<div className="w-full mb-1"><details className="group"><summary className="list-none flex items-center gap-2 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors uppercase font-medium tracking-wider"><BrainCircuit className="w-3 h-3" /> Thought Process <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /></summary><div className="mt-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-zinc-800 italic">{msg.reasoning}</div></details></div>)}
                                <div className={`text-sm leading-relaxed max-w-full ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-zinc-700/50' : 'text-zinc-300'}`}>{msg.attachments && msg.attachments.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{msg.attachments.map((att, i) => (<div key={i} className="bg-black/30 rounded p-1.5 flex items-center gap-2 border border-white/10 max-w-[200px]">{att.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-blue-400" />}<span className="text-xs truncate">{att.name}</span></div>))}</div>)}{msg.content}</div>
                                {msg.actions && msg.actions.length > 0 && (<div className="w-full mt-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden"><div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between"><span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {msg.actions.length} actions taken</span><ChevronDown className="w-3.5 h-3.5 text-zinc-600" /></div><div className="p-2 space-y-1">{msg.actions.map((action, idx) => (<div key={idx} className="flex items-center justify-between text-xs px-2 py-1.5 hover:bg-zinc-800/50 rounded group"><div className="flex items-center gap-2 text-zinc-400">{action.type === 'create' ? <FilePlus className="w-3.5 h-3.5 text-green-400" /> : <FileCode className="w-3.5 h-3.5 text-blue-400" />}<span className="uppercase text-[10px] font-bold opacity-70 w-10">{action.type}</span><span className="truncate font-mono text-zinc-300 max-w-[120px]">{action.path.replace('/src/', '')}</span></div>{action.type === 'update' && action.content && (<button onClick={() => openDiff(action.path, action.content!)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-all" title="View Diff"><FileDiff className="w-3 h-3" /></button>)}</div>))}</div></div>)}
                             </div>
                        ))}
                        {generating && (<div className="flex items-center gap-2 text-zinc-500 text-sm pl-1"><Loader2 className="w-4 h-4 animate-spin" /><span>{autoFixCount > 0 ? "Auto-fixing issues..." : "Thinking..."}</span></div>)}
                        <div ref={chatEndRef} />
                    </div>
                    {/* ... (Input Area same as before) ... */}
                    {!generating && suggestions.length > 0 && (<div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">{suggestions.map((s, i) => (<button key={i} onClick={() => handleSendMessage(s)} className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">{s}</button>))}</div>)}
                    {attachments.length > 0 && (<div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">{attachments.map((att, i) => (<div key={i} className="relative group bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-2 min-w-[120px]">{att.type === 'image' ? <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center overflow-hidden"><img src={att.data} alt="preview" className="w-full h-full object-cover" /></div> : <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-blue-400" /></div>}<span className="text-xs text-zinc-300 truncate max-w-[100px]">{att.name}</span><button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-full p-0.5 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button></div>))}</div>)}
                    <div className="w-full p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                        <div className="bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5 relative animate-glow-pulse">
                            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="How can WillkStudio help you today? (or /command)" className="w-full bg-transparent border-none text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[48px] p-3 max-h-32" style={{ lineHeight: '1.5' }} />
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div className="flex items-center gap-2 relative">
                                    <button onClick={() => attachmentInputRef.current?.click()} className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-800 rounded-md transition-colors group" title="Add file"><div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center"><Plus className="w-3 h-3 text-blue-400" /></div></button>
                                    <input type="file" multiple ref={attachmentInputRef} className="hidden" onChange={handleAttachmentUpload} />
                                    <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
                                    <div className="relative">
                                        <button onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all text-xs font-medium border border-transparent", isModelMenuOpen ? "bg-zinc-800 text-white" : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200", settings.autoMode && "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20")}>{settings.autoMode ? <Sparkles className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}<span>{settings.autoMode ? "Auto Mode" : (settings.activeProvider === 'openai' ? "GPT-4o" : settings.activeProvider === 'anthropic' ? "Claude 3.5" : "Gemini 2.5")}</span><ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", isModelMenuOpen && "rotate-180")} /></button>
                                        {isModelMenuOpen && (<><div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} /><div className="absolute bottom-10 left-0 z-50 w-52 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1 flex flex-col animate-slide-up"><div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Model Selection</div><button onClick={() => { updateSettings({ autoMode: true }); setIsModelMenuOpen(false); }} className={cn("px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors", settings.autoMode ? "text-purple-400 bg-purple-500/5" : "text-zinc-300")}><span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Auto Mode</span>{settings.autoMode && <Check className="w-3 h-3" />}</button><div className="h-[1px] bg-zinc-800 my-1 mx-2" /><button onClick={() => { updateSettings({ autoMode: false, activeProvider: 'gemini' }); setIsModelMenuOpen(false); }} className={cn("px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors", !settings.autoMode && settings.activeProvider === 'gemini' ? "text-blue-400 bg-blue-500/5" : "text-zinc-300")}><span className="flex items-center gap-2"><Box className="w-3.5 h-3.5" /> Gemini 2.5 Flash</span>{!settings.autoMode && settings.activeProvider === 'gemini' && <Check className="w-3 h-3" />}</button><button onClick={() => { updateSettings({ autoMode: false, activeProvider: 'openai' }); setIsModelMenuOpen(false); }} className={cn("px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors", !settings.autoMode && settings.activeProvider === 'openai' ? "text-green-400 bg-green-500/5" : "text-zinc-300")}><span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> GPT-4o</span>{!settings.autoMode && settings.activeProvider === 'openai' && <Check className="w-3 h-3" />}</button><button onClick={() => { updateSettings({ autoMode: false, activeProvider: 'anthropic' }); setIsModelMenuOpen(false); }} className={cn("px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors", !settings.autoMode && settings.activeProvider === 'anthropic' ? "text-orange-400 bg-orange-500/5" : "text-zinc-300")}><span className="flex items-center gap-2"><Boxes className="w-3.5 h-3.5" /> Claude 3.5 Sonnet</span>{!settings.autoMode && settings.activeProvider === 'anthropic' && <Check className="w-3 h-3" />}</button></div></>)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2"><button onClick={handleSelectCode} className={cn("hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-800 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors", showSelectToast && "text-green-400")} title="Add current code selection to context">{showSelectToast ? <Check className="w-3.5 h-3.5" /> : <MousePointer2 className="w-3.5 h-3.5" />}<span>Context</span></button><button onClick={handleEnhancePrompt} disabled={generating || !prompt.trim()} className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-800 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"><Lightbulb className="w-3.5 h-3.5" /><span>Plan</span></button><button onClick={() => handleSendMessage()} disabled={(!prompt.trim() && attachments.length === 0) || generating} className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-sm"><ArrowUp className="w-4 h-4" /></button></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-20" onMouseDown={(e) => { e.preventDefault(); setIsDraggingChat(true); }}></div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                    <div className="flex-1 flex overflow-hidden relative">
                        {(viewMode === 'code' || viewMode === 'split') && (
                            <div className="flex flex-col border-r border-zinc-800 shrink-0" style={{ width: viewMode === 'split' ? `${editorRatio * 100}%` : '100%', maxWidth: viewMode === 'split' ? '90%' : '100%', minWidth: viewMode === 'split' ? '10%' : '100%' }}>
                                <div className="flex-1 flex min-h-0">
                                    <div className="bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0" style={{ width: explorerWidth }}>
                                        <div className="h-9 px-4 flex items-center justify-between text-xs font-medium text-zinc-500 border-b border-zinc-800/50 bg-zinc-900/20 shrink-0"><span>EXPLORER</span><div className="flex items-center gap-1"><button onClick={handleCreateFile} title="New File" className="hover:text-zinc-300 p-1"><FilePlus className="w-3.5 h-3.5" /></button><button onClick={handleCreateFolder} title="New Folder" className="hover:text-zinc-300 p-1"><FolderPlus className="w-3.5 h-3.5" /></button><button onClick={() => uploadInputRef.current?.click()} title="Upload Files" className="hover:text-zinc-300 p-1"><Upload className="w-3.5 h-3.5" /></button><input ref={uploadInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} /><Search className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300 ml-1" onClick={() => setOpenCmd(true)} /></div></div>
                                        <div className="flex-1 overflow-y-auto py-2"><EnhancedRecursiveFileTree files={activeProjectFiles} depth={0} parentPath={null} /></div>
                                    </div>
                                    <div className="w-1 cursor-col-resize hover:bg-blue-600 transition-colors z-10 bg-transparent" onMouseDown={(e) => { e.preventDefault(); setIsDraggingExplorer(true); }} />
                                    <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                                        <div className="h-9 flex bg-[#09090b] border-b border-zinc-800 overflow-x-auto scrollbar-none shrink-0">{activeFile && (<div className="flex items-center gap-2 px-3 bg-zinc-900 border-r border-zinc-800 text-xs text-zinc-300 min-w-fit border-t-2 border-t-blue-500 group"><FileCode className="w-3.5 h-3.5 text-blue-400" /><span>{activeFile.name}</span><X className="w-3.5 h-3.5 ml-2 text-zinc-500 hover:text-zinc-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setActiveFile(null); }} /></div>)}</div>
                                        <div className="flex-1 relative">
                                            {activeFile ? (
                                                <MonacoEditor height="100%" theme="vs-dark" path={activeFile.path} defaultLanguage={activeFile.name.endsWith('.css') ? 'css' : activeFile.name.endsWith('.html') ? 'html' : activeFile.name.endsWith('.json') ? 'json' : 'typescript'} defaultValue={activeFile.content || ''} value={activeFile.content || ''} onChange={(val) => updateFileContent(activeFile.path, val || '')} onMount={(editor, monaco) => { monacoRef.current = monaco; editorRef.current = editor; monaco.editor.defineTheme('custom-dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#09090b' } }); monaco.editor.setTheme('custom-dark'); }} options={{ minimap: { enabled: false }, fontSize: 13, lineHeight: 20, fontFamily: 'JetBrains Mono', padding: { top: 12 }, scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: "smooth" }} />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-zinc-600 flex-col gap-2"><Code2 className="w-10 h-10 opacity-20" /><span className="text-sm">Select a file to edit</span><span className="text-xs text-zinc-700">or ask AI to create one</span></div>
                                            )}
                                        </div>
                                        <TerminalPanel isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {viewMode === 'split' && (<div className="w-1 bg-zinc-800 hover:bg-blue-600 cursor-col-resize transition-colors z-20" onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplit(true); }} />)}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div className={`flex flex-col border-l border-zinc-800 flex-1 min-w-0 relative`}>
                                {(isDraggingExplorer || isDraggingSplit) && <div className="absolute inset-0 z-50 bg-transparent" />}
                                <SandpackProvider template="react-ts" theme="dark" files={flattenFiles(activeProjectFiles)} style={{ height: '100%', width: '100%' }} options={{ externalResources: ["https://cdn.tailwindcss.com"], classes: { "sp-layout": "!h-full !block !rounded-none !border-0", "sp-wrapper": "!h-full" } }}>
                                    <SandpackLayout style={{ height: '100%', display: 'block' }} className="!h-full !block !rounded-none !border-0 bg-zinc-950">
                                        <BrowserFrame isFullScreen={isFullScreen} toggleFullScreen={() => setIsFullScreen(!isFullScreen)} />
                                        <SandpackListener />
                                    </SandpackLayout>
                                </SandpackProvider>
                            </div>
                        )}
                    </div>
                    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] select-none font-medium shrink-0">
                        <div className="flex items-center gap-3"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white"></div> Remote</span><span>main*</span><span className="opacity-80">0 errors, 0 warnings</span></div>
                        <div className="flex items-center gap-3"><span>Ln 12, Col 34</span><span>UTF-8</span><span>JavaScript React</span><button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="hover:bg-white/20 px-1 rounded"><TerminalIcon className="w-3 h-3" /></button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};