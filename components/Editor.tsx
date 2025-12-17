import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Play, Bot, Sparkles, ChevronRight, ChevronDown,
  X, Send, Loader2, Code2, Globe, Monitor, Terminal as TerminalIcon, Search,
  Layout, Maximize2, Minimize2, PanelLeft, RefreshCw, ExternalLink, Menu,
  CheckCircle2, AlertCircle, FilePlus, MousePointer2, Lightbulb, ArrowUp, Plus,
  ChevronLeft, RotateCw, Lock, FolderPlus, Upload, Trash2, Edit2, MoreVertical, Copy,
  ArrowLeft, Zap, Tablet, Smartphone
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { SandpackProvider, SandpackLayout, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { Command } from 'cmdk';
import { File, ChatMessage } from '../types';
import { generateCode } from '../services/geminiService';
import { useStore } from '../lib/store';
import { flattenFiles, cn } from '../lib/utils';
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

// --- Browser Frame Component ---
const BrowserFrame = () => {
    // We use a key to force refresh the iframe when the refresh button is clicked
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [url, setUrl] = useState('localhost:3000');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleRefresh = () => {
        setIsLoading(true);
        setRefreshKey(k => k + 1);
        setTimeout(() => setIsLoading(false), 800); // Fake loading state duration
    };

    const handleUrlSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRefresh();
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
             {/* Browser Toolbar */}
             <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-3 shrink-0 justify-between">
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                     <div className="flex items-center gap-1 shrink-0">
                         <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                         <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                         <button 
                            onClick={handleRefresh}
                            className={cn(
                                "p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors",
                                isLoading && "animate-spin text-zinc-100"
                            )}
                         >
                            <RotateCw className="w-3.5 h-3.5" />
                         </button>
                     </div>
                     
                     {/* Authentic Address Bar */}
                     <div className="flex-1 max-w-xl bg-zinc-950 rounded-md border border-zinc-800 h-7 flex items-center px-3 text-xs text-zinc-400 font-mono shadow-sm min-w-0 group focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                         <Lock className="w-3 h-3 mr-2 text-green-500/80 shrink-0" />
                         <input 
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleUrlSubmit}
                            className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder-zinc-600 w-full"
                            spellCheck={false}
                         />
                     </div>
                 </div>

                 {/* Viewport Toggles */}
                 <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 shrink-0">
                    <button 
                        onClick={() => setViewport('desktop')}
                        className={cn(
                            "p-1.5 rounded-md transition-all",
                            viewport === 'desktop' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Desktop View"
                    >
                        <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => setViewport('tablet')}
                        className={cn(
                            "p-1.5 rounded-md transition-all",
                            viewport === 'tablet' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Tablet View (768px)"
                    >
                        <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => setViewport('mobile')}
                        className={cn(
                            "p-1.5 rounded-md transition-all",
                            viewport === 'mobile' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Mobile View (375px)"
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                    </button>
                 </div>
             </div>
             
             {/* Preview Content */}
             <div className={cn(
                 "flex-1 relative bg-zinc-900/50 isolate w-full h-full overflow-hidden flex flex-col items-center transition-all",
                 viewport !== 'desktop' && "py-4"
             )}>
                  <div 
                      className={cn(
                          "transition-all duration-300 ease-in-out bg-white overflow-hidden shadow-2xl relative",
                          viewport === 'desktop' ? "w-full h-full" : "border-4 border-zinc-800",
                          viewport === 'tablet' && "w-[768px] h-full rounded-xl",
                          viewport === 'mobile' && "w-[375px] h-full rounded-2xl"
                      )}
                  >
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

// --- Command Palette ---
const CommandPalette = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    const { activeProjectFiles, setActiveFile } = useStore();
    const [search, setSearch] = useState('');
    
    const getAllFiles = (nodes: File[]): File[] => {
        let results: File[] = [];
        nodes.forEach(node => {
            if (node.type === 'file') results.push(node);
            if (node.children) results = [...results, ...getAllFiles(node.children)];
        });
        return results;
    };
    const files = getAllFiles(activeProjectFiles);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command Menu">
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" cmdk-overlay="">
                <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl" cmdk-root="">
                    <Command.Input 
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search files..." 
                        cmdk-input=""
                    />
                    <Command.List className="max-h-[300px] overflow-y-auto p-2">
                        <Command.Empty cmdk-empty="">No results found.</Command.Empty>
                        <Command.Group heading="Files" className="text-xs font-medium text-zinc-500 px-2 py-1.5">
                            {files.map(file => (
                                <Command.Item
                                    key={file.path}
                                    onSelect={() => { setActiveFile(file); onOpenChange(false); }}
                                    cmdk-item=""
                                >
                                    <FileCode className="mr-2 h-4 w-4" />
                                    {file.name}
                                    <span className="ml-auto text-xs text-zinc-600">{file.path}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>
                </div>
            </div>
        </Command.Dialog>
    );
};

// --- Terminal Component ---
const TerminalPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="h-40 bg-[#09090b] border-t border-zinc-800 flex flex-col font-mono text-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Terminal</span>
                </div>
                <button onClick={onClose}><X className="w-4 h-4 text-zinc-500 hover:text-zinc-300" /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-zinc-300 space-y-1">
                <div className="flex gap-2">
                    <span className="text-green-500">➜</span>
                    <span className="text-blue-400">project</span>
                    <span className="text-zinc-500">git:(main)</span>
                    <span>npm start</span>
                </div>
                <div className="text-zinc-500">
                    &gt; react-scripts start
                </div>
                <div className="text-zinc-500 ml-4">
                    Starting the development server...
                </div>
                <div className="text-green-400 mt-2">
                    Compiled successfully!
                </div>
            </div>
        </div>
    );
};

// --- Main Editor Component ---
export const Editor: React.FC = () => {
    const { 
        activeProjectFiles, activeFile, activeProjectId, messages,
        updateFileContent, addMessage, setActiveFile, toggleFolder, setView,
        addFile, deleteFile, renameFile, duplicateFile
    } = useStore();

    const [generating, setGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [openCmd, setOpenCmd] = useState(false);
    // CHANGE: Default view mode is now 'preview' for full screen sandbox
    const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('preview');
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Explorer State
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [creatingItem, setCreatingItem] = useState<{ type: 'file' | 'folder', parentPath: string | null } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: File } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    // Layout State
    const [explorerWidth, setExplorerWidth] = useState(240);
    const [editorRatio, setEditorRatio] = useState(0.5); // 0.5 = 50%
    const [isDraggingExplorer, setIsDraggingExplorer] = useState(false);
    const [isDraggingSplit, setIsDraggingSplit] = useState(false);
    const CHAT_WIDTH = 360;

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, generating]);

    // Close context menu on click elsewhere
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Handle Window Resizing Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingExplorer) {
                const relativeX = e.clientX - CHAT_WIDTH;
                const newWidth = Math.max(160, Math.min(relativeX, 600));
                setExplorerWidth(newWidth);
            }
            if (isDraggingSplit) {
                const workbenchWidth = window.innerWidth - CHAT_WIDTH;
                const relativeX = e.clientX - CHAT_WIDTH;
                const ratio = Math.max(0.1, Math.min(relativeX / workbenchWidth, 0.9));
                setEditorRatio(ratio);
            }
        };

        const handleMouseUp = () => {
            setIsDraggingExplorer(false);
            setIsDraggingSplit(false);
        };

        if (isDraggingExplorer || isDraggingSplit) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDraggingExplorer, isDraggingSplit]);


    const handleSendMessage = async () => {
        if (!prompt.trim() || generating) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt, timestamp: new Date() };
        addMessage(userMsg);
        setPrompt('');
        setGenerating(true);

        const context = JSON.stringify(activeProjectFiles, null, 2);

        try {
            const response = await generateCode(userMsg.content, context);
            
            // Apply updates
            response.actions.forEach(action => {
                if (action.type === 'update' || action.type === 'create') {
                    if (action.content && action.path) {
                        updateFileContent(action.path, action.content);
                    }
                }
            });

            addMessage({ 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: response.message, 
                timestamp: new Date(),
                actions: response.actions
            });

        } catch (err) {
            console.error(err);
            addMessage({ id: Date.now().toString(), role: 'system', content: 'Error: ' + (err as Error).message, timestamp: new Date() });
        } finally {
            setGenerating(false);
        }
    };

    // Explorer Actions
    const handleContextMenu = (e: React.MouseEvent, file: File) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const handleRenameSubmit = (oldPath: string, newName: string) => {
        renameFile(oldPath, newName);
        setRenamingPath(null);
    };

    const handleCreateSubmit = (name: string) => {
        if (!creatingItem) return;
        addFile(creatingItem.parentPath, name, creatingItem.type);
        setCreatingItem(null);
    };

    const handleCreateFile = () => {
        setCreatingItem({ type: 'file', parentPath: null });
    };

    const handleCreateFolder = () => {
        setCreatingItem({ type: 'folder', parentPath: null });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        Array.from(files).forEach(file => {
             const reader = new FileReader();
             reader.onload = (e) => {
                 const content = e.target?.result as string;
                 addFile(null, file.name, 'file');
                 setTimeout(() => {
                     updateFileContent(`/${file.name}`, content);
                 }, 50);
             };
             reader.readAsText(file);
        });
        
        if (uploadInputRef.current) uploadInputRef.current.value = '';
    };

    const RecursiveFileTree = ({ files, depth, parentPath }: { files: File[], depth: number, parentPath: string | null }) => {
        return (
            <>
                {files.map(file => (
                    <FileTreeNode 
                        key={file.path} 
                        file={file} 
                        depth={depth} 
                        activePath={activeFile?.path || null}
                        onSelect={setActiveFile}
                        onToggle={(f) => toggleFolder(f.path)}
                        onContextMenu={handleContextMenu}
                        isRenaming={renamingPath === file.path}
                        onRenameSubmit={handleRenameSubmit}
                        onRenameCancel={() => setRenamingPath(null)}
                    />
                ))}
                {creatingItem && creatingItem.parentPath === parentPath && (
                    <FileTreeInput 
                        depth={depth} 
                        type={creatingItem.type} 
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setCreatingItem(null)}
                    />
                )}
            </>
        );
    };

    const EnhancedRecursiveFileTree = ({ files, depth, parentPath }: { files: File[], depth: number, parentPath: string | null }) => {
        return (
            <>
                {files.map(file => (
                    <React.Fragment key={file.path}>
                        <FileTreeNode 
                            file={file} 
                            depth={depth} 
                            activePath={activeFile?.path || null}
                            onSelect={setActiveFile}
                            onToggle={(f) => toggleFolder(f.path)}
                            onContextMenu={handleContextMenu}
                            isRenaming={renamingPath === file.path}
                            onRenameSubmit={handleRenameSubmit}
                            onRenameCancel={() => setRenamingPath(null)}
                        />
                        {file.type === 'folder' && file.isOpen && file.children && (
                            <EnhancedRecursiveFileTree 
                                files={file.children} 
                                depth={depth + 1} 
                                parentPath={file.path} 
                            />
                        )}
                    </React.Fragment>
                ))}
                {creatingItem && creatingItem.parentPath === parentPath && (
                     <FileTreeInput 
                        depth={depth} 
                        type={creatingItem.type} 
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setCreatingItem(null)}
                    />
                )}
            </>
        )
    };

    return (
        <div className="h-screen flex flex-col bg-black text-zinc-300 overflow-hidden font-sans">
            <CommandPalette open={openCmd} onOpenChange={setOpenCmd} />
            
            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed z-[9999] bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 min-w-[140px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setRenamingPath(contextMenu.file.path); setContextMenu(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); duplicateFile(contextMenu.file.path); setContextMenu(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                    >
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button 
                         onClick={(e) => { e.stopPropagation(); deleteFile(contextMenu.file.path); setContextMenu(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-red-400 flex items-center gap-2"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    {contextMenu.file.type === 'folder' && (
                         <div className="border-t border-zinc-800 my-1 pt-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCreatingItem({ type: 'file', parentPath: contextMenu.file.path }); setContextMenu(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                            >
                                <FilePlus className="w-3.5 h-3.5" /> New File
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCreatingItem({ type: 'folder', parentPath: contextMenu.file.path }); setContextMenu(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                            >
                                <FolderPlus className="w-3.5 h-3.5" /> New Folder
                            </button>
                         </div>
                    )}
                </div>
            )}
            
            {/* Top Navigation Bar */}
            <header className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className="hover:bg-zinc-800 p-1.5 rounded-md transition-colors flex items-center gap-2 text-zinc-400 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">willkstudio /</span>
                        <span className="text-zinc-200 font-medium">project-{activeProjectId}</span>
                        <div className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">Public</div>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button 
                        onClick={() => setViewMode('code')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Code Only"
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('split')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Split View"
                    >
                        <Layout className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Preview Only"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20">
                        <Globe className="w-3.5 h-3.5" /> Publish
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-zinc-900 shadow-md"></div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Panel: Chat (Fixed width for now) */}
                <div 
                    className="bg-zinc-950 flex flex-col border-r border-zinc-800 shrink-0 relative z-10"
                    style={{ width: CHAT_WIDTH }}
                >
                     <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar pb-32">
                        {messages.length === 0 && (
                            <div className="mt-10 text-center">
                                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <Sparkles className="w-6 h-6 text-zinc-500" />
                                </div>
                                <h3 className="text-zinc-200 font-medium mb-2">How can WillkStudio help?</h3>
                                <p className="text-sm text-zinc-500">Generate components, fix bugs, or build entire apps.</p>
                            </div>
                        )}
                        
                        {messages.map(msg => (
                             <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                            <Bot className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-xs font-medium text-zinc-400">WillkStudio</span>
                                    </div>
                                )}
                                
                                <div className={`text-sm leading-relaxed max-w-full ${
                                    msg.role === 'user' 
                                    ? 'bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-zinc-700/50' 
                                    : 'text-zinc-300'
                                }`}>
                                    {msg.content}
                                </div>

                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="w-full mt-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
                                        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                                            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                {msg.actions.length} actions taken
                                            </span>
                                            <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {msg.actions.map((action, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs px-2 py-1.5 hover:bg-zinc-800/50 rounded cursor-pointer text-zinc-400">
                                                    {action.type === 'create' ? <FilePlus className="w-3.5 h-3.5 text-green-400" /> : <FileCode className="w-3.5 h-3.5 text-blue-400" />}
                                                    <span className="uppercase text-[10px] font-bold opacity-70 w-10">{action.type}</span>
                                                    <span className="truncate font-mono text-zinc-300">{action.path.replace('/src/', '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {generating && (
                            <div className="flex items-center gap-2 text-zinc-500 text-sm pl-1">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* Modern Composer Chat Input */}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                        <div className="bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                placeholder="How can WillkStudio help you today? (or /command)"
                                className="w-full bg-transparent border-none text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[48px] p-3 max-h-32"
                                style={{ lineHeight: '1.5' }}
                            />
                            
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-800 rounded-md transition-colors group">
                                         <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Plus className="w-3 h-3 text-blue-400" />
                                         </div>
                                    </button>
                                    
                                    <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
                                    
                                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-800 rounded-md transition-colors text-xs text-zinc-400 hover:text-zinc-200 font-medium">
                                         <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                         <span>Gemini 2.5 Flash</span>
                                         <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                     <button className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-800 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                                        <MousePointer2 className="w-3.5 h-3.5" />
                                        <span>Select</span>
                                    </button>
                                     <button className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-800 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        <span>Plan</span>
                                    </button>
                                    <button 
                                        onClick={handleSendMessage} 
                                        disabled={!prompt.trim() || generating}
                                        className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-sm"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Workbench */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                    <div className="flex-1 flex overflow-hidden relative">
                        
                        {(viewMode === 'code' || viewMode === 'split') && (
                            <div 
                                className="flex flex-col border-r border-zinc-800 shrink-0"
                                style={{ 
                                    width: viewMode === 'split' ? `${editorRatio * 100}%` : '100%',
                                    maxWidth: viewMode === 'split' ? '90%' : '100%',
                                    minWidth: viewMode === 'split' ? '10%' : '100%' 
                                }}
                            >
                                <div className="flex-1 flex min-h-0">
                                    {/* File Explorer Sidebar */}
                                    <div 
                                        className="bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0"
                                        style={{ width: explorerWidth }}
                                    >
                                        <div className="h-9 px-4 flex items-center justify-between text-xs font-medium text-zinc-500 border-b border-zinc-800/50 bg-zinc-900/20 shrink-0">
                                            <span>EXPLORER</span>
                                            <div className="flex items-center gap-1">
                                                <button onClick={handleCreateFile} title="New File" className="hover:text-zinc-300 p-1"><FilePlus className="w-3.5 h-3.5" /></button>
                                                <button onClick={handleCreateFolder} title="New Folder" className="hover:text-zinc-300 p-1"><FolderPlus className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => uploadInputRef.current?.click()} title="Upload Files" className="hover:text-zinc-300 p-1"><Upload className="w-3.5 h-3.5" /></button>
                                                <input ref={uploadInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                                                <Search className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300 ml-1" onClick={() => setOpenCmd(true)} />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto py-2">
                                            {/* Use the enhanced recursive tree that supports creation state */}
                                            <EnhancedRecursiveFileTree files={activeProjectFiles} depth={0} parentPath={null} />
                                        </div>
                                    </div>
                                    
                                    {/* Explorer Resizer Handle */}
                                    <div
                                        className="w-1 cursor-col-resize hover:bg-blue-600 transition-colors z-10 bg-transparent"
                                        onMouseDown={(e) => { e.preventDefault(); setIsDraggingExplorer(true); }}
                                    />

                                    {/* Monaco Editor Container */}
                                    <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                                        {/* File Tabs */}
                                        <div className="h-9 flex bg-[#09090b] border-b border-zinc-800 overflow-x-auto scrollbar-none shrink-0">
                                            {activeFile && (
                                                <div className="flex items-center gap-2 px-3 bg-zinc-900 border-r border-zinc-800 text-xs text-zinc-300 min-w-fit border-t-2 border-t-blue-500 group">
                                                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                                    <span>{activeFile.name}</span>
                                                    <X 
                                                        className="w-3.5 h-3.5 ml-2 text-zinc-500 hover:text-zinc-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                                                        onClick={(e) => { e.stopPropagation(); setActiveFile(null); }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Editor */}
                                        <div className="flex-1 relative">
                                            {activeFile ? (
                                                <MonacoEditor
                                                    height="100%"
                                                    theme="vs-dark"
                                                    path={activeFile.path}
                                                    defaultLanguage={activeFile.name.split('.').pop() === 'css' ? 'css' : 'javascript'}
                                                    defaultValue={activeFile.content || ''}
                                                    value={activeFile.content || ''}
                                                    onChange={(val) => updateFileContent(activeFile.path, val || '')}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        fontSize: 13,
                                                        lineHeight: 20,
                                                        fontFamily: 'JetBrains Mono',
                                                        padding: { top: 12 },
                                                        scrollBeyondLastLine: false,
                                                        smoothScrolling: true,
                                                        cursorBlinking: "smooth"
                                                    }}
                                                    onMount={(editor, monaco) => {
                                                        monaco.editor.defineTheme('custom-dark', {
                                                            base: 'vs-dark',
                                                            inherit: true,
                                                            rules: [],
                                                            colors: {
                                                                'editor.background': '#09090b',
                                                            }
                                                        });
                                                        monaco.editor.setTheme('custom-dark');
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-zinc-600 flex-col gap-2">
                                                    <Code2 className="w-10 h-10 opacity-20" />
                                                    <span className="text-sm">Select a file to edit</span>
                                                    <span className="text-xs text-zinc-700">or ask AI to create one</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Bottom Terminal Drawer */}
                                        <TerminalPanel isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Split Resizer Handle */}
                        {viewMode === 'split' && (
                            <div 
                                className="w-1 bg-zinc-800 hover:bg-blue-600 cursor-col-resize transition-colors z-20"
                                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplit(true); }}
                            />
                        )}

                        {/* Preview Area */}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div className={`flex flex-col border-l border-zinc-800 flex-1 min-w-0 relative`}>
                                {/* Drag Overlay to prevent iframe capturing mouse events */}
                                {(isDraggingExplorer || isDraggingSplit) && <div className="absolute inset-0 z-50 bg-transparent" />}
                                
                                <SandpackProvider 
                                    template="react"
                                    theme="dark"
                                    files={flattenFiles(activeProjectFiles)}
                                    style={{ height: '100%', width: '100%' }}
                                    options={{
                                        externalResources: ["https://cdn.tailwindcss.com"],
                                        classes: {
                                            "sp-layout": "!h-full !block !rounded-none !border-0",
                                            "sp-wrapper": "!h-full",
                                        }
                                    }}
                                >
                                    <SandpackLayout style={{ height: '100%', display: 'block' }} className="!h-full !block !rounded-none !border-0 bg-zinc-950">
                                        <BrowserFrame />
                                        <SandpackListener />
                                    </SandpackLayout>
                                </SandpackProvider>
                            </div>
                        )}
                    </div>
                    
                    {/* Status Bar */}
                    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] select-none font-medium shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white"></div> Remote</span>
                            <span>main*</span>
                            <span className="opacity-80">0 errors, 0 warnings</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span>Ln 12, Col 34</span>
                            <span>UTF-8</span>
                            <span>JavaScript React</span>
                            <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="hover:bg-white/20 px-1 rounded">
                                <TerminalIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};