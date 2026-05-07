import React, { useState, useMemo, useEffect } from 'react';
import { initialGigs } from './data';
import { Gig, GigCategory, StackCost, GigDuration, ProblemType } from './types';
import GigCard from './components/GigCard';
// Removed ProposalGenerator import as we are replacing it with the full page guide
import GigGuide from './components/GigGuide';
import { generateSocialGigs, generateMissionExamples } from './services/geminiService';
import { SearchIcon, SparklesIcon, CodeIcon, BotIcon, ZapIcon, BarChartIcon, GamepadIcon, LoaderIcon, RefreshCwIcon, XIcon, BandageIcon, BrainIcon } from './components/Icons';

const ApiKeyModal = ({ isOpen, onClose, onSave, initialKey }: { isOpen: boolean, onClose: () => void, onSave: (key: string) => void, initialKey: string }) => {
  const [key, setKey] = useState(initialKey);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
           <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
           <ZapIcon className="w-5 h-5 text-vibe-400" />
           Configure Gemini API Key
        </h2>
        <p className="text-sm text-slate-400 mb-6">
           You need to provide your own Gemini API key to generate new gigs and ideas. Your key is stored securely in your browser's local storage and never sent anywhere else.
        </p>
        <input 
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-vibe-500 focus:ring-1 focus:ring-vibe-500 transition-all outline-none mb-6 font-mono text-sm"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors">
             Cancel
          </button>
          <button 
             onClick={() => { onSave(key); onClose(); }}
             className="px-6 py-2 bg-gradient-to-r from-vibe-600 to-vibe-500 hover:from-vibe-500 hover:to-vibe-400 text-white rounded-lg font-bold shadow-lg shadow-vibe-500/20 transition-all"
          >
             Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [gigs, setGigs] = useState<Gig[]>(initialGigs);
  const [isGenerating, setIsGenerating] = useState(false);
  const [causeInput, setCauseInput] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Dynamic Examples State
  const [missionExamples, setMissionExamples] = useState([
    { emoji: "🌲", text: "Wildfire prevention dashboard using satellite data" },
    { emoji: "🍲", text: "Local food bank inventory management system" },
    { emoji: "📚", text: "Literacy game for children with dyslexia" },
    { emoji: "⚖️", text: "Legal aid chatbot for tenant rights" },
    { emoji: "🐢", text: "Tracking sea turtle nests for conservation" },
    { emoji: "💧", text: "Clean water access mapping in rural areas" },
  ]);
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<GigCategory | 'All'>('All');
  const [selectedCost, setSelectedCost] = useState<StackCost | 'All'>('All');
  const [selectedDuration, setSelectedDuration] = useState<GigDuration | 'All'>('All');
  const [selectedPain, setSelectedPain] = useState<ProblemType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views
  // We unified the view state. Clicking a card now goes straight to the Full Page Guide.
  const [activeGuideGig, setActiveGuideGig] = useState<Gig | null>(null);

  // API Key state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Show modal quickly on first interaction if no key exists.
  const handleActionRequiringKey = async (action: () => Promise<void>) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    await action();
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('user_gemini_api_key', newKey);
  };

  const handleGenerate = async () => {
    handleActionRequiringKey(async () => {
      if (!causeInput.trim()) return;
      
      setIsGenerating(true);
      setHasGenerated(true);
      // Reset filters on new generation to show everything
      setSelectedCategory('All');
      setSelectedCost('All');
      setSelectedDuration('All');
      setSelectedPain('All');
      
      try {
        const newGigs = await generateSocialGigs(causeInput);
        if (newGigs && newGigs.length > 0) setGigs(newGigs);
      } catch (e: any) {
         if (e.message?.includes("API key")) setShowApiKeyModal(true);
      }
      setIsGenerating(false);
    });
  };

  const handleReset = () => {
    setCauseInput('');
    setHasGenerated(false);
    setGigs(initialGigs);
    setSelectedCategory('All');
    setSelectedCost('All');
    setSelectedDuration('All');
    setSelectedPain('All');
  };

  const handleShuffleMissions = async () => {
    handleActionRequiringKey(async () => {
      setIsLoadingExamples(true);
      try {
        const newMissions = await generateMissionExamples();
        if (newMissions && newMissions.length > 0) {
          setMissionExamples(newMissions);
        }
      } catch (e: any) {
        if (e.message?.includes("API key")) setShowApiKeyModal(true);
      }
      setIsLoadingExamples(false);
    });
  };

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
      const matchesCost = selectedCost === 'All' || gig.stackCost === selectedCost;
      const matchesDuration = selectedDuration === 'All' || gig.duration === selectedDuration;
      const matchesPain = selectedPain === 'All' || gig.customerPain.type === selectedPain;
      const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            gig.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            gig.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            gig.impactDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesCost && matchesDuration && matchesPain && matchesSearch;
    });
  }, [gigs, selectedCategory, selectedCost, selectedDuration, selectedPain, searchQuery]);

  const categories = [
    { label: 'All', icon: SparklesIcon, value: 'All' },
    { label: 'Web Apps', icon: CodeIcon, value: GigCategory.WEB_APP },
    { label: 'Extensions', icon: ZapIcon, value: GigCategory.CHROME_EXTENSION },
    { label: 'Data Viz', icon: BarChartIcon, value: GigCategory.DATA_VIZ },
    { label: 'Automation', icon: BotIcon, value: GigCategory.AUTOMATION },
    { label: 'Games', icon: GamepadIcon, value: GigCategory.GAME },
  ];

  // RENDER FULL PAGE GUIDE IF ACTIVE
  // This replaces the entire main view when a gig is active
  if (activeGuideGig) {
    return (
      <>
        <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} onSave={handleSaveApiKey} initialKey={apiKey} />
        <GigGuide gig={activeGuideGig} onBack={() => setActiveGuideGig(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-100 font-sans selection:bg-vibe-500/30">
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} onSave={handleSaveApiKey} initialKey={apiKey} />
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-vibe-500 to-vibe-300 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                <SparklesIcon className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Vibe Coding for Good
              </span>
            </div>
            <div className="hidden md:flex gap-4 items-center">
              <button 
                 onClick={() => setShowApiKeyModal(true)}
                 className="text-xs font-mono text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                 <ZapIcon className="w-3 h-3" />
                 {apiKey ? 'API Key Configured' : 'Set API Key'}
              </button>
              {gigs.length > 0 && (
                <span className="text-xs font-mono text-slate-500 border border-slate-800 bg-slate-900/50 px-3 py-1 rounded-full">
                  {gigs.length} Opportunities Generated
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Input Section */}
      <div className={`relative transition-all duration-700 ${hasGenerated ? 'pt-12 pb-8' : 'pt-32 pb-32'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              Skill for <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibe-400 to-neon-blue neon-text">Impact.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-8">
              Describe a social cause (e.g., Ocean Conservation, Literacy, Food Waste) and we'll generate real-world "Vibe Coding" volunteering gigs for you.
            </p>
            
            {/* Generation Input */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-vibe-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl flex flex-col md:flex-row gap-2">
                <div className="flex-grow flex items-center px-4 relative">
                  <SearchIcon className="text-slate-500 w-5 h-5 mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="E.g. Help local animal shelters manage adoption papers..." 
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 py-3 text-lg pr-8"
                    value={causeInput}
                    onChange={(e) => setCauseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  {(causeInput || hasGenerated) && (
                    <button 
                      onClick={handleReset}
                      className="absolute right-4 text-slate-600 hover:text-white transition-colors p-1"
                      title="Clear and reset"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !causeInput.trim()}
                  className={`px-8 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                     isGenerating || !causeInput.trim()
                       ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                       : 'bg-gradient-to-r from-vibe-600 to-vibe-500 hover:from-vibe-500 hover:to-vibe-400 shadow-lg shadow-vibe-500/20'
                  }`}
                >
                  {isGenerating ? <LoaderIcon className="animate-spin" /> : <SparklesIcon />}
                  {isGenerating ? 'Dreaming...' : 'Generate Gigs'}
                </button>
              </div>
            </div>
            
            {!hasGenerated && (
               <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Or try one of these missions:</p>
                    <button 
                      onClick={handleShuffleMissions} 
                      disabled={isLoadingExamples}
                      className="text-xs flex items-center gap-1.5 text-vibe-400 hover:text-vibe-300 transition-colors disabled:opacity-50"
                    >
                      <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingExamples ? 'animate-spin' : ''}`} />
                      Shuffle Ideas
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {missionExamples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => setCauseInput(ex.text)}
                          className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:bg-slate-800 hover:border-vibe-500/50 hover:shadow-lg hover:shadow-vibe-500/10 transition-all group text-left"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{ex.emoji}</span>
                            <span className="text-slate-300 group-hover:text-white text-sm font-medium">{ex.text}</span>
                        </button>
                      ))}
                  </div>
               </div>
            )}
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
      </div>

      {/* Main Content Area (Only shows after generation) */}
      {hasGenerated && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Filters Wrapper */}
        <div className="flex flex-col xl:flex-row justify-between items-center mb-10 gap-6 border-t border-slate-800 pt-8">
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
                <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    selectedCategory === cat.value
                    ? 'bg-vibe-900/50 border-vibe-500 text-vibe-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                >
                <cat.icon className="w-4 h-4" />
                {cat.label}
                </button>
            ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
               {/* Pain Filters */}
               <div className="flex items-center bg-slate-900/50 p-1 rounded-full border border-slate-800">
                  <button
                    onClick={() => setSelectedPain('All')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedPain === 'All' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedPain('Headache')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedPain === 'Headache' ? 'bg-blue-900/80 text-blue-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                     <BandageIcon className="w-3 h-3" />
                     Headache
                  </button>
                  <button
                    onClick={() => setSelectedPain('Migraine')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedPain === 'Migraine' ? 'bg-rose-900/80 text-rose-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                     <BrainIcon className="w-3 h-3" />
                     Migraine
                  </button>
              </div>

              {/* Duration Filters */}
              <div className="flex items-center bg-slate-900/50 p-1 rounded-full border border-slate-800">
                  <select 
                     value={selectedDuration}
                     onChange={(e) => setSelectedDuration(e.target.value as GigDuration | 'All')}
                     className="bg-transparent text-xs font-bold text-slate-300 px-3 py-1.5 focus:outline-none cursor-pointer hover:text-white"
                  >
                    <option value="All" className="bg-slate-900">Any Time</option>
                    <option value="Easy (< 1 hr)" className="bg-slate-900">Easy (&lt; 1 hr)</option>
                    <option value="Medium (2-4 hrs)" className="bg-slate-900">Medium (2-4 hrs)</option>
                    <option value="Hard (> 8 hrs)" className="bg-slate-900">Hard (&gt; 8 hrs)</option>
                  </select>
              </div>
            </div>
        </div>

        {/* Loading State or Gigs Grid */}
        {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-vibe-500/50">
                    <LoaderIcon className="w-8 h-8 text-vibe-400 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Consulting the Vibe AI...</h3>
                <p className="text-slate-500">Formulating impactful projects for "{causeInput}"</p>
            </div>
        ) : filteredGigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <GigCard 
                key={gig.id} 
                gig={gig} 
                onSelect={(g) => handleActionRequiringKey(async () => setActiveGuideGig(g))} // Direct to guide
                onAccept={(g) => handleActionRequiringKey(async () => setActiveGuideGig(g))} // Direct to guide
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
               <SearchIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-300">No matching opportunities</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters or generating a new cause.</p>
          </div>
        )}
      </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Vibe Coding for Good. Powered by Google Gemini.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;