const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testFullItinerary() {
    const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    console.log('--- Ollama Full Itinerary Stress Test ---');
    console.log('Target URL:', url);

    const prompt = `Generate a structured travel itinerary for a tourist visiting Hyderabad for 2 days within 10000 INR. 
Return the response STRICTLY as a JSON object, where keys are 'day1', 'day2', etc., and values are arrays of objects. 
Each object MUST have:
- 'name' (string)
- 'lat' (number)
- 'lng' (number)
- 'description' (string)
- 'type' (string, 'attraction' or 'food')`;

    try {
        console.log('Sending request to Llama 3 (this may take up to 2-3 minutes)...');
        const startTime = Date.now();
        const response = await axios.post(`${url}/api/generate`, {
            model: 'llama3:latest',
            prompt: prompt,
            system: "You are an expert travel planner. Output JSON only.",
            stream: false,
            format: 'json'
        }, { timeout: 300000 });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Success! Time taken: ${duration}s`);
        console.log('Response Content:', response.data.response);

        try {
            JSON.parse(response.data.response);
            console.log('JSON Parse: SUCCESS');
        } catch (e) {
            console.error('JSON Parse: FAILED');
            console.error('Error:', e.message);
        }
    } catch (err) {
        console.error('FAILURE:', err.message);
    }
}

testFullItinerary();
