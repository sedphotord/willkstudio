import React, { useState } from 'react';
import { useStore } from './lib/store';
import { Editor } from './components/Editor';
import { File, Project, ViewMode } from './types';
import { 
  Folder, Code2, Plus, Sparkles, ChevronRight, Github, Smartphone, Globe, 
  Users, Shield, Zap, Cpu, Search, Terminal, LayoutTemplate, Menu,
  LayoutDashboard, Settings, LogOut, Clock, ArrowLeft, Mail, Lock
} from 'lucide-react';

// --- Helper Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'blue' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/90 shadow-sm h-9 px-4 py-2",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700/50 shadow-sm h-9 px-4 py-2",
    ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 h-9 px-3",
    icon: "h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md",
    blue: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm h-9 px-4 py-2"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const GlowCard: React.FC<{ children: React.ReactNode; className?: string; delay?: string }> = ({ children, className = "", delay = "0s" }) => {
    return (
        <div className={`relative group rounded-xl p-[1px] overflow-hidden ${className}`}>
             {/* Rotating Glow Effect */}
             <div 
                 className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0deg,#3b82f6_180deg,#0000_360deg)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                 style={{ animationDelay: delay }}
             />
             <div className="relative h-full bg-zinc-900 rounded-xl border border-white/5 p-6 z-10">
                 {children}
             </div>
        </div>
    );
};

// --- Landing Page (Bolt.new Style) ---

const LandingPage: React.FC = () => {
  const { setView } = useStore();
  const onStart = () => setView('login');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-x-hidden relative selection:bg-blue-500/30" style={{ zoom: '90%' }}>
      {/* Background Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full opacity-50 mix-blend-screen"></div>
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-zinc-950 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 h-16 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-zinc-950/80">
        <div className="flex items-center gap-2">
           <span className="font-bold text-xl tracking-tight flex items-center gap-2">
             <Zap className="w-6 h-6 text-blue-500 fill-blue-500" />
             <span className="text-white">WillkStudio</span>
           </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4 text-zinc-400">
           <div className="hidden md:flex items-center gap-4">
               <Github className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
           </div>
           <Button variant="secondary" onClick={onStart} className="rounded-full px-5">Sign In</Button>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-20">
        
        <div className="px-4 flex flex-col items-center">
            <div className="mb-8 animate-[fade-in_1s_ease-out]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors cursor-pointer backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Introducing WillkStudio AI</span>
                </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-center max-w-4xl mx-auto leading-[1.1]">
              Full-stack development, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-pulse">powered by Gemini</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-12 text-center max-w-lg mx-auto leading-relaxed">
                Prompt, click, and deploy. Build production-ready React applications at lightspeed with our intelligent IDE.
            </p>

            {/* Search/Prompt Box */}
            <div className="w-full max-w-3xl relative group mb-20">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
                    <textarea 
                        className="w-full bg-transparent text-lg text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none h-24 mb-4 font-light"
                        placeholder="Create a landing page for a coffee shop with a modern dark theme..."
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" className="h-8 rounded-md bg-zinc-800/50 border border-white/5 text-zinc-400 hover:text-zinc-200">
                                <Plus className="w-4 h-4 mr-2" /> Add context
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500 hidden sm:block">Use <span className="text-zinc-400">Shift + Return</span> for new line</span>
                            <Button variant="blue" className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]" onClick={onStart}>
                                Build now <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-zinc-800"></div>
             
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for flow state</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">Everything you need to build great software, integrated into one seamless experience.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlowCard>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Cpu className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-zinc-100">AI-First Architecture</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Powered by Gemini 2.5 Flash. Context-aware code generation that understands your entire project structure.
                    </p>
                </GlowCard>
                <GlowCard delay="-1s">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-zinc-100">Instant Preview</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        See your changes in real-time. Our Sandpack integration provides a full browser environment directly in the IDE.
                    </p>
                </GlowCard>
                <GlowCard delay="-2s">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-zinc-100">Production Ready</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Built on Next.js and Tailwind. Export your code and deploy anywhere with standard build tooling.
                    </p>
                </GlowCard>
             </div>
        </section>

        {/* Stack Section */}
        <section className="w-full border-y border-white/5 bg-zinc-900/20 py-16">
            <div className="max-w-7xl mx-auto px-6 text-center">
                 <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-8">Powered by modern standards</p>
                 <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full"></div> Next.js</span>
                     <span className="text-xl font-bold text-blue-400 flex items-center gap-2"><div className="w-6 h-6 bg-blue-400 rounded-full"></div> React</span>
                     <span className="text-xl font-bold text-sky-400 flex items-center gap-2"><div className="w-6 h-6 bg-sky-400 rounded-full"></div> Tailwind</span>
                     <span className="text-xl font-bold text-yellow-400 flex items-center gap-2"><div className="w-6 h-6 bg-yellow-400 rounded-full"></div> Vite</span>
                     <span className="text-xl font-bold text-blue-600 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 rounded-full"></div> TypeScript</span>
                 </div>
            </div>
        </section>

        {/* Community/CTA Section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center">
             <div className="relative p-8 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                 
                 <h2 className="text-4xl font-bold mb-6 relative z-10">Ready to build the future?</h2>
                 <p className="text-zinc-400 mb-8 max-w-lg mx-auto relative z-10">
                     Join thousands of developers building the next generation of web applications with WillkStudio.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                     <Button variant="blue" className="h-12 px-8 text-base rounded-full shadow-lg shadow-blue-900/20" onClick={onStart}>
                         Start Building for Free
                     </Button>
                     <Button variant="secondary" className="h-12 px-8 text-base rounded-full bg-zinc-800 hover:bg-zinc-700">
                         View Documentation
                     </Button>
                 </div>

                 <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-8 text-sm text-zinc-500 relative z-10">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> <span>10k+ Builders</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> <span>50k+ Projects</span>
                    </div>
                 </div>
             </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-zinc-950">
           <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
               <div className="col-span-2 md:col-span-1">
                   <span className="text-zinc-100 font-bold text-xl mb-4 block">WillkStudio</span>
                   <p className="text-zinc-500 text-sm">Building the future of web development, one prompt at a time.</p>
               </div>
               <div>
                   <h4 className="font-semibold text-zinc-100 mb-4">Product</h4>
                   <ul className="space-y-2 text-sm text-zinc-500">
                       <li><a href="#" className="hover:text-zinc-300">Features</a></li>
                       <li><a href="#" className="hover:text-zinc-300">Integrations</a></li>
                       <li><a href="#" className="hover:text-zinc-300">Pricing</a></li>
                   </ul>
               </div>
               <div>
                   <h4 className="font-semibold text-zinc-100 mb-4">Company</h4>
                   <ul className="space-y-2 text-sm text-zinc-500">
                       <li><a href="#" className="hover:text-zinc-300">About</a></li>
                       <li><a href="#" className="hover:text-zinc-300">Blog</a></li>
                       <li><a href="#" className="hover:text-zinc-300">Careers</a></li>
                   </ul>
               </div>
               <div>
                   <h4 className="font-semibold text-zinc-100 mb-4">Legal</h4>
                   <ul className="space-y-2 text-sm text-zinc-500">
                       <li><a href="#" className="hover:text-zinc-300">Privacy</a></li>
                       <li><a href="#" className="hover:text-zinc-300">Terms</a></li>
                   </ul>
               </div>
           </div>
           <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
               <span>© 2025 WillkStudio - All rights reserved.</span>
               <div className="flex gap-4">
                   <Github className="w-4 h-4 hover:text-zinc-400 cursor-pointer" />
                   <Globe className="w-4 h-4 hover:text-zinc-400 cursor-pointer" />
                   <Smartphone className="w-4 h-4 hover:text-zinc-400 cursor-pointer" />
               </div>
           </div>
      </footer>
    </div>
  );
};

// --- Login View ---

const LoginView: React.FC = () => {
  const { login, setView } = useStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400 text-sm">Sign in to your WillkStudio account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="email" 
                      defaultValue="demo@willkstudio.com"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="password" 
                      defaultValue="password123"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                    />
                </div>
            </div>

            <Button 
                variant="blue" 
                type="submit" 
                className="w-full h-11 text-base mt-4" 
                disabled={loading}
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-zinc-900 text-zinc-500">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" type="button" className="w-full h-10 gap-2">
                    <Github className="w-4 h-4" /> Github
                </Button>
                <Button variant="secondary" type="button" className="w-full h-10 gap-2">
                    <Globe className="w-4 h-4" /> Google
                </Button>
            </div>
        </form>
      </div>

      <button 
        onClick={() => setView('landing')} 
        className="mt-8 text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-2 transition-colors z-10"
      >
          <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
    </div>
  );
};

// --- Advanced Dashboard (Studio) ---

const Studio: React.FC = () => {
  const { projects, selectProject, createProject, user, logout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
           <span className="font-bold text-lg tracking-tight flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                 <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
             </div>
             <span className="text-white">WillkStudio</span>
           </span>
        </div>
        
        <div className="p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg border border-zinc-800">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-colors">
                <LayoutTemplate className="w-4 h-4" /> Templates
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> Settings
            </button>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-800">
             <div className="mb-4">
                 <div className="flex justify-between text-xs mb-1">
                     <span className="text-zinc-400">Credits Used</span>
                     <span className="text-zinc-200">75%</span>
                 </div>
                 <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                     <div className="w-3/4 h-full bg-blue-600 rounded-full"></div>
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                     <img src={user?.avatar || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
                     <p className="text-xs text-zinc-500 truncate">{user?.email || "email@example.com"}</p>
                 </div>
                 <button onClick={logout} className="text-zinc-500 hover:text-white transition-colors"><LogOut className="w-4 h-4" /></button>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                </div>
            </div>
            <Button variant="blue" className="gap-2 rounded-lg" onClick={createProject}>
                <Plus className="w-4 h-4" /> New Project
            </Button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Quick Start Templates */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4">Start from a template</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['SaaS Dashboard', 'E-commerce', 'Portfolio', 'Landing Page'].map((t, i) => (
                        <div key={i} onClick={createProject} className="group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/80 rounded-xl p-4 transition-all">
                             <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${
                                 i === 0 ? 'bg-purple-500/20 text-purple-400' : 
                                 i === 1 ? 'bg-green-500/20 text-green-400' :
                                 i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                             }`}>
                                 <LayoutTemplate className="w-5 h-5" />
                             </div>
                             <h3 className="text-sm font-medium text-zinc-200 mb-1">{t}</h3>
                             <p className="text-xs text-zinc-500">React • Tailwind • Vite</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-white">Your Projects</h2>
                     <div className="flex gap-2">
                        <button className="p-1.5 bg-zinc-800 rounded text-zinc-300"><LayoutDashboard className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500"><Menu className="w-4 h-4" /></button>
                     </div>
                </div>
                
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl">
                        <p className="text-zinc-500">No projects found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(p => (
                            <div key={p.id} onClick={() => selectProject(p)} className="group cursor-pointer bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all hover:shadow-lg">
                                {/* Thumbnail Placeholder */}
                                <div className="h-32 bg-zinc-900 border-b border-zinc-800 relative flex items-center justify-center overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>
                                     <Code2 className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500 transition-colors relative z-10" />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors">{p.name}</h3>
                                        <div className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400">Public</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.lastModified.toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> v18.3.1</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const { view } = useStore();

  return (
    <>
      {view === 'landing' && <LandingPage />}
      {view === 'login' && <LoginView />}
      {view === 'dashboard' && <Studio />}
      {view === 'editor' && <Editor />}
    </>
  );
};

export default App;