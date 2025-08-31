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
  Database,
} from "lucide-react"
import type { Organization, ImportResult } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"
import { ImportModal } from "./import-modal"
import { OrganizationDetailModal } from "./organization-detail-modal"
import { CreateOrganizationModal } from "./create-organization-modal"

function SupabaseDiagnostic() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...")
  const [envVars, setEnvVars] = useState<any>({})
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
    setEnvVars(vars)

    if (!vars.NEXT_PUBLIC_SUPABASE_URL || !vars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setConnectionStatus("❌ Variables d'environnement manquantes")
      return
    }

    try {
      const result = await SupabaseClientDB.getOrganizations()
      setConnectionStatus("✅ Connexion Supabase réussie")
      setTestResult(`${result.length} organisations trouvées dans Supabase`)
    } catch (error) {
      setConnectionStatus("❌ Erreur de connexion Supabase")
      setTestResult((error as Error).message)
    }
  }

  const testImport = async () => {
    const testOrg = {
      name: "Test Hotel Maurice",
      industry: "Hôtellerie",
      category: "4 étoiles",
      region: "Port Louis",
      district: "Port Louis",
      city: "Port Louis",
      address: "123 Test Street",
      phone: "+230 123 4567",
      email: "test@hotel.mu",
      website: "https://test-hotel.mu",
      nb_chambres: 50,
      secteur: "Tourisme",
      zone_geographique: "Nord",
      contact_principal: "Jean Dupont",
      notes: "Test d'importation",
    }

    try {
      await SupabaseClientDB.createOrganization(testOrg)
      setTestResult("✅ Test d'importation réussi dans Supabase")
      checkConnection()
    } catch (error) {
      setTestResult(`❌ Erreur d'importation: ${(error as Error).message}`)
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Diagnostic Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">État de la connexion:</h4>
            <p className="text-sm text-gray-600">{connectionStatus}</p>
          </div>

          <div>
            <h4 className="font-medium">Variables d'environnement:</h4>
            <div className="text-sm text-gray-600">
              <p>NEXT_PUBLIC_SUPABASE_URL: {envVars.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurée" : "❌ Manquante"}</p>
              <p>
                NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
                {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurée" : "❌ Manquante"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium">Résultat du test:</h4>
            <p className="text-sm text-gray-600">{testResult}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={checkConnection} size="sm" variant="outline">
              Tester Connexion
            </Button>
            <Button onClick={testImport} size="sm" variant="outline">
              Tester Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDiagnostic, setShowDiagnostic] = useState(false)

  // Filtres corrigés
  const [filters, setFilters] = useState({
    type: "",
    ville: "",
    secteur: "",
    district: "",
    categorie: "",
    region: "",
    status: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const orgs = await SupabaseClientDB.getOrganizations()

      if (orgs.length === 0) {
        // Données de démo corrigées
        const demoOrgs = [
          {
            id: "demo-1",
            name: "Hotel Le Mauricien",
            industry: "Hôtellerie",
            category: "4 étoiles",
            region: "Ouest",
            district: "Port Louis",
            city: "Port Louis",
            address: "123 Royal Street",
            phone: "+230 123 4567",
            email: "contact@lemauricien.mu",
            website: "https://lemauricien.mu",
            nb_chambres: 120,
            secteur: "Tourisme",
            zone_geographique: "Nord",
            contact_principal: "Jean Dupont",
            notes: "Hôtel de luxe au centre-ville",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "demo-2",
            name: "Resort Tropical Paradise",
            industry: "Hôtellerie",
            category: "5 étoiles",
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
            notes: "Resort de luxe en bord de mer",
            status: "prospect",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        localStorage.setItem("demo_organizations", JSON.stringify(demoOrgs))
        setOrganizations(demoOrgs)
        return
      }

      setOrganizations(orgs)
    } catch (error) {
      console.error("Error loading data:", error)
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (orgData: Omit<Organization, "id" | "created_at" | "updated_at">) => {
    try {
      await SupabaseClientDB.createOrganization(orgData)
      await loadData()
      setShowCreateModal(false)
      console.log("[v0] Organisation créée avec succès")
    } catch (error) {
      console.error("Erreur lors de la création de l'organisation:", error)
      alert("Erreur lors de la création de l'organisation")
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

  const handleQualifyOrganization = async (org: Organization, newStatus: string) => {
    await handleUpdateOrganization(org, { status: newStatus })
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      ville: "",
      secteur: "",
      district: "",
      categorie: "",
      region: "",
      status: "",
    })
  }

  // ✅ CORRECTION PRINCIPALE : Filtrage corrigé pour utiliser zone_geographique
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
      // ✅ CORRECTION : Utilisation de zone_geographique au lieu de region
      (!filters.region || org.zone_geographique?.toLowerCase() === filters.region.toLowerCase()) &&
      (!filters.status || org.status?.toLowerCase() === filters.status.toLowerCase())

    return matchesSearch && matchesFilters
  })

  const getUniqueValues = (field: keyof Organization) => {
    return [...new Set(organizations.map((org) => org[field]).filter(Boolean))] as string[]
  }

  // Fonction d'import corrigée
  const handleImportOrganizations = async (data: any[]): Promise<ImportResult> => {
    try {
      let imported = 0
      const errors: string[] = []

      for (const row of data) {
        try {
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
            status: row.status || row.statut || "prospect",
            contact_principal: row.contact_name || row.contact_nom || row.contact_principal || "",
          }

          if (org.name) {
            await SupabaseClientDB.createOrganization(org)
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
      case "client":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const clearCache = () => {
    if (
      confirm("Êtes-vous sûr de vouloir vider tous les caches ? Cette action supprimera toutes les données locales.")
    ) {
      localStorage.clear()
      setOrganizations([])
      alert("Cache vidé avec succès ! Vous pouvez maintenant faire une importation propre.")
    }
  }

  const migrateLocalStorageToSupabase = async () => {
    try {
      const localData = localStorage.getItem("demo_organizations")
      if (!localData) {
        alert("Aucune donnée locale trouvée à migrer")
        return
      }

      const localOrgs = JSON.parse(localData)
      if (!Array.isArray(localOrgs) || localOrgs.length === 0) {
        alert("Aucune organisation locale trouvée")
        return
      }

      console.log(`[v0] Migrating ${localOrgs.length} organizations from localStorage to Supabase`)

      let migrated = 0
      const errors: string[] = []

      for (const org of localOrgs) {
        try {
          // Remove demo ID and let Supabase generate a real UUID
          const { id, ...orgData } = org
          await SupabaseClientDB.createOrganization(orgData)
          migrated++
        } catch (error) {
          console.error(`[v0] Migration error for ${org.name}:`, error)
          errors.push(`${org.name}: ${(error as Error).message}`)
        }
      }

      if (migrated > 0) {
        // Clear localStorage after successful migration
        localStorage.removeItem("demo_organizations")
        await loadData()
        alert(
          `Migration réussie ! ${migrated} organisations migrées vers Supabase.${errors.length > 0 ? ` ${errors.length} erreurs.` : ""}`,
        )
      } else {
        alert(`Migration échouée. Erreurs: ${errors.join(", ")}`)
      }
    } catch (error) {
      console.error("[v0] Migration failed:", error)
      alert(`Erreur de migration: ${(error as Error).message}`)
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
          <h2 className="text-3xl font-bold text-blue-600">Organizations</h2>
          <p className="text-muted-foreground">
            Gérez vos établissements mauriciens avec RDV, notes et contrats intégrés
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowDiagnostic(!showDiagnostic)} variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Diagnostic
          </Button>
          <Button onClick={migrateLocalStorageToSupabase} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Migrer vers Supabase
          </Button>
          <Button onClick={clearCache} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Vider Cache
          </Button>
          <Button onClick={() => setShowImportModal(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Organisation
          </Button>
        </div>
      </div>

      {showDiagnostic && <SupabaseDiagnostic />}

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

            {/* ✅ CORRECTION : Le filtre région fonctionne maintenant avec zone_geographique */}
            <Select
              value={filters.region}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="Nord">Nord</SelectItem>
                <SelectItem value="Sud">Sud</SelectItem>
                <SelectItem value="Est">Est</SelectItem>
                <SelectItem value="Ouest">Ouest</SelectItem>
                <SelectItem value="Centre">Centre</SelectItem>
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
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredOrganizations.map((org) => {
          return (
            <Card
              key={org.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleManageOrganization(org)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-balance">{org.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">
                        {org.activityType || org.industry || "No industry"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(org.status || "")} variant="secondary">
                      {org.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {org.category && (
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Catégorie</span>
                      <span className="text-sm font-semibold">{org.category}</span>
                    </div>
                  )}

                  {org.contact_principal && (
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-900 truncate">{org.contact_principal}</p>
                      </div>
                    </div>
                  )}

                  {org.phone && (
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-900">{org.phone}</span>
                    </div>
                  )}

                  {org.email && (
                    <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                      <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-purple-900 truncate">{org.email}</span>
                    </div>
                  )}

                  {(org.city || org.region || org.district || org.zone_geographique) && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          {org.city && (
                            <p className="text-sm font-semibold text-orange-900">{org.city}</p>
                          )}
                          {org.address && <p className="text-xs text-orange-700">{org.address}</p>}
                          <div className="flex flex-wrap gap-1">
                            {org.region && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                              >
                                {org.region}
                              </Badge>
                            )}
                            {org.district && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                              >
                                {org.district}
                              </Badge>
                            )}
                            {org.zone_geographique && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                              >
                                {org.zone_geographique}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {org.secteur && (
                    <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-indigo-600">Secteur</span>
                      <span className="text-sm font-semibold text-indigo-900">{org.secteur}</span>
                    </div>
                  )}

                  {org.website && (
                    <div className="flex items-center space-x-3 p-2 bg-cyan-50 rounded-lg">
                      <Globe className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-cyan-900 hover:text-cyan-700 transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {org.website}
                      </a>
                    </div>
                  )}

                  {org.nb_chambres !== undefined && (
                    <div className="flex items-center justify-between p-2 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-teal-600">Chambres</span>
                      <span className="text-sm font-bold text-teal-900">{org.nb_chambres}</span>
                    </div>
                  )}

                  {org.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                      <p className="text-sm text-gray-800 line-clamp-3">{org.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">Qualification rapide</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <Select
                      value={org.status || ""}
                      onValueChange={(value) => {
                        handleQualifyOrganization(org, value)
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    size="default"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleManageOrganization(org)
                    }}
                    className="w-full bg-primary hover:bg-primary/90 h-10"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Voir Détails Complets
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleManageOrganization(org)
                      }}
                      className="h-9"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteOrganization(org)
                      }}
                      className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Aucune organisation trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || Object.values(filters).some(Boolean)
              ? "Essayez d'ajuster vos termes de recherche ou filtres"
              : "Commencez par ajouter votre première organisation"}
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowCreateModal(true)}
          >
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

      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrganization}
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
