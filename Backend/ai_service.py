import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found. AI features will fail.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')

    async def generate_interview_questions(self, resume_text: str, jd_text: str):
        prompt = f"""
        You are an expert technical interviewer. Based on the Job Description and Candidate's Resume, generate 5 technical and behavioral interview questions.
        
        Job Description:
        {jd_text}
        
        Candidate Resume:
        {resume_text}
        
        Output a strict JSON list of strings:
        ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
        """
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error generating questions: {e}")
            return [
                "Tell me about yourself and your experience.",
                "Why are you interested in this position?",
                "Describe a challenging technical problem you solved.",
                "How do you handle tight deadlines?",
                "What is your preferred tech stack and why?"
            ]

    async def evaluate_answer(self, question: str, answer: str):
        prompt = f"""
        Evaluate the following answer to the interview question.
        
        Question: {question}
        Answer: {answer}
        
        Return JSON format only:
        {{
            "score": 0,  // Integer 1-10
            "feedback": "Short constructive feedback text"
        }}
        """
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return {"score": 5, "feedback": "Could not evaluate at this time."}

    async def parse_resume(self, resume_text: str):
        """
        Helper to extract info if needed, similar to previous logic but kept internal or separate.
        """
        prompt = f"""
        Analyze the resume text.
        Resume: {resume_text}
        Return JSON: {{"full_name": "Name", "skills": ["Skill1"], "experience_years": 0.0}}
        """
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except:
            return {"full_name": "Unknown", "skills": [], "experience_years": 0}

gemini_service = GeminiService()
