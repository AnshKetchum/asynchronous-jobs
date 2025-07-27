"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Briefcase, Code, Save, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useResumeData } from "../hooks/use-resume-data"
import type { Experience, Project } from "../lib/resume-api"

export function CreatePage() {
  const { addExperience, addProject } = useResumeData()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [experienceForm, setExperienceForm] = useState<Experience>({
    company: "",
    location: "",
    role: "",
    date: "",
    description: "",
  })

  const [projectForm, setProjectForm] = useState<Project>({
    title: "",
    description: "",
  })

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addExperience(experienceForm)
      setExperienceForm({
        company: "",
        location: "",
        role: "",
        date: "",
        description: "",
      })
      toast({
        title: "Success!",
        description: "Experience added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add experience. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addProject(projectForm)
      setProjectForm({
        title: "",
        description: "",
      })
      toast({
        title: "Success!",
        description: "Project added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      })
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
            Build Your Professional Profile
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent px-4">
            Create Resume Content
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Add your professional experiences and projects to build a comprehensive resume
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ready to Create</p>
                  <p className="text-2xl font-bold">Experiences</p>
                  <p className="text-green-100 text-xs mt-1">Add your work history</p>
                </div>
                <Briefcase className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Ready to Create</p>
                  <p className="text-2xl font-bold">Projects</p>
                  <p className="text-emerald-100 text-xs mt-1">Showcase your work</p>
                </div>
                <Code className="h-10 w-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creation Forms */}
        <Tabs defaultValue="experience" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="experience" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Add Experience
            </TabsTrigger>
            <TabsTrigger value="project" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Add Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experience" className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Add Work Experience
                </CardTitle>
                <CardDescription>
                  Add details about your professional work experience, internships, or volunteer work.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExperienceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                        placeholder="e.g., Google, Microsoft, Startup Inc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Input
                        id="role"
                        value={experienceForm.role}
                        onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                        placeholder="e.g., Software Engineer, Product Manager"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        value={experienceForm.date}
                        onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })}
                        placeholder="e.g., Jan 2023 - Present, Summer 2022"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      placeholder="Describe your responsibilities, achievements, and impact. Use bullet points or paragraphs."
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Adding Experience...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add Experience
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project" className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Code className="h-5 w-5 text-emerald-600" />
                  Add Project
                </CardTitle>
                <CardDescription>
                  Showcase your personal projects, open source contributions, or side projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProjectSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Title *</Label>
                    <Input
                      id="project-title"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g., E-commerce Website, Mobile App, Data Analysis Tool"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">Project Description *</Label>
                    <Textarea
                      id="project-description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Describe what the project does, technologies used, your role, and any notable achievements or metrics."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Adding Project...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add Project
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
