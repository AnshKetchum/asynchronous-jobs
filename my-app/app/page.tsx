"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Target, CheckCircle, TrendingUp, Download, FileText } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { UnderConstruction } from "@/components/under-construction"
import { LiveIndicator } from "@/components/live-indicator"
import { RoutersPage } from "@/components/routers-page"
import { MarketplacePage } from "@/components/marketplace-page"
import { CreateJobPage } from "@/components/create-job-page"
import { ManageJobsPage } from "@/components/manage-jobs-page"

const API_BASE_URL = "http://127.0.0.1:8002"

interface RatingDistribution {
  job_id: string
  rating_distribution: Record<string, number>
}

export default function CompanyDashboard() {
  const [jobIds, setJobIds] = useState<string[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null)
  const [topSkills, setTopSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Fetch job IDs on component mount
  useEffect(() => {
    fetchJobIds()
    fetchTopSkills()
  }, [])

  const fetchJobIds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/ids`)
      const data = await response.json()
      setJobIds(data)
      if (data.length > 0) {
        setSelectedJobId(data[0])
      }
    } catch (error) {
      console.error("Error fetching job IDs:", error)
    }
  }

  const fetchRatingDistribution = async (jobId: string) => {
    if (!jobId) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/ratings`)
      const data = await response.json()
      setRatingDistribution(data)
    } catch (error) {
      console.error("Error fetching rating distribution:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopSkills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/top`)
      const data = await response.json()
      setTopSkills(data)
    } catch (error) {
      console.error("Error fetching top skills:", error)
    }
  }

  useEffect(() => {
    if (selectedJobId) {
      fetchRatingDistribution(selectedJobId)
    }
  }, [selectedJobId])

  // Transform rating distribution data for chart
  const chartData = ratingDistribution
    ? Object.entries(ratingDistribution.rating_distribution).map(([rating, count]) => ({
        rating: `${rating}/10`,
        count: count,
        fill: `hsl(${240 + Number.parseInt(rating) * 12}, 70%, ${50 + Number.parseInt(rating) * 3}%)`,
      }))
    : []

  // Calculate summary stats
  const totalCandidates = chartData.reduce((sum, item) => sum + item.count, 0)
  const averageRating =
    chartData.length > 0
      ? chartData.reduce((sum, item, index) => sum + (index + 1) * item.count, 0) / totalCandidates
      : 0
  const highQualityCandidates = chartData.slice(6).reduce((sum, item) => sum + item.count, 0)
  const qualityRate = totalCandidates > 0 ? (highQualityCandidates / totalCandidates) * 100 : 0

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Company Analytics Dashboard
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Evaluation Analytics</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Track candidate quality and get insights from AI-powered evaluations with our intelligent analytics
                platform
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <LiveIndicator />
              </div>
            </div>

            {/* Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Job Position</CardTitle>
                <CardDescription>Choose a job to view candidate ratings and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a job position" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobIds.map((jobId) => (
                      <SelectItem key={jobId} value={jobId}>
                        {jobId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Candidates</p>
                      <p className="text-3xl font-bold">{totalCandidates}</p>
                      <p className="text-blue-100 text-xs">+5% this week</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Average Rating</p>
                      <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                      <p className="text-purple-100 text-xs">+12% this week</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">High Quality (7+)</p>
                      <p className="text-3xl font-bold">{highQualityCandidates}</p>
                      <p className="text-green-100 text-xs">+8% this week</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Quality Rate</p>
                      <p className="text-3xl font-bold">{qualityRate.toFixed(0)}%</p>
                      <p className="text-orange-100 text-xs">+3% this week</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rating Distribution Chart */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Candidate Rating Distribution
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    AI evaluation scores for {selectedJobId || "selected position"}
                  </CardDescription>
                </div>
                <LiveIndicator />
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-white">Loading...</div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                        <XAxis dataKey="rating" stroke="rgba(255,255,255,0.8)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                          }}
                        />
                        <Bar dataKey="count" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Stats and Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Skills */}
              <Card className="bg-slate-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top 5 Candidate Skills
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Most frequent skills across all candidates
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{skill}</span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                        {Math.floor(Math.random() * 50) + 20}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card className="bg-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Evaluation Summary
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Key metrics for {selectedJobId || "selected position"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{totalCandidates}</div>
                      <div className="text-sm text-slate-400">Total Evaluated</div>
                      <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                        <div className="bg-blue-400 h-1 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{averageRating.toFixed(1)}</div>
                      <div className="text-sm text-slate-400">Avg Rating</div>
                      <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                        <div
                          className="bg-purple-400 h-1 rounded-full"
                          style={{ width: `${(averageRating / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{qualityRate.toFixed(0)}%</div>
                      <div className="text-sm text-slate-400">Quality Rate</div>
                      <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                        <div className="bg-green-400 h-1 rounded-full" style={{ width: `${qualityRate}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Report
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        )
      case "create":
        return <CreateJobPage />
      case "routers":
        return <RoutersPage />
      case "marketplace":
        return <MarketplacePage />
      case "analytics":
        return (
          <UnderConstruction
            title="Advanced Analytics"
            description="Deep dive into recruitment data with advanced analytics and insights"
          />
        )
      case "applications":
        return (
          <UnderConstruction
            title="Applications Management"
            description="Manage and track all candidate applications in one place"
          />
        )
      case "performance":
        return (
          <UnderConstruction
            title="Performance Metrics"
            description="Track team performance and recruitment efficiency metrics"
          />
        )
      case "calendar":
        return (
          <UnderConstruction
            title="Interview Calendar"
            description="Schedule and manage interviews with integrated calendar system"
          />
        )
      case "settings":
        return (
          <UnderConstruction
            title="System Settings"
            description="Configure your account preferences and system settings"
          />
        )
      case "manage":
        return <ManageJobsPage />
      default:
        return (
          <UnderConstruction
            title="Dashboard Overview"
            description="Get a comprehensive view of all your recruitment metrics and KPIs"
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  )
}
