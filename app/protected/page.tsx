import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CRMApp from "@/components/crm-app"

export default async function ProtectedPage() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      redirect("/auth/login")
    }

    return <CRMApp initialUser={data.user} />
  } catch (error) {
    console.log("[v0] Supabase not configured, using demo mode:", error)

    // Create a mock user for demo purposes
    const mockUser = {
      id: "demo-user-123",
      email: "demo@example.com",
      user_metadata: {
        full_name: "Demo User",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Mode Démo - Configuration Supabase Requise</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour utiliser l'authentification complète, configurez les variables d'environnement Supabase dans les
                  Paramètres du Projet (icône ⚙️).
                </p>
              </div>
            </div>
          </div>
        </div>
        <CRMApp initialUser={mockUser as any} />
      </div>
    )
  }
}
