# jobs_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Union
from pydantic import BaseModel
from job_utils import get_job_data, job_exists
from agents import Agent, Runner, trace
from dotenv import load_dotenv
import json
import os 
from models import *
import uuid 
import time
import random
from pathlib import Path
from collections import Counter

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["http://localhost:3000"] etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/jobs/ids", response_model=List[str])
def list_job_ids():
    """
    Return a list of all available job IDs.
    """
    job_data = get_job_data()
    e = [job.get("id", f"unknown-{i}") for i, job in enumerate(job_data)]
    print(e)
    return e


@app.get("/jobs/{job_id}/ratings", response_model=dict)
async def get_job_rating_distribution(job_id: str):
    """
    Use an AI agent to rate each candidate (1–10) for the given job,
    and return the distribution of those ratings.
    """
    job_folder = Path(APPLICATIONS_FOLDER) / job_id
    if not job_folder.exists() or not job_folder.is_dir():
        raise HTTPException(status_code=404, detail="Job ID not found")

    # find all application JSONs
    app_files = sorted(job_folder.glob("app-*.json"))
    if not app_files:
        raise HTTPException(status_code=404, detail="No applications found for this job")

    # initialize empty distribution
    dist = {str(i): 0 for i in range(1, 11)}

    # for each application, ask an AI agent to assign a 1–10 rating
    for app_path in app_files[:3]:
        with open(app_path) as f:
            candidate = json.load(f)

        # build a prompt from their Q&A responses
        qa_lines = "\n".join(
            f"{item['question']}: {item['response']}"
            for item in candidate.get("responses", [])
        )
        instructions = (
            "You are a hiring committee member. "
            "Read the candidate's responses and assign an integer rating from 1 (poor) to 10 (excellent) "
            "based on their demonstrated skills, clarity, and fit for the role. "
            "Respond with just the number."
        )
        full_prompt = f"{instructions}\n\nCandidate responses:\n{qa_lines}\n\nRating:"

        agent = Agent(
            name="rating-agent",
            instructions=instructions,
            tools=[],
            output_type=int  # or a custom Pydantic model that parses an int
        )
        result = await Runner.run(agent, full_prompt, max_turns=1)
        raw_rating = result.final_output  # should be an int 1–10

        # clamp & record
        rating = max(1, min(10, int(raw_rating)))
        dist[str(rating)] += 1

        print("returning", job_id, dist)
        return {
            "job_id": job_id,
            "rating_distribution": dist
        }

@app.get("/skills/top", response_model=List[str])
async def get_top_skills(n_top: int = 5):
    """
    Scan every application in the `applications/` folder,
    ask an AI agent to pull out the candidate’s key skills,
    then return the top `n_top` most‐common skills.
    """
    base = Path(APPLICATIONS_FOLDER)
    if not base.exists():
        raise HTTPException(status_code=500, detail="Applications directory not found")

    # gather all app json files
    app_files = [
        p for job_dir in base.iterdir() if job_dir.is_dir()
        for p in job_dir.glob("app-*.json")
    ][:3]
    if not app_files:
        raise HTTPException(status_code=404, detail="No applications found")

    counter = Counter()

    # for each application, extract skills via AI
    for path in app_files:
        with open(path) as f:
            candidate = json.load(f)

        # combine all Q&A into one block
        qa_text = "\n".join(
            f"{item['question']}: {item['response']}"
            for item in candidate.get("responses", [])
        )

        instructions = (
            "You are a hiring analyst. "
            "From the following candidate responses, extract the list of distinct skills "
            "(both technical and soft) that the candidate demonstrates or mentions. "
            "Respond with a JSON array of skill strings."
        )
        prompt = f"{instructions}\n\n{qa_text}\n\nSkills:"

        agent = Agent(
            name="skills-extractor",
            instructions=instructions,
            tools=[],
            output_type=List[str]  # expects a Python list of strings
        )
        run = await Runner.run(agent, prompt, max_turns=1)
        skills: List[str] = run.final_output

        # update frequency counts
        for skill in skills:
            counter[skill.strip()] += 1

    # pick the top n_top skills
    top_skills = [skill for skill, _ in counter.most_common(n_top)]
    return top_skills
