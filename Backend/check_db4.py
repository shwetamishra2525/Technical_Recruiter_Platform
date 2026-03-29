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
    
    with open("db_dump.txt", "w") as f:
        f.write('--- Interviews ---\n')
        interviews = await db.get_collection("interviews").find().to_list(None)
        for i in interviews:
            f.write(f"Id: {i.get('_id')}, Cand: {i.get('candidate_id')}, JD: {i.get('jd_id')}, Status: {i.get('status')}\n")
            
        f.write('\n--- Candidates ---\n')
        candidates = await db.get_collection("candidates").find().to_list(None)
        for c in candidates:
            f.write(f"Id: {c.get('_id')}, User: {c.get('user_id')}, Name: {c.get('full_name')}\n")
            
        f.write('\n--- JDs ---\n')
        jds = await db.get_collection("job_descriptions").find().to_list(None)
        for j in jds:
            f.write(f"Id: {j.get('_id')}, Title: {j.get('title')}, HR: {j.get('hr_id')}\n")

if __name__ == '__main__':
    asyncio.run(main())
