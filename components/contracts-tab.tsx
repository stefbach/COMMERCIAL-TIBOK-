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
import { Calendar, FileText, User, Euro, Trash2, Edit, Plus } from "lucide-react"
import { type Contract, type Organization, type Contact, CONTRACT_STATUS_LABELS } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface ContractsTabProps {
  organizations: Organization[]
  contacts: Contact[]
}

export function ContractsTab({ organizations, contacts }: ContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [filters, setFilters] = useState({
    status: "all",
    assignedTo: "all",
    organization: "all",
  })

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizationId: "",
    contactId: "",
    value: "",
    currency: "EUR",
    status: "draft" as Contract["status"],
    assignedTo: "",
    expirationDate: "",
    notes: "",
  })

  useEffect(() => {
    loadContracts()
  }, [])

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
      const contractData: Omit<Contract, "id" | "createdDate" | "updatedDate"> = {
        ...formData,
        value: Number.parseFloat(formData.value) || 0,
        documents: [],
        signedDate: formData.status === "signed" ? new Date() : undefined,
      }

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      organizationId: "",
      contactId: "",
      value: "",
      currency: "EUR",
      status: "draft",
      assignedTo: "",
      expirationDate: "",
      notes: "",
    })
    setShowForm(false)
    setEditingContract(null)
  }

  const startEdit = (contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      title: contract.title,
      description: contract.description,
      organizationId: contract.organizationId,
      contactId: contract.contactId,
      value: contract.value.toString(),
      currency: contract.currency,
      status: contract.status,
      assignedTo: contract.assignedTo,
      expirationDate: contract.expirationDate ? contract.expirationDate.toISOString().split("T")[0] : "",
      notes: contract.notes,
    })
    setShowForm(true)
  }

  const getStatusBadgeColor = (status: Contract["status"]) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    if (filters.status !== "all" && contract.status !== filters.status) return false
    if (filters.assignedTo !== "all" && contract.assignedTo !== filters.assignedTo) return false
    if (filters.organization !== "all" && contract.organizationId !== filters.organization) return false
    return true
  })

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id.toString() === orgId)
    return org?.name || "Organisation inconnue"
  }

  const getContactName = (contactId: string) => {
    const contact = contacts.find((c) => c.id.toString() === contactId)
    return contact?.fullName || "Contact inconnu"
  }

  if (loading && contracts.length === 0) {
    return <div className="p-4">Chargement des contrats...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Contrats</h2>
          <p className="text-gray-600">Gérez vos contrats et leur affectation aux commerciaux</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Contrat
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Statut</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="signed">Signé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commercial</Label>
              <Select
                value={filters.assignedTo}
                onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les commerciaux</SelectItem>
                  {Array.from(new Set(contracts.map((c) => c.assignedTo))).map((commercial) => (
                    <SelectItem key={commercial} value={commercial}>
                      {commercial}
                    </SelectItem>
                  ))}
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

      {/* Contract Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContract ? "Modifier le Contrat" : "Nouveau Contrat"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du contrat</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="value">Valeur</Label>
                  <div className="flex gap-2">
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="organization">Organisation</Label>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
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
                  <Label htmlFor="contact">Contact</Label>
                  <Select
                    value={formData.contactId}
                    onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts
                        .filter(
                          (c) => !formData.organizationId || c.organizationId.toString() === formData.organizationId,
                        )
                        .map((contact) => (
                          <SelectItem key={contact.id} value={contact.id.toString()}>
                            {contact.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Contract["status"]) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="sent">Envoyé</SelectItem>
                      <SelectItem value="signed">Signé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Commercial assigné</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Nom du commercial"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Date d'expiration</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
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
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
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

      {/* Contracts List */}
      <div className="grid gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">Aucun contrat trouvé</CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{contract.title}</h3>
                      <Badge className={getStatusBadgeColor(contract.status)}>
                        {CONTRACT_STATUS_LABELS[contract.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{getOrganizationName(contract.organizationId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{getContactName(contract.contactId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        <span>
                          {contract.value.toLocaleString()} {contract.currency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Commercial: {contract.assignedTo}</span>
                      </div>
                      {contract.expirationDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Expire le: {new Date(contract.expirationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {contract.description && <p className="mt-2 text-sm text-gray-700">{contract.description}</p>}
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
          ))
        )}
      </div>
    </div>
  )
}
