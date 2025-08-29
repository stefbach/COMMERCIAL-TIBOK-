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
    console.log("[v0] Loading organizations...")

    // Check if we should use demo mode
    if (await this.isDemoMode()) {
      console.log("[v0] Using demo mode for organizations")
      const demoOrgs = this.getDemoData("organizations")
      console.log("[v0] Demo organizations loaded:", demoOrgs.length)
      return demoOrgs
    }

    try {
      console.log("[v0] Using Supabase for organizations")
      const supabase = await this.getServerClient()
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

  static async createOrganization(org: Omit<Organization, "id" | "created_at">): Promise<Organization> {
    const supabase = await this.getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("organizations")
      .insert({ ...org, created_at: new Date().toISOString() })
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
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

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
    const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  // The complete deleteAppointment method is implemented later in the class

  static async getAppointmentsByOrganization(organizationId: string): Promise<Appointment[]> {
    console.log("[v0] Loading appointments for organization:", organizationId)

    const supabase = await this.getServerClient()

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
        const appointments = this.getDemoData("appointments") as Appointment[]
        console.log("[v0] Fallback appointments data:", appointments)
        const filtered = appointments.filter(
          (appointment: Appointment) => appointment.organization_id === organizationId,
        )
        console.log("[v0] Fallback appointments loaded:", filtered.length)
        return filtered
      }

      return data || []
    } catch (error) {
      console.log("[v0] Supabase appointments failed, falling back to demo mode:", error)
      const appointments = this.getDemoData("appointments") as Appointment[]
      console.log("[v0] Fallback appointments data:", appointments)
      const filtered = appointments.filter((appointment: Appointment) => appointment.organization_id === organizationId)
      console.log("[v0] Fallback appointments loaded:", filtered.length)
      return filtered
    }
  }
}

// Client-side database operations
export class SupabaseClientDB {
  private static getClient() {
    return createBrowserClient()
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

  static async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    console.log("[v0] Creating organization:", orgData.name)

    // Check if we should use demo mode
    const demoMode = await this.isDemoMode()
    console.log("[v0] Demo mode for organization creation:", demoMode)

    if (demoMode) {
      console.log("[v0] Using localStorage for organization creation")
      const organizations = this.getDemoData("organizations")
      const newOrg: Organization = {
        id: this.generateId(),
        name: orgData.name || "",
        industry: orgData.industry || "",
        category: orgData.category || "",
        region: orgData.region || "",
        zone_geographique: orgData.zone_geographique || "",
        district: orgData.district || "",
        city: orgData.city || "",
        address: orgData.address || "",
        secteur: orgData.secteur || "",
        website: orgData.website || "",
        nb_chambres: orgData.nb_chambres || 0,
        phone: orgData.phone || "",
        email: orgData.email || "",
        notes: orgData.notes || "",
        contact_principal: orgData.contact_principal || "",
        contact_fonction: orgData.contact_fonction || "",
        size: orgData.size || "",
        country: orgData.country || "Maurice",
        status: orgData.status || "Actif",
        priority: orgData.priority || "Moyenne",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      organizations.push(newOrg)
      this.setDemoData("organizations", organizations)
      console.log("[v0] Organization created in localStorage. Total organizations:", organizations.length)
      return newOrg
    }

    // Try Supabase with only columns that exist in the database
    try {
      const supabase = this.getClient()

      const supabaseData = {
        name: orgData.name || "",
        industry: orgData.industry || "",
        category: orgData.category || "",
        region: orgData.region || "",
        zone_geographique: orgData.zone_geographique || "",
        district: orgData.district || "",
        city: orgData.city || "",
        address: orgData.address || "",
        secteur: orgData.secteur || "",
        website: orgData.website || "",
        nb_chambres: orgData.nb_chambres || 0,
        phone: orgData.phone || "",
        email: orgData.email || "",
        notes: orgData.notes || "",
        contact_principal: orgData.contact_principal || "",
        contact_fonction: orgData.contact_fonction || "",
        size: orgData.size || "",
        country: orgData.country || "Maurice",
        status: orgData.status || "Actif",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("organizations").insert([supabaseData]).select().single()

      if (error) {
        console.log("[v0] Supabase insert failed, falling back to demo mode:", error.message)
        // Fallback to localStorage
        const organizations = this.getDemoData("organizations")
        const newOrg: Organization = {
          id: this.generateId(),
          ...orgData,
          priority: orgData.priority || "Moyenne", // Keep priority in localStorage
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Organization

        organizations.push(newOrg)
        this.setDemoData("organizations", organizations)
        console.log("[v0] Fallback organization created. Total organizations:", organizations.length)
        return newOrg
      }

      console.log("[v0] Organization successfully created in Supabase")
      return { ...data, priority: orgData.priority || "Moyenne" } as Organization
    } catch (error) {
      console.log("[v0] Supabase failed, falling back to demo mode:", error)
      // Fallback to localStorage
      const organizations = this.getDemoData("organizations")
      const newOrg: Organization = {
        id: this.generateId(),
        ...orgData,
        priority: orgData.priority || "Moyenne",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Organization

      organizations.push(newOrg)
      this.setDemoData("organizations", organizations)
      console.log("[v0] Fallback organization created. Total organizations:", organizations.length)
      return newOrg
    }
  }

  static async getOrganizations(): Promise<Organization[]> {
    console.log("[v0] Loading organizations...")

    // Check if we should use demo mode
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

  static async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization> {
    if (await this.isDemoMode()) {
      const organizations = this.getDemoData("organizations")
      const index = organizations.findIndex((org: Organization) => org.id === id)
      if (index !== -1) {
        organizations[index] = { ...organizations[index], ...updates }
        this.setDemoData("organizations", organizations)
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

  // Contacts
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

  static async getContactsByOrganization(organizationId: number): Promise<Contact[]> {
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
        contacts[index] = { ...contacts[index], ...updates }
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
      // Fallback to demo mode if Supabase fails
      const contacts = this.getDemoData("contacts")
      const index = contacts.findIndex((contact: Contact) => contact.id === id)
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates }
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

  // Deals
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

  // Activities
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

  // Appointments
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
      console.log("[v0] Raw appointments data:", appointments)
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
        console.log("[v0] Fallback appointments data:", appointments)
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
      console.log("[v0] Fallback appointments data:", appointments)
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
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      console.log("[v0] Supabase appointment created:", data.id)
      return data
    } catch (error) {
      console.error("[v0] Supabase creation failed, falling back to demo mode:", error)
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

  // Contracts
  static async getContracts(): Promise<Contract[]> {
    if (await this.isDemoMode()) {
      return this.getDemoData("contracts")
    }

    const supabase = this.getClient()
    const { data, error } = await supabase.from("contracts").select("*").order("created_date", { ascending: false })

    if (error) throw error
    return data || []
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
        ...contract,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from("contracts")
      .update({ ...updates, updated_date: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
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

  // User Management
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

  // Demo data storage and retrieval functions
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
            id: "org1",
            name: "Hôtel Le Grand Palace",
            industry: "Hôtellerie",
            activityType: "Hôtel",
            size: "Grande entreprise",
            website: "https://legrandpalace.com",
            email: "contact@legrandpalace.com",
            phone: "+33 1 23 45 67 89",
            address: "123 Avenue des Champs-Élysées",
            city: "Paris",
            region: "Île-de-France",
            country: "France",
            status: "Actif",
            priority: "Haute",
            notes: "Client premium avec 200 chambres",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "org2",
            name: "Pharmacie Central",
            industry: "Santé",
            activityType: "Pharmacie",
            size: "PME",
            website: "https://pharmaciecentral.fr",
            email: "info@pharmaciecentral.fr",
            phone: "+33 1 98 76 54 32",
            address: "45 Rue de la République",
            city: "Lyon",
            region: "Auvergne-Rhône-Alpes",
            country: "France",
            status: "Prospect",
            priority: "Moyenne",
            notes: "Pharmacie familiale depuis 1950",
            created_at: "2024-01-20T14:30:00Z",
            updated_at: "2024-01-20T14:30:00Z",
          },
        ]

      case "contacts":
        return [
          {
            id: "1",
            organization_id: "org1",
            fullName: "Marie Dubois",
            role: "Directrice Générale",
            email: "marie.dubois@legrandpalace.com",
            phone: "01 42 56 78 90",
            mobilePhone: "06 12 34 56 78",
            linkedinProfile: "https://linkedin.com/in/marie-dubois",
            consentMarketing: true,
            notes: "Très intéressée par nos solutions. Préfère les rendez-vous en matinée.",
            lastContactDate: "2024-03-01T10:00:00Z",
            nextFollowUpDate: "2024-03-15T10:00:00Z",
            appointmentHistory: [],
            prospectStatus: "hot",
            priority: "high",
            source: "Référence",
            created_at: "2024-02-15T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
          {
            id: "2",
            organization_id: "org2",
            fullName: "Pierre Martin",
            role: "Pharmacien Titulaire",
            email: "pierre.martin@pharmaciecentral.fr",
            phone: "04 78 90 12 34",
            mobilePhone: "06 98 76 54 32",
            consentMarketing: true,
            notes: "Demande plus d'informations sur les tarifs.",
            lastContactDate: "2024-02-28T10:00:00Z",
            nextFollowUpDate: "2024-03-10T10:00:00Z",
            appointmentHistory: [],
            prospectStatus: "cold",
            priority: "medium",
            source: "Site web",
            created_at: "2024-02-20T10:00:00Z",
            updated_at: "2024-02-28T10:00:00Z",
          },
        ]

      case "appointments":
        return [
          {
            id: "z9fr8aj0e",
            organization_id: "org1",
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
            created_at: "2024-03-01T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
          {
            id: "7d3o9kq7c",
            organization_id: "org2",
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
            created_at: "2024-03-05T10:00:00Z",
            updated_at: "2024-03-05T10:00:00Z",
          },
        ]

      case "deals":
        return [
          {
            id: "deal_001",
            organization_id: "org1",
            contact_id: "1",
            title: "CRM Solution - Hôtel Le Grand Palace",
            description: "Implémentation complète du système CRM",
            value: 25000,
            currency: "EUR",
            stage: "proposal",
            probability: 75,
            expected_close_date: "2024-04-15",
            created_at: "2024-03-01T10:00:00Z",
            updated_at: "2024-03-01T10:00:00Z",
          },
          {
            id: "deal_002",
            organization_id: "org2",
            contact_id: "2",
            title: "CRM Solution - Pharmacie Central",
            description: "Solution CRM adaptée aux pharmacies",
            value: 12000,
            currency: "EUR",
            stage: "qualification",
            probability: 50,
            expected_close_date: "2024-05-01",
            created_at: "2024-02-28T10:00:00Z",
            updated_at: "2024-02-28T10:00:00Z",
          },
        ]

      case "contracts":
        return [
          {
            id: "contract_001",
            organizationId: "org1",
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
            organizationId: "org2",
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

      case "admins":
        return [
          {
            id: "admin1",
            user_id: "user1",
            email: "admin@crm.com",
            full_name: "Administrateur Principal",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ]

      case "commerciaux":
        return [
          {
            id: "comm1",
            email: "marie.dupont@crm.com",
            full_name: "Marie Dupont",
            phone: "+33 6 12 34 56 78",
            region: "Île-de-France",
            notes: "Spécialisée dans l'hôtellerie de luxe",
            created_at: "2024-01-05T00:00:00Z",
            updated_at: "2024-01-05T00:00:00Z",
          },
          {
            id: "comm2",
            email: "jean.martin@crm.com",
            full_name: "Jean Martin",
            phone: "+33 6 98 76 54 32",
            region: "Auvergne-Rhône-Alpes",
            notes: "Expert en pharmacies et établissements de santé",
            created_at: "2024-01-05T00:00:00Z",
            updated_at: "2024-01-05T00:00:00Z",
          },
        ]

      default:
        return []
    }
  }

  private static generateId() {
    return Math.random().toString(36).substr(2, 9)
  }
}

// Function to initialize demo data
function initializeDemoData() {
  if (typeof window === "undefined") return

  // Initialize organizations with more complete data
  if (!localStorage.getItem("demo_organizations")) {
    const demoOrganizations = SupabaseClientDB.getInitialDemoData("organizations")
    SupabaseClientDB.setDemoData("organizations", demoOrganizations)
  }

  // Initialize admins
  if (!localStorage.getItem("demo_admins")) {
    const demoAdmins = SupabaseClientDB.getInitialDemoData("admins")
    SupabaseClientDB.setDemoData("admins", demoAdmins)
  }

  // Initialize commerciaux
  if (!localStorage.getItem("demo_commerciaux")) {
    const demoCommerciaux = SupabaseClientDB.getInitialDemoData("commerciaux")
    SupabaseClientDB.setDemoData("commerciaux", demoCommerciaux)
  }

  // Initialize contacts
  if (!localStorage.getItem("demo_contacts")) {
    const demoContacts = SupabaseClientDB.getInitialDemoData("contacts")
    SupabaseClientDB.setDemoData("contacts", demoContacts)
  }

  // Initialize deals
  if (!localStorage.getItem("demo_deals")) {
    const demoDeals = SupabaseClientDB.getInitialDemoData("deals")
    SupabaseClientDB.setDemoData("deals", demoDeals)
  }

  // Initialize appointments
  if (!localStorage.getItem("demo_appointments")) {
    const demoAppointments = SupabaseClientDB.getInitialDemoData("appointments")
    SupabaseClientDB.setDemoData("appointments", demoAppointments)
  }

  // Initialize contracts
  if (!localStorage.getItem("demo_contracts")) {
    const demoContracts = SupabaseClientDB.getInitialDemoData("contracts")
    SupabaseClientDB.setDemoData("contracts", demoContracts)
  }
}

// Call initializeDemoData on page load
if (typeof window !== "undefined") {
  window.addEventListener("load", initializeDemoData)
}
