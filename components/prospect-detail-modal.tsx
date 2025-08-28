"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Phone, Mail, User, Building2, Plus } from "lucide-react"
import type { Contact, Appointment } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface ProspectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onUpdate: () => void
}

export function ProspectDetailModal({ isOpen, onClose, contact, onUpdate }: ProspectDetailModalProps) {
  const [notes, setNotes] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    description: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: 60,
    location: "",
    type: "Meeting" as const,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    if (contact) {
      setNotes(contact.notes || "")
      loadAppointments()
    }
  }, [contact])

  const loadAppointments = async () => {
    if (!contact) return
    try {
      const appts = await SupabaseClientDB.getAppointmentsByContact(contact.id)
      setAppointments(appts)
    } catch (error) {
      console.error("Error loading appointments:", error)
    }
  }

  const handleSaveNotes = async () => {
    if (!contact) return
    setIsSaving(true)
    setSaveMessage("")

    try {
      await SupabaseClientDB.updateContact(contact.id, { notes })
      setSaveMessage("Notes saved successfully!")
      onUpdate()
    } catch (error) {
      console.error("Error saving notes:", error)
      setSaveMessage("Error saving notes. Please try again.")
    } finally {
      setIsSaving(false)
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const handleCreateAppointment = async () => {
    if (!contact || !newAppointment.title || !newAppointment.appointmentDate || !newAppointment.appointmentTime) return

    setIsSaving(true)
    setSaveMessage("")

    try {
      const appointment = {
        contact_id: contact.id,
        organization_id: contact.organizationId,
        title: newAppointment.title,
        description: newAppointment.description,
        appointment_date: newAppointment.appointmentDate,
        appointment_time: newAppointment.appointmentTime,
        duration: newAppointment.duration,
        location: newAppointment.location,
        type: newAppointment.type,
        status: "Scheduled",
        reminder: true,
        city: contact.city || "",
        region: contact.region || "",
        address: newAppointment.location || "",
      }

      console.log("[v0] Creating appointment with data:", appointment)
      const result = await SupabaseClientDB.createAppointment(appointment)
      console.log("[v0] Appointment created successfully:", result)

      setSaveMessage("Appointment scheduled successfully!")
      setShowAppointmentForm(false)
      setNewAppointment({
        title: "",
        description: "",
        appointmentDate: "",
        appointmentTime: "",
        duration: 60,
        location: "",
        type: "Meeting",
      })
      loadAppointments()
    } catch (error) {
      console.error("Error creating appointment:", error)
      setSaveMessage("Error scheduling appointment. Please try again.")
    } finally {
      setIsSaving(false)
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

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

  if (!contact) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {contact.firstName} {contact.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{contact.position}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Organization ID: {contact.organizationId}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Primary Contact</Label>
                  <Badge variant={contact.isPrimary ? "default" : "secondary"}>
                    {contact.isPrimary ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm">{contact.department || "Not specified"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {saveMessage && (
              <div
                className={`p-3 rounded-md text-sm ${
                  saveMessage.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {saveMessage}
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this prospect..."
                className="min-h-[200px] mt-1"
              />
            </div>
            <Button onClick={handleSaveNotes} className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Appointments</h3>
              <Button onClick={() => setShowAppointmentForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>

            {showAppointmentForm && (
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">New Appointment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                      placeholder="Meeting title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value as any })}
                    >
                      <option value="Meeting">Meeting</option>
                      <option value="Call">Call</option>
                      <option value="Demo">Demo</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.appointmentDate}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.appointmentTime}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    placeholder="Meeting description"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    placeholder="Meeting location or address"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAppointment} className="flex-1" disabled={isSaving}>
                    {isSaving ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                  <Button onClick={() => setShowAppointmentForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{appointment.title}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.appointment_date || appointment.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {appointment.appointment_time || appointment.appointmentTime}
                    </div>
                    <Badge variant="outline">{appointment.type}</Badge>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p>No appointments scheduled</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
