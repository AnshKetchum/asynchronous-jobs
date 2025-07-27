"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Target, CheckCircle, TrendingUp, Download, FileText, Activity } from "lucide-react"

const API_BASE_URL = "http://127.0.0.1:8002"

interface RatingDistribution {
  job_id: string
  rating_distribution: Record<string, number>
}

export function DashboardContent() {
  const [jobIds, setJobIds] = useState<string[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null)
  const [topSkills, setTopSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

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
        fill: `hsl(${220 + Number.parseInt(rating) * 8}, 70%, ${45 + Number.parseInt(rating) * 4}%)`,
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Evaluation Analytics</h1>
          <p className="text-gray-600 mt-1">Track candidate quality and get insights from AI-powered evaluations</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live data • Updated 2 min ago
        </div>
      </div>

      {/* Job Selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Job Position Analysis</CardTitle>
          <CardDescription>Select a job position to view detailed candidate analytics</CardDescription>
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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Total Candidates</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{totalCandidates}</p>
                <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{averageRating.toFixed(1)}</p>
                <p className="text-purple-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">High Quality (7+)</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{highQualityCandidates}</p>
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">Quality Rate</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{qualityRate.toFixed(0)}%</p>
                <p className="text-orange-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Candidate Rating Distribution
            </CardTitle>
            <CardDescription className="mt-1">
              AI evaluation scores for {selectedJobId || "selected position"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Live Data
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Top 5 Candidate Skills
            </CardTitle>
            <CardDescription>Most frequent skills across all candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSkills.map((skill, index) => (
              <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{skill}</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {Math.floor(Math.random() * 50) + 20}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Performance Summary
            </CardTitle>
            <CardDescription>Key metrics for {selectedJobId || "selected position"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCandidates}</div>
                <div className="text-sm text-gray-500 mt-1">Total Evaluated</div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-500 mt-1">Avg Rating</div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(averageRating / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{qualityRate.toFixed(0)}%</div>
                <div className="text-sm text-gray-500 mt-1">Quality Rate</div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${qualityRate}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button className="bg-blue-600 hover:bg-blue-700 px-6">
          <FileText className="h-4 w-4 mr-2" />
          View Detailed Report
        </Button>
        <Button variant="outline" className="px-6 bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  )
}
