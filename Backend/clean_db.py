from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "tech_recruitment_db")

print(f"Connecting to MongoDB at {MONGO_URI}...")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def clean_database():
    print("--- Starting Database Cleanup ---")
    
    # Drop JDs
    jds_result = db.jds.delete_many({})
    print(f"Deleted {jds_result.deleted_count} Job Descriptions.")
    
    # Drop Candidates
    candidates_result = db.candidates.delete_many({})
    print(f"Deleted {candidates_result.deleted_count} Candidate Profiles.")
    
    # Drop Interviews
    interviews_result = db.interviews.delete_many({})
    print(f"Deleted {interviews_result.deleted_count} Interview Records.")
    
    print("--- Cleanup Complete ---")
    print("Your database is now clean. Please log back in as HR and upload new Job Descriptions.")

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete all JDs, Candidates, and Interviews? This cannot be undone. (y/n): ")
    if confirm.lower() == 'y':
        clean_database()
    else:
        print("Cleanup aborted.")
