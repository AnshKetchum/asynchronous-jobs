"use client"

import { useState } from "react"
import { Search, Filter, Star, Download, Users, Zap, Bot, Router, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dummy data for marketplace items
const dummyRouters = [
  {
    id: 1,
    name: "SmartRoute Pro",
    description: "Advanced routing with AI-powered optimization for job applications",
    category: "router",
    rating: 4.8,
    downloads: 1250,
    price: "Free",
    tags: ["AI", "Optimization", "Professional"],
    author: "TechCorp",
    featured: true,
  },
  {
    id: 2,
    name: "FastTrack Router",
    description: "Lightning-fast routing for high-volume application processing",
    category: "router",
    rating: 4.6,
    downloads: 890,
    price: "$9.99",
    tags: ["Speed", "High-Volume", "Enterprise"],
    author: "SpeedSoft",
    featured: false,
  },
  {
    id: 3,
    name: "SecureRoute Enterprise",
    description: "Enterprise-grade router with advanced security features",
    category: "router",
    rating: 4.9,
    downloads: 2100,
    price: "$29.99",
    tags: ["Security", "Enterprise", "Compliance"],
    author: "SecureTech",
    featured: true,
  },
]

const dummyAgents = [
  {
    id: 4,
    name: "Resume Optimizer AI",
    description: "Intelligent agent that optimizes your resume for specific job postings",
    category: "agent",
    rating: 4.7,
    downloads: 3200,
    price: "Free",
    tags: ["Resume", "AI", "Optimization"],
    author: "AI Solutions",
    featured: true,
  },
  {
    id: 5,
    name: "Interview Prep Assistant",
    description: "AI-powered interview preparation with personalized questions",
    category: "agent",
    rating: 4.5,
    downloads: 1800,
    price: "$14.99",
    tags: ["Interview", "Preparation", "AI"],
    author: "CareerBoost",
    featured: false,
  },
  {
    id: 6,
    name: "Application Tracker Bot",
    description: "Automated tracking and follow-up for your job applications",
    category: "agent",
    rating: 4.8,
    downloads: 2750,
    price: "$19.99",
    tags: ["Automation", "Tracking", "Follow-up"],
    author: "AutoWork",
    featured: true,
  },
]

const allItems = [...dummyRouters, ...dummyAgents]

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    return matchesSearch && item.category === activeTab
  })

  const featuredItems = filteredItems.filter((item) => item.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Discover & Enhance Your Workflow
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent px-4">
            Marketplace
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Search for routers and custom agents here to supercharge your job application workflow
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for routers and custom agents here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/80 backdrop-blur-sm border-slate-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl shadow-lg"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Items</p>
                  <p className="text-xl sm:text-3xl font-bold">{allItems.length}</p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Available
                  </Badge>
                </div>
                <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-xs sm:text-sm font-medium">Routers</p>
                  <p className="text-xl sm:text-3xl font-bold">{dummyRouters.length}</p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Active
                  </Badge>
                </div>
                <Router className="h-6 w-6 sm:h-10 sm:w-10 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs sm:text-sm font-medium">Agents</p>
                  <p className="text-xl sm:text-3xl font-bold">{dummyAgents.length}</p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Smart
                  </Badge>
                </div>
                <Bot className="h-6 w-6 sm:h-10 sm:w-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">Featured</p>
                  <p className="text-xl sm:text-3xl font-bold">{allItems.filter((item) => item.featured).length}</p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Premium
                  </Badge>
                </div>
                <Star className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              All Items
            </TabsTrigger>
            <TabsTrigger value="router" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Routers
            </TabsTrigger>
            <TabsTrigger value="agent" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Items
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredItems.map((item) => (
                    <MarketplaceCard key={item.id} item={item} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All Results */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-600" />
                {searchQuery
                  ? `Search Results (${filteredItems.length})`
                  : `All ${activeTab === "all" ? "Items" : activeTab === "router" ? "Routers" : "Agents"}`}
              </h2>

              {filteredItems.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                    <p className="text-slate-600">Try adjusting your search terms or browse all available items.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <MarketplaceCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MarketplaceCard({ item, featured = false }: { item: any; featured?: boolean }) {
  return (
    <Card
      className={`overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
        featured
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 ring-2 ring-yellow-300"
          : "bg-gradient-to-br from-white to-slate-50"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {item.category === "router" ? (
              <Router className="h-5 w-5 text-blue-600" />
            ) : (
              <Bot className="h-5 w-5 text-purple-600" />
            )}
            {featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <Badge variant={item.price === "Free" ? "secondary" : "default"} className="text-xs">
            {item.price}
          </Badge>
        </div>
        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{item.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{item.author}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
            <Button size="sm" variant="outline" className="px-3 bg-transparent">
              <Zap className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
