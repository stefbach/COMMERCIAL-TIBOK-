"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Menu,
  LogOut,
  BarChart3,
  CalendarDays,
  FileText,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  user: User | null
  onLogout: () => void
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "appointments", label: "Rendez-vous", icon: CalendarDays },
  { id: "contracts", label: "Contrats", icon: FileText },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border shadow-lg z-40 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-xl font-bold text-blue-600">TIBOK MARKETING</h1>
              {user && (
                <p className="text-sm text-sidebar-foreground/70">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]} ({user.user_metadata?.role || "user"})
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center px-6 py-3 text-left transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border shadow-md"
      >
        <Menu className="w-4 h-4" />
      </Button>
    </div>
  )
}
