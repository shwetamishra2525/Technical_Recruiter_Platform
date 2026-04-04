from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client.technical_recruiter

print("testing connection...")
print("Collections:", db.list_collection_names())

print("\n--- JDs ---")
for jd in db.jds.find():
    print(f"[{jd['_id']}] Title: {jd.get('title')}, HR: {jd.get('hr_id')}")

print("\n--- CANDIDATES ---")
for c in db.candidates.find():
    print(f"[{c['_id']}] Name: {c.get('full_name')}, User: {c.get('user_id')}")

print("\n--- INTERVIEWS ---")
for i in db.interviews.find():
    print(f"[{i['_id']}] JD: {i.get('jd_id')}, Cand: {i.get('candidate_id')}, Status: {i.get('status')}")
