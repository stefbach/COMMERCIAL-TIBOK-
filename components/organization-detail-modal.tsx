"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Plus, Save, X, Edit, Trash2, FileText, Upload, Download } from "lucide-react"
import type { Organization, Appointment, Contract } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { toast } from "sonner"

interface OrganizationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  organization: Organization | null
  onUpdate: () => void
}

// Statuts simplifiés - SYNCHRONISÉ avec contracts-tab.tsx
const CONTRACT_STATUS_LABELS = {
  "envoye": "Envoyé",
  "signe": "Signé", 
  "annule": "Annulé"
} as const

type ContractStatus = keyof typeof CONTRACT_STATUS_LABELS

export function OrganizationDetailModal({ isOpen, onClose, organization, onUpdate }: OrganizationDetailModalProps) {
  const [notes, setNotes] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showContractForm, setShowContractForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Formulaire avec SEULEMENT les champs qui existent dans la table
  const [organizationForm, setOrganizationForm] = useState({
    name: "",
    industry: "",
    category: "",
    region: "",
    zone_geographique: "",
    district: "",
    city: "",
    address: "",
    secteur: "",
    website: "",
    nb_chambres: "",
    phone: "",
    email: "",
    contact_principal: "",
    status: "active" as const,
  })

  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    location: "",
    type: "Meeting" as const,
    status: "Scheduled" as const,
  })

  // FORMULAIRE CONTRAT SYNCHRONISÉ avec contracts-tab.tsx
  const [contractForm, setContractForm] = useState({
    description: "",
    status: "envoye" as ContractStatus,
    sentDate: "",
    signatureDate: "",
  })

  useEffect(() => {
    if (organization) {
      setNotes(organization.notes || "")
      setOrganizationForm({
        name: organization.name || "",
        industry: organization.industry || "",
        category: organization.category || "",
        region: organization.region || "",
        zone_geographique: organization.zone_geographique || "",
        district: organization.district || "",
        city: organization.city || "",
        address: organization.address || "",
        secteur: organization.secteur || "",
        website: organization.website || "",
        nb_chambres: organization.nb_chambres?.toString() || "",
        phone: organization.phone || "",
        email: organization.email || "",
        contact_principal: organization.contact_principal || "",
        status: organization.status || "active",
      })
      loadAppointments()
      loadContracts()
    }
  }, [organization])

  const loadAppointments = async () => {
    if (!organization) return
    try {
      const data = await SupabaseClientDB.getAppointmentsByOrganization(organization.id)
      setAppointments(data)
    } catch (error) {
      console.error("Error loading appointments:", error)
    }
  }

  const loadContracts = async () => {
    if (!organization) return
    try {
      const data = await SupabaseClientDB.getContractsByOrganization(organization.id)
      setContracts(data)
    } catch (error) {
      console.error("Error loading contracts:", error)
    }
  }

  const handleSaveNotes = async () => {
    if (!organization) return
    setLoading(true)
    try {
      await SupabaseClientDB.updateOrganization(organization.id, { notes })
      toast.success("Notes sauvegardées avec succès")
      onUpdate()
    } catch (error) {
      console.error("Error saving notes:", error)
      toast.error("Erreur lors de la sauvegarde des notes")
    } finally {
      setLoading(false)
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setAppointmentForm({
      title: appointment.title,
      description: appointment.description || "",
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      location: appointment.location || "",
      type: appointment.type,
      status: appointment.status,
    })
    setShowAppointmentForm(true)
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return

    setLoading(true)
    try {
      await SupabaseClientDB.deleteAppointment(appointmentId)
      toast.success("Rendez-vous supprimé avec succès")
      loadAppointments()
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Erreur lors de la suppression du rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async () => {
    if (!organization) return
    setLoading(true)
    try {
      const appointment = {
        ...appointmentForm,
        organization_id: organization.id,
        duration: 60,
        reminder: true,
      }

      if (editingAppointment) {
        await SupabaseClientDB.updateAppointment(editingAppointment.id, appointment)
        toast.success("Rendez-vous modifié avec succès")
      } else {
        await SupabaseClientDB.createAppointment(appointment)
        toast.success("Rendez-vous créé avec succès")
      }

      setShowAppointmentForm(false)
      setEditingAppointment(null)
      setAppointmentForm({
        title: "",
        description: "",
        appointment_date: "",
        appointment_time: "",
        location: "",
        type: "Meeting",
        status: "Scheduled",
      })
      loadAppointments()
    } catch (error) {
      console.error("Error saving appointment:", error)
      toast.error("Erreur lors de la sauvegarde du rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setShowAppointmentForm(false)
    setEditingAppointment(null)
    setAppointmentForm({
      title: "",
      description: "",
      appointment_date: "",
      appointment_time: "",
      location: "",
      type: "Meeting",
      status: "Scheduled",
    })
  }

  const handleSaveOrganization = async () => {
    if (!organization) return
    setLoading(true)
    try {
      const updatedData = {
        ...organizationForm,
        nb_chambres: organizationForm.nb_chambres ? Number.parseInt(organizationForm.nb_chambres) : null,
      }
      await SupabaseClientDB.updateOrganization(organization.id, updatedData)
      toast.success("Organisation mise à jour avec succès")
      onUpdate()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error("Erreur lors de la mise à jour de l'organisation")
    } finally {
      setLoading(false)
    }
  }

  // GESTION FICHIERS SYNCHRONISÉE avec contracts-tab.tsx
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

  const resetContractForm = () => {
    setContractForm({
      description: "",
      status: "envoye",
      sentDate: "",
      signatureDate: "",
    })
    setSelectedFiles([])
    setShowContractForm(false)
    setEditingContract(null)
  }

  // CRÉATION/MODIFICATION CONTRAT SYNCHRONISÉE avec contracts-tab.tsx
  const handleCreateContract = async () => {
    if (!organization) return
    setLoading(true)
    try {
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
        description: contractForm.description,
        organization_id: organization.id,
        contact_id: null,
        status: contractForm.status,
        assigned_to: "",
        notes: "",
        title: "",
        value: 0,
        documents: documents,
        signed_date: contractForm.status === "signe" && contractForm.signatureDate 
          ? new Date(contractForm.signatureDate) 
          : undefined,
        sent_date: contractForm.sentDate ? new Date(contractForm.sentDate) : undefined,
      }

      if (editingContract) {
        await SupabaseClientDB.updateContract(editingContract.id, contractData)
        toast.success("Contrat modifié avec succès")
      } else {
        await SupabaseClientDB.createContract(contractData)
        toast.success("Contrat créé avec succès")
      }

      resetContractForm()
      loadContracts()
    } catch (error) {
      console.error("Error saving contract:", error)
      toast.error("Erreur lors de la sauvegarde du contrat")
    } finally {
      setLoading(false)
    }
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setContractForm({
      description: contract.description || "",
      status: (contract.status as ContractStatus) || "envoye",
      sentDate: contract.sent_date ? contract.sent_date.toISOString().split("T")[0] : "",
      signatureDate: contract.signedDate ? contract.signedDate.toISOString().split("T")[0] : "",
    })
    setSelectedFiles([])
    setShowContractForm(true)
  }

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return

    setLoading(true)
    try {
      await SupabaseClientDB.deleteContract(contractId)
      toast.success("Contrat supprimé avec succès")
      loadContracts()
    } catch (error) {
      console.error("Error deleting contract:", error)
      toast.error("Erreur lors de la suppression du contrat")
    } finally {
      setLoading(false)
    }
  }

  // TÉLÉCHARGEMENT DOCUMENTS SYNCHRONISÉ avec contracts-tab.tsx
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

  // FONCTION COULEUR STATUT SYNCHRONISÉE avec contracts-tab.tsx
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

  if (!organization) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{organization.name}</DialogTitle>
          <p className="text-muted-foreground">
            {organization.industry} • {organization.city}
          </p>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous ({appointments.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contrats ({contracts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'organisation</Label>
                <Input
                  id="name"
                  value={organizationForm.name}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, name: e.target.value })}
                  placeholder="Nom de l'organisation"
                />
              </div>
              <div>
                <Label htmlFor="industry">Type/Industrie</Label>
                <Input
                  id="industry"
                  value={organizationForm.industry}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, industry: e.target.value })}
                  placeholder="Type d'établissement"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Catégorie (étoiles)</Label>
                <Select
                  value={organizationForm.category}
                  onValueChange={(value) => setOrganizationForm({ ...organizationForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 étoile">1 étoile</SelectItem>
                    <SelectItem value="2 étoiles">2 étoiles</SelectItem>
                    <SelectItem value="3 étoiles">3 étoiles</SelectItem>
                    <SelectItem value="4 étoiles">4 étoiles</SelectItem>
                    <SelectItem value="5 étoiles">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Input
                  id="secteur"
                  value={organizationForm.secteur}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, secteur: e.target.value })}
                  placeholder="Secteur d'activité"
                />
              </div>
              <div>
                <Label htmlFor="nb_chambres">Nombre de chambres</Label>
                <Input
                  id="nb_chambres"
                  type="number"
                  value={organizationForm.nb_chambres}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, nb_chambres: e.target.value })}
                  placeholder="Nombre de chambres"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="region">Région</Label>
                <Select
                  value={organizationForm.region}
                  onValueChange={(value) => setOrganizationForm({ ...organizationForm, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nord">Nord</SelectItem>
                    <SelectItem value="Sud">Sud</SelectItem>
                    <SelectItem value="Est">Est</SelectItem>
                    <SelectItem value="Ouest">Ouest</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={organizationForm.district}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, district: e.target.value })}
                  placeholder="District"
                />
              </div>
              <div>
                <Label htmlFor="zone_geographique">Zone géographique</Label>
                <Input
                  id="zone_geographique"
                  value={organizationForm.zone_geographique}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, zone_geographique: e.target.value })}
                  placeholder="Zone géographique"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={organizationForm.city}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, city: e.target.value })}
                  placeholder="Ville"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse précise</Label>
                <Input
                  id="address"
                  value={organizationForm.address}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, address: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={organizationForm.phone}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, phone: e.target.value })}
                  placeholder="Numéro de téléphone"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={organizationForm.email}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, email: e.target.value })}
                  placeholder="Adresse email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Site web officiel</Label>
              <Input
                id="website"
                value={organizationForm.website}
                onChange={(e) => setOrganizationForm({ ...organizationForm, website: e.target.value })}
                placeholder="https://www.example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_principal">Contact principal</Label>
                <Input
                  id="contact_principal"
                  value={organizationForm.contact_principal}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, contact_principal: e.target.value })}
                  placeholder="Nom du contact principal"
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={organizationForm.status}
                  onValueChange={(value: any) => setOrganizationForm({ ...organizationForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveOrganization} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="notes">Notes et commentaires</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos notes sur cette organisation..."
                className="min-h-[200px]"
              />
              <Button onClick={handleSaveNotes} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder les notes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rendez-vous</h3>
              <Button onClick={() => setShowAppointmentForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
            </div>

            {showAppointmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingAppointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={appointmentForm.title}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
                        placeholder="Titre du rendez-vous"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={appointmentForm.type}
                        onValueChange={(value: any) => setAppointmentForm({ ...appointmentForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Meeting">Réunion</SelectItem>
                          <SelectItem value="Call">Appel</SelectItem>
                          <SelectItem value="Demo">Démonstration</SelectItem>
                          <SelectItem value="Follow-up">Suivi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={appointmentForm.appointment_date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Heure</Label>
                      <Input
                        id="time"
                        type="time"
                        value={appointmentForm.appointment_time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                      placeholder="Lieu du rendez-vous"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={appointmentForm.description}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                      placeholder="Description du rendez-vous"
                    />
                  </div>

                  <Button onClick={handleCreateAppointment} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading
                      ? "Sauvegarde..."
                      : editingAppointment
                        ? "Modifier le rendez-vous"
                        : "Créer le rendez-vous"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{appointment.title}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {appointment.appointment_date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.appointment_time}
                          </div>
                          {appointment.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {appointment.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{appointment.status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucun rendez-vous planifié</div>
              )}
            </div>
          </TabsContent>

          {/* ONGLET CONTRATS COMPLÈTEMENT SYNCHRONISÉ avec contracts-tab.tsx */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contrats ({contracts.length})</h3>
              <Button onClick={() => setShowContractForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Contrat
              </Button>
            </div>

            {showContractForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingContract ? "Modifier le contrat" : "Nouveau contrat"}
                    <Button variant="ghost" size="sm" onClick={resetContractForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contract-status">Statut</Label>
                      <Select
                        value={contractForm.status}
                        onValueChange={(value: ContractStatus) => setContractForm({ ...contractForm, status: value })}
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
                    <div></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sent-date">Date d'envoi</Label>
                      <Input
                        id="sent-date"
                        type="date"
                        value={contractForm.sentDate}
                        onChange={(e) => setContractForm({ ...contractForm, sentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signed-date">Date de signature</Label>
                      <Input
                        id="signed-date"
                        type="date"
                        value={contractForm.signatureDate}
                        onChange={(e) => setContractForm({ ...contractForm, signatureDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contract-description">Description</Label>
                    <Textarea
                      id="contract-description"
                      value={contractForm.description}
                      onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                      placeholder="Description du contrat"
                      rows={3}
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

                  <Button onClick={handleCreateContract} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Sauvegarde..." : editingContract ? "Modifier le contrat" : "Créer le contrat"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {contracts.map((contract) => {
                const organizationId = (contract as any).organization_id || contract.organizationId
                
                return (
                  <Card key={contract.id}>
                    <CardContent className="pt-4">
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
                                Organisation: {organization?.name}
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContract(contract)}
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContract(contract.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {contracts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucun contrat enregistré</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
