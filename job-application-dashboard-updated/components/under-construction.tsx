"use client"

import { Construction, ArrowLeft, Wrench, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UnderConstructionProps {
  title: string
  description?: string
  onBack?: () => void
}

export function UnderConstruction({
  title,
  description = "This feature is currently being developed and will be available soon.",
  onBack,
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Wrench className="h-4 w-4 text-orange-500" />
              In Development
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4 text-blue-500" />
              Coming Soon
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">What's coming:</p>
            <ul className="text-xs text-slate-600 space-y-1 text-left">
              <li>• Advanced analytics and reporting</li>
              <li>• Interactive data visualization</li>
              <li>• Export and sharing capabilities</li>
              <li>• Real-time notifications</li>
            </ul>
          </div>

          {onBack && (
            <Button onClick={onBack} variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
