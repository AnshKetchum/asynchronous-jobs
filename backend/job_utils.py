import json 
import os
import shutil
import uuid

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

def create_job(description: str, questions: dict, job_folders: str = "test_data/jobs") -> str:
    os.makedirs(job_folders, exist_ok=True)
    job_id = questions.get("id") or str(uuid.uuid4())
    questions["id"] = job_id
    job_dir = os.path.join(job_folders, f"{job_id}")
    os.makedirs(job_dir, exist_ok=True)

    with open(os.path.join(job_dir, "description.txt"), 'w') as f:
        f.write(description)

    with open(os.path.join(job_dir, "questions.json"), 'w') as f:
        json.dump(questions, f, indent=2)

    return job_id

def delete_job(job_id: str, job_folders: str = "test_data/jobs") -> bool:
    for path in os.listdir(job_folders):
        job_folder_path = os.path.join(job_folders, path)
        try:
            with open(os.path.join(job_folder_path, "questions.json"), 'r') as f:
                questions = json.load(f)
                if questions["id"] == job_id:
                    shutil.rmtree(job_folder_path)
                    return True
        except FileNotFoundError:
            continue
    return False

def update_job(job_id: str, new_description: str = None, new_questions: dict = None, job_folders: str = "test_data/jobs") -> bool:
    for path in os.listdir(job_folders):
        job_folder_path = os.path.join(job_folders, path)
        try:
            with open(os.path.join(job_folder_path, "questions.json"), 'r') as f:
                questions = json.load(f)
                if questions["id"] == job_id:
                    # Save new description if provided
                    if new_description:
                        with open(os.path.join(job_folder_path, "description.txt"), 'w') as desc_file:
                            desc_file.write(new_description)
                    # Save new questions if provided
                    if new_questions:
                        new_questions["id"] = job_id  # ensure ID doesn't change
                        with open(os.path.join(job_folder_path, "questions.json"), 'w') as q_file:
                            json.dump(new_questions, q_file, indent=2)
                    return True
        except FileNotFoundError:
            continue
    return False


if __name__ == "__main__":

    # Test the job description retrieval tool
    print(get_job_data("test_data/jobs"))