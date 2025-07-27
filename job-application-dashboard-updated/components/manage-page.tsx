"use client"

import type React from "react"

import { useState } from "react"
import { Edit, Trash2, Briefcase, Code, Save, X, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useResumeData } from "../hooks/use-resume-data"
import { DashboardSkeleton } from "./loading-skeleton"
import { ErrorState } from "./error-state"
import type { Experience, Project } from "../lib/resume-api"

export function ManagePage() {
  const {
    experiences,
    projects,
    loading,
    error,
    updateExperience,
    deleteExperience,
    updateProject,
    deleteProject,
    refetch,
  } = useResumeData()
  const { toast } = useToast()
  const [editingExperience, setEditingExperience] = useState<{ index: number; data: Experience } | null>(null)
  const [editingProject, setEditingProject] = useState<{ index: number; data: Project } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  const handleUpdateExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExperience) return

    setIsSubmitting(true)
    try {
      await updateExperience(editingExperience.index, editingExperience.data)
      setEditingExperience(null)
      toast({
        title: "Success!",
        description: "Experience updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update experience. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExperience = async (index: number) => {
    try {
      await deleteExperience(index)
      toast({
        title: "Success!",
        description: "Experience deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setIsSubmitting(true)
    try {
      await updateProject(editingProject.index, editingProject.data)
      setEditingProject(null)
      toast({
        title: "Success!",
        description: "Project updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (index: number) => {
    try {
      await deleteProject(index)
      toast({
        title: "Success!",
        description: "Project deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 text-xs sm:text-sm font-medium mb-4">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            Edit & Organize Your Content
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent px-4">
            Manage Resume Content
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Edit, update, or delete your existing experiences and projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Experiences</p>
                  <p className="text-3xl font-bold">{experiences.length}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Saved
                  </Badge>
                </div>
                <Briefcase className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Projects</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Saved
                  </Badge>
                </div>
                <Code className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="experiences" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="experiences"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Experiences ({experiences.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Projects ({projects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experiences" className="mt-8">
            <div className="space-y-6">
              {experiences.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No experiences yet</h3>
                    <p className="text-slate-600">Start by adding your first work experience in the Create tab.</p>
                  </CardContent>
                </Card>
              ) : (
                experiences.map((experience, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    {editingExperience?.index === index ? (
                      <form onSubmit={handleUpdateExperience}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Briefcase className="h-5 w-5 text-orange-600" />
                            Edit Experience
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-company-${index}`}>Company</Label>
                              <Input
                                id={`edit-company-${index}`}
                                value={editingExperience.data.company}
                                onChange={(e) =>
                                  setEditingExperience({
                                    ...editingExperience,
                                    data: { ...editingExperience.data, company: e.target.value },
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-location-${index}`}>Location</Label>
                              <Input
                                id={`edit-location-${index}`}
                                value={editingExperience.data.location || ""}
                                onChange={(e) =>
                                  setEditingExperience({
                                    ...editingExperience,
                                    data: { ...editingExperience.data, location: e.target.value },
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-role-${index}`}>Role</Label>
                              <Input
                                id={`edit-role-${index}`}
                                value={editingExperience.data.role}
                                onChange={(e) =>
                                  setEditingExperience({
                                    ...editingExperience,
                                    data: { ...editingExperience.data, role: e.target.value },
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-date-${index}`}>Date</Label>
                              <Input
                                id={`edit-date-${index}`}
                                value={editingExperience.data.date}
                                onChange={(e) =>
                                  setEditingExperience({
                                    ...editingExperience,
                                    data: { ...editingExperience.data, date: e.target.value },
                                  })
                                }
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-description-${index}`}>Description</Label>
                            <Textarea
                              id={`edit-description-${index}`}
                              value={editingExperience.data.description}
                              onChange={(e) =>
                                setEditingExperience({
                                  ...editingExperience,
                                  data: { ...editingExperience.data, description: e.target.value },
                                })
                              }
                              rows={4}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-4 w-4" />
                              )}
                              Save Changes
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingExperience(null)}
                              className="bg-transparent"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </form>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{experience.role}</CardTitle>
                              <CardDescription className="text-base font-medium text-slate-700">
                                {experience.company}
                                {experience.location && ` • ${experience.location}`}
                              </CardDescription>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {experience.date}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingExperience({ index, data: experience })}
                                className="bg-transparent hover:bg-blue-50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteExperience(index)}
                                className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600 whitespace-pre-wrap">{experience.description}</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-8">
            <div className="space-y-6">
              {projects.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Code className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
                    <p className="text-slate-600">Start by adding your first project in the Create tab.</p>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    {editingProject?.index === index ? (
                      <form onSubmit={handleUpdateProject}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Code className="h-5 w-5 text-red-600" />
                            Edit Project
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-project-title-${index}`}>Project Title</Label>
                            <Input
                              id={`edit-project-title-${index}`}
                              value={editingProject.data.title}
                              onChange={(e) =>
                                setEditingProject({
                                  ...editingProject,
                                  data: { ...editingProject.data, title: e.target.value },
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-project-description-${index}`}>Project Description</Label>
                            <Textarea
                              id={`edit-project-description-${index}`}
                              value={editingProject.data.description}
                              onChange={(e) =>
                                setEditingProject({
                                  ...editingProject,
                                  data: { ...editingProject.data, description: e.target.value },
                                })
                              }
                              rows={6}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-4 w-4" />
                              )}
                              Save Changes
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingProject(null)}
                              className="bg-transparent"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </form>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingProject({ index, data: project })}
                                className="bg-transparent hover:bg-blue-50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProject(index)}
                                className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600 whitespace-pre-wrap">{project.description}</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
