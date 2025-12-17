
import { File } from '../types';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import JSZip from 'jszip';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to normalize paths (always start with / and no double slashes)
export const normalizePath = (path: string): string => {
    let cleanPath = path.replace(/\/+/g, '/'); // Remove double slashes
    if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
    }
    // Remove trailing slash if it's not root
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }
    return cleanPath;
};

// Convert hierarchical File[] to flat object for Sandpack: { "/src/App.js": "content" }
export const flattenFiles = (files: File[]): Record<string, string> => {
  const result: Record<string, string> = {};
  
  const traverse = (nodes: File[]) => {
    nodes.forEach(node => {
      if (node.type === 'file') {
        const key = normalizePath(node.path);
        result[key] = node.content || '';
      } else if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(files);
  return result;
};

// Helper to update file content in a tree
export const updateFileInTree = (files: File[], path: string, content: string): File[] => {
  return files.map(f => {
    if (f.path === path) return { ...f, content };
    if (f.children) return { ...f, children: updateFileInTree(f.children, path, content) };
    return f;
  });
};

// Helper to toggle folder open state
export const toggleFolderInTree = (files: File[], path: string): File[] => {
  return files.map(f => {
    if (f.path === path) return { ...f, isOpen: !f.isOpen };
    if (f.children) return { ...f, children: toggleFolderInTree(f.children, path) };
    return f;
  });
};

// Helper to toggle ALL folders
export const toggleAllFoldersInTree = (files: File[], isOpen: boolean): File[] => {
    return files.map(f => {
        if (f.type === 'folder') {
            return {
                ...f,
                isOpen,
                children: f.children ? toggleAllFoldersInTree(f.children, isOpen) : []
            };
        }
        return f;
    });
};

// Helper to find a file in tree
export const findFile = (files: File[], path: string): File | null => {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
};

// --- Robust Recursive File Insertion ---
export const insertFileWithPath = (files: File[], fullPath: string, content: string): File[] => {
    // Normalize path to prevent duplicates
    const normalizedPath = normalizePath(fullPath);
    
    // Split and filter empty strings (e.g. '/src/foo' -> ['src', 'foo'])
    const parts = normalizedPath.split('/').filter(p => p.length > 0); 
    const fileName = parts.pop();

    if (!fileName) return files; // Invalid path

    // Helper to find or create folder at current level
    const updateLevel = (currentFiles: File[], currentPathParts: string[], parentPath: string): File[] => {
        if (currentPathParts.length === 0) {
            // We are at the target folder, handle the file itself
            const filePath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
            const existingIndex = currentFiles.findIndex(f => f.name === fileName);
            
            const newFile: File = {
                name: fileName,
                path: filePath,
                type: 'file',
                content
            };

            if (existingIndex >= 0) {
                // Update existing file
                const newFiles = [...currentFiles];
                newFiles[existingIndex] = { ...newFiles[existingIndex], content, path: filePath };
                return newFiles;
            } else {
                // Create new file
                return [...currentFiles, newFile].sort((a, b) => {
                     if (a.type === b.type) return a.name.localeCompare(b.name);
                     return a.type === 'folder' ? -1 : 1;
                });
            }
        }

        const [folderName, ...rest] = currentPathParts;
        // Construct path for the current folder
        const currentFolderPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
        const folderIndex = currentFiles.findIndex(f => f.name === folderName && f.type === 'folder');

        if (folderIndex >= 0) {
            // Folder exists, recurse into it
            const folder = currentFiles[folderIndex];
            const newFiles = [...currentFiles];
            newFiles[folderIndex] = {
                ...folder,
                children: updateLevel(folder.children || [], rest, currentFolderPath)
            };
            return newFiles;
        } else {
            // Folder doesn't exist, create it and recurse
            const newFolder: File = {
                name: folderName,
                path: currentFolderPath,
                type: 'folder',
                children: [],
                isOpen: true // Auto-open created folders
            };
            newFolder.children = updateLevel([], rest, currentFolderPath);
            return [...currentFiles, newFolder].sort((a, b) => {
                 if (a.type === b.type) return a.name.localeCompare(b.name);
                 return a.type === 'folder' ? -1 : 1;
            });
        }
    };

    // Start recursion from root (parentPath = '/')
    return updateLevel(files, parts, '/');
};

// --- ZIP Helpers (Upload & Download) ---

export const downloadProjectAsZip = async (projectFiles: File[], projectName: string) => {
    const zip = new JSZip();

    const traverse = (nodes: File[]) => {
        nodes.forEach(node => {
            // Remove leading slash for ZIP structure
            const relativePath = node.path.startsWith('/') ? node.path.slice(1) : node.path;
            
            if (node.type === 'file') {
                zip.file(relativePath, node.content || '');
            } else if (node.type === 'folder' && node.children) {
                traverse(node.children);
            }
        });
    };

    traverse(projectFiles);

    const blob = await zip.generateAsync({ type: 'blob' });
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const unzipToFiles = async (file: Blob): Promise<File[]> => {
    const zip = await JSZip.loadAsync(file);
    let files: File[] = [];

    const entries = Object.keys(zip.files);
    
    for (const filename of entries) {
        const zipEntry = zip.files[filename];
        if (zipEntry.dir) continue; 

        if (filename.includes('__MACOSX') || filename.includes('.DS_Store')) continue;

        const content = await zipEntry.async('string');
        // Ensure path starts with /
        const path = normalizePath(filename);
        
        files = insertFileWithPath(files, path, content);
    }

    return files;
};

// --- CRUD Operations ---

// 1. Add Node (Shallow - assumes parent exists)
export const addNodeToTree = (files: File[], parentPath: string | null, newNode: File): File[] => {
  if (parentPath === null) {
    if (files.some(f => f.path === newNode.path)) return files; 
    return [...files, newNode].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
  }

  return files.map(node => {
    if (node.path === parentPath && node.type === 'folder') {
       if (node.children?.some(child => child.path === newNode.path)) return node;
       const newChildren = [...(node.children || []), newNode].sort((a, b) => {
           if (a.type === b.type) return a.name.localeCompare(b.name);
           return a.type === 'folder' ? -1 : 1;
       });
       return { ...node, children: newChildren, isOpen: true }; 
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentPath, newNode) };
    }
    return node;
  });
};

// 2. Delete Node
export const removeNodeFromTree = (files: File[], path: string): File[] => {
  return files
    .filter(node => node.path !== path)
    .map(node => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, path) };
      }
      return node;
    });
};

// 3. Rename Node
export const renameNodeInTree = (files: File[], oldPath: string, newName: string): File[] => {
  return files.map(node => {
    if (node.path === oldPath) {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`;
      
      let updatedChildren = node.children;
      if (node.type === 'folder' && node.children) {
         updatedChildren = updateChildrenPaths(node.children, oldPath, newPath);
      }

      return { ...node, name: newName, path: newPath, children: updatedChildren };
    }
    
    if (node.children) {
      return { ...node, children: renameNodeInTree(node.children, oldPath, newName) };
    }
    return node;
  });
};

const updateChildrenPaths = (nodes: File[], oldParentPath: string, newParentPath: string): File[] => {
    return nodes.map(node => {
        const newPath = node.path.replace(oldParentPath, newParentPath);
        let newChildren = node.children;
        if (node.children) {
            newChildren = updateChildrenPaths(node.children, oldParentPath, newParentPath);
        }
        return { ...node, path: newPath, children: newChildren };
    });
};

// 4. Duplicate Node
export const duplicateNodeInTree = (files: File[], path: string): File[] => {
  const nodeToDuplicate = findFile(files, path);
  if (!nodeToDuplicate) return files;

  const parentPath = path.substring(0, path.lastIndexOf('/'));
  
  const createCopy = (node: File, newParentPath: string): File => {
    const isRootCopy = node.path === path;
    let newName = node.name;
    if (isRootCopy) {
        const extIndex = node.name.lastIndexOf('.');
        if (extIndex !== -1) {
            newName = `${node.name.substring(0, extIndex)} copy${node.name.substring(extIndex)}`;
        } else {
            newName = `${node.name} copy`;
        }
    }

    const newPath = newParentPath === '' ? `/${newName}` : `${newParentPath}/${newName}`;
    let newChildren = node.children;
    if (node.children) {
        newChildren = node.children.map(child => createCopy(child, newPath));
    }

    return {
        ...node,
        name: newName,
        path: newPath,
        children: newChildren
    };
  };

  if (parentPath === '') {
      const copy = createCopy(nodeToDuplicate, '');
      return [...files, copy];
  }

  return files.map(node => {
      if (node.path === parentPath && node.children) {
           const copy = createCopy(nodeToDuplicate, parentPath);
           return { ...node, children: [...node.children, copy] };
      }
      if (node.children) {
          return { ...node, children: duplicateNodeInTree(node.children, path) };
      }
      return node;
  });
};

// --- Auto-Fix / Consistency Check ---

export const checkProjectConsistency = (files: File[]): string[] => {
    const errors: string[] = [];
    const existingPaths = new Set<string>();

    const traverse = (nodes: File[]) => {
        nodes.forEach(node => {
            existingPaths.add(node.path);
            if (node.children) traverse(node.children);
        });
    };
    traverse(files);

    const checkImports = (nodes: File[]) => {
        nodes.forEach(node => {
            if (node.type === 'file' && (node.name.endsWith('.tsx') || node.name.endsWith('.ts')) && node.content) {
                const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
                let match;
                while ((match = importRegex.exec(node.content)) !== null) {
                    const importPath = match[1];
                    if (!importPath.startsWith('.')) continue;

                    const currentDir = node.path.substring(0, node.path.lastIndexOf('/'));
                    const resolvedPath = resolvePath(currentDir, importPath);

                    const possibleExtensions = ['', '.tsx', '.ts', '.js', '.jsx', '/index.tsx', '/index.ts'];
                    let found = false;
                    
                    for (const ext of possibleExtensions) {
                        if (existingPaths.has(resolvedPath + ext)) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        errors.push(`File ${node.path} imports "${importPath}" (resolved: ${resolvedPath}), but it does not exist.`);
                    }
                }
            }
            if (node.children) checkImports(node.children);
        });
    };

    checkImports(files);
    return errors;
};

const resolvePath = (fromDir: string, relativePath: string): string => {
    const parts = relativePath.split('/');
    const stack = fromDir.split('/').filter(Boolean);

    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') {
            stack.pop();
        } else {
            stack.push(part);
        }
    }

    return '/' + stack.join('/');
};
