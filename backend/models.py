from pydantic import BaseModel
from typing import List 

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
    responses: List[JobApplicationResponse]

class JobApplicationSubmission(BaseModel):
    response: JobApplicationResponses
    job_id: str

# Job Relevancy Evaluation objects
class CompanyCandidateRelevancyEvaluation(BaseModel):
    score: float
    candidate_pros: List[str]
    candidate_cons: List[str]