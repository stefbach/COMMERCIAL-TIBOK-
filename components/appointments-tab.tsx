"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Phone, Video, Users, Plus, Edit, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Appointment, Contact, Organization } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface AppointmentsTabProps {
  contacts: Contact[]
  organizations: Organization[]
}

export function AppointmentsTab({ contacts, organizations }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"all" | "today" | "upcoming" | "past">("upcoming")
  const [showFilters, setShowFilters] = useState(false)
  const [cityFilter, setCityFilter] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const normalizeAppointment = (apt: any): Appointment => {
    return {
      id: apt.id,
      title: apt.title,
      description: apt.description || "",
      date: new Date(apt.date || apt.appointment_date || apt.appointmentDate),
      time: apt.time || apt.appointment_time || apt.appointmentTime || "09:00",
      duration: apt.duration || 60,
      location: apt.location || "",
      city: apt.city || "",
      region: apt.region || "",
      address: apt.address || "",
      type: apt.type || "Meeting",
      status: apt.status || "Scheduled",
      contactId: apt.contactId || apt.contact_id,
      organizationId: apt.organizationId || apt.organization_id,
      reminder: apt.reminder || false,
      createdDate: new Date(apt.createdDate || apt.created_at || Date.now()),
    }
  }

  const uniqueCities = [
    ...new Set([
      ...appointments.map((apt) => apt.city).filter(Boolean),
      ...organizations.map((org) => org.city).filter(Boolean),
    ]),
  ].sort()

  const uniqueRegions = [
    ...new Set([
      ...appointments.map((apt) => apt.region).filter(Boolean),
      ...organizations.map((org) => org.region).filter(Boolean),
    ]),
  ].sort()

  const loadAppointments = async () => {
    try {
      console.log("[v0] loadAppointments called")
      const data = await SupabaseClientDB.getAppointments()
      console.log("[v0] Raw appointments data:", data)

      const normalizedAppointments = data.map(normalizeAppointment)
      console.log("[v0] Normalized appointments:", normalizedAppointments)

      setAppointments(normalizedAppointments)
    } catch (error) {
      console.error("[v0] Error in loadAppointments:", error)
      setAppointments([])
    }
  }

  const filteredAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const matchesCity =
        !cityFilter ||
        cityFilter === "all" ||
        appointment.city === cityFilter ||
        (appointment.organizationId &&
          organizations.find((o) => o.id === appointment.organizationId)?.city === cityFilter)

      const matchesRegion =
        !regionFilter ||
        regionFilter === "all" ||
        appointment.region === regionFilter ||
        (appointment.organizationId &&
          organizations.find((o) => o.id === appointment.organizationId)?.region === regionFilter)

      const matchesDateFilter = (() => {
        switch (viewMode) {
          case "today":
            return appointmentDate.toDateString() === today.toDateString()
          case "upcoming":
            return appointmentDate >= today
          case "past":
            return appointmentDate < today
          default:
            return true
        }
      })()

      return matchesDateFilter && matchesCity && matchesRegion
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Call":
        return <Phone className="h-4 w-4" />
      case "Meeting":
        return <Users className="h-4 w-4" />
      case "Demo":
        return <Video className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const handleAddAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      console.log("[v0] handleAddAppointment called with:", appointmentData)

      const dbAppointment = {
        title: appointmentData.title,
        description: appointmentData.description,
        appointment_date:
          appointmentData.date instanceof Date
            ? appointmentData.date.toISOString().split("T")[0]
            : appointmentData.date,
        appointment_time: appointmentData.time,
        duration: appointmentData.duration,
        location: appointmentData.location,
        city: appointmentData.city,
        region: appointmentData.region,
        address: appointmentData.address,
        type: appointmentData.type,
        status: appointmentData.status || "Scheduled",
        contact_id: appointmentData.contactId,
        organization_id: appointmentData.organizationId,
        reminder: appointmentData.reminder || false,
      }

      const newAppointment = await SupabaseClientDB.createAppointment(dbAppointment)
      console.log("[v0] Appointment created successfully:", newAppointment)

      if (newAppointment) {
        const normalizedAppointment = normalizeAppointment(newAppointment)
        setAppointments([...appointments, normalizedAppointment])
        setIsAddingAppointment(false)
      }
    } catch (error) {
      console.error("[v0] Error in handleAddAppointment:", error)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      console.log("[v0] Deleting appointment:", appointmentId)
      await SupabaseClientDB.deleteAppointment(appointmentId)

      // Update local state
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId))
      setDeleteConfirm(null)

      console.log("[v0] Appointment deleted successfully")
    } catch (error) {
      console.error("[v0] Error deleting appointment:", error)
      alert("Erreur lors de la suppression du rendez-vous")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and add button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant={viewMode === "all" ? "default" : "outline"} size="sm" onClick={() => setViewMode("all")}>
            Tous
          </Button>
          <Button variant={viewMode === "today" ? "default" : "outline"} size="sm" onClick={() => setViewMode("today")}>
            Aujourd'hui
          </Button>
          <Button
            variant={viewMode === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("upcoming")}
          >
            À venir
          </Button>
          <Button variant={viewMode === "past" ? "default" : "outline"} size="sm" onClick={() => setViewMode("past")}>
            Passés
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres géo
          </Button>
        </div>

        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau RDV
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Planifier un rendez-vous</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              contacts={contacts}
              organizations={organizations}
              onSubmit={handleAddAppointment}
              onCancel={() => setIsAddingAppointment(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtres géographiques</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={cityFilter || "all"} onValueChange={(value) => setCityFilter(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={regionFilter || "all"}
              onValueChange={(value) => setRegionFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                Aucun rendez-vous{" "}
                {viewMode === "today"
                  ? "aujourd'hui"
                  : viewMode === "upcoming"
                    ? "à venir"
                    : viewMode === "past"
                      ? "passé"
                      : ""}
                {(cityFilter || regionFilter) && " dans cette zone géographique"}
              </p>
              <p className="text-xs text-gray-400 mt-2">Total rendez-vous chargés: {appointments.length}</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => {
            const contact = contacts.find((c) => c.id === appointment.contactId)
            const organization = organizations.find((o) => o.id === appointment.organizationId)

            return (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(appointment.type)}
                        <h3 className="font-semibold">{appointment.title}</h3>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(appointment.date).toLocaleDateString("fr-FR")} à {appointment.time}
                          </span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{appointment.duration} min</span>
                        </div>

                        {(appointment.location || appointment.city || appointment.region) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {appointment.location}
                              {appointment.city && (appointment.location ? ` - ${appointment.city}` : appointment.city)}
                              {appointment.region && `, ${appointment.region}`}
                            </span>
                          </div>
                        )}

                        {contact && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {contact.fullName} - {organization?.name}
                            </span>
                          </div>
                        )}

                        {appointment.description && <p className="mt-2 text-gray-700">{appointment.description}</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {deleteConfirm === appointment.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            Confirmer
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(appointment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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

function AppointmentForm({
  contacts,
  organizations,
  onSubmit,
  onCancel,
}: {
  contacts: Contact[]
  organizations: Organization[]
  onSubmit: (data: Partial<Appointment>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 60,
    location: "",
    city: "",
    region: "",
    address: "",
    type: "Meeting" as const,
    contactId: "",
    organizationId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      contactId: formData.contactId ? Number.parseInt(formData.contactId) : undefined,
      organizationId: formData.organizationId ? Number.parseInt(formData.organizationId) : undefined,
      date: new Date(formData.date),
      status: "Scheduled",
      reminder: true,
      createdDate: new Date(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du RDV</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Heure</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
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
        <div>
          <Label htmlFor="duration">Durée (min)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
            min="15"
            step="15"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact">Contact</Label>
        <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id.toString() || "0"}>
                {contact.fullName || "Contact sans nom"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Adresse ou lien visio"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Ville du RDV"
          />
        </div>
        <div>
          <Label htmlFor="region">Région</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="Région du RDV"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Adresse complète</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Adresse complète du RDV"
        />
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Planifier
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
