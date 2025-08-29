"use client"

import { useState } from "react"
import { Search, Filter, Calendar, Users, Phone, Mail, MapPin, Eye,Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ACTIVITY_TYPES,
  PROSPECT_STATUS_LABELS,
  type Contact,
  type Organization,
  type SearchFilters,
} from "@/types/crm"

interface ProspectSearchProps {
  contacts: Contact[]
  organizations: Organization[]
  onContactSelect: (contact: Contact) => void
  onFiltersChange: (filters: SearchFilters) => void
}

export function ProspectSearch({ contacts, organizations, onContactSelect, onFiltersChange }: ProspectSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    activityType: "",
    prospectStatus: "",
    priority: "",
    hasAppointments: undefined,
    city: "",
    region: "",
  })
  const [showFilters, setShowFilters] = useState(true)

  const uniqueCities = [...new Set(organizations.map((org) => org.city).filter(Boolean))].sort()
  const uniqueRegions = [...new Set(organizations.map((org) => org.region).filter(Boolean))].sort()

  const filteredContacts = contacts.filter((contact) => {
    const org = organizations.find((o) => o.id === contact.organizationId)
    const matchesSearch =
      searchTerm === "" ||
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org?.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org?.region.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesActivityType =
      !filters.activityType || filters.activityType === "all" || org?.activityType === filters.activityType
    const matchesStatus =
      !filters.prospectStatus || filters.prospectStatus === "all" || contact.prospectStatus === filters.prospectStatus
    const matchesPriority = !filters.priority || filters.priority === "all" || contact.priority === filters.priority
    const matchesAppointments =
      filters.hasAppointments === undefined ||
      (filters.hasAppointments ? contact.appointmentHistory.length > 0 : contact.appointmentHistory.length === 0)
    const matchesCity = !filters.city || filters.city === "all" || org?.city === filters.city
    const matchesRegion = !filters.region || filters.region === "all" || org?.region === filters.region

    return (
      matchesSearch &&
      matchesActivityType &&
      matchesStatus &&
      matchesPriority &&
      matchesAppointments &&
      matchesCity &&
      matchesRegion
    )
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const filterValue = value === "all" ? "" : value
    const newFilters = { ...filters, [key]: filterValue }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800"
      case "cold":
        return "bg-blue-100 text-blue-800"
      case "not_contacted":
        return "bg-gray-100 text-gray-800"
      case "not_interested":
        return "bg-yellow-100 text-yellow-800"
      case "to_contact":
        return "bg-green-100 text-green-800"
      case "contract_obtained":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-primary">Recherche Avancée & Gestion des Prospects</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Utilisez les filtres ci-dessous pour trouver vos prospects, puis cliquez sur une fiche pour prendre des notes
          et planifier des rendez-vous.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, entreprise, type d'activité, ville ou région..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 h-12">
          <Filter className="h-4 w-4" />
          {showFilters ? "Masquer filtres" : "Afficher filtres"}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-2 border-primary/30 shadow-lg">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres de recherche géographique et par statut
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
            <Select
              onValueChange={(value) => handleFilterChange("activityType", value)}
              value={filters.activityType || "all"}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Type d'activité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleFilterChange("prospectStatus", value)}
              value={filters.prospectStatus || "all"}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Statut prospect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(PROSPECT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange("priority", value)} value={filters.priority || "all"}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange("city", value)} value={filters.city || "all"}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Ville" />
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

            <Select onValueChange={(value) => handleFilterChange("region", value)} value={filters.region || "all"}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Région" />
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

            <Select
              onValueChange={(value) => handleFilterChange("hasAppointments", value === "true")}
              value={filters.hasAppointments === undefined ? "all" : filters.hasAppointments ? "true" : "false"}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Rendez-vous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">Avec RDV</SelectItem>
                <SelectItem value="false">Sans RDV</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <div className="text-sm font-medium text-foreground">
            {filteredContacts.length} prospect{filteredContacts.length > 1 ? "s" : ""} trouvé
            {filteredContacts.length > 1 ? "s" : ""}
            {filteredContacts.length !== contacts.length && (
              <span className="text-primary ml-1">
                (sur {contacts.length} total{contacts.length > 1 ? "s" : ""})
              </span>
            )}
          </div>
          {Object.values(filters).some((value) => value !== "" && value !== undefined) && (
            <Badge variant="secondary" className="text-xs">
              {Object.values(filters).filter((value) => value !== "" && value !== undefined).length} filtre(s) actif(s)
            </Badge>
          )}
        </div>

        {filteredContacts.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun prospect trouvé</h3>
              <p className="text-sm">Essayez d'ajuster vos critères de recherche ou vos filtres</p>
            </div>
          </Card>
        )}

        {filteredContacts.map((contact) => {
          const org = organizations.find((o) => o.id === contact.organizationId)
          return (
            <Card
              key={contact.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30 hover:border-l-primary"
              onClick={() => onContactSelect(contact)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{contact.fullName}</h3>
                      <Badge className={getStatusColor(contact.prospectStatus)}>
                        {PROSPECT_STATUS_LABELS[contact.prospectStatus as keyof typeof PROSPECT_STATUS_LABELS]}
                      </Badge>
                      {contact.priority === "high" && <Badge variant="destructive">Priorité haute</Badge>}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {org?.name} - {org?.activityType}
                        </span>
                      </div>
                      {(org?.city || org?.region) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {org?.city}
                            {org?.city && org?.region && ", "}
                            {org?.region}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                      {contact.appointmentHistory.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {contact.appointmentHistory.length} RDV programmé
                            {contact.appointmentHistory.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      <Eye className="w-3 h-3 mr-1" />
                      Voir détails
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-primary">
                      <NotebookPen className="w-3 h-3 mr-1" />
                      Notes & RDV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
