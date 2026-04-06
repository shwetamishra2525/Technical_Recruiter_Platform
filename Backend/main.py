from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
import uvicorn
import os
from fastapi.staticfiles import StaticFiles
from mangum import Mangum

# Ensure uploads directory exists in /tmp
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="AI Recruiter API")

# Mount StaticFiles from /tmp (Note: Vercel storage is ephemeral)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "AI Recruiter API is running"}

# Vercel handler
handler = Mangum(app)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
