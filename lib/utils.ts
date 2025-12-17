
import { File } from '../types';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import JSZip from 'jszip';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert hierarchical File[] to flat object for Sandpack: { "/src/App.js": "content" }
export const flattenFiles = (files: File[]): Record<string, string> => {
  const result: Record<string, string> = {};
  
  const traverse = (nodes: File[]) => {
    nodes.forEach(node => {
      if (node.type === 'file') {
        // Sandpack's React template prefers absolute paths (e.g. "/src/App.js")
        const key = node.path.startsWith('/') ? node.path : `/${node.path}`;
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

// --- ZIP Download Helper ---

export const downloadProjectAsZip = async (projectFiles: File[], projectName: string) => {
    const zip = new JSZip();

    const traverse = (nodes: File[]) => {
        nodes.forEach(node => {
            // Remove leading slash for ZIP structure
            const relativePath = node.path.startsWith('/') ? node.path.slice(1) : node.path;
            
            if (node.type === 'file') {
                zip.file(relativePath, node.content || '');
            } else if (node.type === 'folder' && node.children) {
                // Ensure empty folders are created (optional, mostly implicit by files)
                // zip.folder(relativePath);
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

// --- CRUD Operations ---

// 1. Add Node
export const addNodeToTree = (files: File[], parentPath: string | null, newNode: File): File[] => {
  // If adding to root
  if (parentPath === null) {
    // Check for duplicate at root
    if (files.some(f => f.path === newNode.path)) return files; 
    return [...files, newNode].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
  }

  return files.map(node => {
    if (node.path === parentPath && node.type === 'folder') {
       // Check for duplicate in children
       if (node.children?.some(child => child.path === newNode.path)) return node;
       
       const newChildren = [...(node.children || []), newNode].sort((a, b) => {
           if (a.type === b.type) return a.name.localeCompare(b.name);
           return a.type === 'folder' ? -1 : 1;
       });
       return { ...node, children: newChildren, isOpen: true }; // Auto open folder
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

// 3. Rename Node (Recursive path update)
export const renameNodeInTree = (files: File[], oldPath: string, newName: string): File[] => {
  return files.map(node => {
    if (node.path === oldPath) {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`;
      
      // If it's a folder, we must recursively update the paths of all children
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

// Helper for rename to deep update paths
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
  // First, find the node we want to duplicate
  const nodeToDuplicate = findFile(files, path);
  if (!nodeToDuplicate) return files;

  const parentPath = path.substring(0, path.lastIndexOf('/'));
  
  // Create the copy logic
  const createCopy = (node: File, newParentPath: string): File => {
    // Generate new name for root of copy (simple logic: add ' copy')
    // For recursive children, we just need to re-base the path
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

  // If root level
  if (parentPath === '') {
      const copy = createCopy(nodeToDuplicate, '');
      // Insert after the original or at end
      return [...files, copy];
  }

  // If nested
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
                // Regex to capture imports: import ... from 'path';
                const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
                let match;
                while ((match = importRegex.exec(node.content)) !== null) {
                    const importPath = match[1];
                    // Skip library imports (no ./ or ../)
                    if (!importPath.startsWith('.')) continue;

                    // Resolve path (basic resolution)
                    const currentDir = node.path.substring(0, node.path.lastIndexOf('/'));
                    const resolvedPath = resolvePath(currentDir, importPath);

                    // Check exact match first
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

// Basic path resolver
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
