const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

/**
 * Helper to call Ollama generate API
 */
const callOllama = async (prompt, systemPrompt = "") => {
    try {
        const timeoutValue = 600000; // 10 minutes (maximum patience for local AI)
        console.log(`[Ollama] Sending request to ${OLLAMA_MODEL}...`);

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            system: systemPrompt,
            stream: false,
            format: 'json',
            options: {
                temperature: 0.1,
                num_ctx: 2048,
                num_predict: 1000,
                top_k: 20
            }
        }, { timeout: timeoutValue });

        console.log(`[Ollama] ${OLLAMA_MODEL} response received.`);
        return response.data.response;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error(`Ollama (${OLLAMA_MODEL}) took too long to respond. Your machine might be under heavy load.`);
        }
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`Ollama server not running. Start it with "ollama run ${OLLAMA_MODEL}".`);
        }
        throw error;
    }
};

/**
 * Robustly parse JSON from AI response
 */
const parseAIJSON = (text) => {
    try {
        // Try direct parse
        return JSON.parse(text);
    } catch (e) {
        // Try extracting JSON block if markdown is present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerError) {
                console.error('[Ollama Parser] Failed to parse extracted JSON block');
            }
        }
        throw new Error('AI returned invalid JSON format');
    }
};

/**
 * Agent 1: Travel Planning Agent
 * Generate a detailed travel itinerary
 */
const generateItineraryAgent = async (city, days, interests, budget) => {
    console.log(`[Itinerary Agent] Planning ${days} days in ${city}...`);

    const prompt = `Plan a ${days}-day trip to ${city}, India.
User Interests: ${interests}
Budget Level: ${budget}

Requirement: Provide a day-by-day itinerary in JSON format.
Each day should have a list of activities.
Activities must include: name, description (max 10 words), time, type (e.g., 'culture', 'food', 'landmark').

Format:
{
  "itinerary": {
    "day1": [
      { "name": "...", "description": "...", "time": "09:00 AM", "type": "...", "lat": 27.1751, "lng": 78.0421 }
    ],
    ...
  }
}
Note: Strictly include accurate latitude and longitude for every place in India.`;

    const systemPrompt = "You are a professional Indian Travel Planner. Respond ONLY with valid JSON.";

    try {
        const responseText = await callOllama(prompt, systemPrompt);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Itinerary Agent Error]', error.message);
        throw error;
    }
};

/**
 * Agent 2: Place Recommendation Agent
 * Suggest places based on preferences and popularity
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
        const responseText = await callOllama(prompt, systemPrompt);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Recommendation Agent Error]', error.message);
        throw error;
    }
};

/**
 * Agent 3: Travel Guide Agent
 * Provide detailed information about landmarks
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
        const responseText = await callOllama(prompt, systemPrompt);
        return parseAIJSON(responseText);
    } catch (error) {
        console.error('[Travel Guide Agent Error]', error.message);
        throw error;
    }
};

/**
 * Chatbot completion using Ollama
 */
const chatCompletion = async (message) => {
    console.log(`[Ollama AI] Chat: ${message.substring(0, 30)}...`);

    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: message,
            system: "You are a helpful tourism assistant for India. Keep answers concise.",
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 200
            }
        }, { timeout: 60000 });

        return response.data.response;
    } catch (error) {
        console.error('[Ollama Chat Error]', error.message);
        return `Ollama (${OLLAMA_MODEL}) is unavailable. Ensure it is running.`;
    }
};

module.exports = {
    generateItinerary: generateItineraryAgent, // Maintain naming for compatibility
    generateItineraryAgent,
    recommendPlacesAgent,
    travelGuideAgent,
    chatCompletion
};

