import os
import json
import asyncio
from typing import List
from agents import Agent, Runner, trace
from dotenv import load_dotenv
from pydantic import BaseModel
from agent_tools import ResumeRetrievalTool
from job_utils import get_job_data
import uuid

# 1) Load .env to get OPENAI_API_KEY
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise EnvironmentError("Please set the OPENAI_API_KEY environment variable (e.g. in a .env file).")

# 6) Asynchronous "main" function that runs a 4-step demo
def main():
    agent = Agent(
            name=f"test",
            instructions="You are a staffing agent that helps clients apply for job applications.",
            tools=[ResumeRetrievalTool],
    )

    o = Runner.run_sync(
            agent, 
            "Tell me about Ansh.",
            max_turns= 5,
        ).final_output

    print(o)
    
# Job Relevancy Evaluation objects
class JobRelevancyEvaluation(BaseModel):
    score: float
    justification: str

# Job Relevancy Evaluation objects
class CompanyCandidateRelevancyEvaluation(BaseModel):
    score: float
    candidate_pros: List[str]
    candidate_cons: List[str]

class JobApplicationResponse(BaseModel):
    question: str
    response: str

class JobApplicationQuestion(BaseModel):
    expected_response: str
    type: str
    question: str

class JobApplicationQuestions(BaseModel):
    questions: List[JobApplicationQuestion]

class JobApplicationResponses(BaseModel):
    responses: List[JobApplicationQuestion]
    
TURNS = 2
RELEVANT_JOB_THRESHOLD = 5 

def client_log_data_on_conversation():
    print("Logging conversation data ... ")

def server_log_data_on_conversation():
    print("Logging conversation data ... ")

def run_conversation():

    # Client agent first retrieves job data from the server
    job_data = get_job_data()
    
    # For each job description, the client first internally verifies that this is a relevant job
    # Then, the client asks the server agent to provide feedback 
    print("Initializing agentic conversation.")
    company = "zyphra"
    for job in job_data:
        # Initialize the client agent
        client_agent = Agent(
                name=f"client-agent",
                instructions="You are Alicia, a staffing agent that helps clients apply for job applications.",
                tools=[ResumeRetrievalTool],
                output_type=JobRelevancyEvaluation
        )

        description = job["description"]

        INTERNAL_REVIEW_PROMPT = f"""
            Here is a description for a job by a company. Please compare the client's resume and determine whether the candidate would be a good fit, based on his resume. Output a rating on 
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

        ### SERVER SIDE
        
        COMPANY_INTERNAL_REVIEW_PROMPT = f"""
            A staffing agent has reached out to you about this job description: 
            
            {description}

            Here's her message: 
            
            {candidate_pitch}

            Internally evaluate whether the candiate would be a good fit for the job description, and for the company. Come up with reasons for why this candidate would be able to perform the responsibilities highlighted in the description, and potential drawbacks. Then, provide a rating on a scale of 1-10 on why the candidate may be a good fit, with 10 being the best, and 0 being absolutely underqualified. 
        
        """

        # Initialize the server agent
        server_agent = Agent(
                name=f"server-agent",
                instructions="You are Sammy, a human resources agent that works with clients and representatives to identify good fits for prospective hires.",
                tools=[],
                output_type=CompanyCandidateRelevancyEvaluation
        )
        company_response = Runner.run_sync(
            server_agent,
            COMPANY_INTERNAL_REVIEW_PROMPT,
            max_turns=TURNS,
        ).final_output
        print("\n\n")
        print("Company responded with ", company_response)

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

            print("\n\n")
            print("Filled out job application with the following data", application_filled)

        # client_log_data_on_conversation(description, company, internal_review.model_dump(), company_response)
    print("Completed agentic conversation")

if __name__ == "__main__":
    run_conversation()
