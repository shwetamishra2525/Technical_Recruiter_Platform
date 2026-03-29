import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import traceback
import asyncio

load_dotenv()

class GeminiService:
    def __init__(self):
        # Gather all API keys starting with GEMINI_API_KEY
        self.api_keys = []
        for key, value in os.environ.items():
            if key.startswith("GEMINI_API_KEY") and value:
                self.api_keys.append(value)
                
        # Ensure we capture all 6 keys explicitly from env just to be safe
        explicit_keys = [
            os.getenv("GEMINI_API_KEY"),
            os.getenv("GEMINI_API_KEY2"),
            os.getenv("GEMINI_API_KEY3"),
            os.getenv("GEMINI_API_KEY4"),
            os.getenv("GEMINI_API_KEY5"),
            os.getenv("GEMINI_API_KEY6")
        ]
        
        for key in explicit_keys:
            if key and key not in self.api_keys:
                self.api_keys.append(key)

        self.current_key_index = 0

        if not self.api_keys:
            print("WARNING: No GEMINI_API_KEY found. AI features will fail.")
            self.model = None
        else:
            self._configure_current_key()

    def _configure_current_key(self):
        if not self.api_keys:
            return
        current_key = self.api_keys[self.current_key_index]
        print(f"Configuring Gemini with API Key index: {self.current_key_index}")
        genai.configure(api_key=current_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def _rotate_key(self):
        if len(self.api_keys) > 1:
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            print(f"Rotating API Key... Switched to key index {self.current_key_index}")
            self._configure_current_key()
            return True
        return False

    async def _generate_with_retry(self, prompt, retries=12): # Increased retries to cycle through all 6 keys safely
        for attempt in range(retries):
            try:
                response = await self.model.generate_content_async(prompt)
                print("response--------", response)
                return response
            except Exception as e:
                error_msg = str(e)
                # Catch 429 errors or Quota Exceeded
                if "429" in error_msg or "Quota exceeded" in error_msg or "Resource has been exhausted" in error_msg:
                    print(f"Quota exceeded (429) on key {self.current_key_index}.")
                    # Try to rotate the key instead of just wait
                    rotated = self._rotate_key()
                    if rotated and attempt < retries - 1:
                        print(f"Retrying with new key... (Attempt {attempt+1}/{retries})")
                        # Short delay before retry with new key
                        await asyncio.sleep(1)
                        continue
                    elif attempt < retries - 1:
                        # Fallback to waiting if no other keys or rotation failed
                        wait_time = (2 ** attempt) * 4 # 4s, 8s, 16s, 32s, 64s
                        print(f"No more keys. Retrying in {wait_time}s... (Attempt {attempt+1}/{retries})")
                        await asyncio.sleep(wait_time)
                    else:
                        raise e
                else:
                    raise e

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
            response = await self._generate_with_retry(prompt)
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
            response = await self._generate_with_retry(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return {"score": 5, "feedback": "Could not evaluate at this time."}

    async def evaluate_all_answers(self, qa_pairs: list):
        prompt = f"""
        Evaluate the following answers to the interview questions.
        
        Q&A Pairs:
        {json.dumps(qa_pairs, indent=2)}
        
        Return exactly a JSON list of evaluations matching the order of questions. No markdown framing, just the JSON array:
        [
            {{
                "score": 0,  // Integer 1-10
                "feedback": "Overall assessment for this specific answer"
            }},
            ...
        ]
        """
        try:
            response = await self._generate_with_retry(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            if not text.startswith('['):
                 start = text.find('[')
                 end = text.rfind(']') + 1
                 if start != -1 and end != -1:
                    text = text[start:end]
            return json.loads(text)
        except Exception as e:
            print(f"Error evaluating all answers: {e}")
            return [{"score": 5, "feedback": "Could not evaluate at this time."} for _ in qa_pairs]

    async def parse_resume(self, resume_text: str):
        prompt = f"""
        Analyze the submitted text to determine if it is a valid professional resume/CV.
        
        Text to Analyze:
        {resume_text[:2000]}
        
        Extract the following details in JSON. Do your best to find a name and skills even if the document looks like a mock or is very minimal.
        Always return "valid": true.
        
        {{
            "valid": true,
            "full_name": "Candidate Name",
            "skills": ["Skill1", "Skill2"],
            "experience_years": 3.5
        }}
        """
        try:
            response = await self._generate_with_retry(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            
            # Clean up potential leading/trailing characters
            if not text.startswith('{'):
                start = text.find('{')
                end = text.rfind('}') + 1
                if start != -1 and end != -1:
                    text = text[start:end]
            
            data = json.loads(text)
            
            if not data.get("valid", True): # Default to true if missing, but prompt should catch it
                return {"full_name": "Invalid Document", "skills": [], "experience_years": 0, "error": data.get("error")}
                
            return data
            
        except Exception as e:
            print(f"Error parsing resume: {e}")
            return {"full_name": "Unknown", "skills": [], "experience_years": 0, "error": str(e)}

    async def parse_jd(self, jd_text: str):
        prompt = f"""
        Analyze the submitted text to extract job description details.
        
        Text to Analyze:
        {jd_text[:3000]}
        
        Extract the following details in JSON. Even if the text is a mock, simple, or test job description, do your best to extract a title, skills, and requirements.
        Always return "valid": true.
        
        {{
            "valid": true,
            "title": "Job Title (e.g., Software Engineer)",
            "skills": ["Skill1", "Skill2"],
            "requirements": "A concise summary of the key requirements and responsibilities (max 3-4 sentences)."
        }}
        """
        try:
            response = await self._generate_with_retry(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            
            if not text.startswith('{'):
                start = text.find('{')
                end = text.rfind('}') + 1
                if start != -1 and end != -1:
                    text = text[start:end]
            
            data = json.loads(text)
            
            if not data.get("valid", True): 
                return {"title": "Invalid Document", "skills": [], "requirements": "", "error": data.get("error")}
                
            return data
            
        except Exception as e:
            print(f"Error parsing JD: {e}")
            return {"title": "Unknown", "skills": [], "requirements": "", "error": str(e)}

    async def match_jds(self, resume_text: str, jds: list):
        """
        Rank JDs based on resume match.
        jds: List of dicts with 'id', 'title', 'requirements', 'skills'
        """
        # Prepare JD summary for prompt
        jds_summary = []
        for jd in jds:
            jds_summary.append({
                "id": str(jd["id"]), # Ensure string ID
                "title": jd["title"],
                "skills": jd["skills"]
            })
        
        prompt = f"""
        You are a recruitment AI. Match the candidate's resume to the available Job Descriptions.
        
        Candidate Resume:
        {resume_text[:3000]}  // Truncate if too long to save tokens
        
        Available Jobs:
        {json.dumps(jds_summary, indent=2)}
        
        Task:
        1. Analyze how well the resume matches each job.
        2. Assign a "match_score" (0-100) for each job.
        3. Return a JSON list of objects, sorted by match_score descending.
        
        Output format JSON ONLY:
        [
            {{ "id": "job_id_1", "match_score": 95, "reason": "Strong skill match..." }},
            {{ "id": "job_id_2", "match_score": 60, "reason": "Missing React experience..." }}
        ]
        """
        try:
            response = await self._generate_with_retry(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            if not text.startswith('['):
                 start = text.find('[')
                 end = text.rfind(']') + 1
                 if start != -1 and end != -1:
                    text = text[start:end]
            return json.loads(text)
        except Exception as e:
            print(f"Error matching JDs: {e}")
            return []

gemini_service = GeminiService()
