import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  timeRemaining: string;
  period: string;
  odds: {
    homeML: number;
    awayML: number;
    overUnder: number;
  };
}

export interface BetRecommendation {
  id: string;
  sportsbook: 'DraftKings' | 'FanDuel' | 'BetMGM' | 'Caesars';
  type: string;
  description: string;
  odds: string;
  confidence: number; // 0-100
  edge: string; // e.g. "+5.2% EV"
  analysis: string;
}

export interface Commentary {
  id: string;
  timestamp: string;
  text: string;
  type: 'tactical' | 'injury' | 'momentum' | 'general';
}

export interface MarketUpdate {
  id: string;
  sportsbook: string;
  game: string;
  type: 'movement' | 'volume' | 'sharp';
  text: string;
  timestamp: string;
  sentiment: 'up' | 'down' | 'neutral';
}

export async function fetchMockLiveGames(): Promise<Game[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Generate 3 current simulated live sports games (mix of NBA, MLB, or NHL, whichever is plausible today). 
          Return ONLY a valid JSON array of objects with the following keys:
          - id (string, unique UUID)
          - sport (string)
          - homeTeam (string)
          - awayTeam (string)
          - homeScore (number)
          - awayScore (number)
          - timeRemaining (string, e.g. "5:42")
          - period (string, e.g. "3rd Qtr", "Top 5th", "2nd Period")
          - odds (object with homeML (number), awayML (number), overUnder (number))
          Do not include markdown tags. Only the JSON.` }]
        }
      ]
    });
    
    // Strip markdown formatting if any
    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return [];
  }
}

export async function generateBetRecommendations(game: Game): Promise<BetRecommendation[]> {
  try {
    const prompt = `Act as an expert sports betting AI algorithm. Analyze the following live game and provide 3 highly specific high-value bet recommendations across DraftKings, FanDuel, and BetMGM.
    
    Game: ${game.awayTeam} (${game.awayScore}) @ ${game.homeTeam} (${game.homeScore})
    Time: ${game.period}, ${game.timeRemaining}
    Current Lines: ML Home ${game.odds.homeML > 0 ? '+' : ''}${game.odds.homeML}, Away ${game.odds.awayML > 0 ? '+' : ''}${game.odds.awayML}, O/U ${game.odds.overUnder}

    Provide realistic prop bets, live moneyline angles, or spread bets. Calculate a realistic "edge".
    Return ONLY a valid JSON array with keys:
    - id (unique string)
    - sportsbook ("DraftKings", "FanDuel", "BetMGM", or "Caesars")
    - type (string, e.g., "Player Prop", "Live Spread", "Alt Over/Under")
    - description (string, e.g., "LeBron James Over 6.5 Assists", "Lakers +3.5")
    - odds (string, e.g., "-110", "+140")
    - confidence (number 0-100)
    - edge (string, e.g., "+4.5% EV")
    - analysis (string, 1-2 sentences of why this bet is valuable given the live game context)
    
    Do not include markdown tags. Only the JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to generate bets:", error);
    return [];
  }
}

export async function generateLiveCommentary(game: Game, recentContext: string[]): Promise<Commentary> {
    try {
        const prompt = `Act as a live professional sports betting analyst. 
        Game: ${game.awayTeam} (${game.awayScore}) @ ${game.homeTeam} (${game.homeScore}) - ${game.period}, ${game.timeRemaining}.
        Recent context: ${recentContext.join(' | ')}
        
        Generate a single short insightful live commentary update (1-2 sentences max). 
        Focus on momentum shifts, strategic adjustments, or betting impacts (e.g. "Pace is slowing down, consider Live Under").
        
        Return ONLY a JSON object with:
        - id (unique string)
        - timestamp (current simulated time string like "HH:MM")
        - text (the commentary content)
        - type ("tactical", "injury", "momentum", or "general")
        
        Do not include markdown tags. Only the JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = response.text || "{}";
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Commentary gen failed:", e);
        throw e;
    }
}

export async function fetchMarketIntel(games: Game[]): Promise<MarketUpdate[]> {
  try {
    const gameContext = games.map(g => `${g.awayTeam} @ ${g.homeTeam}`).join(', ');
    const prompt = `Act as a real-time betting market analyzer. Generate 4 highly specific market volatility alerts for these games: ${gameContext}.
    Specifically focus on DraftKings, FanDuel, and BetMGM.
    
    Return ONLY a valid JSON array of objects with:
    - id (unique string)
    - sportsbook ("DraftKings", "FanDuel", "BetMGM", or "Caesars")
    - game (short team names, e.g. "LAL @ PHX")
    - type ("movement", "volume", or "sharp")
    - text (e.g., "DraftKings: Lakers ML backed by 65% of handle in last 5 mins", "BetMGM: Sharp action detected on Suns spread")
    - timestamp (e.g., "now")
    - sentiment ("up", "down", or "neutral")
    
    Do not include markdown tags. Only the JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to fetch market intel:", error);
    return [];
  }
}
