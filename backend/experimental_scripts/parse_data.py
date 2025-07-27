import json 
import os

def get_resume(filepath):
    with open(filepath, 'r') as f:
        resume = json.load(f)
    return resume

def get_job_data(job_folders: str): 
    assert os.path.exists(job_folders)

    jobs = []
    for path in os.listdir(job_folders):
        job_folder_path = os.path.join(job_folders, path)

        with open(os.path.join(job_folder_path, "description.txt"), 'r') as f:
            description = f.read()

        with open(os.path.join(job_folder_path, "questions.json"), 'r') as f:
            questions = json.load(f)

        jobs.append({
            "description" : description,
            "questions" : questions
        })

    return jobs

if __name__ == "__main__":
    
    # Test the resume retrieval tool
    print(get_resume("test_data/resume/resume-ansh.json"))

    # Test the job description retrieval tool
    print(get_job_data("test_data/jobs"))