const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Helper to call Groq Chat Completions API
 */
const callGroq = async (prompt, systemPrompt = "", temperature = 0.2) => {
    console.log(`[Groq] Sending request to ${GROQ_MODEL}...`);
    try {
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
        });
        console.log(`[Groq] ${GROQ_MODEL} response received.`);
        return completion.choices[0]?.message?.content ?? '';
    } catch (error) {
        if (error.status === 401) throw new Error('Invalid Groq API key. Check your GROQ_API_KEY in .env');
        if (error.status === 429) throw new Error('Groq rate limit reached. Please wait a moment and try again.');
        throw error;
    }
};

/**
 * Robustly parse JSON from AI response
 */
const parseAIJSON = (text) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerError) {
                console.error('[Groq Parser] Failed to parse extracted JSON block');
            }
        }
        throw new Error('AI returned invalid JSON format');
    }
};

/**
 * Agent 1: Travel Planning Agent
 * Generate a detailed, geographically-optimized itinerary
 */
const generateItineraryAgent = async (city, days, interests, budget) => {
    console.log(`[Itinerary Agent] Planning ${days} days in ${city}...`);

    const prompt = `Plan a ${days}-day trip to ${city}, India.
User Interests: ${interests}
Budget Level: ${budget}

CRITICAL GEOGRAPHIC RULES:
1. Group places that are CLOSE TOGETHER on the same day (within 5-10km of each other).
2. NEVER put places on opposite ends of the city on the same day.
3. Start each day from a central location and visit nearby places in a logical route.
4. Maximum 4-5 places per day to allow realistic travel time.
5. Include realistic travel time between places (15-45 min within city).
6. Order places within each day by geographic proximity (shortest path).

Requirement: Provide a day-by-day itinerary in JSON format.
Each activity must include: name, description (max 10 words), time, type, lat, lng.

Format:
{
  "itinerary": {
    "day1": [
      { "name": "...", "description": "...", "time": "09:00 AM", "type": "culture", "lat": 27.1751, "lng": 78.0421, "visitDuration": "2 hours" }
    ],
    "day2": [
      { "name": "...", "description": "...", "time": "10:00 AM", "type": "landmark", "lat": 27.1751, "lng": 78.0421, "visitDuration": "1.5 hours" }
    ]
  }
}

Note: 
- All lat/lng must be accurate coordinates within ${city}, India.
- Places in the same day MUST be geographically close to each other.
- Include visitDuration for each place (e.g., "1 hour", "2 hours").`;

    const systemPrompt = "You are a professional Indian Travel Planner who optimizes routes geographically. Group nearby places together. Respond ONLY with valid JSON.";

    try {
        const responseText = await callGroq(prompt, systemPrompt, 0.2);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Itinerary Agent Error]', error.message);
        throw error;
    }
};

/**
 * Agent 2: Place Recommendation Agent
 */
const recommendPlacesAgent = async (preferences, location = "India") => {
    console.log(`[Recommendation Agent] Suggesting places for: ${preferences}...`);

    const prompt = `Suggest 5 must-visit tourist places in ${location} based on these preferences: ${preferences}.
Include popular attractions and nearby gems.

Format each as JSON:
{
  "recommendations": [
    { "name": "...", "reason": "...", "popularity": "High/Medium", "nearby_attractions": ["...", "..."] }
  ]
}`;

    const systemPrompt = "You are an expert Indian Tour Guide. Suggest only the best places. JSON ONLY.";

    try {
        const responseText = await callGroq(prompt, systemPrompt, 0.3);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Recommendation Agent Error]', error.message);
        throw error;
    }
};

/**
 * Agent 3: Travel Guide Agent
 */
const travelGuideAgent = async (landmark) => {
    console.log(`[Travel Guide Agent] Informing about ${landmark}...`);

    const prompt = `Provide detailed information about "${landmark}" in India.
Include:
1. History and significance.
2. Practical travel tips.
3. Best time to visit.
4. Approximate ticket prices (for Indians and Foreigners).

Format as JSON:
{
  "landmark": "${landmark}",
  "history": "...",
  "tips": ["...", "..."],
  "bestTime": "...",
  "ticketPrices": { "indian": "...", "foreigner": "..." }
}`;

    const systemPrompt = "You are a knowledgeable Indian History & Travel Guide. Provide accurate details. JSON ONLY.";

    try {
        const responseText = await callGroq(prompt, systemPrompt, 0.2);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Travel Guide Agent Error]', error.message);
        throw error;
    }
};

/**
 * Agent 4: Translation Agent
 * Translates content while maintaining cultural context and friendly tone.
 */
const translateAgent = async (text, targetLanguage = "Marathi") => {
    console.log(`[Translation Agent] Translating into ${targetLanguage}...`);

    const prompt = `Translate the following travel-related text into ${targetLanguage}.
Maintain the same friendly, knowledgeable tourism assistant tone.
Text: "${text}"

Requirement: Provide ONLY the translated text. Do not include quotes or extra commentary.`;

    const systemPrompt = `You are a professional ${targetLanguage} translator specializing in Indian tourism. Respond with only the translated string.`;

    try {
        // Use temperature 0.1 for high precision in translation
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 512
        });
        return completion.choices[0]?.message?.content?.trim() ?? "Translation unavailable.";
    } catch (error) {
        console.error('[Translation Agent Error]', error.message);
    }
};

/**
 * Chatbot completion using Groq (plain text response)
 */
const chatCompletion = async (message) => {
    console.log(`[Groq AI] Chat: ${message.substring(0, 30)}...`);

    try {
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful tourism assistant for India. Keep answers concise and friendly.' },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 300
        });
        return completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('[Groq Chat Error]', error.message);
        return `AI service temporarily unavailable: ${error.message}`;
    }
};

/**
 * Agent 5: Nearby Places Agent (AI-Generated)
 * Generates nearby places based on user coordinates and category
 */
const nearbyPlacesAgent = async (lat, lng, category = 'general', radius = 5000) => {
    console.log(`[Nearby Places Agent] Finding ${category} near ${lat}, ${lng}...`);

    const categoryExamples = {
        hospital: 'hospitals, clinics, medical centers',
        police: 'police stations, police outposts',
        pharmacy: 'pharmacies, medical stores, chemists',
        atm: 'ATMs, banks with ATM facilities',
        hostel: 'budget hostels, backpacker lodges, guesthouses',
        restaurant: 'restaurants, cafes, eateries, food stalls',
        'tourist-info': 'tourist information centers, help desks',
        'fire-station': 'fire stations',
        embassy: 'embassies, consulates',
        general: 'useful places like hospitals, police, ATMs, restaurants, pharmacies'
    };

    const prompt = `I am a tourist at latitude ${lat}, longitude ${lng} in India.
Find the nearest 8 ${categoryExamples[category] || category} within approximately ${radius / 1000}km radius.

For each place, provide:
- name: Real or realistic name of the place
- category: One of [hospital, police, pharmacy, atm, hostel, restaurant, tourist-info, fire-station, embassy]
- address: Approximate street address in the area
- phone: Phone number or emergency number (use 100 for police, 108 for ambulance, 1932 for tourist police if unknown)
- distance: Approximate distance in meters from my location
- open24Hours: true/false
- verified: true
- rating: Rating out of 5

IMPORTANT: Return ONLY a valid JSON array of places. Do NOT include markdown code blocks or extra text.

Format:
{
  "places": [
    {
      "name": "...",
      "category": "...",
      "address": "...",
      "phone": "...",
      "distance": 1200,
      "open24Hours": true,
      "verified": true,
      "rating": 4.5,
      "lat": 28.6139,
      "lng": 77.2090
    }
  ]
}

Note: lat and lng should be realistic coordinates near my location (${lat}, ${lng}).`;

    const systemPrompt = 'You are a knowledgeable local guide. Provide realistic nearby places based on the coordinates. Respond ONLY with valid JSON.';

    try {
        const responseText = await callGroq(prompt, systemPrompt, 0.3);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Nearby Places Agent Error]', error.message);
        throw error;
    }
};

/**
 * Calculate Haversine distance between two coordinates (in km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Reorder activities within each day by geographic proximity (nearest-neighbor)
 */
function optimizeDayRoute(activities) {
    if (activities.length <= 1) return activities;
    
    const optimized = [activities[0]];
    const remaining = activities.slice(1);
    
    while (remaining.length > 0) {
        const last = optimized[optimized.length - 1];
        let nearestIdx = 0;
        let nearestDist = Infinity;
        
        for (let i = 0; i < remaining.length; i++) {
            const dist = haversineDistance(last.lat, last.lng, remaining[i].lat, remaining[i].lng);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
            }
        }
        
        const nearest = remaining.splice(nearestIdx, 1)[0];
        nearest.distanceFromPrev = Math.round(nearestDist * 100) / 100; // km
        optimized.push(nearest);
    }
    
    return optimized;
}

/**
 * Validate and optimize the full itinerary
 */
function validateItinerary(itinerary) {
    const optimized = {};
    const warnings = [];
    
    for (const [day, activities] of Object.entries(itinerary)) {
        if (!activities || activities.length === 0) continue;
        
        // Reorder by nearest-neighbor
        const reordered = optimizeDayRoute(activities);
        
        // Check if any day has places too far apart (>15km between consecutive places)
        let maxDist = 0;
        for (let i = 1; i < reordered.length; i++) {
            const dist = haversineDistance(
                reordered[i-1].lat, reordered[i-1].lng,
                reordered[i].lat, reordered[i].lng
            );
            maxDist = Math.max(maxDist, dist);
        }
        
        if (maxDist > 15) {
            warnings.push(`${day}: Some places are ${maxDist.toFixed(1)}km apart. Consider splitting across days.`);
        }
        
        // Calculate total day distance
        const totalDist = reordered.reduce((sum, a, i) => {
            if (i === 0) return 0;
            return sum + haversineDistance(reordered[i-1].lat, reordered[i-1].lng, a.lat, a.lng);
        }, 0);
        
        optimized[day] = reordered.map(a => ({
            ...a,
            distanceFromPrev: a.distanceFromPrev || 0
        }));
        optimized[day]._summary = {
            placeCount: reordered.length,
            totalTravelKm: Math.round(totalDist * 10) / 10,
            maxGapKm: Math.round(maxDist * 10) / 10
        };
    }
    
    return { itinerary: optimized, warnings };
}

module.exports = {
    generateItinerary: generateItineraryAgent,
    generateItineraryAgent,
    recommendPlacesAgent,
    travelGuideAgent,
    chatCompletion,
    translateAgent,
    nearbyPlacesAgent,
    validateItinerary,
    haversineDistance
};
