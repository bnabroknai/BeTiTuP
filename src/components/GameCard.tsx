import React from 'react';
import { Game } from '../services/geminiService';
import { motion } from 'motion/react';
import { Clock, Play } from 'lucide-react';

interface GameCardProps {
  key?: string | number;
  game: Game;
  isSelected: boolean;
  onClick: () => void;
}

export function GameCard({ game, isSelected, onClick }: GameCardProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`Select game: ${game.awayTeam} versus ${game.homeTeam}`}
      className={`w-full text-left rounded-xl p-4 transition-all duration-200 cursor-pointer gold-border ${
        isSelected 
          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none'
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          {game.sport}
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://www.espn.com/watch/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors uppercase font-bold tracking-tighter focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none rounded px-1"
            title={`Watch Live Stream: ${game.awayTeam} vs ${game.homeTeam}`}
            aria-label={`Watch Live Stream: ${game.awayTeam} vs ${game.homeTeam}`}
          >
            <Play className="w-3 h-3 fill-current" />
            Live
          </a>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {game.period} • {game.timeRemaining}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-lg text-white">{game.awayTeam}</span>
          <span className="font-mono text-xl font-bold">{game.awayScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-lg text-white">{game.homeTeam}</span>
          <span className="font-mono text-xl font-bold">{game.homeScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-black/40 rounded p-1.5 border border-white/5">
          <div className="text-gray-400 mb-0.5 uppercase tracking-tighter">AWAY ML</div>
          <div className="font-mono font-bold text-emerald-400 text-xs">{game.odds.awayML > 0 ? '+' : ''}{game.odds.awayML}</div>
        </div>
        <div className="bg-black/40 rounded p-1.5 border border-white/5">
          <div className="text-gray-400 mb-0.5 uppercase tracking-tighter">O/U</div>
          <div className="font-mono font-bold text-emerald-500 text-xs">{game.odds.overUnder}</div>
        </div>
        <div className="bg-black/40 rounded p-1.5 border border-white/5">
          <div className="text-gray-400 mb-0.5 uppercase tracking-tighter">HOME ML</div>
          <div className="font-mono font-bold text-emerald-400 text-xs">{game.odds.homeML > 0 ? '+' : ''}{game.odds.homeML}</div>
        </div>
      </div>
    </motion.button>
  );
}
