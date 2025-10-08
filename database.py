from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, GEOSPHERE
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = None
        self.database = None

    async def connect(self):
        self.client = AsyncIOMotorClient(
            os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        )
        self.database = self.client.busnav
        await self.create_indexes()

    async def disconnect(self):
        if self.client:
            self.client.close()

    async def create_indexes(self):
        # Create geospatial indexes
        await self.database.buses.create_index([("current_location", GEOSPHERE)])
        await self.database.stops.create_index([("location", GEOSPHERE)])
        
        # Create other indexes
        await self.database.buses.create_index([("bus_id", ASCENDING)], unique=True)
        await self.database.routes.create_index([("route_id", ASCENDING)], unique=True)
        await self.database.stops.create_index([("stop_id", ASCENDING)], unique=True)
        await self.database.crowding_data.create_index([
            ("stop_id", ASCENDING), 
            ("day_of_week", ASCENDING), 
            ("hour_of_day", ASCENDING)
        ])

database = Database()
