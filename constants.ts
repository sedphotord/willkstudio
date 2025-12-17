
import { File } from './types';

export const INITIAL_FILES: File[] = [
  {
    name: 'index.html',
    path: '/index.html',
    type: 'file',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WillkStudio App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`
  },
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    content: `{
  "name": "willkstudio-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^4.4.5"
  }
}`
  },
  {
    name: 'vite.config.ts',
    path: '/vite.config.ts',
    type: 'file',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`
  },
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        type: 'file',
        content: `import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <Sparkles size={48} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: 0 }}>Hello World</h1>
      </div>
      
      <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '32px' }}>
        WillkStudio Sandbox Environment
      </p>
      
      <div style={{
        padding: '16px 32px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%' }}></div>
          <span style={{ fontWeight: 500 }}>System Status: Operational</span>
        </div>
      </div>
    </div>
  );
}`
      },
      {
        name: 'index.tsx',
        path: '/src/index.tsx',
        type: 'file',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`
      },
      {
        name: 'index.css',
        path: '/src/index.css',
        type: 'file',
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 100vw; height: 100vh; overflow: hidden; }`
      },
      {
        name: 'vite-env.d.ts',
        path: '/src/vite-env.d.ts',
        type: 'file',
        content: `/// <reference types="vite/client" />`
      }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `You are WillkStudio, an expert senior React/Next.js engineer.
You are running inside a web IDE. 
Your goal is to help the user build web applications by generating code.

You must respond with a JSON object strictly following this schema:
{
  "message": "A brief explanation of what you did",
  "actions": [
    {
      "type": "create" | "update" | "delete",
      "path": "/src/App.tsx", // Full path to file
      "content": "Full content of the file"
    }
  ]
}

- Always use Tailwind CSS for styling.
- Prefer functional components and hooks.
- If the user asks to "fix" something, analyze the code and provide the full corrected file content.
- Do not provide markdown code blocks, provide raw strings in the JSON "content" field.
`;
