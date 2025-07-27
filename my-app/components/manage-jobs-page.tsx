"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Trash2,
  Save,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings,
  Users,
  Calendar,
  Eye,
} from "lucide-react"
import { LiveIndicator } from "./live-indicator"

const API_BASE_URL = "http://127.0.0.1:8002"

interface Question {
  question: string
  type: "short_answer" | "multiple_choice"
  expected_response: string
  options?: string[]
}

interface JobData {
  id: string
  title: string
  description: string
  questions: Question[]
  created_at?: string
  applications_count?: number
}

interface EditingJob extends JobData {
  isEditing: boolean
}

export function ManageJobsPage() {
  const [jobs, setJobs] = useState<EditingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<{ [key: string]: "idle" | "success" | "error" }>({})
  const [updateMessages, setUpdateMessages] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/jobs/get`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform the data to match our interface
      const transformedJobs: EditingJob[] = data.map((job: any, index: number) => {
        // Parse the description to extract title and description
        const lines = job.description?.split("\n") || []
        const title = lines[0] || `Job ${index + 1}`
        const description = lines.slice(2).join("\n") || job.description || ""

        return {
          id: job.id || `job-${index}`,
          title,
          description,
          questions: job.questions?.questions || [],
          isEditing: false,
          created_at: job.created_at,
          applications_count: Math.floor(Math.random() * 50), // Mock data
        }
      })

      setJobs(transformedJobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs")
      console.error("Error fetching jobs:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleEdit = (jobId: string) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, isEditing: !job.isEditing } : job)))
    // Clear any previous status messages
    setUpdateStatus((prev) => ({ ...prev, [jobId]: "idle" }))
    setUpdateMessages((prev) => ({ ...prev, [jobId]: "" }))
  }

  const updateJobField = (jobId: string, field: keyof JobData, value: any) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, [field]: value } : job)))
  }

  const updateQuestion = (jobId: string, questionIndex: number, field: keyof Question, value: any) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              questions: job.questions.map((q, idx) => (idx === questionIndex ? { ...q, [field]: value } : q)),
            }
          : job,
      ),
    )
  }

  const addQuestion = (jobId: string) => {
    const newQuestion: Question = {
      question: "",
      type: "short_answer",
      expected_response: "string_content",
    }

    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, questions: [...job.questions, newQuestion] } : job)),
    )
  }

  const removeQuestion = (jobId: string, questionIndex: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, questions: job.questions.filter((_, idx) => idx !== questionIndex) } : job,
      ),
    )
  }

  const addMultipleChoiceOption = (jobId: string, questionIndex: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              questions: job.questions.map((q, idx) =>
                idx === questionIndex ? { ...q, options: [...(q.options || []), ""] } : q,
              ),
            }
          : job,
      ),
    )
  }

  const updateMultipleChoiceOption = (jobId: string, questionIndex: number, optionIndex: number, value: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              questions: job.questions.map((q, idx) =>
                idx === questionIndex
                  ? {
                      ...q,
                      options: q.options?.map((opt, optIdx) => (optIdx === optionIndex ? value : opt)),
                    }
                  : q,
              ),
            }
          : job,
      ),
    )
  }

  const removeMultipleChoiceOption = (jobId: string, questionIndex: number, optionIndex: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              questions: job.questions.map((q, idx) =>
                idx === questionIndex
                  ? {
                      ...q,
                      options: q.options?.filter((_, optIdx) => optIdx !== optionIndex),
                    }
                  : q,
              ),
            }
          : job,
      ),
    )
  }

  const saveJob = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    try {
      setUpdateStatus((prev) => ({ ...prev, [jobId]: "idle" }))

      const payload = {
        description: `${job.title}\n\n${job.description}`,
        questions: {
          title: job.title,
          description: job.description,
          questions: job.questions,
        },
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok && result.status === "success") {
        setUpdateStatus((prev) => ({ ...prev, [jobId]: "success" }))
        setUpdateMessages((prev) => ({ ...prev, [jobId]: "Job updated successfully!" }))
        toggleEdit(jobId) // Exit edit mode

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateStatus((prev) => ({ ...prev, [jobId]: "idle" }))
          setUpdateMessages((prev) => ({ ...prev, [jobId]: "" }))
        }, 3000)
      } else {
        throw new Error(result.detail || "Failed to update job")
      }
    } catch (error) {
      setUpdateStatus((prev) => ({ ...prev, [jobId]: "error" }))
      setUpdateMessages((prev) => ({
        ...prev,
        [jobId]: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      }))
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId))
        setUpdateStatus((prev) => ({ ...prev, [jobId]: "success" }))
        setUpdateMessages((prev) => ({ ...prev, [jobId]: "Job deleted successfully!" }))
      } else {
        throw new Error("Failed to delete job")
      }
    } catch (error) {
      setUpdateStatus((prev) => ({ ...prev, [jobId]: "error" }))
      setUpdateMessages((prev) => ({
        ...prev,
        [jobId]: `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              Loading Jobs...
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
              Manage Jobs
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Error Loading Jobs</CardTitle>
            <CardDescription>
              Unable to load job postings. Please make sure the FastAPI server is running.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg font-mono">{error}</p>
            <Button onClick={fetchJobs} className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Available
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
            Manage Jobs
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            View, edit, and manage all your job postings in one place
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
            <LiveIndicator />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold">{jobs.length}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Active
                  </Badge>
                </div>
                <FileText className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold">
                    {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Received
                  </Badge>
                </div>
                <Users className="h-10 w-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Avg Questions</p>
                  <p className="text-3xl font-bold">
                    {jobs.length > 0
                      ? Math.round(jobs.reduce((sum, job) => sum + job.questions.length, 0) / jobs.length)
                      : 0}
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Per Job
                  </Badge>
                </div>
                <HelpCircle className="h-10 w-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Jobs Found</h3>
              <p className="text-slate-600 mb-4">
                You haven't created any job postings yet. Create your first job to get started.
              </p>
              <Button onClick={fetchJobs} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    {job.isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={job.title}
                          onChange={(e) => updateJobField(job.id, "title", e.target.value)}
                          className="text-xl font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full"
                          placeholder="Job Title"
                        />
                        <Textarea
                          value={job.description}
                          onChange={(e) => updateJobField(job.id, "description", e.target.value)}
                          className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Job Description"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">{job.description}</CardDescription>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="text-xs">
                      {job.questions.length} Questions
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {job.applications_count || 0} Applications
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Questions Section */}
                  {job.isEditing && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Questions ({job.questions.length})
                      </h4>

                      {job.questions.map((question, qIndex) => (
                        <Card key={qIndex} className="border border-gray-200">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                              {job.questions.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuestion(job.id, qIndex)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(job.id, qIndex, "question", e.target.value)}
                              placeholder="Enter question..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Select
                                value={question.type}
                                onValueChange={(value: "short_answer" | "multiple_choice") =>
                                  updateQuestion(job.id, qIndex, "type", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short_answer">Short Answer</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>

                              <input
                                type="text"
                                value={question.expected_response}
                                onChange={(e) => updateQuestion(job.id, qIndex, "expected_response", e.target.value)}
                                placeholder="Expected response type"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {question.type === "multiple_choice" && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Options:</label>
                                {(question.options || []).map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) =>
                                        updateMultipleChoiceOption(job.id, qIndex, optIndex, e.target.value)
                                      }
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeMultipleChoiceOption(job.id, qIndex, optIndex)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addMultipleChoiceOption(job.id, qIndex)}
                                  className="w-full"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      <Button
                        variant="outline"
                        onClick={() => addQuestion(job.id)}
                        className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 py-4 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  )}

                  {/* Status Messages */}
                  {updateStatus[job.id] !== "idle" && updateMessages[job.id] && (
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        updateStatus[job.id] === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {updateStatus[job.id] === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">{updateMessages[job.id]}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>ID: {job.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEdit(job.id)}
                            className="bg-transparent"
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveJob(job.id)} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-3 w-3 mr-1" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEdit(job.id)}
                            className="bg-transparent"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-600 bg-transparent">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteJob(job.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center py-6">
          <Button
            onClick={fetchJobs}
            variant="outline"
            size="lg"
            className="bg-transparent border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
          >
            <Settings className="mr-2 h-4 w-4" />
            Refresh Jobs
          </Button>
        </div>
      </div>
    </div>
  )
}
