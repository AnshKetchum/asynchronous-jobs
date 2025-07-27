import os
import json
import asyncio
from typing import List, Union
from agents import Agent, Runner, trace
from dotenv import load_dotenv
from pydantic import BaseModel
from agent_tools import ResumeRetrievalTool
from job_utils import get_job_data
import uuid
import requests
from models import *
import time 

# 1) Load .env to get OPENAI_API_KEY
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise EnvironmentError("Please set the OPENAI_API_KEY environment variable (e.g. in a .env file).")

CLIENT_DATA_DIR = "client_data"

def get_resume(filepath = "test_data/resume/resume-ansh.json"):
    with open(filepath, 'r') as f:
        resume = json.load(f)
    return resume

def get_companies_from_router(config_path="routers.json"):
    all_companies = []

    # Load router base URLs from JSON file
    with open(config_path, "r") as f:
        config = json.load(f)
        router_bases = config.get("routers", [])

    for router_base in router_bases:
        url = f"{router_base}/companies/get"
        try:
            r = requests.get(url)
            r.raise_for_status()
            companies = r.json()
            print(f"Got from {router_base}:", companies)
            all_companies.extend(companies)
        except Exception as e:
            print(f"Failed to get companies from {router_base}: {e}")

    return all_companies
    
def get_jobs(company_url: str): 
    url = f"{company_url}/jobs/get"
    r = requests.get(url)
    
    json_response = r.json()
    print("Got Jobs", json_response)
    return json_response
    
def get_company_feedback(company_url: str, description: str, candidate_pitch: str):
    url = f"{company_url}/jobs/feedback"
    payload = {
        "description": description,
        "candidate_pitch": candidate_pitch,
        "candidate_resume" : get_resume()
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
        return None

def apply_to_job(company_url: str, job_application: JobApplicationResponses, job_id: str):
    job_submission = JobApplicationSubmission(
        response=job_application,
        job_id=job_id
    )
    url = f"{company_url}/jobs/apply"
    payload = job_submission.model_dump()

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
        return None


# Job Relevancy Evaluation objects
class JobRelevancyEvaluation(BaseModel):
    score: float
    justification: str

TURNS = 2
RELEVANT_JOB_THRESHOLD = 5 

def log_data(job_description: str, internal_review: JobRelevancyEvaluation, company_feedback: Union[str, CompanyCandidateRelevancyEvaluation]) -> str:
    current_time = str(time.time())

    # Verify that the client data directory exists
    os.makedirs(CLIENT_DATA_DIR, exist_ok=True)

    processed_company_feedback = {}
    if isinstance(company_feedback, CompanyCandidateRelevancyEvaluation):
        processed_company_feedback = company_feedback.model_dump()

    filename = f"record-{current_time}.json"
    filepath = os.path.join(CLIENT_DATA_DIR, filename)

    data = {
        "timestamp": current_time,  # Add raw timestamp
        # Optionally add human-readable datetime:
        "datetime": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(current_time))),
        "description": job_description,
        "internal_review": internal_review.model_dump(),
        "company_feedback": processed_company_feedback
    }

    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

    return current_time


def client_loop():

    # Retrieve companies from the router
    companies = get_companies_from_router() 
    
    for company_url in companies:
        jobs = get_jobs(company_url)

        for job in jobs:
            # Initialize the client agent
            client_agent = Agent(
                    name=f"client-agent",
                    instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                    tools=[ResumeRetrievalTool],
                    output_type=JobRelevancyEvaluation
            )

            description = job["description"]
            company_response = ""

            INTERNAL_REVIEW_PROMPT = f"""
                Here is a description for a job by a company:
                
                {description}
                
                Please compare the client's resume and determine whether the candidate would be a good fit, based on his resume. Output a rating on 
                a scale of 0-10, 10 being extremely qualified, and 0 meaning the client has zero observable qualifications. Then, provide a justification for your rating, citing specific evidence. 
            """

            internal_review = Runner.run_sync(
                client_agent, 
                INTERNAL_REVIEW_PROMPT,
                max_turns=TURNS,
            ).final_output
            print("Client agent came up with ", internal_review, "for internal review")

            # If the job isn't relevant, move on
            if internal_review.score < RELEVANT_JOB_THRESHOLD:
                # client_log_data_on_conversation(description, company, internal_review.model_dump())
                continue
        
            REQUEST_SERVER_REVIEW_PROMPT = f"""
                Draft a message to reach out to the human-resources for the company. Introduce yourself and your candidate, and then discuss about how your candidate is looking for a job, and highlight why you feel he is a relevant fit for the job. 
            """
            
            client_agent = Agent(
                    name=f"client-agent",
                    instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                    tools=[ResumeRetrievalTool],
            )

            candidate_pitch = Runner.run_sync(
                client_agent, 
                REQUEST_SERVER_REVIEW_PROMPT,
                max_turns=TURNS,
            ).final_output

            print("\n\n")
            print("Client agent came up with ", candidate_pitch, "for candidate pitch")

            # Request feedback from the company
            company_feedback = get_company_feedback(company_url, description, candidate_pitch)

            print("\n\n")
            print("Got company feedback", company_feedback)
            company_response = CompanyCandidateRelevancyEvaluation.model_validate(company_feedback)
        
            if company_response.score >= RELEVANT_JOB_THRESHOLD:
                application  = JobApplicationQuestions.model_validate(job["questions"])

                JOB_APPLICATION_QUESTIONS_PROMPT = f"""
                    Here is a job application. 
                    
                    {application.model_dump_json()}
                
                    Fill out the questions using data you have on the client. Make sure that you type out the question exactly as listed in the response.
                """

                application_agent = Agent(
                        name=f"client-agent",
                        instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                        tools=[ResumeRetrievalTool],
                        output_type=JobApplicationResponses
                )

                application_filled = Runner.run_sync(
                    application_agent,
                    JOB_APPLICATION_QUESTIONS_PROMPT,
                    max_turns=2 * TURNS,
                ).final_output
                
                # Apply to the application 
                job_id = job["id"]
                apply_to_job(company_url, application_filled, job_id)

            print("\n\n")
            print("Filled out job application with the following data", application_filled)
            
            # Log data
            log_data(description, internal_review, company_response)

async def async_client_loop():

    # Retrieve companies from the router
    companies = await asyncio.to_thread(get_companies_from_router)

    for company_url in companies:
        jobs = await asyncio.to_thread(get_jobs, company_url)

        for job in jobs:
            # Initialize the client agent
            client_agent = Agent(
                    name=f"client-agent",
                    instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                    tools=[ResumeRetrievalTool],
                    output_type=JobRelevancyEvaluation
            )

            description = job["description"]
            company_response = ""

            INTERNAL_REVIEW_PROMPT = f"""
                Here is a description for a job by a company:
                
                {description}
                
                Please compare the client's resume and determine whether the candidate would be a good fit, based on his resume. Output a rating on 
                a scale of 0-10, 10 being extremely qualified, and 0 meaning the client has zero observable qualifications. Then, provide a justification for your rating, citing specific evidence. 
            """

            internal_review = await asyncio.to_thread(
                Runner.run_sync,
                client_agent, 
                INTERNAL_REVIEW_PROMPT,
                max_turns=TURNS,
            )
            internal_review = internal_review.final_output
            print("Client agent came up with ", internal_review, "for internal review")

            if internal_review.score < RELEVANT_JOB_THRESHOLD:
                continue
        
            REQUEST_SERVER_REVIEW_PROMPT = f"""
                Draft a message to reach out to the human-resources for the company. Introduce yourself and your candidate, and then discuss about how your candidate is looking for a job, and highlight why you feel he is a relevant fit for the job. 
            """
            
            client_agent = Agent(
                    name=f"client-agent",
                    instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                    tools=[ResumeRetrievalTool],
            )

            candidate_pitch = await asyncio.to_thread(
                Runner.run_sync,
                client_agent, 
                REQUEST_SERVER_REVIEW_PROMPT,
                max_turns=TURNS,
            )
            candidate_pitch = candidate_pitch.final_output

            print("\n\n")
            print("Client agent came up with ", candidate_pitch, "for candidate pitch")

            # Request feedback from the company
            company_feedback = await asyncio.to_thread(
                get_company_feedback,
                company_url, description, candidate_pitch
            )

            print("\n\n")
            print("Got company feedback", company_feedback)
            company_response = CompanyCandidateRelevancyEvaluation.model_validate(company_feedback)
        
            if company_response.score >= RELEVANT_JOB_THRESHOLD:
                application = JobApplicationQuestions.model_validate(job["questions"])

                JOB_APPLICATION_QUESTIONS_PROMPT = f"""
                    Here is a job application. 
                    
                    {application.model_dump_json()}
                
                    Fill out the questions using data you have on the client. Make sure that you type out the question exactly as listed in the response.
                """

                application_agent = Agent(
                        name=f"client-agent",
                        instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                        tools=[ResumeRetrievalTool],
                        output_type=JobApplicationResponses
                )

                application_filled = await asyncio.to_thread(
                    Runner.run_sync,
                    application_agent,
                    JOB_APPLICATION_QUESTIONS_PROMPT,
                    max_turns=2 * TURNS,
                )
                application_filled = application_filled.final_output

                job_id = job["id"]
                await asyncio.to_thread(
                    apply_to_job,
                    company_url, application_filled, job_id
                )

            print("\n\n")
            print("Filled out job application with the following data", application_filled)

            await asyncio.to_thread(
                log_data, description, internal_review, company_response
            )

class TopNRequest(BaseModel):
    start_time: float
    end_time: float
    n: int

# Response model for a reason and its percentage
class ReasonPercent(BaseModel):
    reason: str
    percent: str

class ModelReasons(BaseModel):
    reasons: List[ReasonPercent]
    
async def summarize_reasons(kind: str, n: int) -> List[ReasonPercent]:
    """
    Read the most recent 5 JSON log files from CLIENT_DATA_DIR and extract the top `n` reasons
    of type `kind` ('pros' or 'cons') using an AI agent asynchronously.
    """
    # Select top 5 JSON files by filename sort (descending)
    files = sorted(
        [f for f in os.listdir(CLIENT_DATA_DIR) if f.endswith('.json')],
        reverse=True
    )[:10]

    print(files)
    

    # Aggregate items from company_feedback
    entries = []
    for fname in files:
        path = os.path.join(CLIENT_DATA_DIR, fname)
        with open(path, 'r') as f:
            data = json.load(f)
        feedback = data.get('company_feedback', {})
        key = 'candidate_pros' if kind == 'pros' else 'candidate_cons'
        items = feedback.get(key, [])
        entries.extend(items)

    combined = "\n- ".join(entries)
    instruction = (
        "You are an analyst that reads hiring feedback and extracts the top strengths observed by companies."
        if kind == 'pros' else
        "You are an analyst that reads hiring feedback and extracts the top areas for improvement noticed by companies."
    )
    prompt = (
        f"{instruction}\n\nHere are the collected items from the last 5 feedback logs:\n- {combined}\n\n"
        f"List the top {n} distinct reasons along with the approximate percentage of logs that mentioned each reason. "
        "Respond as a JSON array of objects {\"reason\": string, \"percent\": string}."
    )

    agent = Agent(
        name="summary-agent",
        instructions=instruction,
        tools=[],
        output_type=ModelReasons
    )
    # Use async run to avoid blocking the event loop
    run_result = await Runner.run(agent, prompt, max_turns=2)
    result = run_result.final_output.reasons

    print(result)

    return result

async def get_top_pros_data(start_time: float, end_time: float, n: int) -> List[ReasonPercent]:
    return await summarize_reasons(kind='pros', n=n)


async def get_top_cons_data(start_time: float, end_time: float, n: int) -> List[ReasonPercent]:
    return await summarize_reasons(kind='cons', n=n)
 
if __name__ == "__main__":
    client_loop()