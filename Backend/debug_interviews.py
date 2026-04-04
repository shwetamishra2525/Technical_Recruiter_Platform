import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.technical_recruiter

async def main():
    print("--- HRs ---")
    async for u in db.users.find({"role": "hr"}):
        print(f"User ID: {u['_id']}, Email: {u['email']}")

    print("\n--- Candidates ---")
    async for c in db.candidates.find():
        print(f"Cand ID: {c['_id']}, User ID: {c.get('user_id')}, Name: {c.get('full_name')}")

    print("\n--- Interviews ---")
    async for i in db.interviews.find():
        print(f"Int ID: {i['_id']}, Cand ID: {i.get('candidate_id')}, JD ID: {i.get('jd_id')}, Status: {i.get('status')}")

asyncio.run(main())
