import json 
import os

def get_job_data(job_folders: str = "test_data/jobs"): 
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
            "questions" : questions,
            "id" : questions["id"]
        })

    return jobs

def job_exists(job_id: str , job_folders: str = "test_data/jobs"): 
    assert os.path.exists(job_folders)

    jobs = []
    for path in os.listdir(job_folders):
        job_folder_path = os.path.join(job_folders, path)

        with open(os.path.join(job_folder_path, "questions.json"), 'r') as f:
            questions = json.load(f)

            if questions["id"] == job_id:
                return True

    return False

if __name__ == "__main__":

    # Test the job description retrieval tool
    print(get_job_data("test_data/jobs"))