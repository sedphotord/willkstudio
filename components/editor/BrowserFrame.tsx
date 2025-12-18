
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Lock, Monitor, 
  Tablet, Smartphone, Maximize2, Minimize2 
} from 'lucide-react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { SandpackPreview } from "@codesandbox/sandpack-react";
import { cn } from '../../lib/utils';

export const BrowserFrame = ({ isFullScreen, toggleFullScreen }: { isFullScreen: boolean, toggleFullScreen: () => void }) => {
    const { sandpack, listen } = useSandpack();
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [url, setUrl] = useState('/'); 
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const unsubscribe = listen((msg) => {
            if (msg.type === 'urlchange' && msg.url) {
                try {
                    const urlObj = new URL(msg.url);
                    setUrl(urlObj.pathname + urlObj.search + urlObj.hash);
                } catch (e) {
                    setUrl(msg.url.replace(/^https?:\/\/[^/]+/, '') || '/');
                }
            }
        });
        return unsubscribe;
    }, [listen]);

    const handleRefresh = () => {
        setIsLoading(true);
        sandpack.runSandpack(); 
        setRefreshKey(k => k + 1);
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-full bg-zinc-950 border-l border-zinc-800 transition-all duration-300",
            isFullScreen && "fixed inset-0 z-[100] border-0"
        )}>
            <div className="h-11 bg-[#18181b] border-b border-zinc-800 flex items-center px-4 gap-4 shrink-0 justify-between select-none">
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                     <div className="flex items-center gap-1.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                     </div>
                     
                     <div className="w-[1px] h-4 bg-zinc-700 mx-1 opacity-50"></div>

                     <div className="flex items-center gap-1 text-zinc-400">
                         <button className="p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></button>
                         <button className="p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors"><ArrowRight className="w-3.5 h-3.5" /></button>
                         <button 
                            onClick={handleRefresh}
                            className={cn("p-1 hover:bg-zinc-800 rounded-md hover:text-white transition-colors", isLoading && "animate-spin")}
                         >
                            <RotateCw className="w-3.5 h-3.5" />
                         </button>
                     </div>

                     <div className="flex-1 max-w-xl bg-zinc-900/50 hover:bg-zinc-900 rounded-md border border-zinc-700/50 hover:border-zinc-600 h-7 flex items-center px-3 text-xs text-zinc-400 font-sans transition-all group shadow-inner">
                         <Lock className="w-3 h-3 mr-2 text-zinc-500 group-hover:text-zinc-400 shrink-0" />
                         <span className="truncate group-hover:text-zinc-200">{url}</span>
                     </div>
                 </div>

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
