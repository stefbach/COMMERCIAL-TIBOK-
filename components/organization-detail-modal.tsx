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
import { Calendar, Clock, MapPin, Plus, Save, X, Edit, Trash2, FileText, Upload, Download, AlertCircle } from "lucide-react"
import type { Organization, Appointment, Contract } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { toast } from "sonner"

interface OrganizationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  organization: Organization | null
  onUpdate: () => void
}

// ✅ STATUTS COHÉRENTS avec contracts-tab.tsx
const CONTRACT_STATUS = {
  envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-800" },
  signe: { label: "Signé", color: "bg-green-100 text-green-800" },
  annule: { label: "Annulé", color: "bg-red-100 text-red-800" }
} as const

type ContractStatus = keyof typeof CONTRACT_STATUS

// ✅ INTERFACES DE FORMULAIRES SIMPLIFIÉES
interface OrganizationFormData {
  name: string
  industry: string
  category: string | undefined
  region: string | undefined
  zone_geographique: string
  district: string
  city: string
  address: string
  secteur: string
  website: string
  nb_chambres: string
  phone: string
  email: string
  contact_principal: string
  contact_fonction: string
  status: string
  priority: string
  notes: string
}

interface AppointmentFormData {
  title: string
  description: string
  appointment_date: string
  appointment_time: string
  location: string
  type: "Meeting" | "Call" | "Demo" | "Follow-up"
  status: "Scheduled" | "Completed" | "Cancelled"
}

interface ContractFormData {
  description: string
  status: ContractStatus
  sentDate: string
  signatureDate: string
}

// ✅ COMPOSANT RECODÉ COMPLÈTEMENT
export function OrganizationDetailModal({ isOpen, onClose, organization, onUpdate }: OrganizationDetailModalProps) {
  // ============ STATE ============
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  
  // Data
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  
  // Forms
  const [organizationForm, setOrganizationForm] = useState<OrganizationFormData>({
    name: "",
    industry: "",
    category: undefined,
    region: undefined,
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
    status: "Active",
    priority: "Medium",
    notes: "",
  })

  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    location: "",
    type: "Meeting",
    status: "Scheduled",
  })

  const [contractForm, setContractForm] = useState<ContractFormData>({
    description: "",
    status: "envoye",
    sentDate: "",
    signatureDate: "",
  })

  // UI State
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showContractForm, setShowContractForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // ============ EFFECTS ============
  useEffect(() => {
    if (organization) {
      console.log("[ORG_MODAL] Initializing for organization:", organization.id, organization.name)
      initializeForms()
      loadRelatedData()
    }
  }, [organization])

  // ============ INITIALIZATION ============
  const initializeForms = () => {
    if (!organization) return

    console.log("[ORG_MODAL] Initializing organization form with data:", organization)
    
    setOrganizationForm({
      name: organization.name || "",
      industry: organization.industry || "",
      category: organization.category || undefined,
      region: organization.region || undefined,
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
      notes: organization.notes || "",
    })
  }

  const loadRelatedData = async () => {
    if (!organization) return

    try {
      console.log("[ORG_MODAL] Loading related data for organization:", organization.id)
      
      // Load appointments
      const appointmentsData = await SupabaseClientDB.getAppointmentsByOrganization(organization.id)
      console.log("[ORG_MODAL] Appointments loaded:", appointmentsData.length)
      setAppointments(appointmentsData)
      
      // Load contracts
      const contractsData = await SupabaseClientDB.getContractsByOrganization(organization.id)
      console.log("[ORG_MODAL] Contracts loaded:", contractsData.length, contractsData)
      setContracts(contractsData)
      
    } catch (error) {
      console.error("[ORG_MODAL] Error loading related data:", error)
    }
  }

  // ============ ORGANIZATION HANDLERS ============
  const handleSaveOrganization = async () => {
    if (!organization) {
      console.error("[ORG_MODAL] No organization to update")
      return
    }

    if (!organizationForm.name.trim()) {
      toast.error("Le nom de l'organisation est obligatoire")
      return
    }

    setLoading(true)
    console.log("[ORG_MODAL] Saving organization:", organization.id, organizationForm.name)
    
    try {
      // ✅ DONNÉES PROPRES POUR LA MISE À JOUR - utilise le format de votre DB
      const updatedData = {
        name: organizationForm.name.trim(),
        industry: organizationForm.industry.trim() || null,
        category: organizationForm.category || null,
        region: organizationForm.region || null,
        zone_geographique: organizationForm.zone_geographique.trim() || null,
        district: organizationForm.district.trim() || null,
        city: organizationForm.city.trim() || null,
        address: organizationForm.address.trim() || null,
        secteur: organizationForm.secteur.trim() || null,
        website: organizationForm.website.trim() || null,
        nb_chambres: organizationForm.nb_chambres ? parseInt(organizationForm.nb_chambres) : null,
        phone: organizationForm.phone.trim() || null,
        email: organizationForm.email.trim() || null,
        contact_principal: organizationForm.contact_principal.trim() || null,
        contact_fonction: organizationForm.contact_fonction.trim() || null,
        status: organizationForm.status,
        priority: organizationForm.priority,
        notes: organizationForm.notes.trim() || null,
      }
      
      console.log("[ORG_MODAL] Updating with data:", updatedData)
      await SupabaseClientDB.updateOrganization(organization.id, updatedData)
      
      toast.success("Organisation mise à jour avec succès")
      console.log("[ORG_MODAL] ✅ Organization updated successfully")
      
      await onUpdate()
      
    } catch (error) {
      console.error("[ORG_MODAL] ❌ Error updating organization:", error)
      toast.error(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  // ============ APPOINTMENT HANDLERS ============
  const handleCreateAppointment = async () => {
    if (!organization) return
    if (!appointmentForm.title.trim()) {
      toast.error("Le titre est obligatoire")
      return
    }

    setLoading(true)
    console.log("[ORG_MODAL] Creating/updating appointment:", appointmentForm)
    
    try {
      const appointmentData = {
        ...appointmentForm,
        organization_id: organization.id.toString(),
        contact_id: null,
        duration: 60,
        reminder: true,
      }

      if (editingAppointment) {
        await SupabaseClientDB.updateAppointment(editingAppointment.id, appointmentData)
        toast.success("Rendez-vous modifié avec succès")
        console.log("[ORG_MODAL] ✅ Appointment updated")
      } else {
        await SupabaseClientDB.createAppointment(appointmentData)
        toast.success("Rendez-vous créé avec succès")
        console.log("[ORG_MODAL] ✅ Appointment created")
      }

      resetAppointmentForm()
      await loadRelatedData()
      
    } catch (error) {
      console.error("[ORG_MODAL] ❌ Error saving appointment:", error)
      toast.error(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    console.log("[ORG_MODAL] Starting appointment edit:", appointment.id)
    setEditingAppointment(appointment)
    setAppointmentForm({
      title: appointment.title,
      description: appointment.description || "",
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      location: appointment.location || "",
      type: appointment.type as "Meeting" | "Call" | "Demo" | "Follow-up",
      status: appointment.status as "Scheduled" | "Completed" | "Cancelled",
    })
    setShowAppointmentForm(true)
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return

    setLoading(true)
    try {
      console.log("[ORG_MODAL] Deleting appointment:", appointmentId)
      await SupabaseClientDB.deleteAppointment(appointmentId)
      toast.success("Rendez-vous supprimé avec succès")
      console.log("[ORG_MODAL] ✅ Appointment deleted")
      await loadRelatedData()
    } catch (error) {
      console.error("[ORG_MODAL] ❌ Error deleting appointment:", error)
      toast.error(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetAppointmentForm = () => {
    setAppointmentForm({
      title: "",
      description: "",
      appointment_date: "",
      appointment_time: "",
      location: "",
      type: "Meeting",
      status: "Scheduled",
    })
    setShowAppointmentForm(false)
    setEditingAppointment(null)
  }

  // ============ CONTRACT HANDLERS ============
  const handleCreateContract = async () => {
    if (!organization) return
    
    setLoading(true)
    console.log("[ORG_MODAL] Creating/updating contract:", contractForm)
    
    try {
      // ✅ GESTION DES FICHIERS
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

      // ✅ DONNÉES EN camelCase POUR CORRESPONDRE AU SCHÉMA DB
      const contractInput: Omit<Contract, "id" | "createdDate" | "updatedDate"> = {
        title: `Contrat - ${organization.name}`,
        description: contractForm.description,
        organizationId: organization.id.toString(),     // ✅ camelCase pour correspondre à la DB
        contactId: null,                                // ✅ camelCase pour correspondre à la DB
        value: 0,
        currency: "EUR",
        status: contractForm.status,
        assignedTo: "",                                 // ✅ camelCase pour correspondre à la DB
        expirationDate: undefined,                      // ✅ camelCase pour correspondre à la DB
        signedDate: contractForm.status === "signe" && contractForm.signatureDate   // ✅ camelCase pour correspondre à la DB
          ? new Date(contractForm.signatureDate) 
          : undefined,
        sentDate: contractForm.sentDate ? new Date(contractForm.sentDate) : undefined,  // ✅ camelCase pour correspondre à la DB
        notes: "",
        documents: documents,
      }

      if (editingContract) {
        console.log("[ORG_MODAL] Updating contract:", editingContract.id)
        await SupabaseClientDB.updateContract(editingContract.id, contractInput)
        toast.success("Contrat modifié avec succès")
        console.log("[ORG_MODAL] ✅ Contract updated")
      } else {
        console.log("[ORG_MODAL] Creating new contract")
        await SupabaseClientDB.createContract(contractInput)
        toast.success("Contrat créé avec succès")
        console.log("[ORG_MODAL] ✅ Contract created")
      }

      resetContractForm()
      await loadRelatedData()
      
    } catch (error) {
      console.error("[ORG_MODAL] ❌ Error saving contract:", error)
      toast.error(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditContract = (contract: Contract) => {
    console.log("[ORG_MODAL] Starting contract edit:", contract.id, contract)
    setEditingContract(contract)
    
    // ✅ MAPPING COHÉRENT pour l'édition - camelCase
    setContractForm({
      description: contract.description || "",
      status: (contract.status as ContractStatus) || "envoye",
      sentDate: contract.sentDate                    // ✅ camelCase
        ? new Date(contract.sentDate).toISOString().split("T")[0] 
        : "",
      signatureDate: contract.signedDate            // ✅ camelCase
        ? new Date(contract.signedDate).toISOString().split("T")[0]
        : "",
    })
    
    setSelectedFiles([])
    setShowContractForm(true)
  }

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return

    setLoading(true)
    try {
      console.log("[ORG_MODAL] Deleting contract:", contractId)
      await SupabaseClientDB.deleteContract(contractId)
      toast.success("Contrat supprimé avec succès")
      console.log("[ORG_MODAL] ✅ Contract deleted")
      await loadRelatedData()
    } catch (error) {
      console.error("[ORG_MODAL] ❌ Error deleting contract:", error)
      toast.error(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
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
        console.log("[ORG_MODAL] Document downloaded:", doc.name)
      } else {
        throw new Error("No valid download data found")
      }
    } catch (error) {
      console.error("[ORG_MODAL] Error downloading document:", error)
      alert(`Erreur lors du téléchargement de ${doc.name}`)
    }
  }

  // ============ RENDER ============
  if (!organization) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {organization.name}
          </DialogTitle>
          <p className="text-muted-foreground">
            {organization.industry} {organization.city && `• ${organization.city}`}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="appointments" className="relative">
              Rendez-vous
              {appointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {appointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="relative">
              Contrats
              {contracts.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {contracts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ============ ONGLET DÉTAILS ============ */}
          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de l'organisation *</Label>
                    <Input
                      id="name"
                      value={organizationForm.name}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, name: e.target.value })}
                      placeholder="Nom de l'organisation"
                      className="border-2"
                      required
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

                  <div>
                    <Label htmlFor="category">Catégorie (étoiles)</Label>
                    <Select
                      value={organizationForm.category}
                      onValueChange={(value) => setOrganizationForm({ ...organizationForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
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
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="region">Région</Label>
                    <Select
                      value={organizationForm.region}
                      onValueChange={(value) => setOrganizationForm({ ...organizationForm, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
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
                </CardContent>
              </Card>
            </div>

            {/* Contact et statut */}
            <Card>
              <CardHeader>
                <CardTitle>Contact et statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div>
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      value={organizationForm.website}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, website: e.target.value })}
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_principal">Contact principal</Label>
                    <Input
                      id="contact_principal"
                      value={organizationForm.contact_principal}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, contact_principal: e.target.value })}
                      placeholder="Nom du contact"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_fonction">Fonction</Label>
                    <Input
                      id="contact_fonction"
                      value={organizationForm.contact_fonction}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, contact_fonction: e.target.value })}
                      placeholder="Fonction/Poste"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={organizationForm.status}
                      onValueChange={(value) => setOrganizationForm({ ...organizationForm, status: value })}
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
                </div>
              </CardContent>
            </Card>

            {/* Bouton de sauvegarde */}
            <Button 
              onClick={handleSaveOrganization} 
              disabled={loading || !organizationForm.name.trim()} 
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde en cours..." : "✓ Sauvegarder les modifications"}
            </Button>
          </TabsContent>

          {/* ============ ONGLET NOTES ============ */}
          <TabsContent value="notes" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes et commentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={organizationForm.notes}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, notes: e.target.value })}
                  placeholder="Ajoutez vos notes sur cette organisation..."
                  className="min-h-[300px] resize-none"
                />
                <Button 
                  onClick={handleSaveOrganization} 
                  disabled={loading}
                  className="w-full mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Sauvegarde..." : "Sauvegarder les notes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ ONGLET RENDEZ-VOUS ============ */}
          <TabsContent value="appointments" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rendez-vous ({appointments.length})</h3>
              <Button onClick={() => setShowAppointmentForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
            </div>

            {/* Formulaire RDV */}
            {showAppointmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingAppointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
                    <Button variant="ghost" size="sm" onClick={resetAppointmentForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apt-title">Titre *</Label>
                      <Input
                        id="apt-title"
                        value={appointmentForm.title}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
                        placeholder="Titre du rendez-vous"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apt-type">Type</Label>
                      <Select
                        value={appointmentForm.type}
                        onValueChange={(value: AppointmentFormData["type"]) => 
                          setAppointmentForm({ ...appointmentForm, type: value })
                        }
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apt-date">Date</Label>
                      <Input
                        id="apt-date"
                        type="date"
                        value={appointmentForm.appointment_date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apt-time">Heure</Label>
                      <Input
                        id="apt-time"
                        type="time"
                        value={appointmentForm.appointment_time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apt-location">Lieu</Label>
                    <Input
                      id="apt-location"
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                      placeholder="Lieu du rendez-vous"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apt-description">Description</Label>
                    <Textarea
                      id="apt-description"
                      value={appointmentForm.description}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                      placeholder="Description du rendez-vous"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateAppointment} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Sauvegarde..." : editingAppointment ? "Modifier" : "Créer"}
                    </Button>
                    <Button variant="outline" onClick={resetAppointmentForm}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des RDV */}
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Aucun rendez-vous planifié</p>
                    <p className="text-sm">Créez votre premier rendez-vous avec cette organisation.</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{appointment.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {appointment.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                appointment.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : appointment.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          {appointment.description && (
                            <p className="text-sm text-muted-foreground mb-2">{appointment.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(appointment.appointment_date).toLocaleDateString("fr-FR")}
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
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ============ ONGLET CONTRATS ============ */}
          <TabsContent value="contracts" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contrats ({contracts.length})</h3>
              <Button onClick={() => setShowContractForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Contrat
              </Button>
            </div>

            {/* Formulaire Contrat */}
            {showContractForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingContract ? "Modifier le contrat" : "Nouveau contrat"}
                    <Button variant="ghost" size="sm" onClick={resetContractForm}>
                      <X className="w-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Button onClick={handleCreateContract} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Sauvegarde..." : editingContract ? "Modifier" : "Créer"}
                    </Button>
                    <Button variant="outline" onClick={resetContractForm}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des Contrats */}
            <div className="space-y-3">
              {contracts.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Aucun contrat enregistré</p>
                    <p className="text-sm">Créez votre premier contrat avec cette organisation.</p>
                  </CardContent>
                </Card>
              ) : (
                contracts.map((contract) => {
                  // ✅ Utilise camelCase pour correspondre au schéma DB
                  const contractOrgId = (contract.organizationId || "").toString()
                  
                  return (
                    <Card key={contract.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                              {/* ✅ AFFICHAGE COHÉRENT DES DATES - camelCase */}
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
                              <p className="text-sm text-gray-700 mb-3">{contract.description}</p>
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
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
