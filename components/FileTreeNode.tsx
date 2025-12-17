import React, { useState, useEffect, useRef } from 'react';
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { File } from '../types';

interface FileTreeNodeProps { 
    file: File; 
    depth: number; 
    activePath: string | null;
    onSelect: (file: File) => void;
    onToggle: (file: File) => void;
    onContextMenu: (e: React.MouseEvent, file: File) => void;
    isRenaming?: boolean;
    onRenameSubmit?: (oldPath: string, newName: string) => void;
    onRenameCancel?: () => void;
}

const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.css')) return <div className="w-4 h-4 text-sky-300 font-bold text-[10px] flex items-center justify-center">#</div>;
    if (name.endsWith('.html')) return <FileCode className="w-4 h-4 text-orange-400" />;
    if (name.endsWith('.json')) return <span className="text-yellow-400 font-mono text-[10px] font-bold">{`{}`}</span>;
    return <FileCode className="w-4 h-4 text-zinc-500" />;
};

export const FileTreeInput: React.FC<{
    depth: number;
    type: 'file' | 'folder';
    onSubmit: (name: string) => void;
    onCancel: () => void;
}> = ({ depth, type, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (name.trim()) {
            onSubmit(name);
        } else {
            onCancel();
        }
    };

    return (
        <div 
            className="flex items-center gap-2 py-1.5 pr-2 pl-4"
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
             <span className="text-zinc-500 flex-shrink-0 w-3.5 flex justify-center"></span>
             <span className="opacity-80 flex-shrink-0">
                 {type === 'folder' ? <Folder className="w-4 h-4 text-blue-400/80" /> : <FileCode className="w-4 h-4 text-zinc-500" />}
             </span>
             <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleSubmit()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') onCancel();
                }}
                className="w-full bg-zinc-950 border border-blue-500/50 rounded-sm px-1 py-0.5 text-xs text-white focus:outline-none"
                placeholder={type === 'file' ? 'filename.tsx' : 'foldername'}
            />
        </div>
    );
};

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ 
    file, depth, activePath, onSelect, onToggle, onContextMenu, 
    isRenaming, onRenameSubmit, onRenameCancel 
}) => {
    const isFolder = file.type === 'folder';
    const isActive = activePath === file.path;
    const [editName, setEditName] = useState(file.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            // Smart Selection: Select only the name, exclude extension
            const lastDotIndex = file.name.lastIndexOf('.');
            if (lastDotIndex > 0) {
                 inputRef.current.setSelectionRange(0, lastDotIndex);
            } else {
                 inputRef.current.select();
            }
        }
    }, [isRenaming, file.name]);

    const handleRenameSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (editName.trim() && editName !== file.name && onRenameSubmit) {
            onRenameSubmit(file.path, editName);
        } else if (onRenameCancel) {
            onRenameCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape' && onRenameCancel) onRenameCancel();
    };

    return (
        <div className="select-none font-sans text-sm">
            <div 
                className={`flex items-center gap-2 py-1.5 pr-2 pl-4 hover:bg-zinc-800/50 cursor-pointer group transition-colors ${isActive && !isRenaming ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400'}`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={() => !isRenaming && (isFolder ? onToggle(file) : onSelect(file))}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(e, file);
                }}
            >
                {/* Arrow */}
                <span className={`text-zinc-500 flex-shrink-0 w-3.5 flex justify-center ${isRenaming ? 'opacity-50' : ''}`}>
                    {isFolder && (
                        file.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    )}
                </span>
                
                {/* Icon */}
                <span className={`opacity-80 flex-shrink-0 ${isRenaming ? 'opacity-50' : ''}`}>
                    {isFolder ? (
                        file.isOpen ? <FolderOpen className="w-4 h-4 text-blue-400/80" /> : <Folder className="w-4 h-4 text-blue-400/80" />
                    ) : (
                        getFileIcon(file.name)
                    )}
                </span>
                
                {/* Name or Input */}
                <div className="flex-1 min-w-0">
                    {isRenaming ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRenameSubmit()}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-zinc-950 border border-blue-500/50 rounded-sm px-1 py-0.5 text-xs text-white focus:outline-none"
                        />
                    ) : (
                        <span className={`truncate block ${isActive ? 'font-medium' : ''}`}>{file.name}</span>
                    )}
                </div>
            </div>

            {/* Children */}
            {isFolder && file.isOpen && file.children?.map(child => (
                <FileTreeNode 
                    key={child.path} 
                    file={child} 
                    depth={depth + 1} 
                    activePath={activePath} 
                    onSelect={onSelect}
                    onToggle={onToggle}
                    onContextMenu={onContextMenu}
                    isRenaming={isRenaming && false} // Only direct node is renaming
                    // Pass down these props but they are handled by Editor logic usually
                    onRenameSubmit={onRenameSubmit} 
                    onRenameCancel={onRenameCancel}
                />
            ))}
        </div>
    );
};