import React from 'react';
import { TopPick } from '../services/geminiService';
import { motion } from 'motion/react';
import { Trophy, Zap, TrendingUp, Sparkles, Brain } from 'lucide-react';

export function TopPickDisplay({ topPick, loading }: { topPick: TopPick | null, loading: boolean }) {
  if (loading) {
    return (
      <div className="glass-panel p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg"></div>
          <div className="h-6 w-48 bg-emerald-500/20 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/5 rounded"></div>
          <div className="h-4 w-2/3 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (!topPick) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-6 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent border-emerald-500/40 relative overflow-hidden gold-border group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Trophy className="w-24 h-24 text-emerald-400 rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Prime Alpha Pick</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Maximum Probability Targeted via Brain-3</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono font-bold text-emerald-400">EV EDGE</span>
            <span className="text-xl font-black text-white">{topPick.recommendation.edge}</span>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{topPick.game.awayTeam} @ {topPick.game.homeTeam}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {topPick.recommendation.sportsbook}
            </span>
          </div>
          <h4 className="text-2xl font-black text-white mb-1">{topPick.recommendation.description}</h4>
          <span className="text-3xl font-mono font-black text-emerald-400">{topPick.recommendation.odds}</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <Brain className="w-3 h-3" />
              Strategic Reasoning
            </div>
            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
              "{topPick.reasoning}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div>
                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-1">Profitability</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${topPick.profitabilityScore}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{topPick.profitabilityScore}%</span>
                </div>
              </div>
            </div>
            
            <button className="px-6 py-2 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Back This Pick
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
