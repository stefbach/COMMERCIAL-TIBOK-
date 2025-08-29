"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Database, RefreshCw } from "lucide-react"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface DiagnosticResult {
  table: string
  exists: boolean
  count?: number
  error?: string
}

export function DatabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "demo">("checking")

  const runDiagnostic = async () => {
    setIsLoading(true)
    const tables = ["organizations", "contacts", "appointments", "contracts"]
    const diagnosticResults: DiagnosticResult[] = []

    // Test connection status
    try {
      const orgs = await SupabaseClientDB.getOrganizations()
      setConnectionStatus("connected")
    } catch (error) {
      setConnectionStatus("demo")
    }

    // Test each table
    for (const table of tables) {
      try {
        let count = 0
        switch (table) {
          case "organizations":
            const orgs = await SupabaseClientDB.getOrganizations()
            count = orgs.length
            break
          case "contacts":
            const contacts = await SupabaseClientDB.getContacts()
            count = contacts.length
            break
          case "appointments":
            const appointments = await SupabaseClientDB.getAppointments()
            count = appointments.length
            break
          case "contracts":
            const contracts = await SupabaseClientDB.getContracts()
            count = contracts.length
            break
        }
        diagnosticResults.push({ table, exists: true, count })
      } catch (error) {
        diagnosticResults.push({
          table,
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    setResults(diagnosticResults)
    setIsLoading(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnostic Base de Données
          <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
            {connectionStatus === "connected" ? "Supabase" : "Mode Démo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">État des tables CRM dans votre base de données</p>
          <Button onClick={runDiagnostic} disabled={isLoading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.table} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {result.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{result.table}</p>
                  {result.error && <p className="text-xs text-red-500">{result.error}</p>}
                </div>
              </div>
              <div className="text-right">
                {result.exists && (
                  <Badge variant="outline">
                    {result.count} enregistrement{result.count !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {connectionStatus === "demo" && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Mode Démo Actif :</strong> L'application utilise localStorage. Les données sont stockées
              localement dans votre navigateur.
            </p>
          </div>
        )}

        {connectionStatus === "connected" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Connecté à Supabase :</strong> Toutes les données sont synchronisées avec votre base de données
              cloud.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
