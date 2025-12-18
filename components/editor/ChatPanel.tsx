
import React, { useRef, useState } from 'react';
import { 
    ToggleRight, ToggleLeft, Save, Settings, History, Wrench, RotateCcw,
    BrainCircuit, ImageIcon, FileText, CheckCircle2, ChevronDown, FilePlus,
    FileCode, FileDiff, Loader2, X, Plus, Sparkles, Box, Check, Bot, Boxes,
    MousePointer2, Lightbulb, ArrowUp, ChevronRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { ChatAttachment } from '../../types';

interface ChatPanelProps {
    width: number;
    messages: any[];
    generating: boolean;
    prompt: string;
    setPrompt: (p: string) => void;
    handleSendMessage: (custom?: string, autofix?: boolean) => void;
    handleManualSave: () => void;
    isSaving: boolean;
    setShowSettings: (v: boolean) => void;
    setShowHistory: (v: boolean) => void;
    handleManualAutoFix: () => void;
    hasErrors: boolean;
    consistencyErrors: string[];
    restoreSnapshot: (id: string) => void;
    openDiff: (path: string, content: string) => void;
    autoFixCount: number;
    suggestions: string[];
    attachments: ChatAttachment[];
    setAttachments: React.Dispatch<React.SetStateAction<ChatAttachment[]>>;
    handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectCode: () => void;
    showSelectToast: boolean;
    handleEnhancePrompt: () => void;
    setIsDraggingChat: (v: boolean) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    width, messages, generating, prompt, setPrompt, handleSendMessage,
    handleManualSave, isSaving, setShowSettings, setShowHistory, handleManualAutoFix,
    hasErrors, consistencyErrors, restoreSnapshot, openDiff, autoFixCount, suggestions,
    attachments, setAttachments, handleAttachmentUpload, handleSelectCode, showSelectToast,
    handleEnhancePrompt, setIsDraggingChat
}) => {
    const { settings, updateSettings } = useStore();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, generating]);

    return (
        <div className="bg-zinc-950 flex flex-col border-r border-zinc-800 shrink-0 relative z-10" style={{ width }}>
            {/* Toolbar */}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar pb-32">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'assistant' && (<div className="flex items-center justify-between w-full"><div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-zinc-400">WillkStudio</span></div>{msg.versionId && (<button onClick={() => restoreSnapshot(msg.versionId!)} className="text-[10px] text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors" title="Restore project to this state"><RotateCcw className="w-3 h-3" /> Restore</button>)}</div>)}
                        {msg.reasoning && (<div className="w-full mb-1"><details className="group"><summary className="list-none flex items-center gap-2 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors uppercase font-medium tracking-wider"><BrainCircuit className="w-3 h-3" /> Thought Process <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /></summary><div className="mt-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-zinc-800 italic">{msg.reasoning}</div></details></div>)}
                        <div className={`text-sm leading-relaxed max-w-full ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-zinc-700/50' : 'text-zinc-300'}`}>{msg.attachments && msg.attachments.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{msg.attachments.map((att: any, i: number) => (<div key={i} className="bg-black/30 rounded p-1.5 flex items-center gap-2 border border-white/10 max-w-[200px]">{att.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-blue-400" />}<span className="text-xs truncate">{att.name}</span></div>))}</div>)}{msg.content}</div>
                        {msg.actions && msg.actions.length > 0 && (<div className="w-full mt-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden"><div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between"><span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {msg.actions.length} actions taken</span><ChevronDown className="w-3.5 h-3.5 text-zinc-600" /></div><div className="p-2 space-y-1">{msg.actions.map((action: any, idx: number) => (<div key={idx} className="flex items-center justify-between text-xs px-2 py-1.5 hover:bg-zinc-800/50 rounded group"><div className="flex items-center gap-2 text-zinc-400">{action.type === 'create' ? <FilePlus className="w-3.5 h-3.5 text-green-400" /> : <FileCode className="w-3.5 h-3.5 text-blue-400" />}<span className="uppercase text-[10px] font-bold opacity-70 w-10">{action.type}</span><span className="truncate font-mono text-zinc-300 max-w-[120px]">{action.path.replace('/src/', '')}</span></div>{action.type === 'update' && action.content && (<button onClick={() => openDiff(action.path, action.content!)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-all" title="View Diff"><FileDiff className="w-3 h-3" /></button>)}</div>))}</div></div>)}
                    </div>
                ))}
                {generating && (<div className="flex items-center gap-2 text-zinc-500 text-sm pl-1"><Loader2 className="w-4 h-4 animate-spin" /><span>{autoFixCount > 0 ? "Auto-fixing issues..." : "Thinking..."}</span></div>)}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="w-full p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent mt-auto">
                 {!generating && suggestions.length > 0 && (<div className="pb-3 flex gap-2 overflow-x-auto scrollbar-none">{suggestions.map((s, i) => (<button key={i} onClick={() => handleSendMessage(s)} className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">{s}</button>))}</div>)}
                 {attachments.length > 0 && (<div className="pb-3 flex gap-2 overflow-x-auto scrollbar-none">{attachments.map((att, i) => (<div key={i} className="relative group bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-2 min-w-[120px]">{att.type === 'image' ? <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center overflow-hidden"><img src={att.data} alt="preview" className="w-full h-full object-cover" /></div> : <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-blue-400" /></div>}<span className="text-xs text-zinc-300 truncate max-w-[100px]">{att.name}</span><button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-full p-0.5 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button></div>))}</div>)}

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
    );
};