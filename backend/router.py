from fastapi import FastAPI
from typing import List

app = FastAPI()

# DUMMY DATA 
COMPANY_SERVER_URL = "http://localhost:8002"
router_companies = [
    COMPANY_SERVER_URL
]

@app.get("/companies/get", response_model=List[str])
def get_items():
    return router_companies