import { useState, useEffect } from 'react';
import { Game, BetRecommendation, Commentary, MarketUpdate, TopPick, fetchLiveGames, generateBetRecommendations, generateLiveCommentary, fetchMarketIntel, getTopProfitabilityPick } from './services/geminiService';
import { GameCard } from './components/GameCard';
import { BetRecommendationsList } from './components/BetRecommendations';
import { LiveCommentaryStream } from './components/LiveCommentary';
import { MarketIntelFeed } from './components/MarketIntelFeed';
import { TopPickDisplay } from './components/TopPickDisplay';
import { ProfileModal } from './components/ProfileModal';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { User } from 'firebase/auth';
import { Activity, RefreshCw, Trophy, BrainCircuit, User as UserIcon, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<BetRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  const [commentaryData, setCommentaryData] = useState<Record<string, Commentary[]>>({});
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const [marketUpdates, setMarketUpdates] = useState<MarketUpdate[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const [topPick, setTopPick] = useState<TopPick | null>(null);
  const [loadingTopPick, setLoadingTopPick] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // Initialize live games
  const loadGames = async () => {
    setLoadingGames(true);
    const liveGames = await fetchLiveGames();
    setGames(liveGames);
    if (liveGames.length > 0 && !selectedGameId) {
      setSelectedGameId(liveGames[0].id);
    }
    setLoadingGames(false);

    // Also fetch top pick once we have games
    if (liveGames.length > 0) {
        setLoadingTopPick(true);
        const pick = await getTopProfitabilityPick(liveGames);
        setTopPick(pick);
        setLoadingTopPick(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const selectedGame = games.find(g => g.id === selectedGameId);

  // Load recommendations when a game is selected
  useEffect(() => {
    if (!selectedGame) return;
    
    let isMounted = true;
    const fetchRecs = async () => {
      setLoadingRecs(true);
      const recs = await generateBetRecommendations(selectedGame);
      if (isMounted) {
        setRecommendations(recs);
        setLoadingRecs(false);
      }
    };
    fetchRecs();

    return () => { isMounted = false; };
  }, [selectedGameId, selectedGame?.homeScore, selectedGame?.awayScore]); // Re-run if scores change

  // Periodic AI Commentary Generator
  useEffect(() => {
    if (!selectedGame) return;

    const generateCall = async () => {
      setLoadingCommentary(true);
      const gameMemory = commentaryData[selectedGame.id] || [];
      const memoryText = gameMemory.slice(-3).map(c => c.text);
      
      try {
        const newComm = await generateLiveCommentary(selectedGame, memoryText);
        setCommentaryData(prev => ({
          ...prev,
          [selectedGame.id]: [...(prev[selectedGame.id] || []), newComm]
        }));
      } catch (e) {
        console.error("Commentary gen failed:", e);
      } finally {
        setLoadingCommentary(false);
      }
    };

    // Generate initial commentary when game selected if empty
    if (!(commentaryData[selectedGame.id]?.length > 0)) {
       generateCall();
    }

    // Auto-generate a new commentary every 15-20 seconds to simulate live desk
    const interval = setInterval(generateCall, 18000);
    return () => clearInterval(interval);
  }, [selectedGameId]);

  // Periodic Market Intel Fetcher
  useEffect(() => {
    if (games.length === 0) return;

    const fetchIntel = async () => {
      setLoadingMarket(true);
      const updates = await fetchMarketIntel(games);
      setMarketUpdates(prev => {
        const combined = [...updates, ...prev].slice(0, 10);
        return combined;
      });
      setLoadingMarket(false);
    };

    fetchIntel();
    const interval = setInterval(fetchIntel, 30000);
    return () => clearInterval(interval);
  }, [games.length]);

  return (
    <>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <div className="mesh-bg"></div>
      <div className="min-h-screen flex flex-col font-sans text-white selection:bg-emerald-500/30 p-6 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center glass-panel px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <BrainCircuit className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display">BET-AI ANALYST PRO</h1>
              <p className="text-xs text-gray-400">Neural Network Odds Engine • v4.2 Gold</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadGames}
              disabled={loadingGames}
              className="hidden md:flex items-center gap-2 text-sm px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-50 border border-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loadingGames ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-all"
                >
                  <img 
                    src={user.photoURL || ''} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-emerald-500/50"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-emerald-400">PROFILE</span>
                </button>
                <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.05] transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <LogIn className="w-4 h-4" />
                Access Terminal
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Game List */}
        <div className="lg:col-span-3 glass-panel flex flex-col p-4 space-y-4">
          <div className="border-b border-white/10 flex justify-between items-center pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Action
            </h2>
            <div className="flex items-center gap-1">
               <div className="indicator-dot"></div>
               <span className="text-[10px] text-gray-400 font-bold">ACTIVE</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {loadingGames && games.length === 0 ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10"></div>)
            ) : (
              games.map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isSelected={selectedGameId === game.id}
                  onClick={() => setSelectedGameId(game.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Middle Column: AI Analysis & Bets */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <TopPickDisplay topPick={topPick} loading={loadingTopPick} />

          <div className="glass-panel p-4 flex-1 flex flex-col bg-white/[0.02]">
            <div className="border-b border-white/10 pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                The Vault: House Picks
              </h2>
              <div className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                PRISTINE ENGINE
              </div>
            </div>

            {!selectedGame ? (
              <div className="flex-1 min-h-[200px] flex items-center justify-center border border-white/10 border-dashed rounded-xl text-gray-500">
                Select a game to decrypt value signals
              </div>
            ) : (
             <BetRecommendationsList recommendations={recommendations} loading={loadingRecs} />
            )}
          </div>
        </div>

        {/* Right Column: Live Desk Commentary */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <aside className="glass-panel p-6 flex flex-col space-y-4 flex-1">
            <div className="border-b border-white/10 flex justify-between items-center pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Strategy Feed
              </h2>
            </div>
          
            <LiveCommentaryStream 
              commentary={selectedGame ? (commentaryData[selectedGame.id] || []) : []} 
              loading={loadingCommentary && !!selectedGame} 
            />

            <div className="mt-auto pt-4 border-t border-white/10 flex-1 min-h-[300px] flex flex-col">
               <MarketIntelFeed updates={marketUpdates} loading={loadingMarket} />
            </div>
          </aside>
        </div>

      </main>
      <footer className="text-center text-[10px] text-gray-500 py-2 uppercase tracking-[0.4em] font-bold">
        BET-AI ANALYST PRO • SECURE PROTOCOL • PLAY RESPONSIBLY
      </footer>
      </div>
    </>
  );
}
