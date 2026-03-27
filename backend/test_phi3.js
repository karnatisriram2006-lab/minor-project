const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testPhi3() {
    const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'phi3';

    console.log(`--- Ollama ${model} Performance Test ---`);
    console.log('Target URL:', url);

    const prompt = `PLAN A TRIP TO Hyderabad FOR EXACTLY 3 DAYS. 
YOU MUST PROVIDE A SEPARATE KEY FOR EVERY DAY FROM 'day1' to 'day3'.
MAX 3 items per day. KEEP DESCRIPTIONS UNDER 10 WORDS.

STRICT JSON SCHEMA:
{
  "day1": [{"name": "Name", "lat": 0.0, "lng": 0.0, "description": "...", "type": "attraction", "time": "09:00 AM"}],
  "day2": [...],
  "day3": [...]
}`;

    try {
        console.log(`Sending request to ${model}...`);
        const startTime = Date.now();
        const response = await axios.post(`${url}/api/generate`, {
            model: model,
            prompt: prompt,
            system: "You are a travel database. Output ONLY valid JSON in the requested schema. No characters outside the JSON object. No conversation.",
            stream: false,
            format: 'json',
            options: {
                temperature: 0.1,
                num_ctx: 4096,
                num_predict: 3000
            }
        }, { timeout: 120000 });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Success! Time taken: ${duration}s`);
        console.log('Response Content:', response.data.response);

        try {
            JSON.parse(response.data.response);
            console.log('JSON Parse: SUCCESS');
        } catch (e) {
            console.error('JSON Parse: FAILED');
            console.log('--- RAW RESPONSE START ---');
            console.log(response.data.response);
            console.log('--- RAW RESPONSE END ---');
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

testPhi3();
