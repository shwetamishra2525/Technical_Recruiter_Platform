from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List
from models import UserModel, JobDescriptionModel, CandidateProfileModel, InterviewModel
from database import users_collection, jds_collection, candidates_collection, interviews_collection
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from ai_service import gemini_service
from services.mail_service import send_status_email
from bson import ObjectId
import fitz # PyMuPDF

router = APIRouter()

# --- Auth Routes ---
@router.post("/auth/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserModel):
    try:
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user.password = get_password_hash(user.password)
        new_user = await users_collection.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
        created_user = await users_collection.find_one({"_id": new_user.inserted_id})
        return {"id": str(created_user["_id"]), "email": created_user["email"], "role": created_user["role"]}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
async def login(login_data: dict):
    user = await users_collection.find_one({"email": login_data.get("email")})
    if not user or not verify_password(login_data.get("password"), user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"], "id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}

# --- HR Routes ---
@router.post("/hr/create-jd", response_model=JobDescriptionModel)
async def create_jd(jd: JobDescriptionModel, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "hr":
        raise HTTPException(status_code=403, detail="Only HR can create JDs")
    
    jd.hr_id = current_user["id"]
    new_jd = await jds_collection.insert_one(jd.model_dump(by_alias=True, exclude=["id"]))
    created_jd = await jds_collection.find_one({"_id": new_jd.inserted_id})
    return created_jd

@router.get("/hr/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "hr":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    total_candidates = await candidates_collection.count_documents({})
    pending_reviews = await interviews_collection.count_documents({"status": "pending"})
    
    candidates_cursor = candidates_collection.find().limit(20)
    candidates_list = []
    async for cand in candidates_cursor:
        interview = await interviews_collection.find_one({"candidate_id": str(cand["_id"])})
        score = interview["total_score"] if interview else 0
        candidates_list.append({
            "id": str(cand["_id"]),
            "name": cand["full_name"],
            "role": "Applicant",
            "score": score,
            "status": interview["status"] if interview else "New"
        })
        
    return {
        "stats": {
            "total_applicants": total_candidates,
            "pending_reviews": pending_reviews
        },
        "candidates": candidates_list
    }

@router.post("/hr/update-status/{candidate_id}")
async def update_candidate_status(candidate_id: str, status_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "hr":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    new_status = status_data.get("status")
    
    candidate = await candidates_collection.find_one({"_id": ObjectId(candidate_id)})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Send Email
    user = await users_collection.find_one({"_id": ObjectId(candidate["user_id"])})
    if user:
        await send_status_email(user["email"], new_status, candidate["full_name"])
    
    return {"message": f"Candidate {new_status} and email sent."}

# --- Candidate Routes ---

@router.post("/candidate/upload-resume")
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can upload resumes")
    
    # Read file content
    content = await file.read()
    
    # Extract text using PyMuPDF (fitz)
    text_content = ""
    try:
        if file.filename.endswith(".pdf"):
            with fitz.open(stream=content, filetype="pdf") as doc:
                for page in doc:
                    text_content += page.get_text()
        else:
            text_content = content.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Extraction Error: {e}")
        text_content = content.decode("utf-8", errors="ignore") # Fallback

    if not text_content.strip():
        text_content = "Could not extract text from resume."

    # Parse with AI
    parsed_data = await gemini_service.parse_resume(text_content)
    
    candidate_profile = CandidateProfileModel(
        user_id=current_user["id"],
        full_name=parsed_data.get("full_name", "Unknown"),
        resume_text=text_content,
        skills=parsed_data.get("skills", []),
        experience_years=parsed_data.get("experience_years", 0)
    )
    
    existing = await candidates_collection.find_one({"user_id": current_user["id"]})
    if existing:
        await candidates_collection.update_one({"_id": existing["_id"]}, {"$set": candidate_profile.model_dump(exclude=["id"])})
    else:
        await candidates_collection.insert_one(candidate_profile.model_dump(by_alias=True, exclude=["id"]))
        
    return {"message": "Resume uploaded successfully", "data": parsed_data}

@router.post("/candidate/start-interview/{jd_id}")
async def start_interview(jd_id: str, current_user: dict = Depends(get_current_user)):
    candidate = await candidates_collection.find_one({"user_id": current_user["id"]})
    if not candidate:
        raise HTTPException(status_code=400, detail="Please upload resume first")
        
    jd = await jds_collection.find_one({"_id": ObjectId(jd_id)})
    if not jd:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Generate Questions
    questions = await gemini_service.generate_interview_questions(candidate["resume_text"], jd["requirements"])
    
    interview_data = InterviewModel(
        candidate_id=str(candidate["_id"]),
        jd_id=jd_id,
        questions=[{"question": q, "answer": "", "score": 0} for q in questions],
        status="pending"
    )
    
    new_interview = await interviews_collection.insert_one(interview_data.model_dump(by_alias=True, exclude=["id"]))
    return {"interview_id": str(new_interview.inserted_id), "questions": questions}

@router.post("/candidate/submit-answer/{interview_id}")
async def submit_answer(interview_id: str, answer_data: dict):
    interview = await interviews_collection.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    idx = answer_data["question_index"]
    ans = answer_data["answer"]
    
    # Evaluate
    question = interview["questions"][idx]["question"]
    eval_result = await gemini_service.evaluate_answer(question, ans)
    
    # Update DB
    await interviews_collection.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {
            f"questions.{idx}.answer": ans,
            f"questions.{idx}.score": eval_result["score"]
        }}
    )
    
    # Recalculate Total
    interview = await interviews_collection.find_one({"_id": ObjectId(interview_id)})
    total_score = sum(q.get("score", 0) for q in interview["questions"]) / len(interview["questions"])
    await interviews_collection.update_one({"_id": ObjectId(interview_id)}, {"$set": {"total_score": total_score}})
    
    return eval_result
