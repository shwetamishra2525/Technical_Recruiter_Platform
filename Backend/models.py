from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class UserModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    password: str
    role: Literal["hr", "candidate"]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class JobDescriptionModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    skills: List[str]
    requirements: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    hr_id: str # User ID of the HR who created it

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CandidateProfileModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    full_name: str
    resume_text: str # Parsed text
    resume_url: Optional[str] = None # Path to file if stored
    skills: List[str] = []
    experience_years: Optional[float] = 0
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class InterviewModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    candidate_id: str
    jd_id: str
    questions: List[dict] = [] # List of {question: str, answer: str, score: int}
    total_score: float = 0
    status: Literal["pending", "completed"] = "pending"
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
