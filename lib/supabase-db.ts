import { createClient } from "@/lib/supabase/client"
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

export interface CRMDocument {
  id: string
  title: string
  description?: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  category: 'presentation_commerciale' | 'contrat'
  sub_category?: string
  version: number
  is_active: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

// Client-side database operations
export class SupabaseClientDB {
  private static getClient() {
    return createClient()
  }

  private static async isDemoMode(): Promise<boolean> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Checking demo mode - URL:", !!url, "KEY:", !!key)

    if (!url || !key || url.trim() === "" || key.trim() === "") {
      console.log("[v0] Missing Supabase environment variables, using demo mode")
      return true
    }

    try {
      const client = this.getClient()
      const {
        data: { user },
      } = await client.auth.getUser()
      console.log("[v0] Auth check - User:", !!user)

      // Test database connection
      const { data, error } = await client.from("organizations").select("count").limit(1)
      if (error) {
        console.log("[v0] Database connection failed, using demo mode:", error.message)
        return true
      }

      console.log("[v0] Supabase connection successful, using database mode")
      return false
    } catch (error) {
      console.log("[v0] Connection test failed, using demo mode:", error)
      return true
    }
  }

  // ============================================
  // ORGANIZATIONS - Fonctions complètement corrigées
  // ============================================

  static async getOrganizations(): Promise<Organization[]> {
    console.log("[v0] Loading organizations...")

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for organizations")
      const demoOrgs = this.getDemoData("organizations")
      console.log("[v0] Demo organizations loaded:", demoOrgs.length)
      return demoOrgs
    }

    try {
      console.log("[v0] Using Supabase for organizations")
      const supabase = this.getClient()
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Supabase error, falling back to demo mode:", error.message)
        const demoOrgs = this.getDemoData("organizations")
        console.log("[v0] Fallback organizations loaded:", demoOrgs.length)
        return demoOrgs
      }

      console.log("[v0] Supabase organizations loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.log("[v0] Supabase failed, falling back to demo mode:", error)
      const demoOrgs = this.getDemoData("organizations")
      console.log("[v0] Fallback organizations loaded:", demoOrgs.length)
      return demoOrgs
    }
  }

  static async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    console.log("[v0] Creating organization:", orgData.name)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for organization creation")
      const newOrg: Organization = {
        id: this.generateId(),
        name: orgData.name || "",
        industry: orgData.industry || undefined,
        category: orgData.category || undefined,
        region: orgData.region || undefined,
        zone_geographique: orgData.zone_geographique || undefined,
        district: orgData.district || undefined,
        city: orgData.city || undefined,
        address: orgData.address || undefined,
        secteur: orgData.secteur || undefined,
        website: orgData.website || undefined,
        nb_chambres: orgData.nb_chambres || undefined,
        phone: orgData.phone || undefined,
        email: orgData.email || undefined,
        notes: orgData.notes || undefined,
        contact_principal: orgData.contact_principal || undefined,
        status: orgData.status || "prospect",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Champ temporaire pour compatibilité d'affichage
        activityType: orgData.industry || "",
      }
      const organizations = this.getDemoData("organizations")
      organizations.unshift(newOrg)
      this.setDemoData("organizations", organizations)
      return newOrg
    }

    try {
      const supabase = this.getClient()

      // Préparer les données pour Supabase - SEULEMENT les champs existants
      const supabaseData: any = {
        name: orgData.name || "",
      }

      // Ajouter seulement les champs non-vides qui existent dans la table
      if (orgData.industry?.trim()) supabaseData.industry = orgData.industry.trim()
      if (orgData.category?.trim()) supabaseData.category = orgData.category.trim()
      if (orgData.region?.trim()) supabaseData.region = orgData.region.trim()
      if (orgData.zone_geographique?.trim()) supabaseData.zone_geographique = orgData.zone_geographique.trim()
      if (orgData.district?.trim()) supabaseData.district = orgData.district.trim()
      if (orgData.city?.trim()) supabaseData.city = orgData.city.trim()
      if (orgData.address?.trim()) supabaseData.address = orgData.address.trim()
      if (orgData.secteur?.trim()) supabaseData.secteur = orgData.secteur.trim()
      if (orgData.website?.trim()) supabaseData.website = orgData.website.trim()
      if (orgData.nb_chambres) supabaseData.nb_chambres = orgData.nb_chambres
      if (orgData.phone?.trim()) supabaseData.phone = orgData.phone.trim()
      if (orgData.email?.trim()) supabaseData.email = orgData.email.trim()
      if (orgData.contact_principal?.trim()) supabaseData.contact_principal = orgData.contact_principal.trim()
      if (orgData.notes?.trim()) supabaseData.notes = orgData.notes.trim()
      if (orgData.status) supabaseData.status = orgData.status

      const { data, error } = await supabase.from("organizations").insert([supabaseData]).select().single()

      if (error) {
        console.log("[v0] Supabase insert failed:", error.message)
        throw error
      }

      console.log("[v0] Organization successfully created in Supabase")
      return { ...data, activityType: data.industry } as Organization
    } catch (error) {
      console.log("[v0] Supabase creation failed:", error)
      throw error
    }
  }

  static async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    if (await this.isDemoMode()) {
      const organizations = this.getDemoData("organizations")
      const index = organizations.findIndex((org: Organization) => org.id === id)
      if (index !== -1) {
        organizations[index] = { ...organizations[index], ...updates, updated_at: new Date().toISOString() }
        this.setDemoData("organizations", organizations)
        return organizations[index]
      }
      throw new Error("Organization not found")
    }

    // Filtrer pour ne garder que les champs qui existent dans la table
    const allowedFields = [
      'name', 'industry', 'website', 'phone', 'email', 'address', 'city', 'status',
      'notes', 'category', 'district', 'contact_principal', 'region', 'zone_geographique',
      'secteur', 'nb_chambres'
    ]

    const filteredUpdates: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    })

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("organizations")
      .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteOrganization(id: string): Promise<void> {
    if (await this.isDemoMode()) {
      const organizations = this.getDemoData("organizations")
      const filtered = organizations.filter((org: Organization) => org.id !== id)
      this.setDemoData("organizations", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("organizations").delete().eq("id", id)

    if (error) throw error
  }

  // ============================================
  // CONTACTS
  // ============================================

  static async getContacts(): Promise<Contact[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("contacts")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    if (await this.isDemoMode()) {
      const newContact: Contact = {
        ...contact,
        id: this.generateId(),
      }
      const contacts = this.getDemoData("contacts")
      contacts.unshift(newContact)
      this.setDemoData("contacts", contacts)
      return newContact
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contacts").insert(contact).select().single()

    if (error) throw error
    return data
  }

  static async getContactsByOrganization(organizationId: string): Promise<Contact[]> {
    if (await this.isDemoMode()) {
      const contacts = this.getDemoData("contacts")
      return contacts.filter((contact: Contact) => contact.organization_id === organizationId)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    console.log("[v0] Updating contact:", id, "with updates:", updates)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for contact update")
      const contacts = this.getDemoData("contacts")
      const index = contacts.findIndex((contact: Contact) => contact.id === id)
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates, updated_at: new Date().toISOString() }
        this.setDemoData("contacts", contacts)
        return contacts[index]
      }
      throw new Error("Contact not found")
    }

    console.log("[v0] Using Supabase for contact update")
    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("contacts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      console.log("[v0] Contact updated successfully:", data)
      return data
    } catch (error) {
      console.error("[v0] Supabase update failed, falling back to demo mode:", error)
      const contacts = this.getDemoData("contacts")
      const index = contacts.findIndex((contact: Contact) => contact.id === id)
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates, updated_at: new Date().toISOString() }
        this.setDemoData("contacts", contacts)
        return contacts[index]
      }
      throw new Error("Contact not found")
    }
  }

  static async deleteContact(id: string): Promise<void> {
    if (await this.isDemoMode()) {
      const contacts = this.getDemoData("contacts")
      const filtered = contacts.filter((contact: Contact) => contact.id !== id)
      this.setDemoData("contacts", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) throw error
  }

  // ============================================
  // DEALS
  // ============================================

  static async getDeals(): Promise<Deal[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("deals")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createDeal(deal: Omit<Deal, "id" | "created_at" | "updated_at" | "created_by">): Promise<Deal> {
    if (await this.isDemoMode()) {
      const newDeal: Deal = {
        ...deal,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const deals = this.getDemoData("deals")
      deals.unshift(newDeal)
      this.setDemoData("deals", deals)
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
    if (await this.isDemoMode()) {
      const deals = this.getDemoData("deals")
      const index = deals.findIndex((deal: Deal) => deal.id === id)
      if (index !== -1) {
        deals[index] = { ...deals[index], ...updates, updated_at: new Date().toISOString() }
        this.setDemoData("deals", deals)
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
    if (await this.isDemoMode()) {
      const deals = this.getDemoData("deals")
      const filtered = deals.filter((deal: Deal) => deal.id !== id)
      this.setDemoData("deals", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)

    if (error) throw error
  }

  // ============================================
  // ACTIVITIES
  // ============================================

  static async getActivities(): Promise<Activity[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("activities")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createActivity(
    activity: Omit<Activity, "id" | "created_at" | "updated_at" | "created_by">,
  ): Promise<Activity> {
    if (await this.isDemoMode()) {
      const newActivity: Activity = {
        ...activity,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const activities = this.getDemoData("activities")
      activities.unshift(newActivity)
      this.setDemoData("activities", activities)
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
    if (await this.isDemoMode()) {
      const activities = this.getDemoData("activities")
      const index = activities.findIndex((activity: Activity) => activity.id === id)
      if (index !== -1) {
        activities[index] = { ...activities[index], ...updates, updated_at: new Date().toISOString() }
        this.setDemoData("activities", activities)
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
    if (await this.isDemoMode()) {
      const activities = this.getDemoData("activities")
      const filtered = activities.filter((activity: Activity) => activity.id !== id)
      this.setDemoData("activities", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("activities").delete().eq("id", id)

    if (error) throw error
  }

  // ============================================
  // APPOINTMENTS
  // ============================================

  static async getAppointments(): Promise<any[]> {
    console.log("[v0] getAppointments called")

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for appointments loading")
      const appointments = this.getDemoData("appointments")
      console.log("[v0] Demo appointments loaded:", appointments.length)
      return appointments
    }

    try {
      console.log("[v0] Using Supabase for appointments loading")
      const supabase = this.getClient()
      const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false })

      if (error) throw error

      console.log("[v0] Supabase appointments loaded:", data?.length || 0)

      if (!data || data.length === 0) {
        console.log("[v0] Supabase returned empty data, checking localStorage fallback")
        const fallbackData = this.getDemoData("appointments")
        console.log("[v0] Fallback appointments loaded:", fallbackData.length)
        return fallbackData
      }

      return data || []
    } catch (error) {
      console.error("[v0] Supabase loading failed, falling back to demo mode:", error)
      const appointments = this.getDemoData("appointments")
      console.log("[v0] Fallback appointments loaded:", appointments.length)
      return appointments
    }
  }

  static async getAppointmentsByContact(contactId: string): Promise<Appointment[]> {
    if (await this.isDemoMode()) {
      const appointments = this.getDemoData("appointments")
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

  static async getAppointmentsByOrganization(organizationId: string): Promise<Appointment[]> {
    console.log("[v0] Loading appointments for organization:", organizationId)

    if (await this.isDemoMode()) {
      console.log("[v0] Demo mode for appointments loading: true")
      const appointments = this.getDemoData("appointments")
      const filtered = appointments.filter((appointment: Appointment) => appointment.organization_id === organizationId)
      console.log("[v0] Filtered appointments:", filtered.length)
      return filtered
    }

    console.log("[v0] Demo mode for appointments loading: false")
    const supabase = this.getClient()

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("organization_id", organizationId)
        .order("appointment_date", { ascending: false })

      if (error) throw error
      console.log("[v0] Supabase appointments loaded:", data?.length || 0)

      if (!data || data.length === 0) {
        console.log("[v0] Supabase returned empty data, checking localStorage fallback")
        const appointments = this.getDemoData("appointments")
        const filtered = appointments.filter(
          (appointment: Appointment) => appointment.organization_id === organizationId,
        )
        console.log("[v0] Fallback appointments loaded:", filtered.length)
        return filtered
      }

      return data || []
    } catch (error) {
      console.log("[v0] Supabase appointments failed, falling back to demo mode:", error)
      const appointments = this.getDemoData("appointments")
      const filtered = appointments.filter((appointment: Appointment) => appointment.organization_id === organizationId)
      console.log("[v0] Fallback appointments loaded:", filtered.length)
      return filtered
    }
  }

  static async deleteAppointment(id: string): Promise<void> {
    console.log("[v0] deleteAppointment called with id:", id)

    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    if ((await this.isDemoMode()) || !isValidUUID) {
      console.log("[v0] Using demo mode for appointment deletion")
      const appointments = this.getDemoData("appointments")
      const updatedAppointments = appointments.filter((apt: any) => apt.id !== id)
      this.setDemoData("appointments", updatedAppointments)
      console.log("[v0] Appointment deleted from localStorage")
      return
    }

    try {
      console.log("[v0] Using Supabase for appointment deletion")
      const supabase = this.getClient()
      const { error } = await supabase.from("appointments").delete().eq("id", id)

      if (error) throw error
      console.log("[v0] Appointment deleted from Supabase")
    } catch (error) {
      console.error("[v0] Supabase deletion failed, falling back to demo mode:", error)
      const appointments = this.getDemoData("appointments")
      const updatedAppointments = appointments.filter((apt: any) => apt.id !== id)
      this.setDemoData("appointments", updatedAppointments)
      console.log("[v0] Fallback appointment deleted from localStorage")
    }
  }

  static async createAppointment(
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at">,
  ): Promise<Appointment> {
    console.log("[v0] createAppointment called with:", appointment)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for appointment creation")
      const newAppointment: Appointment = {
        ...appointment,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const appointments = this.getDemoData("appointments")
      appointments.unshift(newAppointment)
      this.setDemoData("appointments", appointments)
      console.log("[v0] Demo appointment created:", newAppointment.id)
      return newAppointment
    }

    try {
      console.log("[v0] Using Supabase for appointment creation")
      const supabase = this.getClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No authenticated user, falling back to demo mode")
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointment,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      console.log("[v0] Supabase appointment created:", data.id)
      return data
    } catch (error) {
      console.log("[v0] Supabase creation failed, falling back to demo mode:", error.message)
      const newAppointment: Appointment = {
        ...appointment,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const appointments = this.getDemoData("appointments")
      appointments.unshift(newAppointment)
      this.setDemoData("appointments", appointments)
      console.log("[v0] Fallback appointment created:", newAppointment.id)
      return newAppointment
    }
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    console.log("[v0] updateAppointment called with id:", id, "updates:", updates)

    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    if ((await this.isDemoMode()) || !isValidUUID) {
      console.log("[v0] Using demo mode for appointment update")
      const appointments = this.getDemoData("appointments")
      const index = appointments.findIndex((apt: any) => apt.id === id)
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        this.setDemoData("appointments", appointments)
        console.log("[v0] Demo appointment updated:", appointments[index].id)
        return appointments[index]
      }
      throw new Error("Appointment not found")
    }

    try {
      console.log("[v0] Using Supabase for appointment update")
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("appointments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      console.log("[v0] Supabase appointment updated:", data.id)
      return data
    } catch (error) {
      console.error("[v0] Supabase update failed, falling back to demo mode:", error)
      const appointments = this.getDemoData("appointments")
      const index = appointments.findIndex((apt: any) => apt.id === id)
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        this.setDemoData("appointments", appointments)
        console.log("[v0] Fallback appointment updated:", appointments[index].id)
        return appointments[index]
      }
      throw new Error("Appointment not found")
    }
  }

  // ============================================
  // CONTRACTS
  // ============================================

  static async getContracts(): Promise<Contract[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("contracts")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contracts").select("*").order("created_date", { ascending: false })

    if (error) throw error

    return (data || []).map((contract) => ({
      ...contract,
      documents: typeof contract.documents === "string" ? JSON.parse(contract.documents) : contract.documents || [],
    }))
  }

  static async createContract(contract: Omit<Contract, "id" | "createdDate" | "updatedDate">): Promise<Contract> {
    if (await this.isDemoMode()) {
      const newContract: Contract = {
        ...contract,
        id: this.generateId(),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      }
      const contracts = this.getDemoData("contracts")
      contracts.unshift(newContract)
      this.setDemoData("contracts", contracts)
      return newContract
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .insert({
        title: contract.title,
        description: contract.description,
        organization_id: contract.organization_id || contract.organizationId,
        contact_id: contract.contact_id || contract.contactId,
        value: contract.value,
        currency: contract.currency,
        status: contract.status,
        assigned_to: contract.assigned_to || contract.assignedTo,
        expiration_date: contract.expiration_date || contract.expirationDate,
        signed_date: contract.signed_date || contract.signedDate,
        notes: contract.notes,
        documents: contract.documents || [],
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      documents: Array.isArray(data.documents)
        ? data.documents
        : typeof data.documents === "string"
          ? JSON.parse(data.documents)
          : [],
    }
  }

  static async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    if (await this.isDemoMode()) {
      const contracts = this.getDemoData("contracts")
      const index = contracts.findIndex((contract: Contract) => contract.id === id)
      if (index !== -1) {
        contracts[index] = {
          ...contracts[index],
          ...updates,
          updatedDate: new Date().toISOString(),
        }
        this.setDemoData("contracts", contracts)
        return contracts[index]
      }
      throw new Error("Contract not found")
    }

    const supabase = this.getClient()

    const updateData = { ...updates, updated_date: new Date().toISOString() }
    if (updateData.documents) {
      updateData.documents = JSON.stringify(updateData.documents)
    }

    const { data, error } = await supabase.from("contracts").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return {
      ...data,
      documents: typeof data.documents === "string" ? JSON.parse(data.documents) : data.documents || [],
    }
  }

  static async deleteContract(id: string): Promise<void> {
    if (await this.isDemoMode()) {
      const contracts = this.getDemoData("contracts")
      const filtered = contracts.filter((contract: Contract) => contract.id !== id)
      this.setDemoData("contracts", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("contracts").delete().eq("id", id)

    if (error) throw error
  }

  static async getContractsByOrganization(organizationId: string): Promise<Contract[]> {
    console.log("[v0] Loading contracts for organization:", organizationId)

    if (await this.isDemoMode()) {
      console.log("[v0] Demo mode for contracts loading: true")
      const contracts = this.getDemoData("contracts")
      const filtered = contracts.filter((contract: Contract) => contract.organizationId === organizationId)
      console.log("[v0] Demo contracts loaded:", filtered.length)
      return filtered
    }

    console.log("[v0] Demo mode for contracts loading: false")
    const supabase = this.getClient()

    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_date", { ascending: false })

      if (error) throw error
      console.log("[v0] Supabase contracts loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.log("[v0] Supabase contracts failed, falling back to demo mode:", error)
      const contracts = this.getDemoData("contracts")
      const filtered = contracts.filter((contract: Contract) => contract.organizationId === organizationId)
      console.log("[v0] Fallback contracts loaded:", filtered.length)
      return filtered
    }
  }

  static async getContractsByAssignee(assignedTo: string): Promise<Contract[]> {
    if (await this.isDemoMode()) {
      const contracts = this.getDemoData("contracts")
      return contracts.filter((contract: Contract) => contract.assignedTo === assignedTo)
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("assigned_to", assignedTo)
      .order("created_date", { ascending: false })

    if (error) throw error
    return data || []
  }

  // ============================================
  // CRM DOCUMENTS (inchangées)
  // ============================================

  static async getCRMDocuments(): Promise<CRMDocument[]> {
    console.log("[v0] Loading CRM documents...")

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for CRM documents")
      const demoDocuments = this.getDemoData("crm_documents")
      console.log("[v0] Demo CRM documents loaded:", demoDocuments.length)
      return demoDocuments
    }

    try {
      console.log("[v0] Using Supabase for CRM documents")
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("crm_documents")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })

      if (error) {
        console.log("[v0] Supabase error, falling back to demo mode:", error.message)
        const demoDocuments = this.getDemoData("crm_documents")
        console.log("[v0] Fallback CRM documents loaded:", demoDocuments.length)
        return demoDocuments
      }

      console.log("[v0] Supabase CRM documents loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.log("[v0] Supabase failed, falling back to demo mode:", error)
      const demoDocuments = this.getDemoData("crm_documents")
      console.log("[v0] Fallback CRM documents loaded:", demoDocuments.length)
      return demoDocuments
    }
  }

  static async createCRMDocument(docData: Omit<CRMDocument, "id" | "created_at" | "updated_at">): Promise<CRMDocument> {
    console.log("[v0] Creating CRM document:", docData.title)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for CRM document creation")
      const newDoc: CRMDocument = {
        id: this.generateId(),
        ...docData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const documents = this.getDemoData("crm_documents")
      documents.unshift(newDoc)
      this.setDemoData("crm_documents", documents)
      return newDoc
    }

    try {
      console.log("[v0] Using Supabase for CRM document creation")
      const supabase = this.getClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const supabaseData = {
        ...docData,
        uploaded_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("crm_documents")
        .insert([supabaseData])
        .select()
        .single()

      if (error) {
        console.log("[v0] Supabase insert failed:", error.message)
        throw error
      }

      console.log("[v0] CRM Document successfully created in Supabase")
      return data
    } catch (error) {
      console.log("[v0] Supabase creation failed:", error)
      throw error
    }
  }

  static async updateCRMDocument(id: string, updates: Partial<CRMDocument>): Promise<CRMDocument> {
    console.log("[v0] Updating CRM document:", id)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for CRM document update")
      const documents = this.getDemoData("crm_documents")
      const index = documents.findIndex((doc: CRMDocument) => doc.id === id)
      if (index !== -1) {
        documents[index] = { 
          ...documents[index], 
          ...updates, 
          updated_at: new Date().toISOString() 
        }
        this.setDemoData("crm_documents", documents)
        return documents[index]
      }
      throw new Error("CRM Document not found")
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("crm_documents")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      console.log("[v0] CRM Document updated successfully")
      return data
    } catch (error) {
      console.error("[v0] Supabase update failed:", error)
      throw error
    }
  }

  static async deleteCRMDocument(id: string): Promise<void> {
    console.log("[v0] Deleting CRM document:", id)

    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for CRM document deletion")
      const documents = this.getDemoData("crm_documents")
      const updatedDocuments = documents.map((doc: CRMDocument) => 
        doc.id === id ? { ...doc, is_active: false } : doc
      )
      this.setDemoData("crm_documents", updatedDocuments)
      return
    }

    try {
      const supabase = this.getClient()
      const { error } = await supabase
        .from("crm_documents")
        .update({ is_active: false })
        .eq("id", id)

      if (error) throw error
      console.log("[v0] CRM Document deleted successfully")
    } catch (error) {
      console.error("[v0] Supabase deletion failed:", error)
      throw error
    }
  }

  static async getCRMDocumentsByCategory(category: 'presentation_commerciale' | 'contrat'): Promise<CRMDocument[]> {
    console.log("[v0] Loading CRM documents by category:", category)

    if (await this.isDemoMode()) {
      const documents = this.getDemoData("crm_documents")
      return documents.filter((doc: CRMDocument) => doc.category === category && doc.is_active)
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("crm_documents")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[v0] Error loading CRM documents by category:", error)
      const documents = this.getDemoData("crm_documents")
      return documents.filter((doc: CRMDocument) => doc.category === category && doc.is_active)
    }
  }

  static async getCRMDocumentsBySubCategory(subCategory: string): Promise<CRMDocument[]> {
    console.log("[v0] Loading CRM documents by sub-category:", subCategory)

    if (await this.isDemoMode()) {
      const documents = this.getDemoData("crm_documents")
      return documents.filter((doc: CRMDocument) => doc.sub_category === subCategory && doc.is_active)
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("crm_documents")
        .select("*")
        .eq("sub_category", subCategory)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[v0] Error loading CRM documents by sub-category:", error)
      const documents = this.getDemoData("crm_documents")
      return documents.filter((doc: CRMDocument) => doc.sub_category === subCategory && doc.is_active)
    }
  }

  // Gestion des fichiers avec Supabase Storage
  static async uploadCRMDocumentFile(file: File, fileName: string): Promise<string> {
    console.log("[v0] Uploading CRM document file:", fileName)

    if (await this.isDemoMode()) {
      console.log("[v0] Demo mode - file upload simulated")
      return `demo/${fileName}`
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase.storage
        .from('crm-documents')
        .upload(fileName, file)

      if (error) throw error
      
      console.log("[v0] File uploaded successfully:", data.path)
      return data.path
    } catch (error) {
      console.error("[v0] File upload failed:", error)
      throw error
    }
  }

  static async downloadCRMDocumentFile(filePath: string): Promise<Blob> {
    console.log("[v0] Downloading CRM document file:", filePath)

    if (await this.isDemoMode()) {
      console.log("[v0] Demo mode - file download simulated")
      throw new Error("File download not available in demo mode")
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase.storage
        .from('crm-documents')
        .download(filePath)

      if (error) throw error
      
      console.log("[v0] File downloaded successfully")
      return data
    } catch (error) {
      console.error("[v0] File download failed:", error)
      throw error
    }
  }

  static async deleteCRMDocumentFile(filePath: string): Promise<void> {
    console.log("[v0] Deleting CRM document file:", filePath)

    if (await this.isDemoMode()) {
      console.log("[v0] Demo mode - file deletion simulated")
      return
    }

    try {
      const supabase = this.getClient()
      const { error } = await supabase.storage
        .from('crm-documents')
        .remove([filePath])

      if (error) throw error
      
      console.log("[v0] File deleted successfully")
    } catch (error) {
      console.error("[v0] File deletion failed:", error)
      throw error
    }
  }

  // ============================================
  // USER MANAGEMENT (inchangées)
  // ============================================

  static async getAdmins(): Promise<any[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("admins")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createAdmin(admin: { email: string; full_name: string }): Promise<any> {
    if (await this.isDemoMode()) {
      const newAdmin = {
        ...admin,
        id: this.generateId(),
        user_id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const admins = this.getDemoData("admins")
      admins.unshift(newAdmin)
      this.setDemoData("admins", admins)
      return newAdmin
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("admins")
      .insert({
        ...admin,
        user_id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCommerciaux(): Promise<any[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("commerciaux")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("commerciaux").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createCommercial(commercial: {
    email: string
    full_name: string
    phone?: string
    region?: string
    notes?: string
  }): Promise<any> {
    if (await this.isDemoMode()) {
      const newCommercial = {
        ...commercial,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const commerciaux = this.getDemoData("commerciaux")
      commerciaux.unshift(newCommercial)
      this.setDemoData("commerciaux", commerciaux)
      return newCommercial
    }

    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("commerciaux")
      .insert({
        ...commercial,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteAdmin(id: string): Promise<void> {
    if (await this.isDemoMode()) {
      const admins = this.getDemoData("admins")
      const filtered = admins.filter((admin: any) => admin.id !== id)
      this.setDemoData("admins", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("admins").delete().eq("id", id)

    if (error) throw error
  }

  static async deleteCommercial(id: string): Promise<void> {
    if (await this.isDemoMode()) {
      const commerciaux = this.getDemoData("commerciaux")
      const filtered = commerciaux.filter((commercial: any) => commercial.id !== id)
      this.setDemoData("commerciaux", filtered)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("commerciaux").delete().eq("id", id)

    if (error) throw error
  }

  // ============================================
  // DEMO DATA - Données corrigées SANS les champs supprimés
  // ============================================

  private static getDemoData(key: string) {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(`demo_${key}`)

    if (!data) {
      const demoData = this.getInitialDemoData(key)
      if (demoData.length > 0) {
        this.setDemoData(key, demoData)
        return demoData
      }
    }

    return data ? JSON.parse(data) : []
  }

  private static setDemoData(key: string, data: any[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(`demo_${key}`, JSON.stringify(data))
  }

  private static getInitialDemoData(key: string) {
    switch (key) {
      case "organizations":
        return [
          {
            id: "demo-org-1",
            name: "Hôtel Le Grand Mauricien",
            industry: "Hôtellerie",
            category: "4 étoiles",
            region: "Ouest",
            zone_geographique: "Côte ouest",
            district: "Port Louis",
            city: "Port Louis",
            address: "123 Royal Street, Port Louis",
            secteur: "Tourisme",
            website: "https://legrandmauricien.mu",
            nb_chambres: 120,
            phone: "+230 123 4567",
            email: "contact@legrandmauricien.mu",
            contact_principal: "Marie Lagesse",
            notes: "Hôtel de luxe au centre-ville avec vue sur le port",
            status: "active",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
            activityType: "Hôtellerie",
          },
          {
            id: "demo-org-2",
            name: "Resort Tropical Paradise",
            industry: "Hôtellerie",
            category: "5 étoiles",
            region: "Nord",
            zone_geographique: "Grand Baie",
            district: "Rivière du Rempart",
            city: "Grand Baie",
            address: "456 Coastal Road, Grand Baie",
            secteur: "Tourisme",
            website: "https://tropicalparadise.mu",
            nb_chambres: 200,
            phone: "+230 987 6543",
            email: "info@tropicalparadise.mu",
            contact_principal: "Jean Dupont",
            notes: "Resort de luxe en bord de mer avec spa",
            status: "prospect",
            created_at: "2024-01-20T14:30:00Z",
            updated_at: "2024-01-20T14:30:00Z",
            activityType: "Hôtellerie",
          },
        ]

      case "contacts":
        return [
          {
            id: "demo-contact-1",
            organization_id: "demo-org-1",
            fullName: "Marie Lagesse",
            role: "Directrice Générale",
            email: "marie.lagesse@legrandmauricien.mu",
            phone: "+230 123 4567",
            mobilePhone: "+230 5123 4567",
            consentMarketing: true,
            notes: "Très intéressée par nos solutions CRM",
            lastContactDate: "2024-03-01T10:00:00Z",
            nextFollowUpDate: "2024-03-15T10:00:00Z",
            appointmentHistory: [],
            prospectStatus: "hot",
            source: "Référence",
            created_at: "2024-02-15T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
        ]

      case "appointments":
        return [
          {
            id: "demo-apt-1",
            organization_id: "demo-org-1",
            title: "Présentation solution CRM",
            description: "Démonstration des fonctionnalités principales",
            appointment_date: "2024-03-15",
            appointment_time: "10:00",
            duration: 60,
            location: "Hôtel Le Grand Mauricien",
            type: "Meeting",
            status: "Scheduled",
            reminder: true,
            created_at: "2024-03-01T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
        ]

      case "contracts":
        return [
          {
            id: "demo-contract-1",
            organizationId: "demo-org-1",
            title: "Contrat CRM Hôtel Le Grand Mauricien",
            description: "Solution CRM complète pour la gestion hôtelière",
            value: 15000,
            currency: "MUR",
            status: "envoye",
            assignedTo: "Marie Lagesse",
            createdDate: new Date("2024-03-01"),
            updatedDate: new Date("2024-03-01"),
            documents: [],
            notes: "Contrat envoyé suite à la démonstration",
          },
        ]

      case "deals":
        return [
          {
            id: "demo-deal-1",
            organizationId: "demo-org-1",
            title: "CRM Solution - Hôtel Le Grand Mauricien",
            description: "Implémentation complète du système CRM",
            value: 25000,
            currency: "MUR",
            stage: "proposal",
            probability: 75,
            expected_close_date: "2024-04-15",
            created_at: "2024-03-01T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
        ]

      case "activities":
        return []

      case "crm_documents":
        return [
          {
            id: "demo-doc-1",
            title: "Présentation CRM Hôtellerie Maurice",
            description: "Présentation commerciale adaptée au secteur hôtelier mauricien",
            file_name: "crm_hotels_maurice.pdf",
            file_path: "demo/crm_hotels_maurice.pdf",
            file_size: 2850000,
            mime_type: "application/pdf",
            category: "presentation_commerciale",
            sub_category: "hotel",
            version: 1,
            is_active: true,
            uploaded_by: "demo-user",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
        ]

      case "admins":
        return [
          {
            id: "demo-admin-1",
            user_id: "demo-user-1",
            email: "admin@crm.mu",
            full_name: "Administrateur Principal",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ]

      case "commerciaux":
        return [
          {
            id: "demo-comm-1",
            email: "marie.commercial@crm.mu",
            full_name: "Marie Commercial",
            phone: "+230 5123 4567",
            region: "Nord",
            notes: "Spécialisée dans l'hôtellerie de luxe à Maurice",
            created_at: "2024-01-05T00:00:00Z",
            updated_at: "2024-01-05T00:00:00Z",
          },
        ]

      default:
        return []
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

// Fonction d'initialisation des données de démonstration
function initializeDemoData() {
  if (typeof window === "undefined") return

  const dataTypes = [
    "organizations", 
    "admins", 
    "commerciaux", 
    "contacts", 
    "deals", 
    "appointments", 
    "contracts",
    "crm_documents",
    "activities"
  ]
  
  dataTypes.forEach(type => {
    if (!localStorage.getItem(`demo_${type}`)) {
      const demoData = SupabaseClientDB['getInitialDemoData'](type)
      if (demoData.length > 0) {
        localStorage.setItem(`demo_${type}`, JSON.stringify(demoData))
      }
    }
  })
}

// Initialiser les données de démo au chargement de la page
if (typeof window !== "undefined") {
  window.addEventListener("load", initializeDemoData)
}

// Export pour compatibilité avec l'ancien code
export { SupabaseClientDB as SupabaseDB }
