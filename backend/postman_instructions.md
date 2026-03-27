# API Testing Instructions (Postman)

Use the following details to test the "Incredible India" backend APIs. Ensure your server is running on `http://localhost:5000`.

## 1. AI Itinerary Generator
**Endpoint**: `POST http://localhost:5000/api/ai/itinerary`  
**Description**: Generates a day-by-day travel plan using OpenAI. If no API key is found, it returns unique mock data.

**Headers**: `Content-Type: application/json`
**Body (JSON)**:
```json
{
  "city": "Jaipur",
  "days": 3,
  "budget": "high",
  "interests": ["History", "Architecture", "Food"]
}
```

---

## 2. Route Optimizer (Dijkstra)
**Endpoint**: `POST http://localhost:5000/api/route/optimize`  
**Description**: Uses Dijkstra's algorithm (Nearest Neighbor) to find the shortest path between multiple tourist locations.

**Headers**: `Content-Type: application/json`
**Body (JSON)**:
```json
{
  "locations": [
    { "name": "Hawa Mahal", "lat": 26.9239, "lng": 75.8267 },
    { "name": "Amer Fort", "lat": 26.9855, "lng": 75.8513 },
    { "name": "City Palace", "lat": 26.9258, "lng": 75.8237 }
  ]
}
```

---

## 3. Budget Calculator
**Endpoint**: `POST http://localhost:5000/api/budget`  
**Description**: Calculates the 40/20/20/10/10 allocation for a given total budget.

**Headers**: `Content-Type: application/json`
**Body (JSON)**:
```json
{
  "totalBudget": 50000
}
```

---

## 4. Tourism Chatbot
**Endpoint**: `POST http://localhost:5000/api/chat`  
**Description**: A conversational AI assistant for travel queries.

**Headers**: `Content-Type: application/json`
**Body (JSON)**:
```json
{
  "message": "What is the best time to visit Rajasthan?"
}
```

---

## 5. User Authentication (Registration)
**Endpoint**: `POST http://localhost:5000/api/auth/register`  
**Headers**: `Content-Type: application/json`
**Body (JSON)**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "nationality": "American",
  "language": "English"
}
```
