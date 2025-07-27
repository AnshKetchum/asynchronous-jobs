"use client"

import { useState, useEffect } from "react"
import { resumeApiClient, type Experience, type Project } from "../lib/resume-api"

export function useResumeData() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [experiencesData, projectsData] = await Promise.all([
        resumeApiClient.getAllExperiences(),
        resumeApiClient.getAllProjects(),
      ])

      setExperiences(experiencesData)
      setProjects(projectsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch resume data")
      console.error("Error fetching resume data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addExperience = async (experience: Experience) => {
    await resumeApiClient.addExperience(experience)
    await fetchData()
  }

  const updateExperience = async (index: number, experience: Experience) => {
    await resumeApiClient.updateExperience(index, experience)
    await fetchData()
  }

  const deleteExperience = async (index: number) => {
    await resumeApiClient.deleteExperience(index)
    await fetchData()
  }

  const addProject = async (project: Project) => {
    await resumeApiClient.addProject(project)
    await fetchData()
  }

  const updateProject = async (index: number, project: Project) => {
    await resumeApiClient.updateProject(index, project)
    await fetchData()
  }

  const deleteProject = async (index: number) => {
    await resumeApiClient.deleteProject(index)
    await fetchData()
  }

  return {
    experiences,
    projects,
    loading,
    error,
    refetch: fetchData,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    updateProject,
    deleteProject,
  }
}
