const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testOllama() {
    const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    console.log('--- Ollama Connectivity Test ---');
    console.log('Target URL:', url);

    try {
        console.log('Checking Ollama server status...');
        const tags = await axios.get(`${url}/api/tags`);
        console.log('Ollama is RUNNING.');
        console.log('Available Models:', tags.data.models.map(m => m.name).join(', '));

        console.log('\nTesting Llama 3 generation...');
        const response = await axios.post(`${url}/api/generate`, {
            model: 'llama3:latest',
            prompt: 'Say "Ollama Connection Successful"',
            stream: false
        }, { timeout: 60000 });

        console.log('AI Response:', response.data.response);
        console.log('\nSUCCESS: Backend is ready for local AI features.');
    } catch (err) {
        console.error('\nFAILURE: Could not connect to Ollama.');
        if (err.code === 'ECONNREFUSED') {
            console.error('ERROR: Ollama server is not running on', url);
            console.error('Please install Ollama from https://ollama.com and run "ollama run llama3"');
        } else {
            console.error('Error Details:', err.message);
        }
    }
}

testOllama();
