const API_BASE_URL = "http://127.0.0.1:8005"

export interface Experience {
  company: string
  location?: string
  role: string
  date: string
  description: string
}

export interface Project {
  title: string
  description: string
}

export class ResumeApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Experience methods
  async addExperience(experience: Experience): Promise<{ message: string }> {
    return this.request("/resume/experience", {
      method: "POST",
      body: JSON.stringify(experience),
    })
  }

  async updateExperience(index: number, experience: Experience): Promise<{ message: string }> {
    return this.request(`/resume/experience/${index}`, {
      method: "PUT",
      body: JSON.stringify(experience),
    })
  }

  async deleteExperience(index: number): Promise<{ message: string }> {
    return this.request(`/resume/experience/${index}`, {
      method: "DELETE",
    })
  }

  async getAllExperiences(): Promise<Experience[]> {
    return this.request("/resume/experience")
  }

  async getExperience(index: number): Promise<Experience> {
    return this.request(`/resume/experience/${index}`)
  }

  // Project methods
  async addProject(project: Project): Promise<{ message: string }> {
    return this.request("/resume/project", {
      method: "POST",
      body: JSON.stringify(project),
    })
  }

  async updateProject(index: number, project: Project): Promise<{ message: string }> {
    return this.request(`/resume/project/${index}`, {
      method: "PUT",
      body: JSON.stringify(project),
    })
  }

  async deleteProject(index: number): Promise<{ message: string }> {
    return this.request(`/resume/project/${index}`, {
      method: "DELETE",
    })
  }

  async getAllProjects(): Promise<Project[]> {
    return this.request("/resume/project")
  }

  async getProject(index: number): Promise<Project> {
    return this.request(`/resume/project/${index}`)
  }
}

export const resumeApiClient = new ResumeApiClient()
