import React from 'react';
import { Gig, GigCategory } from '../types';
import { CodeIcon, ZapIcon, GamepadIcon, BotIcon, BarChartIcon, SparklesIcon, ClockIcon, BrainIcon, BandageIcon, ActivityIcon, RefreshCwIcon } from './Icons';

interface GigCardProps {
  gig: Gig;
  onSelect: (gig: Gig) => void;
  onAccept: (gig: Gig) => void;
}

const CategoryIcon = ({ category }: { category: GigCategory }) => {
  switch (category) {
    case GigCategory.WEB_APP: return <CodeIcon className="w-4 h-4 text-cyan-400" />;
    case GigCategory.CHROME_EXTENSION: return <ZapIcon className="w-4 h-4 text-yellow-400" />;
    case GigCategory.GAME: return <GamepadIcon className="w-4 h-4 text-purple-400" />;
    case GigCategory.AUTOMATION: return <BotIcon className="w-4 h-4 text-green-400" />;
    case GigCategory.DATA_VIZ: return <BarChartIcon className="w-4 h-4 text-pink-400" />;
    default: return <SparklesIcon className="w-4 h-4 text-white" />;
  }
};

const getDurationColor = (duration: string) => {
  if (duration.includes('Easy')) return 'text-emerald-400 bg-emerald-950/50 border-emerald-900';
  if (duration.includes('Medium')) return 'text-amber-400 bg-amber-950/50 border-amber-900';
  return 'text-rose-400 bg-rose-950/50 border-rose-900';
};

const getPainColor = (level?: string) => {
  switch (level) {
    case 'Critical': return 'text-red-500';
    case 'High': return 'text-orange-500';
    case 'Medium': return 'text-yellow-500';
    case 'Low': return 'text-blue-400';
    default: return 'text-slate-400';
  }
};

const GigCard: React.FC<GigCardProps> = ({ gig, onSelect, onAccept }) => {
  const isMigraine = gig.customerPain.type === 'Migraine';

  return (
    <div 
      className="group relative flex flex-col justify-between h-full bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-vibe-500/50 rounded-xl p-5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-vibe-500/10"
      onClick={() => onSelect(gig)}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 group-hover:border-vibe-500/30 transition-colors">
            <CategoryIcon category={gig.category} />
            {gig.category}
          </span>
          <div className="flex flex-col items-end gap-1">
             <span className="text-vibe-400 font-mono text-xs font-bold tracking-tight">⏱️ {gig.timeCommitment}</span>
             <div className="flex gap-1">
               <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                   gig.stackCost === 'Free' 
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-400' 
                      : 'bg-indigo-950 border-indigo-800 text-indigo-400'
               }`}>
                  {gig.stackCost === 'Free' ? 'Free Stack' : 'Paid Stack'}
               </span>
             </div>
          </div>
        </div>
        
        <div className="mb-2">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {gig.organization}
            </span>
            <span className="mx-2 text-slate-700">&bull;</span>
            <span className="text-xs font-medium text-vibe-500/80">
                {gig.cause}
            </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-vibe-300 transition-colors">
          {gig.title}
        </h3>
        
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
          {gig.impactDescription}
        </p>

        {/* Customer Pain Profile Section */}
        <div className="mb-4 bg-slate-900/40 rounded-lg p-3 border border-slate-700/50">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pain Profile</span>
              <div className="h-px bg-slate-700 flex-grow" />
           </div>
           
           <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${isMigraine ? 'text-rose-400' : 'text-blue-300'}`}>
                 {isMigraine ? <BrainIcon className="w-4 h-4" /> : <BandageIcon className="w-4 h-4" />}
                 <span className="text-sm font-semibold">{gig.customerPain.type}</span>
              </div>
              
              {isMigraine && (
                 <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1" title="Pain Level">
                       <ActivityIcon className={`w-3 h-3 ${getPainColor(gig.customerPain.painLevel)}`} />
                       <span className="text-slate-300">{gig.customerPain.painLevel}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Repeatability">
                       <RefreshCwIcon className="w-3 h-3 text-slate-500" />
                       <span className="text-slate-300">{gig.customerPain.repeatability}</span>
                    </div>
                 </div>
              )}
              {!isMigraine && (
                  <span className="text-xs text-slate-500 italic">Goes away after a bit</span>
              )}
           </div>
        </div>

        <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Recommended Stack</p>
            <p className="text-xs text-slate-300 font-mono bg-slate-900/50 p-2 rounded border border-slate-700/50 leading-relaxed line-clamp-2">
                {gig.recommendedStack}
            </p>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAccept(gig);
        }}
        className="w-full mt-2 py-2 px-4 rounded-lg bg-slate-700 text-slate-200 text-sm font-semibold hover:bg-vibe-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:bg-slate-700/80"
      >
        <span>Accept Challenge</span>
        <SparklesIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

export default GigCard;
