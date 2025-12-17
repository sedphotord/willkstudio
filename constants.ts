import { File } from './types';

// Moved SYSTEM_INSTRUCTION to lib/ai/prompts.ts as specialized agent prompts

export const INITIAL_FILES: File[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    content: `{
  "name": "willkstudio-project",
  "version": "1.0.0",
  "main": "/src/index.tsx",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "^5.0.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
  },
  {
    name: 'public',
    path: '/public',
    type: 'folder',
    children: [
        {
            name: 'index.html',
            path: '/public/index.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
        }
    ]
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
        WillkStudio Sandbox Environment (React TSX)
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
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      {
        name: 'styles.css',
        path: '/src/styles.css',
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