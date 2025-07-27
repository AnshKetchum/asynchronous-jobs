"use client"

import { useState } from "react"
import { Router, Wifi, AlertCircle, RefreshCw, CheckCircle, Clock, Signal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouters } from "../hooks/use-routers"

export function RoutersPage() {
  const { routers, loading, error, refetch } = useRouters()
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null)

  const handleRouterSelect = (router: string) => {
    setSelectedRouter(router)
    // Here you could add logic to switch to the selected router
    console.log("Selected router:", router)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4">
              <Router className="h-3 w-3 sm:h-4 sm:w-4" />
              Loading Routers...
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
              Router Management
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
            <CardTitle className="text-red-900">Connection Error</CardTitle>
            <CardDescription>
              Unable to load routers. Please make sure the FastAPI server is running on http://127.0.0.1:8005
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg font-mono">{error}</p>
            <Button onClick={refetch} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
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
            <Router className="h-3 w-3 sm:h-4 sm:w-4" />
            {routers.length} Router{routers.length !== 1 ? "s" : ""} Available
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
            Router Management
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Manage and switch between available routers for your job application tracking
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            Last updated: just now
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Routers</p>
                  <p className="text-3xl font-bold">{routers.length}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Available
                  </Badge>
                </div>
                <Router className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Router</p>
                  <p className="text-lg font-bold truncate">{selectedRouter || "None Selected"}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    {selectedRouter ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Signal className="h-10 w-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Connection Status</p>
                  <p className="text-lg font-bold">Online</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                    Stable
                  </Badge>
                </div>
                <Wifi className="h-10 w-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Router Grid */}
        {routers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Router className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Routers Available</h3>
              <p className="text-slate-600 mb-4">
                No routers were found in the configuration. Please check your routers.json file.
              </p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routers.map((router, index) => (
              <Card
                key={index}
                className={`overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                  selectedRouter === router
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-500"
                    : "bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50"
                }`}
                onClick={() => handleRouterSelect(router)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wifi className={`h-5 w-5 ${selectedRouter === router ? "text-blue-600" : "text-slate-600"}`} />
                    <span className="truncate">{router}</span>
                    {selectedRouter === router && <Badge className="ml-auto bg-blue-600 text-white">Active</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {selectedRouter === router ? "Currently selected router" : "Click to select this router"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Connection:</span>
                      <span className="text-slate-900 font-medium">Stable</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Type:</span>
                      <span className="text-slate-900 font-medium">Network Router</span>
                    </div>
                  </div>
                  <Button
                    className={`w-full mt-4 transition-all duration-200 ${
                      selectedRouter === router
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRouterSelect(router)
                    }}
                  >
                    {selectedRouter === router ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Router className="mr-2 h-4 w-4" />
                        Select Router
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 py-6 sm:py-8 px-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            onClick={refetch}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Routers
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 bg-transparent w-full sm:w-auto"
            disabled={!selectedRouter}
          >
            <Signal className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </div>
      </div>
    </div>
  )
}
