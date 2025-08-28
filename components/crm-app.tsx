"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Organizations } from "@/components/organizations"
import { AppointmentsTab } from "@/components/appointments-tab"
import { ContractsTab } from "@/components/contracts-tab"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { SupabaseClientDB } from "@/lib/supabase-db"
import type { User } from "@supabase/supabase-js"
import type { Contact, Organization } from "@/types/crm"

interface CRMAppProps {
  initialUser: User
}

export default function CRMApp({ initialUser }: CRMAppProps) {
  const [currentView, setCurrentView] = useState("dashboard")
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsDemoMode(!url || !key)
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

    // Listen for auth changes
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
      case "contacts":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-foreground mb-4">Contacts</h2>
            <p className="text-muted-foreground">Contact management coming soon...</p>
          </div>
        )
      case "pipeline":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-foreground mb-4">Pipeline</h2>
            <p className="text-muted-foreground">Sales pipeline management coming soon...</p>
          </div>
        )
      case "appointments":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Rendez-vous</h2>
            <AppointmentsTab contacts={contacts} organizations={organizations} />
          </div>
        )
      case "contracts":
        return (
          <div className="p-6">
            <ContractsTab contacts={contacts} organizations={organizations} />
          </div>
        )
      case "activities":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-foreground mb-4">Activities</h2>
            <p className="text-muted-foreground">Activity tracking coming soon...</p>
          </div>
        )
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-foreground mb-4">Settings</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">Application settings coming soon...</p>
              <Button onClick={loadDemoData} className="bg-primary hover:bg-primary/90">
                Load Demo Data
              </Button>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} user={currentUser} onLogout={handleLogout} />
      <div className="ml-64 min-h-screen">{renderCurrentView()}</div>
    </div>
  )
}
