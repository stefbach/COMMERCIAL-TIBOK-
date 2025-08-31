"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Organizations } from "@/components/organizations"
import { AppointmentsTab } from "@/components/appointments-tab"
import { ContractsTab } from "@/components/contracts-tab"
import { DocumentsManagement } from "@/components/documents-management"
import { UsersManagement } from "@/components/users-management"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { SupabaseClientDB } from "@/lib/supabase-db"
import type { User } from "@supabase/supabase-js"
import type { Contact, Organization } from "@/types/crm"
import { DatabaseDiagnostic } from "@/components/database-diagnostic"

interface CRMAppProps {
  initialUser: User
}

export default function CRMApp({ initialUser }: CRMAppProps) {
  const [currentView, setCurrentView] = useState("dashboard")
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "supabase" | "demo">("checking")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkConnection = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setIsDemoMode(true)
        setConnectionStatus("demo")
        console.log("[v0] Mode DEMO activé - Variables d'environnement Supabase manquantes")
      } else {
        try {
          const { data, error } = await supabase.from("organizations").select("count").limit(1)
          if (error) {
            console.log("[v0] Erreur Supabase, basculement en mode DEMO:", error.message)
            setIsDemoMode(true)
            setConnectionStatus("demo")
          } else {
            console.log("[v0] Connexion Supabase réussie")
            setIsDemoMode(false)
            setConnectionStatus("supabase")
          }
        } catch (error) {
          console.log("[v0] Erreur de connexion, basculement en mode DEMO:", error)
          setIsDemoMode(true)
          setConnectionStatus("demo")
        }
      }
    }

    checkConnection()
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [contactsData, orgsData] = await Promise.all([
        SupabaseClientDB.getContacts(),
        SupabaseClientDB.getOrganizations(),
      ])
      setContacts(contactsData)
      setOrganizations(orgsData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  useEffect(() => {
    if (isDemoMode) return // Skip auth listener in demo mode

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login")
      } else if (event === "SIGNED_IN" && session?.user) {
        setCurrentUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase, isDemoMode])

  const handleLogout = async () => {
    if (isDemoMode) {
      router.push("/auth/login")
      return
    }
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const loadDemoData = async () => {
    const demoOrganizations = [
      {
        id: "1",
        name: "TechCorp Solutions",
        industry: "Technology",
        country: "USA",
        city: "San Francisco",
        website: "https://techcorp.com",
        size: "Large",
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Global Healthcare Inc",
        industry: "Healthcare",
        country: "Canada",
        city: "Toronto",
        website: "https://globalhc.com",
        size: "Large",
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Green Energy Solutions",
        industry: "Energy",
        country: "Germany",
        city: "Berlin",
        website: "https://greenenergy.de",
        size: "Medium",
        status: "prospect",
        created_at: new Date().toISOString(),
      },
    ]

    localStorage.setItem("demo_organizations", JSON.stringify(demoOrganizations))
    alert("Demo data loaded successfully!")
    window.location.reload()
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "organizations":
        return <Organizations />
      case "appointments":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">Rendez-vous</h2>
            <AppointmentsTab contacts={contacts} organizations={organizations} />
          </div>
        )
      case "contracts":
        return (
          <div className="p-6">
            <ContractsTab contacts={contacts} organizations={organizations} />
          </div>
        )
      case "documents":
        return <DocumentsManagement />
      case "users":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">Gestion des Utilisateurs</h2>
            <UsersManagement />
          </div>
        )
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Settings</h2>
            <div className="space-y-6">
              <DatabaseDiagnostic />
              <div className="space-y-4">
                <p className="text-muted-foreground">Application settings coming soon...</p>
                <Button onClick={loadDemoData} className="bg-primary hover:bg-primary/90">
                  Load Demo Data
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        {connectionStatus === "checking" && (
          <Badge variant="secondary" className="animate-pulse">
            Vérification connexion...
          </Badge>
        )}
        {connectionStatus === "supabase" && (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            🟢 Connecté à Supabase
          </Badge>
        )}
        {connectionStatus === "demo" && (
          <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
            🟡 Mode Démo (LocalStorage)
          </Badge>
        )}
      </div>

      <Sidebar currentView={currentView} onViewChange={setCurrentView} user={currentUser} onLogout={handleLogout} />
      <div className="ml-64 min-h-screen">{renderCurrentView()}</div>
    </div>
  )
}
