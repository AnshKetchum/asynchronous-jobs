"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Router,
  Search,
  BarChart3,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  FileEdit,
  Briefcase,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "create", label: "Create", icon: Plus },
  { id: "manage", label: "Manage", icon: FileEdit },
  { id: "routers", label: "Routers", icon: Router },
  { id: "marketplace", label: "Marketplace", icon: Search },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "applications", label: "Applications", icon: Target },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Asynchronous Jobs</h1>
            <p className="text-sm text-gray-500">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h2>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback className="bg-gray-800 text-white">AC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Ansh Chaurasia</p>
            <p className="text-xs text-gray-500 truncate">Hardware R&D Intern</p>
          </div>
        </div>
      </div>
    </div>
  )
}
