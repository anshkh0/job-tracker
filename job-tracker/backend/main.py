from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
print("API KEY:", os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    jobDescription: str
    resume: str

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}",
        json={
            "contents": [{
                "role": "user",
                "parts": [{
                    "text": f"""You are a career advisor. Given this job description and resume, give:
1. A match score out of 100
2. Top 3 matching skills
3. Top 3 missing skills
4. One sentence of advice

Job Description:
{req.jobDescription}

Resume:
{req.resume}

Reply in this exact format:
Score: X/100
Matching skills: x, y, z
Missing skills: x, y, z
Advice: ..."""
                }]
            }]
        }
    )
    data = response.json()
    print("Gemini response:", data)  # add this
    if "candidates" not in data:
        return {"result": f"Error: {data}"}
    return {"result": data["candidates"][0]["content"]["parts"][0]["text"]}