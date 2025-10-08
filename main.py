from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import database
from app.routers import buses, routes, stops, feedback, crowding
from app.utils.websocket_manager import websocket_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await database.connect()
    print("Connected to database")
    yield
    # Shutdown
    await database.disconnect()
    print("Disconnected from database")

app = FastAPI(
    title="BusNav API",
    description="Backend for BusNav - Smart Bus Companion",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(buses.router, prefix="/api/buses", tags=["buses"])
app.include_router(routes.router, prefix="/api/routes", tags=["routes"])
app.include_router(stops.router, prefix="/api/stops", tags=["stops"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(crowding.router, prefix="/api/crowding", tags=["crowding"])

@app.get("/")
async def root():
    return {"message": "BusNav API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2023-01-01T00:00:00Z"}

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await websocket_manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
