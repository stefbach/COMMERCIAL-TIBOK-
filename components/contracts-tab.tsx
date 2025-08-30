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
import { Calendar, FileText, Trash2, Edit, Plus, Upload, Download, X, AlertTriangle } from "lucide-react"
import { type Contract, type Organization, type Contact } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface ContractsTabProps {
  organizations: Organization[]
  contacts: Contact[]
}

// ✅ STATUTS COHÉRENTS ET SIMPLIFIÉS
const CONTRACT_STATUS = {
  envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-800" },
  signe: { label: "Signé", color: "bg-green-100 text-green-800" },
  annule: { label: "Annulé", color: "bg-red-100 text-red-800" }
} as const

type ContractStatus = keyof typeof CONTRACT_STATUS

// ✅ INTERFACE DE FORMULAIRE SIMPLE
interface ContractFormData {
  description: string
  organizationId: string
  status: ContractStatus
  sentDate: string
  signatureDate: string
}

// ✅ COMPOSANT RECODÉ COMPLÈTEMENT
export function ContractsTab({ organizations, contacts }: ContractsTabProps) {
  // ============ STATE ============
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const [filters, setFilters] = useState({
    status: "all",
    organization: "all",
  })
  
  // ✅ FORMULAIRE SIMPLIFIÉ ET COHÉRENT
  const [formData, setFormData] = useState<ContractFormData>({
    description: "",
    organizationId: "",
    status: "envoye",
    sentDate: "",
    signatureDate: "",
  })

  // ============ EFFECTS ============
  useEffect(() => {
    loadContracts()
  }, [])

  // ============ DATA LOADING ============
  const loadContracts = async () => {
    try {
      console.log("[CONTRACTS] Loading contracts...")
      setLoading(true)
      const data = await SupabaseClientDB.getContracts()
      console.log("[CONTRACTS] Contracts loaded:", data.length)
      setContracts(data)
    } catch (error) {
      console.error("[CONTRACTS] Error loading contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  // ============ FORM HANDLERS ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.organizationId) {
      alert("Erreur: Organisation obligatoire.")
      return
    }

    setLoading(true)

    try {
      console.log("[CONTRACTS] Submitting contract:", formData)

      // ✅ GESTION DES FICHIERS SIMPLIFIÉE
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

      // ✅ DONNÉES COHÉRENTES EN camelCase
      const contractInput: Omit<Contract, "id" | "createdDate" | "updatedDate"> = {
        title: `Contrat - ${getOrganizationName(formData.organizationId)}`,
        description: formData.description,
        organizationId: formData.organizationId,        // ✅ camelCase
        contactId: null,
        value: 0,
        currency: "EUR",
        status: formData.status,
        assignedTo: "",                                 // ✅ camelCase
        expirationDate: undefined,
        signedDate: formData.status === "signe" && formData.signatureDate   // ✅ camelCase
          ? new Date(formData.signatureDate) 
          : undefined,
        sentDate: formData.sentDate ? new Date(formData.sentDate) : undefined,  // ✅ camelCase
        notes: "",
        documents: documents,
      }

      console.log("[CONTRACTS] Contract input prepared:", contractInput)

      if (editingContract) {
        console.log("[CONTRACTS] Updating existing contract:", editingContract.id)
        await SupabaseClientDB.updateContract(editingContract.id, contractInput)
      } else {
        console.log("[CONTRACTS] Creating new contract...")
        await SupabaseClientDB.createContract(contractInput)
      }

      await loadContracts()
      resetForm()
      console.log("[CONTRACTS] ✅ Contract saved successfully")
      
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error saving contract:", error)
      alert(`Erreur lors de l'enregistrement: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return

    try {
      console.log("[CONTRACTS] Deleting contract:", contractId)
      await SupabaseClientDB.deleteContract(contractId)
      await loadContracts()
      console.log("[CONTRACTS] ✅ Contract deleted successfully")
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error deleting contract:", error)
      alert(`Erreur lors de la suppression: ${(error as Error).message}`)
    }
  }

  const startEdit = (contract: Contract) => {
    console.log("[CONTRACTS] Starting edit for contract:", contract.id)
    setEditingContract(contract)
    
    // ✅ MAPPING COHÉRENT pour l'édition
    setFormData({
      description: contract.description || "",
      organizationId: contract.organizationId || "",     // ✅ cohérent
      status: (contract.status as ContractStatus) || "envoye",
      sentDate: contract.sentDate                        // ✅ cohérent
        ? new Date(contract.sentDate).toISOString().split("T")[0] 
        : "",
      signatureDate: contract.signedDate                 // ✅ cohérent
        ? new Date(contract.signedDate).toISOString().split("T")[0] 
        : "",
    })
    
    setSelectedFiles([])
    setShowForm(true)
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
  }

  // ============ FILE HANDLERS ============
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
      } else {
        throw new Error("No valid download data found")
      }
    } catch (error) {
      console.error("[CONTRACTS] Error downloading document:", error)
      alert(`Erreur lors du téléchargement de ${doc.name}`)
    }
  }

  // ============ UTILITY FUNCTIONS ============
  const getOrganizationName = (orgId: string) => {
    if (!orgId) return "Aucune organisation"
    const org = organizations.find((o) => o.id.toString() === orgId)
    return org ? org.name : `Organisation #${orgId.substring(0, 8)}...`
  }

  const getOrganizationDetails = (orgId: string) => {
    if (!orgId) return null
    return organizations.find((o) => o.id.toString() === orgId)
  }

  const filteredContracts = contracts.filter((contract) => {
    if (filters.status !== "all" && contract.status !== filters.status) return false
    if (filters.organization !== "all" && contract.organizationId !== filters.organization) return false
    return true
  })

  // ============ RENDER ============
  if (loading && contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Chargement des contrats...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ============ ALERT SI PAS D'ORGANISATIONS ============ */}
      {organizations.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Aucune organisation trouvée</h3>
                <p className="text-sm text-orange-700">
                  Les contrats doivent être liés à des organisations. Créez d'abord des organisations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ HEADER ============ */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Gestion des Contrats</h2>
          <p className="text-gray-600">Gérez vos contrats et leur suivi</p>
          <p className="text-sm text-blue-600">{contracts.length} contrat(s) • {organizations.length} organisation(s)</p>
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

      {/* ============ FILTRES ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
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
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============ FORMULAIRE ============ */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingContract ? "Modifier le Contrat" : "Nouveau Contrat"}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
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
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* Fichiers sélectionnés */}
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

                  {/* Documents existants */}
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
                  {loading ? "Sauvegarde..." : editingContract ? "Mettre à jour" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ============ LISTE DES CONTRATS ============ */}
      <div className="grid gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {contracts.length === 0 
                ? "Aucun contrat enregistré. Créez votre premier contrat !" 
                : "Aucun contrat trouvé avec les filtres actuels."
              }
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => {
            const organization = getOrganizationDetails(contract.organizationId || "")

            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* En-tête Organisation */}
                  {organization ? (
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
                  ) : (
                    <div className="mb-4 p-4 bg-orange-500 text-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                          <h2 className="text-xl font-bold">Organisation introuvable</h2>
                          <p className="text-orange-100 text-sm">ID: {contract.organizationId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contenu du contrat */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={CONTRACT_STATUS[contract.status as ContractStatus]?.color || "bg-gray-100 text-gray-800"}>
                          {CONTRACT_STATUS[contract.status as ContractStatus]?.label || contract.status}
                        </Badge>
                        {contract.title && (
                          <span className="text-lg font-semibold">{contract.title}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        {/* ✅ AFFICHAGE COHÉRENT DES DATES */}
                        {contract.sentDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Envoyé le: {new Date(contract.sentDate).toLocaleDateString("fr-FR")}</span>
                          </div>
                        )}
                        {contract.signedDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Signé le: {new Date(contract.signedDate).toLocaleDateString("fr-FR")}</span>
                          </div>
                        )}
                      </div>

                      {contract.description && (
                        <p className="mt-2 text-sm text-gray-700">{contract.description}</p>
                      )}

                      {/* Documents */}
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
                    </div>

                    {/* Actions */}
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
