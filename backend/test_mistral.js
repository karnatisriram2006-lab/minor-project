const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testMistral() {
    const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'mistral';

    console.log(`--- Ollama ${model} Performance Test ---`);
    console.log('Target URL:', url);

    const prompt = `Itinerary: Hyderabad, 1 day, 5000 INR. Output JSON ONLY: {"day1": []}`;

    try {
        console.log(`Sending request to ${model}...`);
        const startTime = Date.now();
        const response = await axios.post(`${url}/api/generate`, {
            model: model,
            prompt: prompt,
            system: "You are a fast travel planner. Output JSON only.",
            stream: false,
            format: 'json',
            options: {
                temperature: 0.1,
                num_predict: 200
            }
        }, { timeout: 60000 });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Success! Time taken: ${duration}s`);
        console.log('Response Content:', response.data.response);

        try {
            JSON.parse(response.data.response);
            console.log('JSON Parse: SUCCESS');
        } catch (e) {
            console.error('JSON Parse: FAILED');
        }
        console.log(`\nSUCCESS: ${model} is ready and responsive.`);
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error(`FAILURE: Ollama server not running. Run: ollama run ${model}`);
        } else {
            console.error('FAILURE:', err.message);
        }
    }
}

testMistral();
