"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"

import {
  Calendar,
  Home,
  Settings,
  BarChart3,
  Target,
  TrendingUp,
  User,
  Bell,
  LogOut,
  Router,
  Search,
  PlusCircle,
  FileText,
  GitBranch,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Create",
    url: "/create",
    icon: PlusCircle,
  },
  {
    title: "Manage",
    url: "/manage",
    icon: FileText,
  },
  {
    title: "Timeline",
    url: "/timeline",
    icon: GitBranch,
  },
  {
    title: "Routers",
    url: "/routers",
    icon: Router,
  },
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: Search,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Target,
  },
  {
    title: "Performance",
    url: "/performance",
    icon: TrendingUp,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar {...props} className="border-r-0">
      <SidebarHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-4">
          {/* Cute SVG Logo */}
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
              <rect x="20" y="28" width="24" height="16" rx="2" fill="#3B82F6" />
              <rect x="20" y="28" width="24" height="4" rx="2" fill="#1E40AF" />
              <path d="M28 28 V24 Q28 22 30 22 H34 Q36 22 36 24 V28" stroke="#1E40AF" strokeWidth="2" fill="none" />
              <rect x="22" y="20" width="2" height="8" rx="1" fill="#10B981" />
              <rect x="26" y="16" width="2" height="12" rx="1" fill="#F59E0B" />
              <rect x="30" y="12" width="2" height="16" rx="1" fill="#EF4444" />
              <rect x="34" y="18" width="2" height="10" rx="1" fill="#8B5CF6" />
              <rect x="38" y="14" width="2" height="14" rx="1" fill="#06B6D4" />
              <path d="M12 16 L14 18 L12 20 L10 18 Z" fill="#F59E0B" />
              <path d="M50 12 L52 14 L50 16 L48 14 Z" fill="#10B981" />
              <path d="M52 40 L54 42 L52 44 L50 42 Z" fill="#EF4444" />
              <path d="M10 48 L12 50 L10 52 L8 50 Z" fill="#8B5CF6" />
              <circle cx="16" cy="24" r="1" fill="#60A5FA" opacity="0.6" />
              <circle cx="48" cy="20" r="1" fill="#34D399" opacity="0.6" />
              <circle cx="46" cy="48" r="1" fill="#FBBF24" opacity="0.6" />
              <circle cx="18" cy="44" r="1" fill="#A78BFA" opacity="0.6" />
              <circle cx="28" cy="36" r="1.5" fill="#FFFFFF" />
              <circle cx="36" cy="36" r="1.5" fill="#FFFFFF" />
              <path d="M30 40 Q32 42 34 40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
              JobAnalytics
            </h2>
            <p className="text-xs text-slate-500 truncate">Track your success</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-slate-50 to-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold text-xs sm:text-sm">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="transition-all duration-200 hover:scale-105 hover:shadow-sm text-sm"
                  >
                    <button onClick={() => router.push(item.url)} className="flex items-center gap-2 sm:gap-3 w-full">
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full hover:bg-blue-100 transition-colors duration-200">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-2 ring-blue-200">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm">
                      AJ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs sm:text-sm font-medium truncate">Alex Johnson</span>
                    <span className="text-xs text-slate-500 truncate">Software Engineer</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
