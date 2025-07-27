import json 
import os
from pydantic import BaseModel
from agents import RunContextWrapper, FunctionTool
from utils import fix_schema_for_openai
from typing import Any
from agents import Agent, Runner, trace

# Pydantic model for GetResumeTool's arguments
class GetResumeTool(BaseModel):
    pass

async def get_resume(ctx: RunContextWrapper[Any], args: str):
    with open("test_data/resume/resume-ansh.json", 'r') as f:
        resume = json.load(f)
    return resume

# (2.3) Build and modify the JSON schema
resume_tool_schema = GetResumeTool.model_json_schema()
resume_tool_schema = fix_schema_for_openai(resume_tool_schema)

# (2.4) Instantiate the FunctionTool for starting a container
ResumeRetrievalTool = FunctionTool(
    name="get_resume",
    description=(
        "Retrieve the resume of the client."
    ),
    params_json_schema=resume_tool_schema,
    on_invoke_tool=get_resume,
)
