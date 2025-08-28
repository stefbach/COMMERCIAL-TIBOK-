"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, Globe, MapPin, Upload, Eye, Calendar } from "lucide-react"
import type { Organization, Contact, ImportResult } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { ImportModal } from "./import-modal"
import { ProspectDetailModal } from "./prospect-detail-modal"
import { ProspectSearch } from "./prospect-search"

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showProspectModal, setShowProspectModal] = useState(false)
  const [viewMode, setViewMode] = useState<"organizations" | "prospects">("organizations")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [orgs, contactsData] = await Promise.all([
        SupabaseClientDB.getOrganizations(),
        SupabaseClientDB.getContacts(),
      ])

      setOrganizations(orgs)
      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportOrganizations = async (data: any[]): Promise<ImportResult> => {
    try {
      let imported = 0
      const errors: string[] = []

      for (const row of data) {
        try {
          const org: Omit<Organization, "id" | "createdDate"> = {
            name: row.name || row.company_name || "",
            industry: row.industry || "",
            country: row.country || "",
            city: row.city || "",
            address: row.address || "",
            postalCode: row.postal_code || row.zip || "",
            website: row.website || "",
            size: row.size || "Medium",
            status: row.status || "Prospect",
            tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
            activityType: row.activity_type || row.type || "Autre",
          }

          if (org.name) {
            const newOrg = await SupabaseClientDB.createOrganization(org)

            if (row.contact_name || row.email || row.phone) {
              const contact: Omit<Contact, "id"> = {
                organizationId: newOrg.id,
                fullName: row.contact_name || row.name || "",
                role: row.role || row.position || "",
                email: row.email || "",
                phone: row.phone || "",
                mobilePhone: row.mobile || "",
                linkedinProfile: row.linkedin || "",
                consentMarketing: true,
                notes: row.notes || "",
                appointmentHistory: [],
                prospectStatus: row.prospect_status || "not_contacted",
                priority: row.priority || "medium",
                source: row.source || "Import CSV",
              }

              if (contact.fullName || contact.email) {
                await SupabaseClientDB.createContact(contact)
              }
            }

            imported++
          } else {
            errors.push(`Row ${imported + 1}: Missing organization name`)
          }
        } catch (error) {
          errors.push(`Row ${imported + 1}: ${(error as Error).message}`)
        }
      }

      await loadData()
      return { success: true, imported, errors, duplicates: 0 }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [(error as Error).message],
        duplicates: 0,
      }
    }
  }

  const handleViewContacts = async (orgId: number) => {
    try {
      const orgContacts = contacts.filter((c) => c.organizationId === orgId)
      if (orgContacts.length > 0) {
        setSelectedContact(orgContacts[0])
        setShowProspectModal(true)
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    }
  }

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setShowProspectModal(true)
  }

  const handleFiltersChange = (filters: any) => {
    // Filters are handled within ProspectSearch component
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "prospect":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {viewMode === "organizations" ? "Organizations" : "Prospects"}
          </h2>
          <p className="text-muted-foreground">
            {viewMode === "organizations" ? "Manage your client organizations" : "Search and manage your prospects"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg border-2 border-primary/20 bg-primary/5">
            <Button
              variant={viewMode === "organizations" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("organizations")}
              className="rounded-r-none font-medium"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Organizations
            </Button>
            <Button
              variant={viewMode === "prospects" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("prospects")}
              className="rounded-l-none font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Prospects & Filtres
            </Button>
          </div>

          <Button onClick={() => setShowImportModal(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add {viewMode === "organizations" ? "Organization" : "Prospect"}
          </Button>
        </div>
      </div>

      {viewMode === "organizations" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Search className="w-5 h-5" />
            <span className="font-medium">Astuce :</span>
            <span>Cliquez sur "Prospects & Filtres" pour accéder aux filtres avancés, prise de RDV et notes</span>
          </div>
        </div>
      )}

      {viewMode === "prospects" ? (
        <ProspectSearch
          contacts={contacts}
          organizations={organizations}
          onContactSelect={handleContactSelect}
          onFiltersChange={handleFiltersChange}
        />
      ) : (
        <>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations
              .filter(
                (org) =>
                  org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (org.industry && org.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (org.country && org.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (org.activityType && org.activityType.toLowerCase().includes(searchTerm.toLowerCase())),
              )
              .map((org) => (
                <Card key={org.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {org.activityType || org.industry || "No industry"}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(org.status)}>{org.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(org.city || org.country) && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {org.city && org.country ? `${org.city}, ${org.country}` : org.city || org.country}
                        </div>
                      )}
                      {org.website && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="w-4 h-4 mr-2" />
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {org.website}
                          </a>
                        </div>
                      )}
                      <div className="pt-2 space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewContacts(org.id)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Contacts
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewMode("prospects")}
                          className="w-full text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Gérer RDV & Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first organization"}
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
            </div>
          )}
        </>
      )}

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportOrganizations}
        type="organizations"
      />

      <ProspectDetailModal
        isOpen={showProspectModal}
        onClose={() => setShowProspectModal(false)}
        contact={selectedContact}
        onUpdate={loadData}
      />
    </div>
  )
}
