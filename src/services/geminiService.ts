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
  status: 'live' | 'past' | 'scheduled';
  startTime?: string;
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
  thoughtProcess?: string;
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

export interface TopPick {
  game: Game;
  recommendation: BetRecommendation;
  reasoning: string;
  profitabilityScore: number; // 0-100
}

export async function fetchLiveGames(): Promise<Game[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Search for current live and upcoming major sports games (NBA, MLB, NHL) happening today ${new Uint8Array(8).reduce((acc) => acc + '0123456789'[Math.floor(Math.random() * 10)], '')}. 
          Return a valid JSON array of objects with the following keys:
          - id (string, unique UUID)
          - sport (string)
          - homeTeam (string)
          - awayTeam (string)
          - homeScore (number)
          - awayScore (number)
          - timeRemaining (string)
          - period (string)
          - status ("live", "past", or "scheduled")
          - startTime (string, optional)
          - odds (object with homeML (number), awayML (number), overUnder (number))
          Return at least 5 games. Use real current data via search grounding.` }]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // In case the model returns text alongside JSON, try to extract the array
    const jsonMatch = cleanText.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return [];
  }
}

export async function generateBetRecommendations(game: Game): Promise<BetRecommendation[]> {
  try {
    const prompt = `Analyze this game: ${game.awayTeam} vs ${game.homeTeam}. Status: ${game.status}, Score: ${game.awayScore}-${game.homeScore}.
    Provide 3 high-value bet recommendations.
    Return a JSON array of objects with:
    - id, sportsbook, type, description, odds, confidence, edge, analysis.
    - thoughtProcess: A detailed step-by-step reasoning of why this pick was selected (the "logic flow").
    
    Use realistic live market data.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanText.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
  } catch (error) {
    console.error("Failed to generate bets:", error);
    return [];
  }
}

export async function getTopProfitabilityPick(games: Game[]): Promise<TopPick | null> {
    try {
        const gameContext = games.map(g => `${g.awayTeam} @ ${g.homeTeam}`).join(', ');
        const prompt = `From these games: ${gameContext}, identify the single highest profitability pick across all markets.
        Analyze weather, starting lineups, momentum, and historical trends via search.
        
        Return a JSON object with:
        - game: the full Game object as provided but with any real-time score updates
        - recommendation: a BetRecommendation object
        - reasoning: 2-3 sentences of deep technical analysis
        - profitabilityScore: 0-100 rating of the EV quality
        
        Focus on specific DraftKings/FanDuel value gaps.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview', // Pro for high-level reasoning
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text || "null";
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\{.*\}/s);
        return JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
    } catch (e) {
        console.error("Top pick failed:", e);
        return null;
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
