import React, { useState, useEffect, useRef } from 'react';
import { Gig, ProjectPlan, ChatMessage } from '../types';
import { generateProjectPlan, createGigChat } from '../services/geminiService';
import { XIcon, LoaderIcon, CodeIcon, BotIcon, ZapIcon, SparklesIcon, PuzzleIcon, BrainIcon, BandageIcon, ActivityIcon, RefreshCwIcon } from './Icons';
import { GenerateContentResponse, Chat } from "@google/genai";

interface GigGuideProps {
  gig: Gig;
  onBack: () => void;
}

type Tab = 'setup' | 'tasks';

const GigGuide: React.FC<GigGuideProps> = ({ gig, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('setup');
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Ref for the Chat instance
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(false);
        // 1. Generate the plan
        const generatedPlan = await generateProjectPlan(gig);
        
        // 2. Initialize Chat
        chatSession.current = createGigChat(gig);
        
        if (mounted) {
          if (generatedPlan.tools.length === 0 && generatedPlan.tasks.length === 0) {
              setError(true);
          } else {
              setPlan(generatedPlan);
          }
          
          // Add initial greeting
          setChatHistory([{
            role: 'model',
            text: `System Online. I am your Vibe Mentor. 
            
I've analyzed the mission parameters for "${gig.title}". 
Review the Briefing and Setup checklist to the left. 

When you're ready to start coding or get stuck, just ask me.`
          }]);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
            setError(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
  }, [gig]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSession.current) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await chatSession.current.sendMessage({ message: userMsg });
      const text = (response as GenerateContentResponse).text || "I'm thinking...";
      
      setChatHistory(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Connection interrupted. Retrying uplink..." }]);
    } finally {
      setIsSending(false);
    }
  };

  const isMigraine = gig.customerPain.type === 'Migraine';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 w-full">
          <div className="relative">
             <div className="absolute inset-0 bg-vibe-500 blur-xl opacity-20 animate-pulse"></div>
             <LoaderIcon className="w-16 h-16 text-vibe-400 animate-spin relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-8 mb-2">Initializing Mission Environment</h2>
          <p className="text-slate-400">Analysing stack requirements and generating task matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col w-full">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                  title="Abort Mission / Back to Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to HQ
                </button>
                <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
                <div>
                   <h1 className="text-lg font-bold text-white flex items-center gap-2">
                      Mission Control 
                      <span className="px-2 py-0.5 rounded text-[10px] bg-vibe-900 text-vibe-400 border border-vibe-800 uppercase tracking-wider">Active</span>
                   </h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI Mentor Online
               </div>
            </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* LEFT COLUMN: Mission Info & Plan (8 cols) */}
         <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Mission Briefing Card */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-vibe-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{gig.title}</h2>
                        <p className="text-lg text-slate-300 italic">"{gig.clientVibe}"</p>
                    </div>
                    <div className="flex-shrink-0 bg-slate-950 p-4 rounded-xl border border-slate-800 min-w-[200px]">
                        <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 tracking-wider flex items-center gap-2">
                           <ActivityIcon className="w-3 h-3" /> Customer Profile
                        </h3>
                        <div className="space-y-2">
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Pain Type</span>
                                <span className={`font-semibold flex items-center gap-1.5 ${isMigraine ? 'text-rose-400' : 'text-blue-400'}`}>
                                    {isMigraine ? <BrainIcon className="w-3 h-3"/> : <BandageIcon className="w-3 h-3"/>}
                                    {gig.customerPain.type}
                                </span>
                             </div>
                             {isMigraine && (
                                <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Severity</span>
                                    <span className="text-white">{gig.customerPain.painLevel}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Frequency</span>
                                    <span className="text-white">{gig.customerPain.repeatability}</span>
                                </div>
                                </>
                             )}
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-indigo-300 mb-1 flex items-center gap-2">
                        <CodeIcon className="w-4 h-4" /> Required Stack
                    </h3>
                    <p className="text-indigo-100/80 text-sm font-mono">{gig.recommendedStack}</p>
                </div>
            </section>

            {/* 2. Battle Station (Tabs) */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex border-b border-slate-800 bg-slate-950/50">
                    <button 
                        onClick={() => setActiveTab('setup')}
                        className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'setup' ? 'border-vibe-500 text-vibe-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <ZapIcon className="w-4 h-4" /> 1. Setup & Tools
                    </button>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'tasks' ? 'border-vibe-500 text-vibe-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <PuzzleIcon className="w-4 h-4" /> 2. Execute Tasks
                    </button>
                </div>

                <div className="p-6 flex-grow">
                    {activeTab === 'setup' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                             <div>
                                <h3 className="text-white font-bold text-lg mb-4">Initialize Environment</h3>
                                <p className="text-slate-400 text-sm mb-6">Install or sign up for these tools to match the recommended stack.</p>
                                
                                {plan?.tools && plan.tools.length > 0 ? (
                                    <div className="grid gap-4">
                                        {plan.tools.map((tool, idx) => (
                                        <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-vibe-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-vibe-400 transition-colors">
                                                    <ZapIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-semibold text-base">{tool.name}</h4>
                                                    <p className="text-slate-400 text-sm">{tool.reason}</p>
                                                </div>
                                            </div>
                                            <a 
                                                href={tool.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="shrink-0 inline-flex items-center justify-center gap-2 text-xs font-bold text-vibe-400 hover:text-white bg-vibe-950/30 hover:bg-vibe-600 px-4 py-2 rounded-lg border border-vibe-900/50 hover:border-vibe-500 transition-all"
                                            >
                                                Open Tool <span className="text-lg leading-none">&rsaquo;</span>
                                            </a>
                                        </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                                        <p className="text-slate-500 mb-4">Tools list unavailable. Ask the Assistant for the stack.</p>
                                    </div>
                                )}
                             </div>
                             
                             <div className="flex justify-end pt-4">
                                <button 
                                    onClick={() => setActiveTab('tasks')}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    Proceed to Tasks <span className="text-vibe-400">&rarr;</span>
                                </button>
                             </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg">Development Checklist</h3>
                                <span className="text-xs font-mono text-slate-500">{plan?.tasks.length || 0} Steps</span>
                             </div>

                             {plan?.tasks && plan.tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {plan.tasks.map((task, idx) => (
                                        <label key={task.id} className="flex gap-4 items-start p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-all group select-none">
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" className="peer w-5 h-5 border-2 border-slate-600 rounded bg-slate-900/50 checked:bg-vibe-500 checked:border-vibe-500 transition-all appearance-none cursor-pointer" />
                                                <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-slate-200 font-semibold text-base group-hover:text-white transition-colors peer-checked:text-slate-500 peer-checked:line-through decoration-slate-600">{task.title}</h4>
                                                    <span className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded">Task {idx + 1}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm mt-1 leading-relaxed peer-checked:text-slate-600">{task.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-center p-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                                    <p className="text-slate-500">Tasks list unavailable. Ask the Assistant to break it down.</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>
            </section>
         </div>

         {/* RIGHT COLUMN: AI Mentor (4 cols) - Sticky */}
         <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden ring-1 ring-white/5">
                {/* Chat Header */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vibe-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-vibe-900/20">
                            <BotIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Vibe Mentor</h3>
                        <p className="text-xs text-slate-400">Context-Aware Assistant</p>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#0B1120] scroll-smooth">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-vibe-600 text-white rounded-tr-sm' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                            }`}>
                                {msg.role === 'model' && (
                                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">AI</span>
                                )}
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isSending && (
                       <div className="flex justify-start">
                          <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm p-4 border border-slate-700/50 flex gap-1.5 items-center">
                             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="relative group">
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-200 text-sm focus:outline-none focus:border-vibe-500 focus:ring-1 focus:ring-vibe-500 transition-all placeholder-slate-600 resize-none"
                            placeholder="Ask for help..."
                            rows={1}
                            style={{ minHeight: '46px' }}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!isSending) handleSendMessage();
                                }
                            }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || isSending}
                            className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-vibe-600 text-white w-9 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:bg-vibe-600 group-focus-within:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-600">Enter to send. Shift + Enter for new line.</p>
                    </div>
                </div>
            </div>
         </div>

      </main>
    </div>
  );
};

export default GigGuide;