import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "ai_recruiter_db"

import certifi
# Fix for Windows SSL Certificate Verify Failed
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.get_database("ai_recruiter_db")

# Collections
users_collection = db.get_collection("users")
jds_collection = db.get_collection("job_descriptions")
candidates_collection = db.get_collection("candidates")
interviews_collection = db.get_collection("interviews")
