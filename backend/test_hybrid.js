const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/ai';

const testHybrid = async () => {
    console.log('--- Starting Hybrid Itinerary Test ---');

    // 1. Test Dataset (Agra is in our dataset)
    console.log('\n[Test 1] Requesting Agra (Should use Dataset)...');
    try {
        const res1 = await axios.post(`${BASE_URL}/itinerary`, { city: 'Agra', days: 1 });
        console.log('Response received (truncated):', JSON.stringify(res1.data).substring(0, 100) + '...');
    } catch (e) {
        console.error('Test 1 failed:', e.message);
    }

    // 2. Test Cache (Agra-1 should now be in cache)
    console.log('\n[Test 2] Requesting Agra again (Should be Cache Hit)...');
    try {
        const res2 = await axios.post(`${BASE_URL}/itinerary`, { city: 'Agra', days: 1 });
        console.log('Response received (truncated):', JSON.stringify(res2.data).substring(0, 100) + '...');
    } catch (e) {
        console.error('Test 2 failed:', e.message);
    }

    // 3. Test Fallback (Unknown city should call Ollama)
    console.log('\n[Test 3] Requesting Unknown City (Should call Ollama)...');
    try {
        const res3 = await axios.post(`${BASE_URL}/itinerary`, { city: 'Mysore', days: 1 });
        console.log('Response received (truncated):', JSON.stringify(res3.data).substring(0, 100) + '...');
    } catch (e) {
        console.error('Test 3 failed:', e.message);
    }
};

testHybrid();
