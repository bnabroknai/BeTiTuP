import React from 'react';
import { MarketUpdate } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Network, TrendingUp, TrendingDown, Info, BarChart3 } from 'lucide-react';

export function MarketIntelFeed({ updates, loading }: { updates: MarketUpdate[], loading: boolean }) {
  const getUpdateIcon = (type: string, sentiment: string) => {
    if (type === 'movement') {
      return sentiment === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    }
    if (type === 'sharp') return <Network className="w-3.5 h-3.5 text-amber-500" />;
    return <BarChart3 className="w-3.5 h-3.5 text-blue-400" />;
  };

  const getBookLabel = (book: string) => {
    switch(book.toLowerCase()) {
      case 'draftkings': return 'DK';
      case 'fanduel': return 'FD';
      case 'betmgm': return 'MGM';
      default: return 'CZR';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Info className="w-3 h-3" />
          Live Market Floor
        </h3>
        {loading && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping delay-75" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {updates.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/20 border border-white/5 rounded-lg p-3 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black italic">
                    {getBookLabel(update.sportsbook)}
                  </span>
                  <span className="text-[10px] font-bold text-white tracking-tight uppercase">
                    {update.game}
                  </span>
                </div>
                {getUpdateIcon(update.type, update.sentiment)}
              </div>
              <p className="text-xs text-gray-400 leading-tight group-hover:text-gray-300 transition-colors">
                {update.text}
              </p>
              <div className="mt-2 flex items-center justify-end">
                <span className="text-[9px] text-gray-600 font-mono">T-SEC-{Math.floor(Math.random() * 60)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {!loading && updates.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
            <Network className="w-8 h-8" />
            <p className="text-[10px] uppercase font-bold tracking-tighter">Waiting for Market Uplink...</p>
          </div>
        )}
      </div>
    </div>
  );
}
