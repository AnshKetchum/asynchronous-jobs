import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import asyncio
from client_loop import async_client_loop, get_top_pros_data, get_top_cons_data  # assumes client_loop.py is in the same directory
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import os 
import json 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["http://localhost:3000"] etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def periodic_client_loop(interval_seconds: int = 43200):  # 12 hours
    while True:
        print("Running client loop...")
        await asyncio.to_thread(async_client_loop)
        await asyncio.sleep(interval_seconds)

@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(periodic_client_loop())

# 1) shared request models

class TimeFrame(BaseModel):
    start_time: datetime
    end_time: datetime

class TopNRequest(TimeFrame):
    n: int

class TotalsResponse(BaseModel):
    total_applications: int
    relevant_matches: int
    approved: int

class ReasonPercent(BaseModel):
    reason: str
    percent: str

# 2) three dummy routes
CLIENT_DATA_DIR = "client_data"


@app.post("/applications/totals/summary", response_model=TotalsResponse)
async def get_totals(req: TimeFrame):
    # Convert datetime objects to float timestamps
    if isinstance(req.start_time, datetime):
        start_time = req.start_time.timestamp()
    else:
        start_time = float(req.start_time)

    if isinstance(req.end_time, datetime):
        end_time = req.end_time.timestamp()
    else:
        end_time = float(req.end_time)

    total_applications = 0
    relevant_matches = 0
    approved = 0

    for filename in os.listdir(CLIENT_DATA_DIR):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(CLIENT_DATA_DIR, filename)
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
        except Exception:
            continue

        timestamp_str = data.get("timestamp")
        if timestamp_str is None:
            continue

        try:
            timestamp = float(timestamp_str)
        except ValueError:
            continue

        if not (start_time <= timestamp <= end_time):
            continue

        total_applications += 1

        internal_review = data.get("internal_review", {})
        internal_score = internal_review.get("score")
        if isinstance(internal_score, (int, float)) and internal_score > 5.0:
            relevant_matches += 1

        company_feedback = data.get("company_feedback", {})
        company_score = None
        if isinstance(company_feedback, dict):
            company_score = company_feedback.get("score")

        if isinstance(company_score, (int, float)) and company_score > 5.0:
            approved += 1

    return TotalsResponse(
        total_applications=total_applications,
        relevant_matches=relevant_matches,
        approved=approved
    )

@app.post("/applications/totals/pros", response_model=List[ReasonPercent])
async def get_top_pros(req: TopNRequest):
    start_ts = req.start_time.timestamp()
    end_ts   = req.end_time.timestamp()

    d = await get_top_pros_data(start_ts, end_ts, req.n)
    print(d)
    return d

@app.post("/applications/totals/cons", response_model=List[ReasonPercent])
async def get_top_cons(req: TopNRequest):
    start_ts = req.start_time.timestamp()
    end_ts   = req.end_time.timestamp()
    return await get_top_cons_data(start_ts, end_ts, req.n)



ROUTERS_CONFIG_PATH = "routers.json"  # change this if needed

@app.get("/routers", response_model=List[str])
async def get_all_routers():
    try:
        with open(ROUTERS_CONFIG_PATH, "r") as f:
            config = json.load(f)
            routers = config.get("routers", [])
            if not isinstance(routers, list):
                return JSONResponse(status_code=500, content={"error": "'routers' should be a list"})
            return routers
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"error": "routers.json file not found"})
    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON format in routers.json"})

RESUME_PATH = "test_data/resume/resume-ansh.json"

# Shared base models
class Experience(BaseModel):
    company: str
    location: str = ""
    role: str
    date: str
    description: str

class Project(BaseModel):
    title: str
    description: str

# Resume loading/saving helpers
def load_resume():
    print("Opening resume", RESUME_PATH)
    try:
        print(os.path.exists(RESUME_PATH))
        with open(RESUME_PATH, "r") as f:
            d = json.load(f)
            print("GOT", d)
            return d
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load resume: {str(e)}")

def save_resume(resume_data):
    try:
        with open(RESUME_PATH, "w") as f:
            json.dump(resume_data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")


# ------------------- EXPERIENCE ROUTES -------------------

@app.post("/resume/experience")
async def add_experience(exp: Experience):
    resume = load_resume()
    resume.setdefault("experiences", []).append(exp.dict())
    save_resume(resume)
    return {"message": "Experience added successfully"}

@app.put("/resume/experience/{index}")
async def update_experience(index: int, exp: Experience):
    resume = load_resume()
    try:
        resume["experiences"][index] = exp.dict()
    except IndexError:
        raise HTTPException(status_code=404, detail="Experience index out of range")
    save_resume(resume)
    return {"message": "Experience updated successfully"}

@app.delete("/resume/experience/{index}")
async def delete_experience(index: int):
    resume = load_resume()
    try:
        del resume["experiences"][index]
    except IndexError:
        raise HTTPException(status_code=404, detail="Experience index out of range")
    save_resume(resume)
    return {"message": "Experience deleted successfully"}

@app.get("/resume/experience", response_model=List[Experience])
async def get_all_experiences():
    resume = load_resume()
    return resume.get("experiences", [])

@app.get("/resume/experience/{index}", response_model=Experience)
async def get_experience(index: int):
    resume = load_resume()
    experiences = resume.get("experiences", [])
    try:
        return experiences[index]
    except IndexError:
        raise HTTPException(status_code=404, detail="Experience index out of range")



# ------------------- PROJECT ROUTES -------------------

@app.post("/resume/project")
async def add_project(project: Project):
    resume = load_resume()
    resume.setdefault("projects", []).append(project.dict())
    save_resume(resume)
    return {"message": "Project added successfully"}

@app.put("/resume/project/{index}")
async def update_project(index: int, project: Project):
    resume = load_resume()
    try:
        resume["projects"][index] = project.dict()
    except IndexError:
        raise HTTPException(status_code=404, detail="Project index out of range")
    save_resume(resume)
    return {"message": "Project updated successfully"}

@app.delete("/resume/project/{index}")
async def delete_project(index: int):
    resume = load_resume()
    try:
        del resume["projects"][index]
    except IndexError:
        raise HTTPException(status_code=404, detail="Project index out of range")
    save_resume(resume)
    return {"message": "Project deleted successfully"}

@app.get("/resume/project", response_model=List[Project])
async def get_all_projects():
    resume = load_resume()
    print("LOADED RESUME", resume)
    return resume.get("projects", [])

@app.get("/resume/project/{index}", response_model=Project)
async def get_project(index: int):
    resume = load_resume()
    projects = resume.get("projects", [])
    try:
        return projects[index]
    except IndexError:
        raise HTTPException(status_code=404, detail="Project index out of range")
