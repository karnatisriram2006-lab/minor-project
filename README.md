# Incredible India – Smart Tourist Assistance Application

A fully functional end-to-end tourism platform for India with AI-powered itinerary planning, intelligent route optimization, and real-time travel features.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, ShadCN UI, React Leaflet
- **Backend**: Node.js, Express, MongoDB, JWT Authentication
- **AI**: OpenAI GPT-3.5 Turbo
- **Maps**: OpenStreetMap, OSRM (Open Source Routing Machine), Leaflet Routing Machine

## Core Modules

1. **Authentication**: JWT-based registration and login with nationality/language support.
2. **AI Trip Planner**: Generates day-by-day structured itineraries with real coordinates.
3. **Route Optimizer**: Uses Dijkstra's algorithm to find the shortest visiting order for multiple stops.
4. **Real Road Routing**: OSRM-powered intelligent routing between tourist attractions.
5. **Animated Travel Path**: Visual representation of travel routes with moving markers.
6. **Finance & Budget**: Fuel cost estimator and a smart budget breakdown (40/20/20/10/10 rule).
7. **Social & Support**: Travel companion matching based on interest similarity and a 24/7 AI tourism chatbot.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. `npm run dev`

### AI Engine (Optional)
1. `cd ai-engine`
2. `pip install -r requirements.txt`
3. `python main.py`

## Usage
- Register/Login to access personalized features.
- Visit **/trip-planner** for AI-generated itineraries.
- Visit **/route-planner** to build custom routes and optimize them with Dijkstra.
- Use the **Floating Chatbot** anywhere for instant tourism advice.
