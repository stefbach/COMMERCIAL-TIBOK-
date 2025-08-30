"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { SupabaseClientDB } from "@/lib/supabase-db"

export function SupabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    connectionStatus: "En cours...",
    organizations: { count: 0, sample: null },
    contracts: { count: 0, sample: null, errors: [] },
    tableStructure: null,
    schemaInfo: null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    runFullDiagnostic()
  }, [])

  const runFullDiagnostic = async () => {
    setLoading(true)
    
    try {
      // Test 1: Connexion de base
      console.log("[DIAGNOSTIC] Testing basic connection...")
      const orgs = await SupabaseClientDB.getOrganizations()
      
      let orgSample = null
      if (orgs.length > 0) {
        orgSample = orgs[0]
      }
      
      // Test 2: Contrats et leur structure
      console.log("[DIAGNOSTIC] Testing contracts...")
      const contracts = await SupabaseClientDB.getContracts()
      
      let contractSample = null
      let contractErrors = []
      if (contracts.length > 0) {
        contractSample = contracts[0]
        console.log("[DIAGNOSTIC] Sample contract:", contractSample)
        
        // Vérifier les champs manquants ou incohérents
        contracts.forEach((contract, index) => {
          if (!contract.organization_id && !contract.organizationId) {
            contractErrors.push(`Contrat ${index + 1}: Aucun lien vers l'organisation`)
          }
          if (contract.organization_id && contract.organizationId) {
            contractErrors.push(`Contrat ${index + 1}: Double champ organisation (${contract.organization_id} vs ${contract.organizationId})`)
          }
        })
      }
      
      // Test 3: Test de création de contrat
      console.log("[DIAGNOSTIC] Testing contract creation...")
      if (orgs.length > 0) {
        const testContract = {
          title: "Test Contrat Diagnostic",
          description: "Test de diagnostic",
          organization_id: orgs[0].id.toString(),
          contact_id: null,
          value: 0,
          currency: "EUR",
          status: "envoye",
          assigned_to: "",
          expiration_date: undefined,
          signed_date: undefined,
          sent_date: new Date(),
          notes: "Test diagnostic",
          documents: [],
        }
        
        try {
          const newContract = await SupabaseClientDB.createContract(testContract)
          console.log("[DIAGNOSTIC] Test contract created successfully:", newContract)
          
          // Nettoyer le contrat de test
          await SupabaseClientDB.deleteContract(newContract.id)
          console.log("[DIAGNOSTIC] Test contract cleaned up")
          
        } catch (createError) {
          contractErrors.push(`Erreur création: ${(createError as Error).message}`)
          console.error("[DIAGNOSTIC] Create error:", createError)
        }
      }
      
      setDiagnostics({
        connectionStatus: "✅ Connexion réussie",
        organizations: { 
          count: orgs.length, 
          sample: orgSample 
        },
        contracts: { 
          count: contracts.length, 
          sample: contractSample,
          errors: contractErrors
        },
        tableStructure: null,
        schemaInfo: null
      })
      
    } catch (error) {
      console.error("[DIAGNOSTIC] Error:", error)
      setDiagnostics(prev => ({
        ...prev,
        connectionStatus: `❌ Erreur: ${(error as Error).message}`,
      }))
    } finally {
      setLoading(false)
    }
  }

  const fixContractOrganizationLinks = async () => {
    setLoading(true)
    
    try {
      console.log("[DIAGNOSTIC] Fixing contract-organization links...")
      const contracts = await SupabaseClientDB.getContracts()
      const organizations = await SupabaseClientDB.getOrganizations()
      
      let fixed = 0
      for (const contract of contracts) {
        // Si le contrat n'a pas de organization_id mais a organizationId
        if (!contract.organization_id && contract.organizationId) {
          await SupabaseClientDB.updateContract(contract.id, {
            organization_id: contract.organizationId
          })
          fixed++
        }
        
        // Si le contrat a organization_id mais pas organizationId
        if (contract.organization_id && !contract.organizationId) {
          await SupabaseClientDB.updateContract(contract.id, {
            organizationId: contract.organization_id
          })
          fixed++
        }
      }
      
      console.log(`[DIAGNOSTIC] Fixed ${fixed} contracts`)
      alert(`Réparation terminée ! ${fixed} contrats corrigés.`)
      
      // Relancer le diagnostic
      await runFullDiagnostic()
      
    } catch (error) {
      console.error("[DIAGNOSTIC] Fix error:", error)
      alert(`Erreur lors de la réparation: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestData = async () => {
    setLoading(true)
    
    try {
      const organizations = await SupabaseClientDB.getOrganizations()
      if (organizations.length === 0) {
        alert("Créez d'abord des organisations avant de créer des contrats de test")
        return
      }
      
      const testContract = {
        title: `Contrat Test - ${organizations[0].name}`,
        description: "Contrat de test créé par le diagnostic",
        organization_id: organizations[0].id.toString(),
        contact_id: null,
        value: 1000,
        currency: "EUR",
        status: "envoye",
        assigned_to: "",
        expiration_date: undefined,
        signed_date: undefined,
        sent_date: new Date(),
        notes: "Créé par le diagnostic pour tester la liaison",
        documents: [],
      }
      
      const newContract = await SupabaseClientDB.createContract(testContract)
      console.log("[DIAGNOSTIC] Test contract created:", newContract)
      
      alert("Contrat de test créé avec succès !")
      await runFullDiagnostic()
      
    } catch (error) {
      console.error("[DIAGNOSTIC] Error creating test data:", error)
      alert(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Diagnostic Complet Supabase - Contrats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status général */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Statut de la connexion:</span>
            <Badge variant={diagnostics.connectionStatus.includes('✅') ? 'default' : 'destructive'}>
              {diagnostics.connectionStatus}
            </Badge>
          </div>

          {/* Organisations */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Organisations: {diagnostics.organizations.count}
            </h4>
            {diagnostics.organizations.sample && (
              <div className="text-sm text-gray-600">
                <p>Exemple: {diagnostics.organizations.sample.name}</p>
                <p>ID: {diagnostics.organizations.sample.id}</p>
              </div>
            )}
          </div>

          {/* Contrats */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {diagnostics.contracts.errors.length > 0 ? (
                <XCircle className="w-4 h-4 text-red-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              Contrats: {diagnostics.contracts.count}
            </h4>
            
            {diagnostics.contracts.sample && (
              <div className="text-sm text-gray-600 mb-2">
                <p>Exemple: {diagnostics.contracts.sample.title}</p>
                <p>Organization ID (snake_case): {diagnostics.contracts.sample.organization_id || "❌ Manquant"}</p>
                <p>Organization ID (camelCase): {diagnostics.contracts.sample.organizationId || "❌ Manquant"}</p>
                <p>Status: {diagnostics.contracts.sample.status}</p>
              </div>
            )}
            
            {diagnostics.contracts.errors.length > 0 && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Problèmes détectés:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {diagnostics.contracts.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runFullDiagnostic} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Relancer Diagnostic
            </Button>
            
            <Button 
              onClick={fixContractOrganizationLinks} 
              disabled={loading || diagnostics.contracts.errors.length === 0}
              variant="default"
            >
              🔧 Réparer les liens
            </Button>
            
            <Button 
              onClick={createTestData} 
              disabled={loading || diagnostics.organizations.count === 0}
              variant="secondary"
            >
              ➕ Créer contrat test
            </Button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Diagnostic en cours...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
