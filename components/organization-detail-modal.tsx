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
import { Calendar, Clock, MapPin, Plus, Save, X, Edit, Trash2, FileText } from "lucide-react"
import type { Organization, Appointment, Contract } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { toast } from "sonner"

interface OrganizationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  organization: Organization | null
  onUpdate: () => void
}

export function OrganizationDetailModal({ isOpen, onClose, organization, onUpdate }: OrganizationDetailModalProps) {
  const [notes, setNotes] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showContractForm, setShowContractForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string }>>([])

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
    contact_fonction: "",
    status: "Active" as const,
    priority: "Medium" as const,
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

  const [contractForm, setContractForm] = useState({
    title: "",
    description: "",
    type: "Contrat de partenariat" as const,
    status: "draft" as const,
    assigned_to: "",
    signed_date: "",
    sent_date: "",
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
        contact_fonction: organization.contact_fonction || "",
        status: organization.status || "Active",
        priority: organization.priority || "Medium",
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

  const resetContractForm = () => {
    setContractForm({
      title: "",
      description: "",
      type: "Contrat de partenariat",
      status: "draft",
      assigned_to: "",
      signed_date: "",
      sent_date: "",
    })
    setDocuments([])
    setShowContractForm(false)
    setEditingContract(null)
  }

  const handleCreateContract = async () => {
    if (!organization) return
    setLoading(true)
    try {
      const contractData = {
        ...contractForm,
        organization_id: organization.id,
        documents: documents,
        signed_date:
          contractForm.status === "signed" && contractForm.signed_date ? new Date(contractForm.signed_date) : undefined,
        sent_date: contractForm.sent_date ? new Date(contractForm.sent_date) : undefined,
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
      title: contract.title,
      description: contract.description || "",
      type: contract.type || "Contrat de partenariat",
      status: contract.status,
      assigned_to: contract.assigned_to || "",
      signed_date: contract.signed_date ? new Date(contract.signed_date).toISOString().split("T")[0] : "",
      sent_date: contract.sent_date ? new Date(contract.sent_date).toISOString().split("T")[0] : "",
    })
    setDocuments(contract.documents || [])
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newDocument = {
          name: file.name,
          url: e.target?.result as string,
          type: file.type,
        }
        setDocuments((prev) => [...prev, newDocument])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
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
                <Label htmlFor="contact_fonction">Fonction du contact</Label>
                <Input
                  id="contact_fonction"
                  value={organizationForm.contact_fonction}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, contact_fonction: e.target.value })}
                  placeholder="Fonction/Poste"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="Active">Actif</SelectItem>
                    <SelectItem value="Inactive">Inactif</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={organizationForm.priority}
                  onValueChange={(value: any) => setOrganizationForm({ ...organizationForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Faible</SelectItem>
                    <SelectItem value="Medium">Moyenne</SelectItem>
                    <SelectItem value="High">Élevée</SelectItem>
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
                      <Label htmlFor="contract-title">Titre du contrat</Label>
                      <Input
                        id="contract-title"
                        value={contractForm.title}
                        onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                        placeholder="Titre du contrat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contract-type">Type de contrat</Label>
                      <Select
                        value={contractForm.type}
                        onValueChange={(value: any) => setContractForm({ ...contractForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contrat de partenariat">Contrat de partenariat</SelectItem>
                          <SelectItem value="Contrat entreprise">Contrat entreprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contract-status">Statut</Label>
                      <Select
                        value={contractForm.status}
                        onValueChange={(value: any) => setContractForm({ ...contractForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="sent">Envoyé</SelectItem>
                          <SelectItem value="contrat_envoye">Contrat Envoyé</SelectItem>
                          <SelectItem value="signed">Signé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assigned-to">Commercial assigné</Label>
                      <Select
                        value={contractForm.assigned_to}
                        onValueChange={(value) => setContractForm({ ...contractForm, assigned_to: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un commercial" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                          <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                          <SelectItem value="Pierre Durand">Pierre Durand</SelectItem>
                          <SelectItem value="Sophie Bernard">Sophie Bernard</SelectItem>
                          <SelectItem value="Luc Moreau">Luc Moreau</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sent-date">Date d'envoi</Label>
                      <Input
                        id="sent-date"
                        type="date"
                        value={contractForm.sent_date}
                        onChange={(e) => setContractForm({ ...contractForm, sent_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signed-date">Date de signature</Label>
                      <Input
                        id="signed-date"
                        type="date"
                        value={contractForm.signed_date}
                        onChange={(e) => setContractForm({ ...contractForm, signed_date: e.target.value })}
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="contract-documents">Documents du contrat</Label>
                    <div className="space-y-2">
                      <Input
                        id="contract-documents"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      {documents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Documents sélectionnés :</p>
                          {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                                <X className="w-4 h-4" />
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
              {contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Type: {contract.type || "Non spécifié"}</span>
                          <span>Assigné à: {contract.assigned_to || "Non assigné"}</span>
                          {contract.sent_date && (
                            <span>Envoyé le: {new Date(contract.sent_date).toLocaleDateString()}</span>
                          )}
                          {contract.signed_date && (
                            <span>Signé le: {new Date(contract.signed_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        {contract.documents && contract.documents.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm text-muted-foreground">
                              {contract.documents.length} document(s) attaché(s)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{contract.status}</Badge>
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

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
