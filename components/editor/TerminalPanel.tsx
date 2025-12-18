
import React from 'react';
import { X } from 'lucide-react';

export const TerminalPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="h-48 border-t border-zinc-800 bg-[#09090b] flex flex-col shrink-0 animate-in slide-in-from-bottom-10 fade-in duration-200">
           <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
               <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                   <span className="text-white border-b-2 border-blue-500 pb-2 -mb-2.5">Output</span>
                   <span className="hover:text-zinc-200 cursor-pointer">Terminal</span>
                   <span className="hover:text-zinc-200 cursor-pointer">Problems</span>
               </div>
               <div className="flex items-center gap-2">
                   <button onClick={onClose}><X className="w-3.5 h-3.5 text-zinc-500 hover:text-white" /></button>
               </div>
           </div>
           <div className="flex-1 p-3 font-mono text-xs text-zinc-400 overflow-y-auto font-medium">
              <div className="flex gap-2"><span className="text-green-500">➜</span><span className="text-blue-400">~</span><span className="text-zinc-300">npm run dev</span></div>
              <div className="mt-2 text-zinc-500"><span className="text-green-400">VITE v5.1.4</span> <span className="text-zinc-500">ready in 345 ms</span></div>
              <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2"><span className="font-bold text-white">➜</span><span className="font-bold text-white">Local:</span><span className="text-blue-400 hover:underline cursor-pointer">http://localhost:5173/</span></div>
                  <div className="flex items-center gap-2"><span className="font-bold text-white">➜</span><span className="font-bold text-white">Network:</span><span className="text-zinc-500">use --host to expose</span></div>
              </div>
              <div className="mt-4 text-zinc-500"><span className="text-blue-400">i</span> <span className="text-zinc-400">press h + enter to show help</span></div>
           </div>
        </div>
    )
};
