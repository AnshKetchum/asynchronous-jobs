# jobs_api.py
from fastapi import FastAPI
from typing import List, Union
from pydantic import BaseModel
from job_utils import get_job_data, job_exists
from agents import Agent, Runner, trace
from dotenv import load_dotenv
import json
import os 
from models import *
import uuid 
import time

# CONSTANTS
TURNS = 2
APPLICATIONS_FOLDER = "applications"
SERVER_CONVERSATION_DATA = "server_data/conversations"

# 1) Load .env to get OPENAI_API_KEY
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise EnvironmentError("Please set the OPENAI_API_KEY environment variable (e.g. in a .env file).")

app = FastAPI()

# Job Relevancy Evaluation objects
class CompanyCandiateRelevancyEvaluation(BaseModel):
    score: float
    candidate_pros: List[str]
    candidate_cons: List[str]
    
class FeedbackRequest(BaseModel):
    description: str
    candidate_pitch: str
    candidate_resume: dict

async def log_data(job_description: str, candidate_pitch: str, company_feedback: dict):
    current_time = str(time.time())

    #TODO: Add in the application information, to see what questions are most useful questions commonly being asked?
    
    # Verify that the client data directory exists
    os.makedirs(SERVER_CONVERSATION_DATA, exist_ok=True)

    with open(os.path.join(SERVER_CONVERSATION_DATA, f"record-{current_time}.json"), "w") as f:
        data = {
            "description" : job_description,
            "candidate_pitch" : candidate_pitch,
            "company_feedback" : company_feedback
        }
        json.dump(data, f)


@app.get("/jobs/get", response_model=List[dict])
def list_jobs():
    return get_job_data()

@app.post("/jobs/feedback", response_model=CompanyCandiateRelevancyEvaluation)
async def get_feedback(payload: FeedbackRequest):
    description = payload.description
    candidate_pitch = payload.candidate_pitch
    candidate_resume = str(payload.candidate_resume)

    ### SERVER SIDE
    COMPANY_INTERNAL_REVIEW_PROMPT = f"""
        A staffing agent has reached out to you about this job description: 
        
        {description}

        Here's her message: 
        
        {candidate_pitch}

        Here's the candidate's resume: 
        
        {candidate_resume}

        Internally evaluate whether the candiate would be a good fit for the job description, and for the company. Come up with reasons for why this candidate would be able to perform the responsibilities highlighted in the description, and potential drawbacks. Then, provide a rating on a scale of 1-10 on why the candidate may be a good fit, with 10 being the best, and 0 being absolutely underqualified. 
    
    """

    # Initialize the server agent
    server_agent = Agent(
            name=f"server-agent",
            instructions="You are Sammy, a human resources agent that works with clients and representatives to identify good fits for prospective hires.",
            tools=[],
            output_type=CompanyCandiateRelevancyEvaluation
    )

    company_response = await Runner.run(
        server_agent,
        COMPANY_INTERNAL_REVIEW_PROMPT,
        max_turns=TURNS,
    )
    
    print("GOT COMPANY RESPONSE", company_response)
    
    await log_data(description, candidate_pitch, company_response.final_output.model_dump())
    return company_response.final_output

@app.post("/jobs/apply")
async def apply_to_job(payload: JobApplicationSubmission):
    
    # Verify that the job exists
    if not job_exists(payload.job_id):
        return {"status" : "failure"}

    applications_save_path = os.path.join(APPLICATIONS_FOLDER, payload.job_id)
    os.makedirs(applications_save_path, exist_ok = True)

    app_id = str(uuid.uuid4())
    with open(os.path.join(applications_save_path, f"app-{app_id}.json"), "w") as f:
        json.dump(payload.response.model_dump(), f)

    return {"status" : "success"}
    