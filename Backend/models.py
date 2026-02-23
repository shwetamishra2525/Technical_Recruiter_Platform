from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from typing import List, Optional, Literal, Annotated
from datetime import datetime
from bson import ObjectId

# Create a custom type that accepts ObjectId or str and converts to str
# This handles the breakdown where Pydantic expects str but receives ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    email: EmailStr
    password: str
    role: Literal["hr", "candidate"]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class JobDescriptionModel(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    title: str
    skills: List[str]
    requirements: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    hr_id: Optional[PyObjectId] = None # User ID of the HR who created it

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CandidateProfileModel(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: str
    full_name: str
    resume_text: str # Parsed text
    resume_url: Optional[str] = None # Path to file if stored
    skills: List[str] = []
    experience_years: Optional[float] = 0
    matched_jds: dict = {} # Cache of JD matches
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class InterviewModel(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    candidate_id: str
    jd_id: str
    questions: List[dict] = [] # List of {question: str, answer: str, score: int}
    total_score: float = 0
    status: Literal["pending", "completed"] = "pending"
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
