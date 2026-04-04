import asyncio
import os
from dotenv import load_dotenv
from bson import ObjectId
import pymongo

from database import db, jds_collection, interviews_collection, candidates_collection, users_collection

async def main():
    print("Fetching HR dashboard data simulation...")
    
    # 1. Get an HR user to mimic
    hr_user = await users_collection.find_one({"role": "hr"})
    if not hr_user:
        print("No HR user found.")
        return
        
    print(f"Simulating HR: {hr_user['email']} (ID: {hr_user['_id']})")
    
    # 2. Fetch JDs for this HR
    jds_cursor = jds_collection.find({"hr_id": str(hr_user["_id"])}).sort("created_at", pymongo.DESCENDING)
    hr_jd_ids = []
    async for jd in jds_cursor:
        hr_jd_ids.append(str(jd["_id"]))
        
    print(f"HR JD IDs ({len(hr_jd_ids)}): {hr_jd_ids}")
    
    if not hr_jd_ids:
        print("HR has no JDs. They will see nothing.")
        # Try finding ANY HR with JDs
        hr_users = await users_collection.find({"role": "hr"}).to_list(100)
        for h in hr_users:
            c = await jds_collection.count_documents({"hr_id": str(h["_id"])})
            if c > 0:
                print(f"HR {h['email']} has {c} JDs!")
        return

    # 3. Filter interviews
    interview_query = {"jd_id": {"$in": hr_jd_ids}}
    print(f"Interview Query: {interview_query}")
    
    interviews = await interviews_collection.find(interview_query).to_list(100)
    print(f"Interviews found: {len(interviews)}")
    
    for i in interviews:
        print(f"  Interview ID: {i['_id']}, Cand ID: {i.get('candidate_id')}, JD ID: {i.get('jd_id')}")

if __name__ == "__main__":
    asyncio.run(main())
