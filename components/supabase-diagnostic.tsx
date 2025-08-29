"use client"

import { useState, useEffect } from "react"
import { SupabaseClientDB } from "@/utils/supabaseClientDB" // Assuming SupabaseClientDB is declared in this file

export function SupabaseDiagnostic() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...")
  const [envVars, setEnvVars] = useState<any>({})
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    console.log("[v0] Checking Supabase connection...")

    // Check environment variables
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
    setEnvVars(vars)

    if (!vars.NEXT_PUBLIC_SUPABASE_URL || !vars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setConnectionStatus("❌ Variables d'environnement manquantes")
      return
    }

    try {
      // Test connection to organizations table
      const result = await SupabaseClientDB.getOrganizations()
      console.log("[v0] Supabase test result:", result)
      setConnectionStatus("✅ Connexion Supabase réussie")
      setTestResult(`${result.length} organisations trouvées`)
    } catch (error) {
      console.error("[v0] Supabase connection error:", error)
      setConnectionStatus("❌ Erreur de connexion Supabase")
      setTestResult(error.message)
    }
  }

  const testImport = async () => {
    console.log("[v0] Testing import to Supabase...")

    const testOrg = {
      name: "Test Hotel Maurice",
      industry: "Hôtellerie",
      category: "4 étoiles",
      region: "Port Louis",
      district: "Port Louis",
      city: "Port Louis",
      address: "123 Test Street",
      phone: "+230 123 4567",
      email: "test@hotel.mu",
      website: "https://test-hotel.mu",
      nb_chambres: 50,
      secteur: "Tourisme",
      zone_geographique: "Nord",
      contact_principal: "Jean Dupont",
      contact_fonction: "Manager",
      notes: "Test d'importation",
    }

    try {
      const result = await SupabaseClientDB.createOrganization(testOrg)
      console.log("[v0] Test import result:", result)
      setTestResult("✅ Test d'importation réussi")
      checkConnection() // Refresh count
    } catch (error) {
      console.error("[v0] Test import error:", error)
      setTestResult(`❌ Erreur d'importation: ${error.message}`)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Diagnostic Supabase</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">État de la connexion:</h4>
          <p className="text-sm text-gray-600">{connectionStatus}</p>
        </div>

        <div>
          <h4 className="font-medium">Variables d'environnement:</h4>
          <div className="text-sm text-gray-600">
            <p>NEXT_PUBLIC_SUPABASE_URL: {envVars.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurée" : "❌ Manquante"}</p>
            <p>
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurée" : "❌ Manquante"}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium">Résultat du test:</h4>
          <p className="text-sm text-gray-600">{testResult}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={checkConnection} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Tester Connexion
          </button>
          <button onClick={testImport} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Tester Import
          </button>
        </div>
      </div>
    </div>
  )
}
