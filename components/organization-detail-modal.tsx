"use client"

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
import { Calendar, Clock, MapPin, Plus, Save, X, Edit, Trash2 } from "lucide-react"
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
  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    location: "",
    type: "Meeting" as const,
    status: "Scheduled" as const,
  })

  useEffect(() => {
    if (organization) {
      setNotes(organization.notes || "")
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

  if (!organization) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{organization.name}</DialogTitle>
          <p className="text-muted-foreground">
            {organization.activityType} • {organization.city}
          </p>
        </DialogHeader>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous ({appointments.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contrats</TabsTrigger>
          </TabsList>

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
              <h3 className="text-lg font-semibold">Contrats</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Contrat
              </Button>
            </div>

            <div className="space-y-4">
              {contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            Valeur: {contract.value} {contract.currency}
                          </span>
                          <span>Assigné à: {contract.assigned_to}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{contract.status}</Badge>
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
