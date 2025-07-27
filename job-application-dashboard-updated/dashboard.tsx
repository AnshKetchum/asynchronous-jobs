"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts"
import { TrendingUp, Users, CheckCircle, Target, Sparkles, Zap, Award, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useDashboardData } from "./hooks/use-dashboard-data"
import { DashboardSkeleton } from "./components/loading-skeleton"
import { ErrorState } from "./components/error-state"

const truncateText = (text: string, maxLength = 40) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}

const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  return <span className="tabular-nums">{value}</span>
}

const FunnelChart = ({ applied, relevant, approved }: { applied: number; relevant: number; approved: number }) => {
  const relevantPercent = Math.round((relevant / applied) * 100)
  const approvedPercent = Math.round((approved / applied) * 100)
  const approvedFromRelevantPercent = Math.round((approved / relevant) * 100)

  return (
    <Card className="col-span-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6" />
            Application Funnel
          </div>
          <Badge variant="secondary" className="self-start sm:ml-auto bg-white/20 text-white border-white/30 text-xs">
            Live Data
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-100 text-sm">
          Track your job application progress through each stage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto">
          <div className="relative min-w-[280px] sm:min-w-0">
            {/* Applications Applied */}
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-8 py-4 sm:py-6 text-center relative shadow-lg transform hover:scale-105 transition-transform duration-300"
              style={{
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "240px" : "300px",
              }}
            >
              <div className="text-2xl sm:text-3xl font-bold">
                <AnimatedCounter value={applied} />
              </div>
              <div className="text-xs sm:text-sm opacity-90">Applications Applied</div>
              <div className="text-xs opacity-75">100%</div>
            </div>

            {/* Relevant Jobs */}
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-6 py-3 sm:py-5 text-center relative mt-2 shadow-lg transform hover:scale-105 transition-transform duration-300"
              style={{
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)",
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "192px" : "240px",
                marginLeft: typeof window !== "undefined" && window.innerWidth < 640 ? "24px" : "30px",
              }}
            >
              <div className="text-xl sm:text-2xl font-bold">
                <AnimatedCounter value={relevant} />
              </div>
              <div className="text-xs sm:text-sm opacity-90">Relevant Jobs</div>
              <div className="text-xs opacity-75">{relevantPercent}%</div>
            </div>

            {/* Approved */}
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 sm:px-4 py-3 sm:py-4 text-center relative mt-2 shadow-lg transform hover:scale-105 transition-transform duration-300"
              style={{
                clipPath: "polygon(0 0, 100% 0, 75% 100%, 25% 100%)",
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "144px" : "180px",
                marginLeft: typeof window !== "undefined" && window.innerWidth < 640 ? "48px" : "60px",
              }}
            >
              <div className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={approved} />
              </div>
              <div className="text-xs sm:text-sm opacity-90">Approved</div>
              <div className="text-xs opacity-75">{approvedPercent}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
              <AnimatedCounter value={applied} />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Total Applied</div>
            <Progress value={100} className="mt-2 h-1.5 sm:h-2" />
          </div>
          <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">{relevantPercent}%</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Relevance Rate</div>
            <Progress value={relevantPercent} className="mt-2 h-1.5 sm:h-2" />
          </div>
          <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{approvedFromRelevantPercent}%</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Approval Rate</div>
            <Progress value={approvedFromRelevantPercent} className="mt-2 h-1.5 sm:h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const FeedbackChart = ({
  title,
  data,
  icon: Icon,
  colorScheme,
}: {
  title: string
  data: Array<{ reason: string; percent: string }>
  icon: any
  colorScheme: "light" | "dark"
}) => {
  const chartData = data.map((item, index) => ({
    name: truncateText(item.reason, typeof window !== "undefined" && window.innerWidth < 768 ? 15 : 25),
    fullReason: item.reason,
    value: Number.parseInt(item.percent.replace("%", "")),
    percent: item.percent,
  }))

  const barColor = colorScheme === "light" ? "hsl(213, 94%, 68%)" : "hsl(213, 94%, 45%)"
  const gradientFrom = colorScheme === "light" ? "from-blue-50" : "from-indigo-50"
  const gradientTo = colorScheme === "light" ? "to-cyan-50" : "to-purple-50"

  return (
    <Card
      className={`overflow-hidden bg-gradient-to-br ${gradientFrom} via-white ${gradientTo} border-0 shadow-xl hover:shadow-2xl transition-shadow duration-500 group`}
    >
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:scale-105 transition-transform duration-300">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">{title}</span>
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-auto opacity-70 flex-shrink-0" />
        </CardTitle>
        <CardDescription className="text-slate-300 text-xs sm:text-sm">
          Based on company feedback and interview notes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <ChartContainer
          config={{
            value: {
              label: "Percentage",
              color: barColor,
            },
          }}
          className="h-[280px] sm:h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 10,
                left: 10,
                bottom: typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 80,
              }}
            >
              <XAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? 9 : 11 }}
                angle={-45}
                textAnchor="end"
                height={typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 80}
                interval={0}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? 9 : 11 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-xl max-w-xs border-blue-200">
                        <p className="font-medium text-xs sm:text-sm mb-2 text-slate-800">{data.fullReason}</p>
                        <p className="text-blue-600 font-bold text-base sm:text-lg">{data.percent}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity duration-200">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default function JobApplicationDashboard() {
  const { totals, pros, cons, loading, error, refetch } = useDashboardData()

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !totals) {
    return <ErrorState error={error || "No data available"} onRetry={refetch} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            Real-time Analytics Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
            Job Application Analytics
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Track your progress and get insights from company feedback with our intelligent analytics platform
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            Last updated: just now
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Applications</p>
                  <p className="text-xl sm:text-3xl font-bold">
                    <AnimatedCounter value={totals.total_applications} />
                  </p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Live Data
                  </Badge>
                </div>
                <Users className="h-6 w-6 sm:h-10 sm:w-10 text-blue-200 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-indigo-100 text-xs sm:text-sm font-medium">Relevant Matches</p>
                  <p className="text-xl sm:text-3xl font-bold">
                    <AnimatedCounter value={totals.relevant_matches} />
                  </p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Live Data
                  </Badge>
                </div>
                <Target className="h-6 w-6 sm:h-10 sm:w-10 text-indigo-200 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Approved</p>
                  <p className="text-xl sm:text-3xl font-bold">
                    <AnimatedCounter value={totals.approved} />
                  </p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Live Data
                  </Badge>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-10 sm:w-10 text-purple-200 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">Success Rate</p>
                  <p className="text-xl sm:text-3xl font-bold">
                    {Math.round((totals.approved / totals.total_applications) * 100)}%
                  </p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Live Data
                  </Badge>
                </div>
                <Award className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-200 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Chart */}
        <FunnelChart
          applied={totals.total_applications}
          relevant={totals.relevant_matches}
          approved={totals.approved}
        />

        {/* Feedback Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <FeedbackChart
            title="Top 5 Great Things Noticed by Companies"
            data={pros}
            icon={TrendingUp}
            colorScheme="light"
          />

          <FeedbackChart
            title="Top 5 Areas of Improvement Noticed by Companies"
            data={cons}
            icon={Target}
            colorScheme="dark"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 py-6 sm:py-8 px-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            View Detailed Report
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 bg-transparent w-full sm:w-auto"
            onClick={refetch}
          >
            <Target className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}
