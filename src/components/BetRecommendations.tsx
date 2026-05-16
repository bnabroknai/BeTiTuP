import React from 'react';
import { BetRecommendation } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Activity, Sparkles } from 'lucide-react';

export function BetRecommendationsList({ recommendations, loading }: { recommendations: BetRecommendation[], loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white/5 h-28 rounded-xl border border-white/10 flex flex-col justify-between p-4">
             <div className="flex justify-between items-start">
               <div className="h-5 w-32 bg-white/10 rounded"></div>
               <div className="h-5 w-16 bg-white/10 rounded"></div>
             </div>
             <div className="h-3 w-3/4 bg-white/10 rounded mt-4"></div>
             <div className="h-3 w-1/2 bg-white/10 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-gray-500 border border-white/10 border-dashed rounded-xl h-full min-h-[200px]">
        <Target className="w-8 h-8 mb-3 opacity-50" />
        <p>No actionable bets found right now.</p>
        <p className="text-sm">Select a game to analyze live odds.</p>
      </div>
    );
  }

  const getSportsbookColor = (book: string) => {
    switch (book.toLowerCase()) {
      case 'draftkings': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'fanduel': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'betmgm': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'caesars': return 'bg-slate-100/10 text-slate-200 border-slate-100/20';
      default: return 'bg-brand/10 text-brand border-brand/20';
    }
  };

  return (
    <div className="space-y-4">
       <AnimatePresence>
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all rounded-xl overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="p-4 relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-white/10 bg-black/40 text-gray-300`}>
                      {rec.sportsbook}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                      <Target className="w-3 h-3" />
                      {rec.type}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-white">{rec.description}</h4>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="font-mono text-xl font-bold text-emerald-400">{rec.odds}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold badge-green mt-1">
                      <Zap className="w-3 h-3" />
                      {rec.edge}
                    </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-300 leading-relaxed border-l-2 border-emerald-500 pl-3 bg-white/5 p-2 rounded-lg">
                <span className="font-bold text-emerald-400 mr-1">AI Analysis:</span>
                {rec.analysis}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-tighter">
                <span>Confidence Score</span>
                <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500"
                    style={{ width: `${rec.confidence}%` }}
                   ></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
