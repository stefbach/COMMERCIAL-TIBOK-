"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  FolderOpen
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  user: User
  onLogout: () => void
}

export function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Vue d'ensemble"
    },
    {
      id: "organizations", 
      label: "Organisations",
      icon: Building2,
      description: "Gestion des clients"
    },
    {
      id: "appointments",
      label: "Rendez-vous",
      icon: Calendar,
      description: "Planification RDV"
    },
    {
      id: "contracts",
      label: "Contrats", 
      icon: FileText,
      description: "Suivi contrats"
    },
    {
      id: "documents",
      label: "Documents",
      icon: FolderOpen,
      description: "Supports commerciaux"
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      description: "Gestion équipe"
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      description: "Configuration"
    }
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-blue-600">TIBOK</h1>
            <p className="text-xs text-muted-foreground">MARKETING</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </Button>
            )
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
