"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, FileText, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react"
import { LiveIndicator } from "./live-indicator"

const API_BASE_URL = "http://127.0.0.1:8002"

interface Question {
  id: string
  question: string
  type: "short_answer" | "multiple_choice"
  expected_response: string
  options?: string[]
}

interface JobData {
  title: string
  description: string
  questions: Question[]
}

export function CreateJobPage() {
  const [jobData, setJobData] = useState<JobData>({
    title: "",
    description: "",
    questions: [
      {
        id: "1",
        question: "name",
        type: "short_answer",
        expected_response: "string_content",
      },
      {
        id: "2",
        question: "email",
        type: "short_answer",
        expected_response: "string_content",
      },
    ],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      type: "short_answer",
      expected_response: "string_content",
    }
    setJobData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  const removeQuestion = (id: string) => {
    setJobData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }))
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setJobData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    }))
  }

  const addMultipleChoiceOption = (questionId: string) => {
    setJobData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q)),
    }))
  }

  const updateMultipleChoiceOption = (questionId: string, optionIndex: number, value: string) => {
    setJobData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q,
      ),
    }))
  }

  const removeMultipleChoiceOption = (questionId: string, optionIndex: number) => {
    setJobData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.filter((_, idx) => idx !== optionIndex),
            }
          : q,
      ),
    }))
  }

  const handleSubmit = async () => {
    if (!jobData.title.trim() || !jobData.description.trim()) {
      setSubmitStatus("error")
      setSubmitMessage("Please fill in both title and description")
      return
    }

    if (jobData.questions.some((q) => !q.question.trim())) {
      setSubmitStatus("error")
      setSubmitMessage("Please fill in all question fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Transform the data to match the backend format
      const payload = {
        description: `${jobData.title}\n\n${jobData.description}`,
        questions: {
          title: jobData.title,
          description: jobData.description,
          questions: jobData.questions.map((q) => ({
            expected_response: q.expected_response,
            type: q.type,
            question: q.question,
            ...(q.type === "multiple_choice" && q.options ? { options: q.options } : {}),
          })),
        },
      }

      const response = await fetch(`${API_BASE_URL}/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok && result.status === "success") {
        setSubmitStatus("success")
        setSubmitMessage(`Job created successfully! Job ID: ${result.job_id}`)
        // Reset form after successful submission
        setTimeout(() => {
          setJobData({
            title: "",
            description: "",
            questions: [
              {
                id: Date.now().toString(),
                question: "name",
                type: "short_answer",
                expected_response: "string_content",
              },
              {
                id: (Date.now() + 1).toString(),
                question: "email",
                type: "short_answer",
                expected_response: "string_content",
              },
            ],
          })
          setSubmitStatus("idle")
        }, 3000)
      } else {
        throw new Error(result.detail || "Failed to create job")
      }
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-green-700 text-xs sm:text-sm font-medium mb-4">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Create New Job Posting
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent px-4">
            Create Job
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Create a new job posting with custom questions to evaluate candidates effectively
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
            <LiveIndicator />
          </div>
        </div>

        {/* Job Basic Information */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Job Information
            </CardTitle>
            <CardDescription>Provide the basic details for your job posting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => setJobData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <Textarea
                value={jobData.description}
                onChange={(e) => setJobData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate..."
                className="min-h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-600" />
                Application Questions
              </CardTitle>
              <CardDescription>Create custom questions to evaluate candidates</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {jobData.questions.length} Questions
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {jobData.questions.map((question, index) => (
              <Card key={question.id} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    {jobData.questions.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Enter your question..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                    <Select
                      value={question.type}
                      onValueChange={(value: "short_answer" | "multiple_choice") =>
                        updateQuestion(question.id, "type", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {question.type === "multiple_choice" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateMultipleChoiceOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMultipleChoiceOption(question.id, optionIndex)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addMultipleChoiceOption(question.id)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Response Type</label>
                    <input
                      type="text"
                      value={question.expected_response}
                      onChange={(e) => updateQuestion(question.id, "expected_response", e.target.value)}
                      placeholder="e.g. string_content, number, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={addQuestion}
              className="w-full border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 py-6 bg-transparent"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Another Question
            </Button>
          </CardContent>
        </Card>

        {/* Submit Status */}
        {submitStatus !== "idle" && (
          <Card
            className={`border-0 shadow-xl ${
              submitStatus === "success"
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                : "bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {submitStatus === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${submitStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                    {submitStatus === "success" ? "Success!" : "Error"}
                  </p>
                  <p className={`text-sm ${submitStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                    {submitMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center py-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Job...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Job
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
