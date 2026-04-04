import asyncio
import os
from dotenv import load_dotenv
import pymongo
from database import db, jds_collection, interviews_collection, candidates_collection, users_collection

async def main():
    hr_users = await users_collection.find({'role': 'hr'}).to_list(100)
    for hr in hr_users:
        jds_cursor = jds_collection.find({'hr_id': str(hr['_id'])})
        hr_jd_ids = [str(jd['_id']) async for jd in jds_cursor]
        if hr_jd_ids:
            interviews = await interviews_collection.find({'jd_id': {'$in': hr_jd_ids}}).to_list(100)
            print(f"HR {hr['email']} has {len(hr_jd_ids)} JDs and {len(interviews)} interviews.")
        else:
            print(f"HR {hr['email']} has 0 JDs.")

asyncio.run(main())
