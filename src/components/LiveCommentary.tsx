import React, { useEffect, useRef } from 'react';
import { Commentary } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { RadioReceiver, Megaphone, Activity, AlertCircle, Zap } from 'lucide-react';

export function LiveCommentaryStream({ commentary, loading }: { commentary: Commentary[], loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commentary]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'tactical': return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'momentum': return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'injury': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return <Megaphone className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 min-h-[300px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-2">
        {loading && (
          <div className="flex gap-1 ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 scroll-smooth pr-2">
        <AnimatePresence initial={false}>
          {commentary.length === 0 && !loading && (
            <div className="text-gray-500 text-sm text-center mt-8">Waiting for action...</div>
          )}
          {commentary.map((comm) => {
            const isAlert = comm.type === 'injury' || comm.type === 'momentum';
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-l-2 text-sm leading-relaxed ${isAlert ? 'bg-white/5 border-red-500' : 'bg-white/5 border-emerald-500'}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(comm.type)}
                  </div>
                  <div>
                    <span className="text-gray-300">{comm.text}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-end">
                  <span className="text-[10px] text-gray-500 font-mono">{comm.timestamp}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
