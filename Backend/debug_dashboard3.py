import os, pymongo, certifi, datetime
from dotenv import load_dotenv
load_dotenv('backend/.env')
db = pymongo.MongoClient(os.getenv('MONGO_URI'), tlsCAFile=certifi.where()).get_database('ai_recruiter_db')

print("Recent JDs:")
jds = list(db.job_descriptions.find({}).sort('created_at', pymongo.DESCENDING).limit(10))
for jd in jds:
    print(f"JD {jd['_id']} by HR {jd['hr_id']} at {jd.get('created_at')}")

print("\nRecent Interviews:")
interviews = list(db.interviews.find({}).sort('created_at', pymongo.DESCENDING).limit(10))
for i in interviews:
    print(f"{i['_id']}: Candidate {i['candidate_id']} for JD {i['jd_id']} on {i.get('created_at')} status {i.get('status')}")
