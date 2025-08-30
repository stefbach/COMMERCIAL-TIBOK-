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

  const loadContracts = async () => {
    try {
      console.log("[v0] Loading contracts...")
      const data = await SupabaseClientDB.getContracts()
      console.log("[v0] Contracts loaded:", data)
      setContracts(data)
    } catch (error) {
      console.error("[v0] Error loading contracts:", error)
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

      console.log("[v0] Creating contract with data:", formData)

      const documents = await Promise.all(
        selectedFiles.map(async (file) => {
          let base64Data = (file as any).base64

          if (!base64Data) {
            // Convert file to base64 if not already done
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

      const contractData: Omit<Contract, "id" | "createdDate" | "updatedDate"> = {
        description: formData.description,
        organization_id: formData.organizationId,
        contact_id: null, // Supprimé
        status: formData.status,
        assigned_to: "", // Supprimé
        notes: "", // Supprimé
        title: "", // Supprimé
        value: 0,
        documents: documents,
        signed_date: formData.status === "signe" && formData.signatureDate 
          ? new Date(formData.signatureDate) 
          : undefined,
        sent_date: formData.sentDate ? new Date(formData.sentDate) : undefined,
      }

      console.log("[v0] Contract data being sent:", contractData)

      if (editingContract) {
        await SupabaseClientDB.updateContract(editingContract.id, contractData)
        console.log("[v0] Contract updated successfully")
      } else {
        await SupabaseClientDB.createContract(contractData)
        console.log("[v0] Contract created successfully")
      }

      await loadContracts()
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving contract:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return

    try {
      await SupabaseClientDB.deleteContract(contractId)
      console.log("[v0] Contract deleted successfully")
      await loadContracts()
    } catch (error) {
      console.error("[v0] Error deleting contract:", error)
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
  }

  const startEdit = (contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      description: contract.description || "",
      organizationId: contract.organizationId || "",
      status: (contract.status as ContractStatus) || "envoye",
      sentDate: contract.sent_date ? contract.sent_date.toISOString().split("T")[0] : "",
      signatureDate: contract.signedDate ? contract.signedDate.toISOString().split("T")[0] : "",
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
    if (filters.organization !== "all" && contract.organizationId !== filters.organization) return false
    return true
  })

  const getOrganizationName = (orgId: string) => {
    if (!orgId) return "Aucune organisation"
    const org = organizations.find((o) => o.id.toString() === orgId)
    if (!org) {
      console.log(`[v0] Organization not found for ID: ${orgId}`)
      return `Organisation #${orgId.substring(0, 8)}...`
    }
    return org.name
  }

  const getOrganizationDetails = (orgId: string) => {
    if (!orgId) return null
    return organizations.find((o) => o.id.toString() === orgId)
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
        console.log("[v0] Document downloaded:", doc.name)
      } else if (doc.url) {
        const link = document.createElement("a")
        link.href = doc.url
        link.download = doc.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("[v0] Document downloaded (fallback):", doc.name)
      } else {
        throw new Error("No valid download data found")
      }
    } catch (error) {
      console.error("[v0] Error downloading document:", error)
      alert(`Erreur lors du téléchargement de ${doc.name}. Le fichier pourrait ne plus être disponible.`)
    }
  }

  if (loading && contracts.length === 0) {
    return <div className="p-4">Chargement des contrats...</div>
  }

  return (
    <div className="space-y-6">
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
                          <SelectItem key={org.id} value={org.id.toString()}>
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
            <CardContent className="p-6 text-center text-gray-500">Aucun contrat trouvé</CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => {
            const organizationId = (contract as any).organization_id || contract.organizationId
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
                        {contract.signedDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Signé le: {new Date(contract.signedDate).toLocaleDateString("fr-FR")}</span>
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
