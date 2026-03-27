from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
from optimizer import nearest_neighbor_tsp, optimize_budget

app = FastAPI(title="Incredible India AI Engine", version="1.0.0")

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Place(BaseModel):
    id: Optional[str] = None
    name: str
    lat: float
    lng: float
    # Allow extra fields to be passed through transparently
    model_config = {
        "extra": "allow"
    }

class RouteRequest(BaseModel):
    places: List[Dict[str, Any]]

class BudgetRequest(BaseModel):
    totalBudget: float

@app.get("/")
def read_root():
    return {"status": "Incredible India AI Engine is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/optimize-route")
def optimize_route(request: RouteRequest):
    try:
        optimized = nearest_neighbor_tsp(request.places)
        return {"optimizedRoute": optimized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-budget")
def get_budget_allocation(request: BudgetRequest):
    try:
        allocation = optimize_budget(request.totalBudget)
        return {"allocation": allocation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
