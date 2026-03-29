import asyncio
import motor.motor_asyncio
import os
import certifi
from dotenv import load_dotenv

async def main():
    load_dotenv()
    uri = os.getenv('MONGO_URI')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri, tlsCAFile=certifi.where())
    db = client.get_database("ai_recruiter_db")
    
    print('--- Interviews ---')
    interviews = await db.get_collection("interviews").find().to_list(None)
    for i in interviews:
        print(f"Id: {i.get('_id')}, Cand: {i.get('candidate_id')}, JD: {i.get('jd_id')}, Status: {i.get('status')}")
        
    print('--- Candidates ---')
    candidates = await db.get_collection("candidates").find().to_list(None)
    for c in candidates:
        print(f"Id: {c.get('_id')}, User: {c.get('user_id')}, Name: {c.get('full_name')}")
        
    print('--- JDs ---')
    jds = await db.get_collection("job_descriptions").find().to_list(None)
    for j in jds:
        print(f"Id: {j.get('_id')}, Title: {j.get('title')}, HR: {j.get('hr_id')}")

if __name__ == '__main__':
    asyncio.run(main())
