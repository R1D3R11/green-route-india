import { GoogleGenAI, Type } from "@google/genai";
import { RouteOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRoutes = async (origin: string, destination: string, city: string): Promise<RouteOption[]> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    CRITICAL CITY-SPECIFIC RULES (STRICTLY ENFORCE - HIGHEST PRIORITY):
    1. MUMBAI "SOUTH BOMBAY" AUTO BAN: 
       - Auto Rickshaws are STRICTLY BANNED south of Bandra/Sion. 
       - Locations like Colaba, Fort, Churchgate, Marine Lines, Charni Road, Girgaon, Grant Road, Mumbai Central, Dadar, Mahalaxmi, Worli DO NOT HAVE AUTOS.
       - In these areas, you MUST use "Taxi" (Kaali-Peeli), "Bus", or "Walk". NEVER suggest an Auto Rickshaw start or end here.
    
    2. SHORT DISTANCE WALKING LOGIC:
       - If the origin/destination is within 1.0 km (approx 10-12 mins walk) of a major Railway Station (e.g., Churchgate, CST, Dadar, Andheri), the instruction MUST be "Walk". 
       - Do NOT suggest waiting for a Taxi/Bus for distances < 800 meters. It is faster to walk in Indian traffic.
       - Example: Hinduja College to Charni Road Station is 200m. Step MUST be "Walk".

    Task: Generate 4 distinct commuting routes from "${origin}" to "${destination}" in "${city}", India.

    Calculation Baseline (Cab):
    - Cab Time: Estimate using traffic speed (City: 18km/h, Highway: 35km/h).
    - Cab Cost: Distance * ₹25/km.
    - Cab CO2: Distance * 160g/km.

    Route Types Needed:
    1. "Greenest": Prioritize Electric Bus (BEST EV, DTC EV), Metro, Local Train, Walk. (Tag: 'Greenest')
    2. "Fastest": Prioritize Metro, Train, or Taxi+Train combo. (Tag: 'Fastest')
    3. "Cheapest": Prioritize Bus or Walk. (Tag: 'Cheapest')
    4. "Most Balanced": A practical mix (e.g., Walk 5m + Train is better than wait 15m for Bus). (Tag: 'Most Balanced')

    Instructions Constraints:
    - BE SPECIFIC. "Take Electric Bus 203 LTD towards Sion". "Take Fast Train towards Virar".
    - If a route serves multiple goals (e.g., Fastest AND Cheapest), that is fine, but try to offer variety in the other slots.

    Output: JSON Array of 4 RouteOption objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "E.g., Metro + Walk" },
              totalDuration: { type: Type.NUMBER, description: "Minutes" },
              totalCost: { type: Type.NUMBER, description: "Cost in Rupees" },
              co2Emitted: { type: Type.NUMBER, description: "KG of CO2" },
              
              timeSaved: { type: Type.NUMBER },
              moneySaved: { type: Type.NUMBER },
              co2Saved: { type: Type.NUMBER },

              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Tags like 'Fastest', 'Cheapest', 'Greenest', 'Most Balanced'"
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mode: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    duration: { type: Type.NUMBER }
                  }
                }
              },
              score: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    const rawRoutes = JSON.parse(jsonStr) as RouteOption[];
    
    // DE-DUPLICATION LOGIC
    // AI sometimes generates the same route twice for different categories (e.g. Fastest is also Cheapest).
    // We merge them to avoid showing duplicate cards.
    const uniqueRoutes: RouteOption[] = [];
    const seenSignatures = new Set<string>();

    for (const route of rawRoutes) {
      // Create a unique signature based on Title + Cost + Duration
      // This is robust enough to catch identical routes
      const key = `${route.title.toLowerCase().trim()}|${route.totalCost}|${route.totalDuration}`;

      if (seenSignatures.has(key)) {
        // It's a duplicate. Find the existing one and merge tags.
        const existing = uniqueRoutes.find(r => 
           `${r.title.toLowerCase().trim()}|${r.totalCost}|${r.totalDuration}` === key
        );
        if (existing) {
           // Add any new tags from the duplicate to the existing one
           const combinedTags = new Set([...existing.tags, ...route.tags]);
           existing.tags = Array.from(combinedTags);
        }
      } else {
        seenSignatures.add(key);
        uniqueRoutes.push(route);
      }
    }

    return uniqueRoutes;

  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};
