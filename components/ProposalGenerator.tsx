import React, { useState } from 'react';
import { Gig } from '../types';
import { generateProposal } from '../services/geminiService';
import { SparklesIcon, XIcon, LoaderIcon, CodeIcon } from './Icons';

interface ProposalGeneratorProps {
  gig: Gig;
  onClose: () => void;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ gig, onClose }) => {
  const [coderNote, setCoderNote] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateProposal(gig, coderNote);
    setProposal(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="text-vibe-400" />
              Vibe Proposal Generator
            </h2>
            <p className="text-slate-400 text-sm">Gig: {gig.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Gig Details Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">The Impact</h4>
                <p className="text-slate-300 text-sm">{gig.impactDescription}</p>
             </div>
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">The Stack</h4>
                <p className="text-slate-300 text-sm font-mono">{gig.recommendedStack}</p>
             </div>
          </div>

          {/* Vibe Code Approach Steps */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CodeIcon className="w-4 h-4 text-vibe-400" />
                Vibe Code Approach
            </h3>
            <div className="space-y-3">
                {gig.approach.map((step) => (
                    <div key={step.stepNumber} className="flex gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vibe-900/50 text-vibe-400 border border-vibe-500/30 flex items-center justify-center text-xs font-mono">
                            {step.stepNumber}
                        </span>
                        <p className="text-sm text-slate-300">
                           <span className="font-semibold text-slate-400">Step {step.stepNumber}:</span> {step.instruction}
                        </p>
                    </div>
                ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* User Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Add your personal flair (optional):
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-vibe-500 focus:border-transparent outline-none transition-all resize-none text-sm"
              rows={3}
              placeholder="e.g. I specialize in dark mode UI and using Redis for speed..."
              value={coderNote}
              onChange={(e) => setCoderNote(e.target.value)}
            />
          </div>

          {/* Action Button */}
          {!proposal && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                loading 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-vibe-600 to-vibe-500 hover:from-vibe-500 hover:to-vibe-400 shadow-lg shadow-vibe-500/20'
              }`}
            >
              {loading ? (
                <>
                  <LoaderIcon className="animate-spin" />
                  Generating Vibes...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Generate Proposal with Gemini
                </>
              )}
            </button>
          )}

          {/* Output */}
          {proposal && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-semibold">Your Generated Proposal</h3>
                 <button 
                   onClick={() => {navigator.clipboard.writeText(proposal)}}
                   className="text-xs text-vibe-400 hover:text-vibe-300 underline"
                 >
                   Copy to Clipboard
                 </button>
              </div>
              <div className="bg-slate-950 border border-vibe-900/50 rounded-xl p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-vibe-500/5 to-transparent pointer-events-none" />
                <p className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed relative z-10">
                  {proposal}
                </p>
              </div>
              
              <div className="mt-4 flex gap-3">
                 <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
                    Close
                 </button>
                 <button onClick={handleGenerate} className="flex-1 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm">
                    Regenerate
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;