# Setting Up Local AI with Ollama

To run the AI features (Trip Planner & Chatbot) without OpenAI API keys or quotas, the backend has been migrated to use **Ollama**.

## Step 1: Install Ollama
Download and install Ollama for your OS:
- **Windows/Mac/Linux**: [https://ollama.com/download](https://ollama.com/download)

## Step 2: Download the Phi-3 Model
Open your terminal and run the following command to download and start the Phi-3 model (extremely fast and lightweight):
```bash
ollama run phi3
```
Ensure Ollama is running in the background.

## Step 3: Configure the Backend
The backend defaults to `phi3`. Check your `backend/.env` file:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

## Step 4: Verify the Setup
Run the diagnostic script to ensure the backend can communicate with your local AI:
```bash
cd backend
node test_phi3.js
```

## Step 5: Start the App
Start your backend and frontend as usual:
- **Backend**: `npm run dev`
- **Frontend**: `npm run dev`

The AI Trip Planner and Chatbot will now use your local computer's power to generate responses!
