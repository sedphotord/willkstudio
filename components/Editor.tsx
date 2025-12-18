
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileCode, Code2, X } from 'lucide-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { SandpackProvider, SandpackLayout, useSandpack } from "@codesandbox/sandpack-react";
import { useStore } from '../lib/store';
import { flattenFiles, checkProjectConsistency, downloadProjectAsZip, findFile } from '../lib/utils';
import { agentManager } from '../lib/ai/agents';
import { ChatAttachment } from '../types';

// Components
import { EditorHeader } from './editor/EditorHeader';
import { BrowserFrame } from './editor/BrowserFrame';
import { TerminalPanel } from './editor/TerminalPanel';
import { ChatPanel } from './editor/ChatPanel';
import { FileExplorer } from './editor/FileExplorer';
import { 
  CommandPalette, SettingsModal, HistoryModal, DiffModal 
} from './editor/EditorModals';

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

export const Editor: React.FC = () => {
    const { 
        activeProjectFiles, activeFile, activeProjectId, messages, projects,
        updateFileContent, addMessage, setActiveFile, setView,
        renameProject,
        pendingPrompt, setPendingPrompt, pendingAttachments, setPendingAttachments,
        saveSnapshot, restoreSnapshot, writeFile, deleteFile
    } = useStore();

    const [generating, setGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [openCmd, setOpenCmd] = useState(false);
    const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('preview');
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [autoFixCount, setAutoFixCount] = useState(0);
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
    
    // Layout State
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

    // Layout Resizing Handlers
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
    
    // AI Interaction
    const handleSendMessage = async (customPrompt?: string, isAutoFix: boolean = false) => {
        const textToSend = customPrompt || prompt;
        if (!textToSend.trim() && attachments.length === 0 && !isAutoFix) return;
        if (generating) return;
        if (isAutoFix) { if (autoFixCount > 2) { addMessage({ id: Date.now().toString(), role: 'system', content: "Auto-fix loop stopped.", timestamp: new Date() }); setAutoFixCount(0); setGenerating(false); return; } setAutoFixCount(prev => prev + 1); } else { setAutoFixCount(0); }
        const userMsg: any = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date(), attachments: [...attachments] };
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
    
    // Auto-Fix Monitor
    useEffect(() => {
        if (generating) return; if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.actions && lastMsg.actions.length > 0) { const consistencyErrors = checkProjectConsistency(activeProjectFiles); if (consistencyErrors.length > 0 && autoFixCount < 2) { const fixPrompt = `CRITICAL: I found broken imports. ERRORS: ${consistencyErrors.join('\n')}. FIX NOW.`; const timer = setTimeout(() => handleSendMessage(fixPrompt, true), 500); return () => clearTimeout(timer); } }
    }, [messages, generating, activeProjectFiles]);

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (!files) return; Array.from(files).forEach(file => { const reader = new FileReader(); reader.onload = (e) => { const result = e.target?.result as string; const isImage = file.type.startsWith('image/'); const isPdf = file.type === 'application/pdf'; setAttachments(prev => [...prev, { name: file.name, mimeType: file.type, type: isImage ? 'image' : (isPdf ? 'file' : 'text'), data: result }]); }; if (file.type.startsWith('image/') || file.type === 'application/pdf') reader.readAsDataURL(file); else reader.readAsText(file); }); };
    const handleSelectCode = () => { let snippet = ''; if (editorRef.current && monacoRef.current) { const selection = editorRef.current.getSelection(); const model = editorRef.current.getModel(); if (selection && !selection.isEmpty()) { snippet = model.getValueInRange(selection); } else { snippet = model.getValue(); } } else if (activeFile?.content) { snippet = activeFile.content; } if (snippet) { const formatted = `Referencing file ${activeFile?.path}:\n\`\`\`\n${snippet}\n\`\`\``; setPrompt(prev => prev + (prev ? '\n' : '') + formatted); setShowSelectToast(true); setTimeout(() => setShowSelectToast(false), 2000); } };
    const handleManualAutoFix = () => { if (consistencyErrors.length > 0) { const fixPrompt = `Fix these build errors:\n${consistencyErrors.join('\n')}`; handleSendMessage(fixPrompt, false); } };
    const handleDownloadZip = () => { downloadProjectAsZip(activeProjectFiles, `project-${activeProjectId || 'export'}`); };
    const handleEnhancePrompt = async () => { if (!prompt.trim()) return; setGenerating(true); try { const enhanced = await agentManager.enhancePrompt(prompt); setPrompt(enhanced); } finally { setGenerating(false); } };
    const openDiff = (path: string, newContent: string) => { const existing = findFile(activeProjectFiles, path); setDiffData({ original: existing?.content || '', modified: newContent, path: path, language: path.endsWith('.css') ? 'css' : path.endsWith('.json') ? 'json' : 'typescript' }); };

    return (
        <div className="h-screen flex flex-col bg-black text-zinc-300 overflow-hidden font-sans">
            <CommandPalette open={openCmd} onOpenChange={setOpenCmd} />
            {diffData && <DiffModal {...diffData} onClose={() => setDiffData(null)} />}
            {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            
            <EditorHeader 
                viewMode={viewMode}
                setViewMode={setViewMode}
                isRenamingProject={isRenamingProject}
                setIsRenamingProject={setIsRenamingProject}
                projectNameInput={projectNameInput}
                setProjectNameInput={setProjectNameInput}
                handleProjectRename={handleProjectRename}
                handleDownloadZip={handleDownloadZip}
                setView={setView}
            />

            <div className="flex-1 flex overflow-hidden">
                <ChatPanel 
                    width={chatWidth}
                    messages={messages}
                    generating={generating}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleSendMessage={handleSendMessage}
                    handleManualSave={handleManualSave}
                    isSaving={isSaving}
                    setShowSettings={setShowSettings}
                    setShowHistory={setShowHistory}
                    handleManualAutoFix={handleManualAutoFix}
                    hasErrors={hasErrors}
                    consistencyErrors={consistencyErrors}
                    restoreSnapshot={restoreSnapshot}
                    openDiff={openDiff}
                    autoFixCount={autoFixCount}
                    suggestions={suggestions}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    handleAttachmentUpload={handleAttachmentUpload}
                    handleSelectCode={handleSelectCode}
                    showSelectToast={showSelectToast}
                    handleEnhancePrompt={handleEnhancePrompt}
                    setIsDraggingChat={setIsDraggingChat}
                />

                <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                    <div className="flex-1 flex overflow-hidden relative">
                        {(viewMode === 'code' || viewMode === 'split') && (
                            <div className="flex flex-col border-r border-zinc-800 shrink-0" style={{ width: viewMode === 'split' ? `${editorRatio * 100}%` : '100%', maxWidth: viewMode === 'split' ? '90%' : '100%', minWidth: viewMode === 'split' ? '10%' : '100%' }}>
                                <div className="flex-1 flex min-h-0">
                                    <FileExplorer 
                                        width={explorerWidth}
                                        setIsDraggingExplorer={setIsDraggingExplorer}
                                        setOpenCmd={setOpenCmd}
                                    />

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
                        <div className="flex items-center gap-3"><span>Ln 12, Col 34</span><span>UTF-8</span><span>JavaScript React</span><button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="hover:bg-white/20 px-1 rounded"><Code2 className="w-3 h-3" /></button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
