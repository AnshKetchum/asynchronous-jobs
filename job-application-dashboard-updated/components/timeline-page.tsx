"use client"

import { useState, useEffect } from "react"
import { GitBranch, Briefcase, Code, Calendar, MapPin, Sparkles, GitCommit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useResumeData } from "@/hooks/use-resume-data"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"

interface TimelineItem {
  id: string
  type: "experience" | "project"
  title: string
  subtitle: string
  date: string
  description: string
  location?: string
  sortDate: Date
  branch: number
}

export function TimelinePage() {
  const { experiences, projects, loading, error, refetch } = useResumeData()
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [filter, setFilter] = useState<"all" | "experience" | "project">("all")

  useEffect(() => {
    const items: TimelineItem[] = []

    // Add experiences to main branch
    experiences.forEach((exp, index) => {
      items.push({
        id: `exp-${index}`,
        type: "experience",
        title: exp.role,
        subtitle: exp.company,
        date: exp.date,
        description: exp.description,
        location: exp.location,
        sortDate: parseDateString(exp.date),
        branch: 0, // Main branch
      })
    })

    // Add projects to feature branch
    projects.forEach((proj, index) => {
      items.push({
        id: `proj-${index}`,
        type: "project",
        title: proj.title,
        subtitle: "Personal Project",
        date: "Recent",
        description: proj.description,
        sortDate: new Date(Date.now() - index * 86400000),
        branch: 1, // Feature branch
      })
    })

    // Sort by date (oldest first for left-to-right flow)
    items.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    setTimelineItems(items)
  }, [experiences, projects])

  const parseDateString = (dateStr: string): Date => {
    const currentYear = new Date().getFullYear()
    if (dateStr.toLowerCase().includes("present")) {
      return new Date()
    }
    const yearMatch = dateStr.match(/\d{4}/)
    if (yearMatch) {
      return new Date(Number.parseInt(yearMatch[0]), 0, 1)
    }
    return new Date(currentYear, 0, 1)
  }

  const filteredItems = timelineItems.filter((item) => {
    if (filter === "all") return true
    return item.type === filter
  })

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-teal-700 text-xs sm:text-sm font-medium mb-4">
          <GitBranch className="h-3 w-3 sm:h-4 sm:w-4" />
          Your Professional Repository
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent px-4">
          Career Timeline
        </h1>
        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
          Your professional journey visualized as a Git repository with experiences and projects as commits
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Commits</p>
                <p className="text-3xl font-bold">{timelineItems.length}</p>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                  Repository
                </Badge>
              </div>
              <GitCommit className="h-10 w-10 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Experience Branch</p>
                <p className="text-3xl font-bold">{experiences.length}</p>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                  Main
                </Badge>
              </div>
              <Briefcase className="h-10 w-10 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Project Branch</p>
                <p className="text-3xl font-bold">{projects.length}</p>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                  Feature
                </Badge>
              </div>
              <Code className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="all" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            All Commits
          </TabsTrigger>
          <TabsTrigger value="experience" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Experience
          </TabsTrigger>
          <TabsTrigger value="project" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-8">
          {filteredItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No commits yet</h3>
                <p className="text-slate-600">
                  Start by adding experiences and projects in the Create tab to build your repository.
                </p>
              </CardContent>
            </Card>
          ) : (
            <GitRepositoryTree items={filteredItems} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function GitRepositoryTree({ items }: { items: TimelineItem[] }) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, item.id]))
      }, index * 150)
    })
  }, [items])

  // Group items by branch for proper line drawing
  const branches = items.reduce(
    (acc, item) => {
      if (!acc[item.branch]) acc[item.branch] = []
      acc[item.branch].push(item)
      return acc
    },
    {} as Record<number, TimelineItem[]>,
  )

  // Calculate dimensions for larger visualization
  const nodeSpacing = 120 // Increased from 80px
  const branchSpacing = 80 // Increased from 60px
  const totalWidth = Math.max(...Object.values(branches).map((branch) => branch.length)) * nodeSpacing + 100
  const totalHeight = Object.keys(branches).length * branchSpacing + 100

  return (
    <div className="bg-slate-900 rounded-xl p-8 shadow-xl border-0 overflow-x-auto">
      <div className="relative min-w-max" style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}>
        {/* Draw branch lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {Object.entries(branches).map(([branchIndex, branchItems]) => {
            const branch = Number.parseInt(branchIndex)
            const y = 60 + branch * branchSpacing

            return (
              <g key={branch}>
                {/* Main branch line */}
                <line
                  x1="40"
                  y1={y}
                  x2={branchItems.length * nodeSpacing + 40}
                  y2={y}
                  stroke={branch === 0 ? "#3B82F6" : "#F97316"}
                  strokeWidth="3"
                  opacity="0.7"
                />

                {/* Connecting lines between branches */}
                {branch > 0 && (
                  <>
                    {/* Branch out line */}
                    <line x1="40" y1="60" x2="40" y2={y} stroke="#F97316" strokeWidth="3" opacity="0.5" />
                    {/* Merge back line (if needed) */}
                    <line
                      x1={branchItems.length * nodeSpacing + 40}
                      y1={y}
                      x2={branchItems.length * nodeSpacing + 40}
                      y2="60"
                      stroke="#F97316"
                      strokeWidth="3"
                      opacity="0.5"
                    />
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* Render commit nodes */}
        <div className="relative z-10">
          {items.map((item, index) => {
            const branchItems = branches[item.branch]
            const positionInBranch = branchItems.indexOf(item)
            const x = positionInBranch * nodeSpacing + 40
            const y = 60 + item.branch * branchSpacing

            return (
              <GitCommitNode
                key={item.id}
                item={item}
                index={index}
                isVisible={visibleItems.has(item.id)}
                x={x}
                y={y}
                isHovered={hoveredItem === item.id}
                onHover={setHoveredItem}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GitCommitNode({
  item,
  index,
  isVisible,
  x,
  y,
  isHovered,
  onHover,
}: {
  item: TimelineItem
  index: number
  isVisible: boolean
  x: number
  y: number
  isHovered: boolean
  onHover: (id: string | null) => void
}) {
  const isExperience = item.type === "experience"
  const nodeColor = isExperience ? "bg-blue-500" : "bg-orange-500"
  const hoverColor = isExperience ? "bg-blue-400" : "bg-orange-400"
  const pulseColor = isExperience ? "shadow-blue-500/50" : "shadow-orange-500/50"

  return (
    <div className="absolute" style={{ left: `${x - 8}px`, top: `${y - 8}px` }}>
      {/* Commit node with subtle pulse */}
      <div
        className={`relative z-20 w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${isHovered ? `${hoverColor} scale-150 shadow-xl` : `${nodeColor} animate-pulse`} ${pulseColor}`}
        style={{
          transitionDelay: `${index * 100}ms`,
          boxShadow: isHovered
            ? `0 0 20px ${isExperience ? "rgba(59, 130, 246, 0.6)" : "rgba(249, 115, 22, 0.6)"}`
            : `0 0 8px ${isExperience ? "rgba(59, 130, 246, 0.3)" : "rgba(249, 115, 22, 0.3)"}`,
        }}
        onMouseEnter={() => onHover(item.id)}
        onMouseLeave={() => onHover(null)}
      >
        <div className="absolute inset-0 rounded-full bg-white/30"></div>

        {/* Subtle pulsing ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            isExperience ? "border-blue-400" : "border-orange-400"
          } animate-ping opacity-20`}
          style={{ animationDuration: "3s" }}
        ></div>
      </div>

      {/* Hover card */}
      {isHovered && (
        <div
          className="absolute z-30 w-80 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: x > 600 ? "-320px" : "20px", // Position card to avoid overflow
            top: "-140px",
          }}
        >
          <Card className="bg-white border border-slate-200 shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                {isExperience ? (
                  <Briefcase className="h-4 w-4 text-blue-600" />
                ) : (
                  <Code className="h-4 w-4 text-orange-600" />
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    isExperience
                      ? "border-blue-200 text-blue-700 bg-blue-50"
                      : "border-orange-200 text-orange-700 bg-orange-50"
                  }`}
                >
                  {isExperience ? "experience" : "project"}
                </Badge>
                <div className="ml-auto">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                </div>
              </div>
              <CardTitle className="text-sm font-semibold leading-tight">{item.title}</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                {item.subtitle}
                {item.location && (
                  <span className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
              </p>
              <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 bg-slate-50">
                <Calendar className="h-3 w-3 mr-1" />
                {item.date}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
