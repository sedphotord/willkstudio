
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronsUp, ChevronsDown, FilePlus, FolderPlus, Upload, Search, 
  Edit2, Copy, Trash2
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { File } from '../../types';
import { FileTreeNode, FileTreeInput } from '../FileTreeNode';
import { unzipToFiles } from '../../lib/utils';

interface FileExplorerProps {
    width: number;
    setIsDraggingExplorer: (v: boolean) => void;
    setOpenCmd: (v: boolean) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ width, setIsDraggingExplorer, setOpenCmd }) => {
    const { 
        activeProjectFiles, activeFile, setActiveFile, toggleFolder, toggleAllFolders, 
        addFile, deleteFile, renameFile, duplicateFile, updateFileContent, addMessage, setProjectFiles
    } = useStore();

    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [creatingItem, setCreatingItem] = useState<{ type: 'file' | 'folder', parentPath: string | null } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: File } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        const closeMenu = () => setContextMenu(null); 
        document.addEventListener('click', closeMenu); 
        return () => document.removeEventListener('click', closeMenu); 
    }, []);

    const handleContextMenu = (e: React.MouseEvent, file: File) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setContextMenu({ x: e.clientX, y: e.clientY, file }); 
    };
    
    const handleRenameSubmit = (oldPath: string, newName: string) => { renameFile(oldPath, newName); setRenamingPath(null); };
    const handleCreateSubmit = (name: string) => { if (!creatingItem) return; addFile(creatingItem.parentPath, name, creatingItem.type); setCreatingItem(null); };
    const handleCreateFile = () => setCreatingItem({ type: 'file', parentPath: null });
    const handleCreateFolder = () => setCreatingItem({ type: 'folder', parentPath: null });
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const files = e.target.files; if (!files) return; 
        Array.from(files).forEach(async (file) => { 
            if (file.name.endsWith('.zip')) { 
                try { 
                    const extractedFiles = await unzipToFiles(file); 
                    setProjectFiles(extractedFiles); 
                    addMessage({ id: Date.now().toString(), role: 'system', content: `Successfully uploaded and extracted ${file.name}`, timestamp: new Date() }); 
                } catch (err) { 
                    console.error("Failed to unzip", err); 
                    addMessage({ id: Date.now().toString(), role: 'system', content: `Error extracting ZIP: ${(err as Error).message}`, timestamp: new Date() }); 
                } return; 
            } 
            const reader = new FileReader(); 
            reader.onload = (e) => { 
                addFile(null, file.name, 'file'); 
                setTimeout(() => updateFileContent(`/${file.name}`, e.target?.result as string), 50); 
            }; 
            reader.readAsText(file); 
        }); 
        if (uploadInputRef.current) uploadInputRef.current.value = ''; 
    };

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
        <>
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

            <div className="bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0" style={{ width }}>
                <div className="h-9 px-4 flex items-center justify-between text-xs font-medium text-zinc-500 border-b border-zinc-800/50 bg-zinc-900/20 shrink-0">
                    <span>EXPLORER</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => toggleAllFolders(false)} title="Collapse All" className="hover:text-zinc-300 p-1"><ChevronsUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleAllFolders(true)} title="Expand All" className="hover:text-zinc-300 p-1"><ChevronsDown className="w-3.5 h-3.5" /></button>
                        <button onClick={handleCreateFile} title="New File" className="hover:text-zinc-300 p-1"><FilePlus className="w-3.5 h-3.5" /></button>
                        <button onClick={handleCreateFolder} title="New Folder" className="hover:text-zinc-300 p-1"><FolderPlus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => uploadInputRef.current?.click()} title="Upload Files" className="hover:text-zinc-300 p-1"><Upload className="w-3.5 h-3.5" /></button>
                        <input ref={uploadInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                        <Search className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300 ml-1" onClick={() => setOpenCmd(true)} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-2"><EnhancedRecursiveFileTree files={activeProjectFiles} depth={0} parentPath={null} /></div>
            </div>
            <div className="w-1 cursor-col-resize hover:bg-blue-600 transition-colors z-10 bg-transparent" onMouseDown={(e) => { e.preventDefault(); setIsDraggingExplorer(true); }} />
        </>
    );
};
