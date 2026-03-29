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

module.exports = {
    generateItinerary: generateItineraryAgent,
    generateItineraryAgent,
    recommendPlacesAgent,
    travelGuideAgent,
    chatCompletion,
    translateAgent
};
