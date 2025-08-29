"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Building2,
  Globe,
  MapPin,
  Upload,
  Calendar,
  Phone,
  Mail,
  User,
  Edit,
  Trash2,
  Filter,
  X,
} from "lucide-react"
import type { Organization, ImportResult } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { ImportModal } from "./import-modal"
import { OrganizationDetailModal } from "./organization-detail-modal"

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [filters, setFilters] = useState({
    type: "",
    ville: "",
    secteur: "",
    district: "",
    categorie: "",
    status: "",
    priority: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const orgs = await SupabaseClientDB.getOrganizations()
      setOrganizations(orgs)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrganization = async (org: Organization, updates: Partial<Organization>) => {
    try {
      await SupabaseClientDB.updateOrganization(org.id, updates)
      await loadData()
    } catch (error) {
      console.error("Error updating organization:", error)
    }
  }

  const handleDeleteOrganization = async (org: Organization) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${org.name}" ?`)) {
      try {
        await SupabaseClientDB.deleteOrganization(org.id)
        await loadData()
      } catch (error) {
        console.error("Error deleting organization:", error)
      }
    }
  }

  const handleQualifyOrganization = async (org: Organization, newStatus: string, newPriority: string) => {
    await handleUpdateOrganization(org, { status: newStatus, priority: newPriority })
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      ville: "",
      secteur: "",
      district: "",
      categorie: "",
      status: "",
      priority: "",
    })
  }

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.activityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contact_principal?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters =
      (!filters.type || org.industry?.toLowerCase().includes(filters.type.toLowerCase())) &&
      (!filters.ville || org.city?.toLowerCase().includes(filters.ville.toLowerCase())) &&
      (!filters.secteur || org.secteur?.toLowerCase().includes(filters.secteur.toLowerCase())) &&
      (!filters.district || org.district?.toLowerCase().includes(filters.district.toLowerCase())) &&
      (!filters.categorie || org.category?.toLowerCase().includes(filters.categorie.toLowerCase())) &&
      (!filters.status || org.status?.toLowerCase() === filters.status.toLowerCase()) &&
      (!filters.priority || org.priority?.toLowerCase() === filters.priority.toLowerCase())

    return matchesSearch && matchesFilters
  })

  const getUniqueValues = (field: keyof Organization) => {
    return [...new Set(organizations.map((org) => org[field]).filter(Boolean))] as string[]
  }

  const handleImportOrganizations = async (data: any[]): Promise<ImportResult> => {
    console.log("[v0] Starting import process with data:", data.length, "rows")
    console.log("[v0] First row sample:", data[0])

    try {
      let imported = 0
      const errors: string[] = []

      for (const row of data) {
        try {
          console.log("[v0] Processing row:", row)

          const org: Omit<Organization, "id" | "created_at" | "updated_at"> = {
            name: row.name || row.nom || row.nom_etablissement || row["Nom"] || "",
            industry: row.industry || row.type || row.activite || row["Type"] || "",
            category: row.category || row.categorie || row["Categorie (etoiles)"] || "",
            region: row.region || row["Region"] || "",
            zone_geographique: row.zone_geographique || row.zone || row["Zone geographique"] || "",
            district: row.district || row["District"] || "",
            city: row.city || row.ville || row["Ville"] || "",
            address: row.address || row.adresse || row.adresse_precise || row["Adresse precise"] || "",
            secteur: row.secteur || row["Secteur"] || "",
            website: row.website || row.site_web || row.site_web_officiel || row["Site web officiel"] || "",
            nb_chambres:
              row.nb_chambres || row["Nb de chambres"]
                ? Number.parseInt(row.nb_chambres || row["Nb de chambres"])
                : undefined,
            phone: row.phone || row.telephone || row["Téléphone"] || "",
            email: row.email || row["Email"] || "",
            notes: row.notes || row.commentaires || row["Commentaires"] || "",
            size: row.size || "Medium",
            country: row.country || row.pays || "France",
            status: row.status || row.statut || "Prospect",
            contact_principal: row.contact_name || row.contact_nom || row.contact_principal || "",
            contact_fonction: row.contact_fonction || row.role || row.position || "",
            prospectStatus: row.prospect_status || "not_contacted",
            priority: row.priority || "medium",
            source: row.source || "Import CSV",
          }

          console.log("[v0] Mapped organization:", org)

          if (org.name) {
            console.log("[v0] Creating organization:", org.name)
            await SupabaseClientDB.createOrganization(org)
            imported++
            console.log("[v0] Successfully created organization:", org.name)
          } else {
            const error = `Row ${imported + 1}: Missing organization name`
            console.log("[v0] Error:", error)
            errors.push(error)
          }
        } catch (error) {
          const errorMsg = `Row ${imported + 1}: ${(error as Error).message}`
          console.log("[v0] Error processing row:", errorMsg)
          errors.push(errorMsg)
        }
      }

      console.log("[v0] Import completed. Imported:", imported, "Errors:", errors.length)
      await loadData()

      return { success: true, imported, errors, duplicates: 0 }
    } catch (error) {
      console.log("[v0] Import failed:", error)
      return {
        success: false,
        imported: 0,
        errors: [(error as Error).message],
        duplicates: 0,
      }
    }
  }

  const handleManageOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setShowDetailModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-blue-100 text-blue-800"
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
          <h2 className="text-3xl font-bold text-foreground">Organizations</h2>
          <p className="text-muted-foreground">Gérez vos établissements avec RDV, notes et contrats intégrés</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowImportModal(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Organisation
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher organisations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </Button>
          {(Object.values(filters).some(Boolean) || searchTerm) && (
            <Button
              variant="ghost"
              onClick={() => {
                resetFilters()
                setSearchTerm("")
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 p-4 bg-muted/50 rounded-lg">
            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {getUniqueValues("industry").map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.ville} onValueChange={(value) => setFilters((prev) => ({ ...prev, ville: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {getUniqueValues("city").map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.secteur}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, secteur: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {getUniqueValues("secteur").map((secteur) => (
                  <SelectItem key={secteur} value={secteur}>
                    {secteur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.district}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, district: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les districts</SelectItem>
                {getUniqueValues("district").map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.categorie}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, categorie: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {getUniqueValues("category").map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{org.activityType || org.industry || "No industry"}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(org.status || "")}>{org.status}</Badge>
                  {org.priority && (
                    <Badge className={getPriorityColor(org.priority)} variant="outline">
                      {org.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {org.category && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium mr-2">Catégorie:</span>
                    {org.category}
                  </div>
                )}

                {org.contact_principal && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    {org.contact_principal} {org.contact_fonction && `- ${org.contact_fonction}`}
                  </div>
                )}

                {org.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {org.phone}
                  </div>
                )}

                {org.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {org.email}
                  </div>
                )}

                {(org.city || org.country) && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {org.city && org.country ? `${org.city}, ${org.country}` : org.city || org.country}
                    {org.region && ` (${org.region})`}
                    {org.district && ` - ${org.district}`}
                  </div>
                )}

                {org.secteur && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium mr-2">Secteur:</span>
                    {org.secteur}
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

                {org.nb_chambres !== undefined && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 mr-2" />
                    {org.nb_chambres} Chambres
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Qualification rapide:</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <Select
                      value={org.status || ""}
                      onValueChange={(value) => handleQualifyOrganization(org, value, org.priority || "medium")}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={org.priority || ""}
                      onValueChange={(value) => handleQualifyOrganization(org, org.status || "prospect", value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleManageOrganization(org)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Gérer RDV, Notes & Contrats
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageOrganization(org)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteOrganization(org)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune organisation trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || Object.values(filters).some(Boolean)
              ? "Essayez d'ajuster vos termes de recherche ou filtres"
              : "Commencez par ajouter votre première organisation"}
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Organisation
          </Button>
        </div>
      )}

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportOrganizations}
        type="organizations"
      />

      <OrganizationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        organization={selectedOrganization}
        onUpdate={loadData}
      />
    </div>
  )
}
