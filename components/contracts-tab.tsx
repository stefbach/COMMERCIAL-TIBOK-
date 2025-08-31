"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Trash2, Edit, Plus, Upload, Download, X } from "lucide-react"
import { type Contract, type Organization, type Contact } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { createClient } from "@/lib/supabase/client"

interface ContractsTabProps {
  organizations: Organization[]
  contacts: Contact[]
}

// Statuts simplifiés
const CONTRACT_STATUS_LABELS = {
  "envoye": "Envoyé",
  "signe": "Signé", 
  "annule": "Annulé"
} as const

type ContractStatus = keyof typeof CONTRACT_STATUS_LABELS

// ✅ AJOUT : Composant de debug frontend
const ContractFrontendDebugger = () => {
  const [contractId, setContractId] = useState('d816d1d8-b622-456d-8354-d087f8684319');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const supabase = createClient();

  const testDirectUpdate = async () => {
    setIsLoading(true);
    console.clear();
    console.log('🧪 TESTING CONTRACT UPDATE FROM FRONTEND');
    
    try {
      const { data: before } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();
        
      console.log('📋 Before update:', before);
      
      const testUpdate = {
        sent_date: new Date().toISOString(),
        signed_date: new Date().toISOString(),
        status: 'envoye'
      };
      
      console.log('📤 Sending update:', testUpdate);
      
      const result = await SupabaseClientDB.updateContract(contractId, testUpdate);
      console.log('✅ UpdateContract result:', result);
      
      // Vérification immédiate
      const { data: verification } = await supabase
        .from('contracts')
        .select('id, status, sent_date, signed_date, updated_date')
        .eq('id', contractId)
        .single();
        
      console.log('🔍 DB Verification immediately after:', verification);
      
      setLastResult({ success: true, data: result, verification });
      alert('✅ Test direct réussi ! Vérifiez la console.');
      
    } catch (error) {
      console.error('💥 Test failed:', error);
      setLastResult({ success: false, error: error.message });
      alert('❌ Test direct échoué. Vérifiez la console.');
    } finally {
      setIsLoading(false);
    }
  };

  const testSendProcess = async () => {
    setIsLoading(true);
    console.clear();
    console.log('🧪 TESTING SEND PROCESS');
    
    try {
      // Simuler votre processus d'envoi exact
      const now = new Date().toISOString();
      console.log(`[SEND] Using date: ${now}`);
      
      const result = await SupabaseClientDB.updateContract(contractId, {
        sent_date: now,
        status: 'envoye'
      });
      
      console.log('[SEND] ✅ Send result:', result);
      
      // Vérification immédiate
      const { data: verification } = await supabase
        .from('contracts')
        .select('id, status, sent_date, signed_date, updated_date')
        .eq('id', contractId)
        .single();
        
      console.log('[SEND] 🔍 DB Verification:', verification);
      
      setLastResult({ success: true, data: result, verification });
      alert('✅ Test envoi terminé ! Vérifiez la console.');
      
    } catch (error) {
      console.error('[SEND] ❌ Send failed:', error);
      setLastResult({ success: false, error: error.message });
      alert('❌ Test envoi échoué. Vérifiez la console.');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignProcess = async () => {
    setIsLoading(true);
    console.clear();
    console.log('🧪 TESTING SIGN PROCESS');
    
    try {
      const now = new Date().toISOString();
      console.log(`[SIGN] Using date: ${now}`);
      
      const result = await SupabaseClientDB.updateContract(contractId, {
        signed_date: now,
        status: 'signe'
      });
      
      console.log('[SIGN] ✅ Sign result:', result);
      
      // Vérification immédiate
      const { data: verification } = await supabase
        .from('contracts')
        .select('id, status, sent_date, signed_date, updated_date')
        .eq('id', contractId)
        .single();
        
      console.log('[SIGN] 🔍 DB Verification:', verification);
      
      setLastResult({ success: true, data: result, verification });
      alert('✅ Test signature terminé ! Vérifiez la console.');
      
    } catch (error) {
      console.error('[SIGN] ❌ Sign failed:', error);
      setLastResult({ success: false, error: error.message });
      alert('❌ Test signature échoué. Vérifiez la console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-800">🔧 Debug Frontend Contrats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Contract ID" 
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testDirectUpdate} disabled={isLoading} size="sm">
              Test Direct
            </Button>
            <Button onClick={testSendProcess} disabled={isLoading} size="sm" variant="outline">
              Test Envoi
            </Button>
            <Button onClick={testSignProcess} disabled={isLoading} size="sm" variant="secondary">
              Test Signature
            </Button>
          </div>
          
          {lastResult && (
            <div className="bg-white p-3 rounded border max-h-40 overflow-auto">
              <h4 className="font-bold text-sm">Dernier résultat :</h4>
              <pre className="text-xs mt-2">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
          
          <p className="text-xs text-purple-600">
            💡 Ouvrez la console (F12) pour voir tous les détails du debug
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function ContractsTab({ organizations, contacts }: ContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [showMigrationAlert, setShowMigrationAlert] = useState(false)
  
  const [filters, setFilters] = useState({
    status: "all",
    organization: "all",
  })
  
  const [formData, setFormData] = useState({
    description: "",
    organizationId: "",
    status: "envoye" as ContractStatus,
    sentDate: "",
    signatureDate: "",
  })
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    loadContracts()
    if (organizations.length === 0) {
      setShowMigrationAlert(true)
    }
  }, [organizations])

  // ✅ GESTION D'ERREURS ROBUSTE comme dans documents-management
  const loadContracts = async () => {
    try {
      setLoading(true)
      console.log("[CONTRACTS] Loading contracts...")
      const data = await SupabaseClientDB.getContracts()
      console.log("[CONTRACTS] Contracts loaded:", data.length, "contracts")
      setContracts(data)
    } catch (error) {
      console.error("[CONTRACTS] Error loading contracts:", error)
      // FALLBACK vers des données de démo ou tableau vide
      console.log("[CONTRACTS] Using fallback - empty array")
      setContracts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.organizationId) {
        alert("Erreur: Organisation obligatoire.")
        setLoading(false)
        return
      }

      console.log("[CONTRACTS] Creating contract with data:", formData)

      const documents = await Promise.all(
        selectedFiles.map(async (file) => {
          let base64Data = (file as any).base64

          if (!base64Data) {
            base64Data = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.readAsDataURL(file)
            })
          }

          return {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
            data: base64Data,
          }
        }),
      )

      // ✅ STRUCTURE COMPLÈTE - Avec les colonnes créées/modifiées
      const contractData = {
        organization_id: formData.organizationId,
        contact_id: null,
        description: formData.description,
        status: formData.status,
        signed_date: formData.status === "signe" && formData.signatureDate 
          ? new Date(formData.signatureDate).toISOString()
          : null,
        sent_date: formData.sentDate ? new Date(formData.sentDate).toISOString() : null,
        notes: "",
        documents: documents,
        // ✅ AJOUTÉ pour éviter les erreurs de cache
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }

      console.log("[CONTRACTS] Contract input prepared:", contractData)

      let result
      if (editingContract) {
        console.log("[CONTRACTS] ⚡ UPDATING existing contract:", editingContract.id)
        result = await SupabaseClientDB.updateContract(editingContract.id, contractData)
        console.log("[CONTRACTS] Contract updated successfully:", result)
      } else {
        console.log("[CONTRACTS] ⚡ CREATING new contract")
        result = await SupabaseClientDB.createContract(contractData)
        console.log("[CONTRACTS] Contract created successfully:", result)
      }

      await loadContracts()
      resetForm()
    } catch (error) {
      console.error("[CONTRACTS] Error saving contract:", error)
      // ✅ GESTION D'ERREUR DÉTAILLÉE
      if (error.message) {
        alert(`Erreur lors de la sauvegarde: ${error.message}`)
      } else {
        alert("Erreur lors de la sauvegarde du contrat")
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ AJOUT : Fonctions de test pour les boutons d'action
  const handleSendContract = async (contractId: string) => {
    console.log(`[SEND] ⚡ Starting send process for contract: ${contractId}`);
    
    try {
      const now = new Date().toISOString();
      console.log(`[SEND] Using date: ${now}`);
      
      const result = await SupabaseClientDB.updateContract(contractId, {
        sent_date: now,
        status: 'envoye'
      });
      
      console.log(`[SEND] ✅ Contract sent successfully:`, result);
      
      // Vérifier immédiatement dans la DB
      const supabase = createClient();
      const { data: verification } = await supabase
        .from('contracts')
        .select('id, status, sent_date, signed_date')
        .eq('id', contractId)
        .single();
        
      console.log(`[SEND] 🔍 Verification check:`, verification);
      
      // Recharger la liste
      await loadContracts();
      
      alert('✅ Contrat envoyé avec succès !');
      
    } catch (error) {
      console.error('[SEND] ❌ Send failed:', error);
      alert(`❌ Erreur envoi: ${error.message}`);
    }
  };

  const handleSignContract = async (contractId: string) => {
    console.log(`[SIGN] ⚡ Starting sign process for contract: ${contractId}`);
    
    try {
      const now = new Date().toISOString();
      console.log(`[SIGN] Using date: ${now}`);
      
      const result = await SupabaseClientDB.updateContract(contractId, {
        signed_date: now,
        status: 'signe'
      });
      
      console.log(`[SIGN] ✅ Contract signed successfully:`, result);
      
      // Vérifier immédiatement dans la DB
      const supabase = createClient();
      const { data: verification } = await supabase
        .from('contracts')
        .select('id, status, sent_date, signed_date')
        .eq('id', contractId)
        .single();
        
      console.log(`[SIGN] 🔍 Verification check:`, verification);
      
      // Recharger la liste
      await loadContracts();
      
      alert('✅ Contrat signé avec succès !');
      
    } catch (error) {
      console.error('[SIGN] ❌ Sign failed:', error);
      alert(`❌ Erreur signature: ${error.message}`);
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return

    try {
      console.log("[CONTRACTS] ⚡ Deleting contract:", contractId)
      await SupabaseClientDB.deleteContract(contractId)
      console.log("[CONTRACTS] Contract deleted successfully")
      await loadContracts()
    } catch (error) {
      console.error("[CONTRACTS] Error deleting contract:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    const processedFiles = await Promise.all(
      fileArray.map(async (file) => {
        return new Promise<File>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const processedFile = new File([file], file.name, { type: file.type })
            ;(processedFile as any).base64 = reader.result
            resolve(processedFile)
          }
          reader.readAsDataURL(file)
        })
      }),
    )

    setSelectedFiles((prev) => [...prev, ...processedFiles])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({
      description: "",
      organizationId: "",
      status: "envoye",
      sentDate: "",
      signatureDate: "",
    })
    setSelectedFiles([])
    setShowForm(false)
    setEditingContract(null)
    console.log("[CONTRACTS] ⚡ Form reset completed")
  }

  const startEdit = (contract: Contract) => {
    console.log("[CONTRACTS] ⚡ Starting edit for contract:", contract.id)
    setEditingContract(contract)
    setFormData({
      description: contract.description || "",
      organizationId: contract.organization_id || "",
      status: (contract.status as ContractStatus) || "envoye",
      sentDate: contract.sent_date ? new Date(contract.sent_date).toISOString().split("T")[0] : "",
      signatureDate: contract.signed_date ? new Date(contract.signed_date).toISOString().split("T")[0] : "",
    })
    setSelectedFiles([])
    setShowForm(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "signe":
        return "bg-green-100 text-green-800"
      case "envoye":
        return "bg-blue-100 text-blue-800"
      case "annule":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    if (filters.status !== "all" && contract.status !== filters.status) return false
    if (filters.organization !== "all" && contract.organization_id !== filters.organization) return false
    return true
  })

  const getOrganizationName = (orgId: string) => {
    if (!orgId) return "Aucune organisation"
    const org = organizations.find((o) => o.id === orgId)
    if (!org) {
      console.log(`[CONTRACTS] Organization not found for ID: ${orgId}`)
      return `Organisation #${orgId.substring(0, 8)}...`
    }
    return org.name
  }

  const getOrganizationDetails = (orgId: string) => {
    if (!orgId) return null
    return organizations.find((o) => o.id === orgId)
  }

  const downloadDocument = (doc: any) => {
    try {
      if (doc.data && doc.data.startsWith("data:")) {
        const link = document.createElement("a")
        link.href = doc.data
        link.download = doc.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("[CONTRACTS] Document downloaded:", doc.name)
      } else if (doc.url) {
        const link = document.createElement("a")
        link.href = doc.url
        link.download = doc.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("[CONTRACTS] Document downloaded (fallback):", doc.name)
      } else {
        throw new Error("No valid download data found")
      }
    } catch (error) {
      console.error("[CONTRACTS] Error downloading document:", error)
      alert(`Erreur lors du téléchargement de ${doc.name}. Le fichier pourrait ne plus être disponible.`)
    }
  }

  if (loading && contracts.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement des contrats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ AJOUT DU COMPOSANT DE DEBUG */}
      <ContractFrontendDebugger />

      {showMigrationAlert && organizations.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-orange-600">⚠️</div>
              <div>
                <h3 className="font-semibold text-orange-800">Aucune organisation trouvée</h3>
                <p className="text-sm text-orange-700">
                  Les contrats doivent être liés à des organisations. Veuillez d'abord importer ou créer des
                  organisations dans l'onglet "Organisations" avant de créer des contrats.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
                  onClick={() => setShowMigrationAlert(false)}
                >
                  Compris
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Gestion des Contrats</h2>
          <p className="text-gray-600">Gérez vos contrats et leur suivi</p>
          <p className="text-sm text-blue-600">{organizations.length} organisation(s) disponible(s) pour liaison</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          disabled={organizations.length === 0}
        >
          <Plus className="h-4 w-4" />
          Nouveau Contrat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="signe">Signé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Organisation</Label>
              <Select
                value={filters.organization}
                onValueChange={(value) => setFilters({ ...filters, organization: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les organisations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContract ? "Modifier le Contrat" : "Nouveau Contrat"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organisation *</Label>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une organisation" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.length === 0 ? (
                        <SelectItem value="" disabled>
                          Aucune organisation disponible
                        </SelectItem>
                      ) : (
                        organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Obligatoire : chaque contrat doit être lié à une organisation
                  </p>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ContractStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="envoye">Envoyé</SelectItem>
                      <SelectItem value="signe">Signé</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sentDate">Date d'envoi</Label>
                  <Input
                    id="sentDate"
                    type="date"
                    value={formData.sentDate}
                    onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signatureDate">Date de signature</Label>
                  <Input
                    id="signatureDate"
                    type="date"
                    value={formData.signatureDate}
                    onChange={(e) => setFormData({ ...formData, signatureDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Description du contrat..."
                />
              </div>
              <div>
                <Label>Documents du contrat</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Fichiers sélectionnés :</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSelectedFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {editingContract && editingContract.documents && editingContract.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Documents existants :</p>
                      {editingContract.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{doc.name}</span>
                            <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {doc.type?.split("/")[1]?.toUpperCase() || "FILE"}
                            </Badge>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingContract ? "Mettre à jour" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {loading ? "Chargement..." : "Aucun contrat trouvé"}
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => {
            const organizationId = contract.organization_id
            const organization = getOrganizationDetails(organizationId)

            return (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  {(() => {
                    if (organization) {
                      return (
                        <div className="mb-4 p-4 bg-blue-600 text-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6" />
                            <div>
                              <h2 className="text-2xl font-bold">{organization.name}</h2>
                              {organization.industry && (
                                <p className="text-blue-100 text-sm">Secteur: {organization.industry}</p>
                              )}
                              {organization.city && organization.region && (
                                <p className="text-blue-100 text-sm">
                                  📍 {organization.city}, {organization.region}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div className="mb-4 p-4 bg-orange-500 text-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6" />
                            <div>
                              <h2 className="text-2xl font-bold">{getOrganizationName(organizationId)}</h2>
                              <p className="text-orange-100 text-sm">
                                Organisation non trouvée dans la base de données
                              </p>
                              <p className="text-orange-100 text-xs">ID: {organizationId}</p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })()}

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusBadgeColor(contract.status)}>
                          {CONTRACT_STATUS_LABELS[contract.status as ContractStatus] || contract.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ID: {contract.id.slice(-8)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-blue-700 font-medium">
                            Organisation: {getOrganizationName(organizationId)}
                          </span>
                        </div>
                        {contract.sent_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Envoyé le: {new Date(contract.sent_date).toLocaleDateString("fr-FR")}</span>
                          </div>
                        )}
                        {contract.signed_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Signé le: {new Date(contract.signed_date).toLocaleDateString("fr-FR")}</span>
                          </div>
                        )}
                      </div>

                      {contract.description && <p className="mt-2 text-sm text-gray-700">{contract.description}</p>}

                      {contract.documents && contract.documents.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium mb-2">Documents ({contract.documents.length}) :</p>
                          <div className="space-y-1">
                            {contract.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3" />
                                  <span>{doc.name}</span>
                                  <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    {doc.type?.split("/")[1]?.toUpperCase() || "FILE"}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  onClick={() => downloadDocument(doc)}
                                  title={`Télécharger ${doc.name}`}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ✅ AJOUT : Boutons d'action pour tester */}
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs font-medium text-yellow-800 mb-2">🧪 Actions de Test :</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendContract(contract.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            📤 Marquer Envoyé
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSignContract(contract.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            ✍️ Marquer Signé
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEdit(contract)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
