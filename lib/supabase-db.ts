import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Organization, Contact, Deal, Activity, Appointment, Contract } from "@/types/crm"

export interface Profile {
  id: string
  full_name?: string
  email?: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Server-side database operations
export class SupabaseDB {
  private static async getServerClient() {
    return await createClient()
  }

  // Organizations
  static async getOrganizations(): Promise<Organization[]> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase.from("organizations").select("*").order("createdDate", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createOrganization(org: Omit<Organization, "id" | "createdDate">): Promise<Organization> {
    const supabase = await this.getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("organizations")
      .insert({ ...org, createdDate: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase.from("organizations").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteOrganization(id: number): Promise<void> {
    const supabase = await this.getServerClient()
    const { error } = await supabase.from("organizations").delete().eq("id", id)

    if (error) throw error
  }

  // Contacts
  static async getContacts(): Promise<Contact[]> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase.from("contacts").select("*").order("id", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const supabase = await this.getServerClient()

    const { data, error } = await supabase.from("contacts").insert(contact).select().single()

    if (error) throw error
    return data
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from("contacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteContact(id: string): Promise<void> {
    const supabase = await this.getServerClient()
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) throw error
  }

  // Deals
  static async getDeals(): Promise<Deal[]> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createDeal(deal: Omit<Deal, "id" | "created_at" | "updated_at" | "created_by">): Promise<Deal> {
    const supabase = await this.getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("deals")
      .insert({ ...deal, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from("deals")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDeal(id: string): Promise<void> {
    const supabase = await this.getServerClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)

    if (error) throw error
  }

  // Activities
  static async getActivities(): Promise<Activity[]> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createActivity(
    activity: Omit<Activity, "id" | "created_at" | "updated_at" | "created_by">,
  ): Promise<Activity> {
    const supabase = await this.getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("activities")
      .insert({ ...activity, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from("activities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteActivity(id: string): Promise<void> {
    const supabase = await this.getServerClient()
    const { error } = await supabase.from("activities").delete().eq("id", id)

    if (error) throw error
  }

  // Appointments
  static async getAppointments(): Promise<Appointment[]> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const supabase = await this.getServerClient()

    const { data, error } = await supabase.from("appointments").insert(appointment).select().single()

    if (error) throw error
    return data
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteAppointment(id: string): Promise<void> {
    const supabase = await this.getServerClient()
    const { error } = await supabase.from("appointments").delete().eq("id", id)

    if (error) throw error
  }
}

// Client-side database operations
export class SupabaseClientDB {
  private static getClient() {
    return createBrowserClient()
  }

  private static isDemoMode() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return !url || !key
  }

  // Organizations
  static async getOrganizations(): Promise<Organization[]> {
    if (this.isDemoMode()) {
      return getDemoData("organizations")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("organizations").select("*").order("createdDate", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createOrganization(org: Omit<Organization, "id" | "createdDate">): Promise<Organization> {
    if (this.isDemoMode()) {
      const newOrg: Organization = {
        ...org,
        id: generateId(),
        createdDate: new Date().toISOString(),
      }
      const organizations = getDemoData("organizations")
      organizations.unshift(newOrg)
      setDemoData("organizations", organizations)
      return newOrg
    }

    const supabase = this.getClient()

    const { data, error } = await supabase
      .from("organizations")
      .insert({ ...org, createdDate: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization> {
    if (this.isDemoMode()) {
      const organizations = getDemoData("organizations")
      const index = organizations.findIndex((org: Organization) => org.id === id)
      if (index !== -1) {
        organizations[index] = { ...organizations[index], ...updates }
        setDemoData("organizations", organizations)
        return organizations[index]
      }
      throw new Error("Organization not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("organizations").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteOrganization(id: number): Promise<void> {
    if (this.isDemoMode()) {
      const organizations = getDemoData("organizations")
      const filtered = organizations.filter((org: Organization) => org.id !== id)
      setDemoData("organizations", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("organizations").delete().eq("id", id)

    if (error) throw error
  }

  // Contacts
  static async getContacts(): Promise<Contact[]> {
    if (this.isDemoMode()) {
      return getDemoData("contacts")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contacts").select("*").order("id", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    if (this.isDemoMode()) {
      const newContact: Contact = {
        ...contact,
        id: generateId(),
      }
      const contacts = getDemoData("contacts")
      contacts.unshift(newContact)
      setDemoData("contacts", contacts)
      return newContact
    }

    const supabase = this.getClient()

    const { data, error } = await supabase.from("contacts").insert(contact).select().single()

    if (error) throw error
    return data
  }

  static async getContactsByOrganization(organizationId: number): Promise<Contact[]> {
    if (this.isDemoMode()) {
      const contacts = getDemoData("contacts")
      return contacts.filter((contact: Contact) => contact.organizationId === organizationId)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("organizationId", organizationId)
      .order("id", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    if (this.isDemoMode()) {
      const contacts = getDemoData("contacts")
      const index = contacts.findIndex((contact: Contact) => contact.id === id)
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates }
        setDemoData("contacts", contacts)
        return contacts[index]
      }
      throw new Error("Contact not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteContact(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const contacts = getDemoData("contacts")
      const filtered = contacts.filter((contact: Contact) => contact.id !== id)
      setDemoData("contacts", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) throw error
  }

  // Deals
  static async getDeals(): Promise<Deal[]> {
    if (this.isDemoMode()) {
      return getDemoData("deals")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createDeal(deal: Omit<Deal, "id" | "created_at" | "updated_at" | "created_by">): Promise<Deal> {
    if (this.isDemoMode()) {
      const newDeal: Deal = {
        ...deal,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const deals = getDemoData("deals")
      deals.unshift(newDeal)
      setDemoData("deals", deals)
      return newDeal
    }

    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("deals")
      .insert({ ...deal, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    if (this.isDemoMode()) {
      const deals = getDemoData("deals")
      const index = deals.findIndex((deal: Deal) => deal.id === id)
      if (index !== -1) {
        deals[index] = { ...deals[index], ...updates, updated_at: new Date().toISOString() }
        setDemoData("deals", deals)
        return deals[index]
      }
      throw new Error("Deal not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("deals")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDeal(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const deals = getDemoData("deals")
      const filtered = deals.filter((deal: Deal) => deal.id !== id)
      setDemoData("deals", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)

    if (error) throw error
  }

  // Activities
  static async getActivities(): Promise<Activity[]> {
    if (this.isDemoMode()) {
      return getDemoData("activities")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createActivity(
    activity: Omit<Activity, "id" | "created_at" | "updated_at" | "created_by">,
  ): Promise<Activity> {
    if (this.isDemoMode()) {
      const newActivity: Activity = {
        ...activity,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const activities = getDemoData("activities")
      activities.unshift(newActivity)
      setDemoData("activities", activities)
      return newActivity
    }

    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("activities")
      .insert({ ...activity, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    if (this.isDemoMode()) {
      const activities = getDemoData("activities")
      const index = activities.findIndex((activity: Activity) => activity.id === id)
      if (index !== -1) {
        activities[index] = { ...activities[index], ...updates, updated_at: new Date().toISOString() }
        setDemoData("activities", activities)
        return activities[index]
      }
      throw new Error("Activity not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("activities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteActivity(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const activities = getDemoData("activities")
      const filtered = activities.filter((activity: Activity) => activity.id !== id)
      setDemoData("activities", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("activities").delete().eq("id", id)

    if (error) throw error
  }

  // Appointments
  static async getAppointments(): Promise<Appointment[]> {
    if (this.isDemoMode()) {
      return getDemoData("appointments")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getAppointmentsByContact(contactId: string): Promise<Appointment[]> {
    if (this.isDemoMode()) {
      const appointments = getDemoData("appointments")
      return appointments.filter((apt: Appointment) => apt.contact_id === contactId)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("contact_id", contactId)
      .order("appointment_date", { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    if (this.isDemoMode()) {
      const newAppointment: Appointment = {
        ...appointment,
        id: generateId(),
      }
      const appointments = getDemoData("appointments")
      appointments.unshift(newAppointment)
      setDemoData("appointments", appointments)
      return newAppointment
    }

    const supabase = this.getClient()

    const { data, error } = await supabase.from("appointments").insert(appointment).select().single()

    if (error) throw error
    return data
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    if (this.isDemoMode()) {
      const appointments = getDemoData("appointments")
      const index = appointments.findIndex((apt: Appointment) => apt.id === id)
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates }
        setDemoData("appointments", appointments)
        return appointments[index]
      }
      throw new Error("Appointment not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteAppointment(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const appointments = getDemoData("appointments")
      const filtered = appointments.filter((apt: Appointment) => apt.id !== id)
      setDemoData("appointments", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("appointments").delete().eq("id", id)

    if (error) throw error
  }

  // Contracts
  static async getContracts(): Promise<Contract[]> {
    if (this.isDemoMode()) {
      return getDemoData("contracts")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contracts").select("*").order("createdDate", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createContract(contract: Omit<Contract, "id" | "createdDate" | "updatedDate">): Promise<Contract> {
    if (this.isDemoMode()) {
      const newContract: Contract = {
        ...contract,
        id: generateId(),
        createdDate: new Date(),
        updatedDate: new Date(),
      }
      const contracts = getDemoData("contracts")
      contracts.unshift(newContract)
      setDemoData("contracts", contracts)
      return newContract
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .insert({
        ...contract,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    if (this.isDemoMode()) {
      const contracts = getDemoData("contracts")
      const index = contracts.findIndex((contract: Contract) => contract.id === id)
      if (index !== -1) {
        contracts[index] = {
          ...contracts[index],
          ...updates,
          updatedDate: new Date(),
        }
        setDemoData("contracts", contracts)
        return contracts[index]
      }
      throw new Error("Contract not found")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .update({ ...updates, updatedDate: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteContract(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const contracts = getDemoData("contracts")
      const filtered = contracts.filter((contract: Contract) => contract.id !== id)
      setDemoData("contracts", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("contracts").delete().eq("id", id)

    if (error) throw error
  }

  static async getContractsByOrganization(organizationId: string): Promise<Contract[]> {
    if (this.isDemoMode()) {
      const contracts = getDemoData("contracts")
      return contracts.filter((contract: Contract) => contract.organizationId === organizationId)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("organizationId", organizationId)
      .order("createdDate", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getContractsByAssignee(assignedTo: string): Promise<Contract[]> {
    if (this.isDemoMode()) {
      const contracts = getDemoData("contracts")
      return contracts.filter((contract: Contract) => contract.assignedTo === assignedTo)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("assignedTo", assignedTo)
      .order("createdDate", { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Demo data storage and retrieval functions
const getDemoData = (key: string) => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(`demo_${key}`)

  if (!data) {
    const demoData = getInitialDemoData(key)
    if (demoData.length > 0) {
      setDemoData(key, demoData)
      return demoData
    }
  }

  return data ? JSON.parse(data) : []
}

const setDemoData = (key: string, data: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(`demo_${key}`, JSON.stringify(data))
}

const getInitialDemoData = (key: string) => {
  switch (key) {
    case "organizations":
      return [
        {
          id: 1,
          name: "Hôtel Le Grand Palace",
          industry: "Hôtellerie",
          country: "France",
          city: "Paris",
          address: "123 Avenue des Champs-Élysées",
          postalCode: "75008",
          region: "Île-de-France",
          website: "https://legrandpalace.fr",
          size: "Large",
          status: "Active",
          tags: ["Premium", "Luxe"],
          createdDate: new Date("2024-01-15"),
          activityType: "Hôtel",
        },
        {
          id: 2,
          name: "Pharmacie Central",
          industry: "Santé",
          country: "France",
          city: "Lyon",
          address: "45 Rue de la République",
          postalCode: "69002",
          region: "Auvergne-Rhône-Alpes",
          website: "https://pharmacie-central.fr",
          size: "Small",
          status: "Prospect",
          tags: ["Santé", "Local"],
          createdDate: new Date("2024-02-01"),
          activityType: "Pharmacie",
        },
      ]

    case "contacts":
      return [
        {
          id: "1",
          organizationId: 1,
          fullName: "Marie Dubois",
          role: "Directrice Générale",
          email: "marie.dubois@legrandpalace.fr",
          phone: "01 42 56 78 90",
          mobilePhone: "06 12 34 56 78",
          linkedinProfile: "https://linkedin.com/in/marie-dubois",
          consentMarketing: true,
          notes: "Très intéressée par nos solutions. Préfère les rendez-vous en matinée.",
          lastContactDate: new Date("2024-03-01"),
          nextFollowUpDate: new Date("2024-03-15"),
          appointmentHistory: [],
          prospectStatus: "hot",
          priority: "high",
          source: "Référence",
        },
        {
          id: "2",
          organizationId: 2,
          fullName: "Pierre Martin",
          role: "Pharmacien Titulaire",
          email: "pierre.martin@pharmacie-central.fr",
          phone: "04 78 90 12 34",
          mobilePhone: "06 98 76 54 32",
          consentMarketing: true,
          notes: "Demande plus d'informations sur les tarifs.",
          lastContactDate: new Date("2024-02-28"),
          nextFollowUpDate: new Date("2024-03-10"),
          appointmentHistory: [],
          prospectStatus: "cold",
          priority: "medium",
          source: "Site web",
        },
      ]

    case "appointments":
      return [
        {
          id: "z9fr8aj0e",
          organizationId: 1,
          contact_id: "1",
          title: "Présentation solution CRM",
          description: "Démonstration des fonctionnalités principales",
          appointment_date: "2024-03-15",
          appointment_time: "10:00",
          duration: 60,
          location: "Hôtel Le Grand Palace",
          city: "Paris",
          region: "Île-de-France",
          address: "123 Avenue des Champs-Élysées",
          type: "Meeting",
          status: "Scheduled",
          reminder: true,
          createdDate: new Date("2024-03-01"),
        },
        {
          id: "7d3o9kq7c",
          organizationId: 2,
          contact_id: "2",
          title: "Appel de suivi",
          description: "Discussion sur les besoins spécifiques",
          appointment_date: "2024-03-12",
          appointment_time: "14:30",
          duration: 30,
          location: "Téléphone",
          city: "Lyon",
          region: "Auvergne-Rhône-Alpes",
          type: "Call",
          status: "Scheduled",
          reminder: true,
          createdDate: new Date("2024-03-05"),
        },
      ]

    case "contracts":
      return [
        {
          id: "contract_001",
          organizationId: "1",
          contactId: "1",
          title: "Contrat CRM Hôtel Le Grand Palace",
          description: "Solution CRM complète pour la gestion des clients et réservations",
          value: 15000,
          currency: "EUR",
          status: "sent",
          signedDate: undefined,
          expirationDate: new Date("2024-06-15"),
          assignedTo: "Jean Dupont",
          createdDate: new Date("2024-03-01"),
          updatedDate: new Date("2024-03-01"),
          documents: [],
          notes: "Contrat envoyé suite à la démonstration. En attente de signature.",
        },
        {
          id: "contract_002",
          organizationId: "2",
          contactId: "2",
          title: "Contrat CRM Pharmacie Central",
          description: "Solution CRM adaptée aux pharmacies avec gestion des stocks",
          value: 8500,
          currency: "EUR",
          status: "draft",
          signedDate: undefined,
          expirationDate: new Date("2024-05-30"),
          assignedTo: "Sophie Martin",
          createdDate: new Date("2024-02-28"),
          updatedDate: new Date("2024-03-05"),
          documents: [],
          notes: "Contrat en préparation. Attente des spécifications techniques.",
        },
      ]

    default:
      return []
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9)
