const axios = require('axios');

const API_URL = 'http://localhost:5000/api/ai';

async function testAgents() {
    console.log('--- Testing AI Agents ---');

    // 1. Travel Planning Agent
    try {
        console.log('\n[Testing Travel Planning Agent]');
        const itineraryRes = await axios.post(`${API_URL}/itinerary`, {
            city: 'Agra',
            days: 2,
            budget: 'Medium',
            interests: 'History'
        });
        console.log('Itinerary Keys:', Object.keys(itineraryRes.data.itinerary || itineraryRes.data));
    } catch (e) { console.error('Itinerary failed:', e.code || e.message); }

    // 2. Place Recommendation Agent
    try {
        console.log('\n[Testing Place Recommendation Agent]');
        const recommendRes = await axios.post(`${API_URL}/recommend`, {
            preferences: 'Peaceful cafes and gardens',
            location: 'Jaipur'
        });
        console.log('Recommendations:', recommendRes.data.recommendations?.length || 0, 'found');
    } catch (e) { console.error('Recommendation failed:', e.code || e.message); }

    // 3. Travel Guide Agent
    try {
        console.log('\n[Testing Travel Guide Agent]');
        const guideRes = await axios.post(`${API_URL}/chat`, {
            message: 'Tell me about the history of the Taj Mahal.'
        });
        console.log('Guide Reply:', guideRes.data.reply ? 'Success' : 'Empty');
    } catch (e) { console.error('Guide failed:', e.code || e.message); }
}

testAgents();
