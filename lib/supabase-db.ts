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

/**
 * ============================================================================
 * SUPABASE CLIENT DB - VERSION COMPLÈTEMENT RECODÉE
 * ============================================================================
 * 
 * Basée sur la structure exacte de votre table contracts:
 * - organization_id, contact_id, assigned_to, signed_date, send_date (snake_case)
 * - Mapping automatique snake_case ↔ camelCase
 * - Support mode démo + mode Supabase
 */
export class SupabaseClientDB {
  private static getClient() {
    return createClient()
  }

  private static async isDemoMode(): Promise<boolean> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[CRM] Checking demo mode - URL:", !!url, "KEY:", !!key)

    if (!url || !key || url.trim() === "" || key.trim() === "") {
      console.log("[CRM] Missing Supabase environment variables, using demo mode")
      return true
    }

    try {
      const client = this.getClient()
      const { data: { user } } = await client.auth.getUser()
      console.log("[CRM] Auth check - User:", !!user)

      const { data, error } = await client.from("organizations").select("count").limit(1)
      if (error) {
        console.log("[CRM] Database connection failed, using demo mode:", error.message)
        return true
      }

      console.log("[CRM] Supabase connection successful, using database mode")
      return false
    } catch (error) {
      console.log("[CRM] Connection test failed, using demo mode:", error)
      return true
    }
  }

  // ============================================================================
  // ORGANIZATIONS - GARDE VOTRE CODE EXISTANT QUI FONCTIONNE
  // ============================================================================
  static async getOrganizations(): Promise<Organization[]> {
    console.log("[CRM] Loading organizations...")

    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for organizations")
      const demoOrgs = this.getDemoData("organizations")
      console.log("[CRM] Demo organizations loaded:", demoOrgs.length)
      return demoOrgs
    }

    try {
      console.log("[CRM] Using Supabase for organizations")
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.log("[CRM] Supabase error, falling back to demo mode:", error.message)
        return this.getDemoData("organizations")
      }

      console.log("[CRM] Supabase organizations loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.log("[CRM] Supabase failed, falling back to demo mode:", error)
      return this.getDemoData("organizations")
    }
  }

  static async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    console.log("[CRM] Creating organization:", orgData.name)

    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for organization creation")
      const newOrg: Organization = {
        id: parseInt(this.generateId()),
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
        status: orgData.status || "Active",
        priority: orgData.priority || "Medium",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activityType: orgData.industry || "",
      }
      
      const organizations = this.getDemoData("organizations")
      organizations.unshift(newOrg)
      this.setDemoData("organizations", organizations)
      console.log("[CRM] Organization created in demo mode:", newOrg.id)
      return newOrg
    }

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
        status: orgData.status || "Active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("organizations")
        .insert([supabaseData])
        .select()
        .single()

      if (error) throw error

      console.log("[CRM] Organization created in Supabase:", data.id)
      return { 
        ...data, 
        priority: orgData.priority || "Medium", 
        activityType: data.industry 
      } as Organization
    } catch (error) {
      console.error("[CRM] Supabase creation failed:", error)
      throw error
    }
  }

  static async updateOrganization(id: number | string, updates: Partial<Organization>): Promise<Organization> {
    console.log("[CRM] Updating organization - ID:", id, "Type:", typeof id)
    
    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for organization update")
      const organizations = this.getDemoData("organizations")
      const searchId = typeof id === 'string' ? parseInt(id) : id
      const index = organizations.findIndex((org: Organization) => org.id === searchId)
      
      if (index !== -1) {
        organizations[index] = { 
          ...organizations[index], 
          ...updates, 
          updated_at: new Date().toISOString() 
        }
        this.setDemoData("organizations", organizations)
        console.log("[CRM] Organization updated in demo mode")
        return organizations[index]
      }
      throw new Error("Organization not found in demo data")
    }

    try {
      const supabase = this.getClient()
      const supabaseId = typeof id === 'number' ? id.toString() : id
      
      const { data, error } = await supabase
        .from("organizations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", supabaseId)
        .select()
        .single()

      if (error) throw error
      
      console.log("[CRM] Organization updated in Supabase successfully")
      return data
    } catch (error) {
      console.error("[CRM] Organization update failed:", error)
      throw error
    }
  }

  static async deleteOrganization(id: number | string): Promise<void> {
    console.log("[CRM] Deleting organization - ID:", id)
    
    if (await this.isDemoMode()) {
      const organizations = this.getDemoData("organizations")
      const searchId = typeof id === 'string' ? parseInt(id) : id
      const filtered = organizations.filter((org: Organization) => org.id !== searchId)
      this.setDemoData("organizations", filtered)
      return
    }

    const supabase = this.getClient()
    const supabaseId = typeof id === 'number' ? id.toString() : id
    const { error } = await supabase.from("organizations").delete().eq("id", supabaseId)
    if (error) throw error
  }

  // ============================================================================
  // CONTRACTS - SECTION COMPLÈTEMENT RECODÉE BASÉE SUR VOTRE VRAIE STRUCTURE
  // ============================================================================

  /**
   * Récupère tous les contrats avec mapping correct snake_case → camelCase
   */
  static async getContracts(): Promise<Contract[]> {
    console.log("[CRM] 📋 Loading contracts...")

    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for contracts")
      const demoContracts = this.getDemoData("contracts")
      console.log("[CRM] ✅ Demo contracts loaded:", demoContracts.length)
      return demoContracts
    }

    try {
      console.log("[CRM] Using Supabase for contracts")
      const supabase = this.getClient()
      
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          id,
          title,
          description,
          organization_id,
          contact_id,
          value,
          currency,
          status,
          signed_date,
          expiration_date,
          assigned_to,
          notes,
          created_at,
          updated_at,
          send_date,
          documents
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[CRM] ❌ Supabase contracts error:", error.message)
        console.log("[CRM] Falling back to demo mode")
        return this.getDemoData("contracts")
      }

      console.log("[CRM] ✅ Raw Supabase contracts loaded:", data?.length || 0)
      
      // 🔄 MAPPING EXACT : Supabase (snake_case) → TypeScript (camelCase)
      const mappedContracts = (data || []).map((contract) => {
        const mapped = {
          id: contract.id,
          title: contract.title || "",
          description: contract.description || "",
          organizationId: contract.organization_id,                    // ✅ organization_id → organizationId
          contactId: contract.contact_id || null,                      // ✅ contact_id → contactId
          value: contract.value || 0,
          currency: contract.currency || "EUR",
          status: contract.status || "envoye",
          assignedTo: contract.assigned_to || "",                      // ✅ assigned_to → assignedTo
          expirationDate: contract.expiration_date ? new Date(contract.expiration_date) : undefined,
          signedDate: contract.signed_date ? new Date(contract.signed_date) : undefined,        // ✅ signed_date → signedDate
          sentDate: contract.send_date ? new Date(contract.send_date) : undefined,              // ✅ send_date → sentDate
          notes: contract.notes || "",
          documents: this.parseDocuments(contract.documents),
          createdDate: contract.created_at ? new Date(contract.created_at) : new Date(),
          updatedDate: contract.updated_at ? new Date(contract.updated_at) : new Date(),
        }
        console.log("[CRM] 🔄 Mapped contract:", contract.id, "→", { organizationId: mapped.organizationId, sentDate: mapped.sentDate })
        return mapped
      })

      console.log("[CRM] ✅ Contracts mapped and ready:", mappedContracts.length)
      return mappedContracts
      
    } catch (error) {
      console.error("[CRM] ❌ Contracts loading failed:", error)
      console.log("[CRM] Falling back to demo mode")
      return this.getDemoData("contracts")
    }
  }

  /**
   * Crée un nouveau contrat avec mapping correct camelCase → snake_case
   */
  static async createContract(contractInput: Omit<Contract, "id" | "createdDate" | "updatedDate">): Promise<Contract> {
    console.log("[CRM] 📝 Creating contract:", contractInput.title)

    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for contract creation")
      const newContract: Contract = {
        ...contractInput,
        id: this.generateId(),
        createdDate: new Date(),
        updatedDate: new Date(),
      }
      
      const contracts = this.getDemoData("contracts")
      contracts.unshift(newContract)
      this.setDemoData("contracts", contracts)
      console.log("[CRM] ✅ Contract created in demo mode:", newContract.id)
      return newContract
    }

    try {
      console.log("[CRM] Using Supabase for contract creation")
      const supabase = this.getClient()
      
      // 🔄 MAPPING EXACT : TypeScript (camelCase) → Supabase (snake_case)
      const supabaseData = {
        title: contractInput.title || "",
        description: contractInput.description || "",
        organization_id: contractInput.organizationId,                        // ✅ organizationId → organization_id
        contact_id: contractInput.contactId || null,                          // ✅ contactId → contact_id
        value: contractInput.value || 0,
        currency: contractInput.currency || "EUR",
        status: contractInput.status || "envoye",
        assigned_to: contractInput.assignedTo || null,                        // ✅ assignedTo → assigned_to
        expiration_date: contractInput.expirationDate ? contractInput.expirationDate.toISOString() : null,
        signed_date: contractInput.signedDate ? contractInput.signedDate.toISOString() : null,      // ✅ signedDate → signed_date
        send_date: contractInput.sentDate ? contractInput.sentDate.toISOString() : null,            // ✅ sentDate → send_date (CLEF!)
        notes: contractInput.notes || "",
        documents: this.stringifyDocuments(contractInput.documents),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("[CRM] 📤 Inserting contract data into Supabase:", {
        ...supabaseData,
        documents: `[${Array.isArray(contractInput.documents) ? contractInput.documents.length : 0} files]`
      })

      const { data, error } = await supabase
        .from("contracts")
        .insert([supabaseData])
        .select()
        .single()

      if (error) {
        console.error("[CRM] ❌ Contract creation error:", error)
        throw new Error(`Erreur création contrat: ${error.message}`)
      }

      console.log("[CRM] ✅ Contract created in Supabase with ID:", data.id)
      
      // 🔄 MAPPING DE RETOUR : Supabase (snake_case) → TypeScript (camelCase)
      const createdContract = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizationId: data.organization_id,                  // ✅ organization_id → organizationId
        contactId: data.contact_id,                            // ✅ contact_id → contactId
        value: data.value,
        currency: data.currency,
        status: data.status,
        assignedTo: data.assigned_to,                          // ✅ assigned_to → assignedTo
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        signedDate: data.signed_date ? new Date(data.signed_date) : undefined,        // ✅ signed_date → signedDate
        sentDate: data.send_date ? new Date(data.send_date) : undefined,              // ✅ send_date → sentDate
        notes: data.notes,
        documents: this.parseDocuments(data.documents),
        createdDate: new Date(data.created_at),
        updatedDate: new Date(data.updated_at),
      }
      
      console.log("[CRM] ✅ Contract created and mapped back:", createdContract.id)
      return createdContract
      
    } catch (error) {
      console.error("[CRM] ❌ Contract creation failed:", error)
      throw error
    }
  }

  /**
   * Met à jour un contrat existant
   */
  static async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    console.log("[CRM] ✏️ Updating contract:", id)

    if (await this.isDemoMode()) {
      console.log("[CRM] Using demo mode for contract update")
      const contracts = this.getDemoData("contracts")
      const index = contracts.findIndex((contract: Contract) => contract.id === id)
      
      if (index !== -1) {
        contracts[index] = {
          ...contracts[index],
          ...updates,
          updatedDate: new Date(),
        }
        this.setDemoData("contracts", contracts)
        console.log("[CRM] ✅ Contract updated in demo mode")
        return contracts[index]
      }
      throw new Error("Contract not found in demo data")
    }

    try {
      console.log("[CRM] Using Supabase for contract update")
      const supabase = this.getClient()

      // 🔄 MAPPING pour les updates : TypeScript (camelCase) → Supabase (snake_case)
      const supabaseUpdates: any = { 
        updated_at: new Date().toISOString() 
      }
      
      if (updates.title !== undefined) supabaseUpdates.title = updates.title
      if (updates.description !== undefined) supabaseUpdates.description = updates.description
      if (updates.organizationId !== undefined) supabaseUpdates.organization_id = updates.organizationId      // ✅ organizationId → organization_id
      if (updates.contactId !== undefined) supabaseUpdates.contact_id = updates.contactId                    // ✅ contactId → contact_id
      if (updates.value !== undefined) supabaseUpdates.value = updates.value
      if (updates.currency !== undefined) supabaseUpdates.currency = updates.currency
      if (updates.status !== undefined) supabaseUpdates.status = updates.status
      if (updates.assignedTo !== undefined) supabaseUpdates.assigned_to = updates.assignedTo                // ✅ assignedTo → assigned_to
      if (updates.expirationDate !== undefined) supabaseUpdates.expiration_date = updates.expirationDate ? updates.expirationDate.toISOString() : null
      if (updates.signedDate !== undefined) supabaseUpdates.signed_date = updates.signedDate ? updates.signedDate.toISOString() : null      // ✅ signedDate → signed_date
      if (updates.sentDate !== undefined) supabaseUpdates.send_date = updates.sentDate ? updates.sentDate.toISOString() : null              // ✅ sentDate → send_date
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes
      if (updates.documents !== undefined) supabaseUpdates.documents = this.stringifyDocuments(updates.documents)

      console.log("[CRM] 📤 Supabase update data:", {
        id,
        fieldsToUpdate: Object.keys(supabaseUpdates),
        organization_id: supabaseUpdates.organization_id,
        send_date: supabaseUpdates.send_date
      })

      const { data, error } = await supabase
        .from("contracts")
        .update(supabaseUpdates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[CRM] ❌ Contract update error:", error)
        throw new Error(`Erreur mise à jour contrat: ${error.message}`)
      }

      console.log("[CRM] ✅ Contract updated in Supabase:", data.id)

      // 🔄 MAPPING DE RETOUR cohérent
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        organizationId: data.organization_id,              // ✅ organization_id → organizationId
        contactId: data.contact_id,                        // ✅ contact_id → contactId
        value: data.value,
        currency: data.currency,
        status: data.status,
        assignedTo: data.assigned_to,                      // ✅ assigned_to → assignedTo
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        signedDate: data.signed_date ? new Date(data.signed_date) : undefined,    // ✅ signed_date → signedDate
        sentDate: data.send_date ? new Date(data.send_date) : undefined,          // ✅ send_date → sentDate
        notes: data.notes,
        documents: this.parseDocuments(data.documents),
        createdDate: new Date(data.created_at),
        updatedDate: new Date(data.updated_at),
      }
    } catch (error) {
      console.error("[CRM] ❌ Contract update failed:", error)
      throw error
    }
  }

  /**
   * Supprime un contrat
   */
  static async deleteContract(id: string): Promise<void> {
    console.log("[CRM] 🗑️ Deleting contract:", id)

    if (await this.isDemoMode()) {
      const contracts = this.getDemoData("contracts")
      const filtered = contracts.filter((contract: Contract) => contract.id !== id)
      this.setDemoData("contracts", filtered)
      console.log("[CRM] ✅ Contract deleted from demo mode")
      return
    }

    try {
      const supabase = this.getClient()
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("[CRM] ❌ Contract deletion error:", error)
        throw new Error(`Erreur suppression contrat: ${error.message}`)
      }

      console.log("[CRM] ✅ Contract deleted from Supabase:", id)
    } catch (error) {
      console.error("[CRM] ❌ Contract deletion failed:", error)
      throw error
    }
  }

  /**
   * Récupère les contrats d'une organisation spécifique
   */
  static async getContractsByOrganization(organizationId: string | number): Promise<Contract[]> {
    console.log("[CRM] 🏢 Loading contracts for organization:", organizationId)

    if (await this.isDemoMode()) {
      const contracts = this.getDemoData("contracts")
      const searchId = organizationId.toString()
      const filtered = contracts.filter((contract: Contract) => 
        contract.organizationId?.toString() === searchId
      )
      console.log("[CRM] ✅ Demo contracts for org loaded:", filtered.length)
      return filtered
    }

    try {
      const supabase = this.getClient()
      const supabaseId = organizationId.toString()
      
      console.log("[CRM] 📤 Querying contracts for organization_id:", supabaseId)
      
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          id,
          title,
          description,
          organization_id,
          contact_id,
          value,
          currency,
          status,
          signed_date,
          expiration_date,
          assigned_to,
          notes,
          created_at,
          updated_at,
          send_date,
          documents
        `)
        .eq("organization_id", supabaseId)                    // ✅ organization_id (nom exact de la colonne)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[CRM] ❌ Error loading contracts for org:", error)
        throw new Error(`Erreur récupération contrats pour organisation: ${error.message}`)
      }
      
      console.log("[CRM] ✅ Raw contracts for org loaded:", data?.length || 0)
      
      // 🔄 MAPPING cohérent
      const mappedContracts = (data || []).map((contract) => ({
        id: contract.id,
        title: contract.title || "",
        description: contract.description || "",
        organizationId: contract.organization_id,          // ✅ organization_id → organizationId
        contactId: contract.contact_id,                    // ✅ contact_id → contactId
        value: contract.value || 0,
        currency: contract.currency || "EUR",
        status: contract.status || "envoye",
        assignedTo: contract.assigned_to || "",            // ✅ assigned_to → assignedTo
        expirationDate: contract.expiration_date ? new Date(contract.expiration_date) : undefined,
        signedDate: contract.signed_date ? new Date(contract.signed_date) : undefined,    // ✅ signed_date → signedDate
        sentDate: contract.send_date ? new Date(contract.send_date) : undefined,          // ✅ send_date → sentDate
        notes: contract.notes || "",
        documents: this.parseDocuments(contract.documents),
        createdDate: new Date(contract.created_at),
        updatedDate: new Date(contract.updated_at),
      }))
      
      console.log("[CRM] ✅ Contracts mapped for organization:", mappedContracts.length)
      return mappedContracts
      
    } catch (error) {
      console.error("[CRM] ❌ Contracts for organization failed:", error)
      return []
    }
  }

  // ============================================================================
  // APPOINTMENTS - GARDE VOTRE CODE EXISTANT
  // ============================================================================
  static async getAppointments(): Promise<any[]> {
    console.log("[CRM] Loading appointments...")

    if (await this.isDemoMode()) {
      const appointments = this.getDemoData("appointments")
      console.log("[CRM] Demo appointments loaded:", appointments.length)
      return appointments
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      console.log("[CRM] Supabase appointments loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("[CRM] Appointments loading failed:", error)
      return this.getDemoData("appointments")
    }
  }

  static async getAppointmentsByOrganization(organizationId: string | number): Promise<Appointment[]> {
    console.log("[CRM] Loading appointments for organization:", organizationId)

    if (await this.isDemoMode()) {
      const appointments = this.getDemoData("appointments")
      const searchId = typeof organizationId === 'number' ? organizationId.toString() : organizationId
      const filtered = appointments.filter((appointment: Appointment) => 
        appointment.organization_id === searchId || appointment.organization_id === organizationId
      )
      console.log("[CRM] Demo appointments for org loaded:", filtered.length)
      return filtered
    }

    try {
      const supabase = this.getClient()
      const supabaseId = typeof organizationId === 'number' ? organizationId.toString() : organizationId
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("organization_id", supabaseId)
        .order("appointment_date", { ascending: false })

      if (error) throw error
      console.log("[CRM] Supabase appointments for org loaded:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("[CRM] Appointments for organization failed:", error)
      return this.getDemoData("appointments")
    }
  }

  static async createAppointment(appointment: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
    console.log("[CRM] Creating appointment:", appointment)

    if (await this.isDemoMode()) {
      const newAppointment: Appointment = {
        ...appointment,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const appointments = this.getDemoData("appointments")
      appointments.unshift(newAppointment)
      this.setDemoData("appointments", appointments)
      console.log("[CRM] Appointment created in demo mode:", newAppointment.id)
      return newAppointment
    }

    try {
      const supabase = this.getClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointment,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      console.log("[CRM] Appointment created in Supabase:", data.id)
      return data
    } catch (error) {
      console.error("[CRM] Appointment creation failed:", error)
      throw error
    }
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    console.log("[CRM] Updating appointment:", id, updates)

    if (await this.isDemoMode()) {
      const appointments = this.getDemoData("appointments")
      const index = appointments.findIndex((apt: any) => apt.id === id)
      
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        this.setDemoData("appointments", appointments)
        console.log("[CRM] Appointment updated in demo mode")
        return appointments[index]
      }
      throw new Error("Appointment not found")
    }

    try {
      const supabase = this.getClient()
      const { data, error } = await supabase
        .from("appointments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      console.log("[CRM] Appointment updated in Supabase:", data.id)
      return data
    } catch (error) {
      console.error("[CRM] Appointment update failed:", error)
      throw error
    }
  }

  static async deleteAppointment(id: string): Promise<void> {
    console.log("[CRM] Deleting appointment:", id)

    if (await this.isDemoMode()) {
      const appointments = this.getDemoData("appointments")
      const updated = appointments.filter((apt: any) => apt.id !== id)
      this.setDemoData("appointments", updated)
      return
    }

    const supabase = this.getClient()
    const { error } = await supabase.from("appointments").delete().eq("id", id)
    if (error) throw error
  }

  // ============================================================================
  // UTILITAIRES PRIVÉS 
  // ============================================================================
  private static parseDocuments(documents: any): any[] {
    if (!documents) return []
    if (Array.isArray(documents)) return documents
    if (typeof documents === "string") {
      try {
        return JSON.parse(documents)
      } catch {
        return []
      }
    }
    return []
  }

  private static stringifyDocuments(documents: any): string {
    if (!documents || !Array.isArray(documents)) return "[]"
    try {
      return JSON.stringify(documents)
    } catch {
      return "[]"
    }
  }

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
            id: 1,
            name: "Hôtel Le Grand Palace",
            industry: "Hôtellerie",
            activityType: "Hôtel",
            category: "5 étoiles",
            region: "Nord",
            district: "Port Louis",
            city: "Port Louis",
            address: "123 Royal Street",
            phone: "+230 123 4567",
            email: "contact@legrandpalace.mu",
            website: "https://legrandpalace.mu",
            nb_chambres: 120,
            secteur: "Tourisme",
            zone_geographique: "Nord",
            contact_principal: "Jean Dupont",
            contact_fonction: "Manager",
            notes: "Hôtel de luxe au centre-ville",
            status: "Active",
            priority: "High",
            size: "Grande entreprise",
            country: "Maurice",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Resort Tropical Paradise",
            industry: "Hôtellerie",
            activityType: "Resort",
            category: "4 étoiles",
            region: "Nord",
            district: "Rivière du Rempart",
            city: "Grand Baie",
            address: "456 Coastal Road",
            phone: "+230 987 6543",
            email: "info@tropicalparadise.mu",
            website: "https://tropicalparadise.mu",
            nb_chambres: 200,
            secteur: "Tourisme",
            zone_geographique: "Nord",
            contact_principal: "Marie Lagesse",
            contact_fonction: "Directrice",
            notes: "Resort de luxe en bord de mer",
            status: "Prospect",
            priority: "Medium",
            size: "Grande entreprise",
            country: "Maurice",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

      case "contracts":
        return [
          {
            id: "contract_001",
            title: "Contrat CRM Hôtel Le Grand Palace",
            description: "Solution CRM complète pour la gestion des clients et réservations",
            organizationId: "1",
            contactId: null,
            value: 15000,
            currency: "EUR",
            status: "envoye",
            assignedTo: "Jean Dupont",
            expirationDate: new Date("2024-06-15"),
            signedDate: undefined,
            sentDate: new Date("2024-03-01"),
            notes: "Contrat envoyé suite à la démonstration. En attente de signature.",
            documents: [],
            createdDate: new Date("2024-03-01"),
            updatedDate: new Date("2024-03-01"),
          },
          {
            id: "contract_002",
            title: "Contrat CRM Resort Tropical",
            description: "Solution CRM adaptée aux resorts avec gestion des réservations",
            organizationId: "2",
            contactId: null,
            value: 18500,
            currency: "EUR",
            status: "signe",
            assignedTo: "Sophie Martin",
            expirationDate: new Date("2024-12-31"),
            signedDate: new Date("2024-03-15"),
            sentDate: new Date("2024-02-28"),
            notes: "Contrat signé et en cours d'implémentation.",
            documents: [],
            createdDate: new Date("2024-02-28"),
            updatedDate: new Date("2024-03-15"),
          },
        ]

      case "appointments":
        return [
          {
            id: "apt_001",
            organization_id: "1",
            contact_id: null,
            title: "Présentation solution CRM",
            description: "Démonstration des fonctionnalités principales",
            appointment_date: "2024-03-25",
            appointment_time: "10:00",
            duration: 60,
            location: "Hôtel Le Grand Palace",
            type: "Meeting",
            status: "Scheduled",
            reminder: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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

// Export pour compatibilité
export { SupabaseClientDB as SupabaseDB }
