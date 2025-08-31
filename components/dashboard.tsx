"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar,
  FileText,
  Map,
  Navigation,
  BarChart3,
  CalendarClock,
  FileCheck,
  Send,
  DollarSign,
  Trophy
} from "lucide-react"
import type { Organization } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  prospectOrganizations: number
  totalRooms: number
  completedAppointments: number
  upcomingAppointments: number
  signedContracts: number
  sentContracts: number
}

interface GeographicalGroup {
  zone: string
  count: number
  organizations: Organization[]
  percentage: number
  appointmentCount: number
  contractCount: number
}

interface DistrictGroup {
  district: string
  count: number
  organizations: Organization[]
  zone?: string
  appointmentCount: number
  contractCount: number
}

interface ZoneDetails {
  type: "geographical" | "district"
  name: string
  organizations: any[]
  stats: {
    organizationCount: number
    appointmentCount: number
    contractCount: number
  }
  cities?: string[]
}

export function Dashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    prospectOrganizations: 0,
    totalRooms: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    signedContracts: 0,
    sentContracts: 0,
  })
  const [geographicalGroups, setGeographicalGroups] = useState<GeographicalGroup[]>([])
  const [districtGroups, setDistrictGroups] = useState<DistrictGroup[]>([])
  const [selectedZone, setSelectedZone] = useState<ZoneDetails | null>(null)
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [allContracts, setAllContracts] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log("[Dashboard] Loading data...")
      const orgs = await SupabaseClientDB.getOrganizations()
      const appointments = await SupabaseClientDB.getAppointments()
      const contracts = await SupabaseClientDB.getContracts()
      
      console.log("[Dashboard] Data loaded:", { orgs: orgs.length, appointments: appointments.length, contracts: contracts.length })
      
      setOrganizations(orgs)
      setAllAppointments(appointments)
      setAllContracts(contracts)
      
      calculateStats(orgs, appointments, contracts)
      calculateGeographicalGroups(orgs, appointments, contracts)
      calculateDistrictGroups(orgs, appointments, contracts)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orgs: Organization[], appointments: any[], contracts: any[]) => {
    const totalOrganizations = orgs.length
    const activeOrganizations = orgs.filter(org => org.status?.toLowerCase() === 'active').length
    const prospectOrganizations = orgs.filter(org => org.status?.toLowerCase() === 'prospect').length
    const totalRooms = orgs.reduce((sum, org) => sum + (org.nb_chambres || 0), 0)

    // Calcul des appointments
    const completedAppointments = appointments.filter(
      (apt) => apt.status === "Completed" || apt.status === "completed"
    ).length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcomingAppointments = appointments.filter((apt) => {
      const isScheduled = apt.status === "Scheduled" || apt.status === "scheduled"
      const appointmentDate = new Date(apt.date || apt.appointment_date)
      return isScheduled && appointmentDate >= today
    }).length

    // Calcul des contrats
    const signedContracts = contracts.filter((contract) => contract.status === "signed").length
    const sentContracts = contracts.filter(
      (contract) => contract.status === "sent" || contract.status === "contrat_envoye"
    ).length

    setStats({
      totalOrganizations,
      activeOrganizations,
      prospectOrganizations,
      totalRooms,
      completedAppointments,
      upcomingAppointments,
      signedContracts,
      sentContracts,
    })
  }

  const calculateGeographicalGroups = (orgs: Organization[], appointments: any[], contracts: any[]) => {
    const zones = ['Nord', 'Sud', 'Est', 'Ouest', 'Centre']
    const groups: GeographicalGroup[] = []

    zones.forEach(zone => {
      const zoneOrgs = orgs.filter(org => org.region?.toLowerCase() === zone.toLowerCase())
      
      // Calculer les appointments et contrats pour cette zone
      const zoneAppointments = appointments.filter(apt => 
        zoneOrgs.some(org => org.id === apt.organizationId)
      )
      const zoneContracts = contracts.filter(contract => 
        zoneOrgs.some(org => org.id === contract.organizationId)
      )

      if (zoneOrgs.length > 0 || zone !== 'Centre') {
        groups.push({
          zone,
          count: zoneOrgs.length,
          organizations: zoneOrgs,
          percentage: orgs.length > 0 ? Math.round((zoneOrgs.length / orgs.length) * 100) : 0,
          appointmentCount: zoneAppointments.length,
          contractCount: zoneContracts.length
        })
      }
    })

    // Ajouter les organisations sans zone définie
    const orgsWithoutZone = orgs.filter(org => 
      !org.region || !zones.map(z => z.toLowerCase()).includes(org.region.toLowerCase())
    )
    
    if (orgsWithoutZone.length > 0) {
      const zoneAppointments = appointments.filter(apt => 
        orgsWithoutZone.some(org => org.id === apt.organizationId)
      )
      const zoneContracts = contracts.filter(contract => 
        orgsWithoutZone.some(org => org.id === contract.organizationId)
      )

      groups.push({
        zone: 'Non définie',
        count: orgsWithoutZone.length,
        organizations: orgsWithoutZone,
        percentage: orgs.length > 0 ? Math.round((orgsWithoutZone.length / orgs.length) * 100) : 0,
        appointmentCount: zoneAppointments.length,
        contractCount: zoneContracts.length
      })
    }

    groups.sort((a, b) => b.count - a.count)
    setGeographicalGroups(groups)
  }

  const calculateDistrictGroups = (orgs: Organization[], appointments: any[], contracts: any[]) => {
    const districtMap = new Map<string, DistrictGroup>()

    orgs.forEach(org => {
      const district = org.district?.trim() || 'Non défini'
      
      if (districtMap.has(district)) {
        const existing = districtMap.get(district)!
        existing.count += 1
        existing.organizations.push(org)
      } else {
        districtMap.set(district, {
          district,
          count: 1,
          organizations: [org],
          zone: org.region,
          appointmentCount: 0,
          contractCount: 0
        })
      }
    })

    // Calculer les appointments et contrats pour chaque district
    districtMap.forEach((group, district) => {
      const districtAppointments = appointments.filter(apt => 
        group.organizations.some(org => org.id === apt.organizationId)
      )
      const districtContracts = contracts.filter(contract => 
        group.organizations.some(org => org.id === contract.organizationId)
      )
      
      group.appointmentCount = districtAppointments.length
      group.contractCount = districtContracts.length
    })

    const groups = Array.from(districtMap.values())
    groups.sort((a, b) => b.count - a.count)
    setDistrictGroups(groups)
  }

  const handleZoneClick = (type: ZoneDetails["type"], name: string) => {
    let filteredOrganizations: any[] = []

    switch (type) {
      case "geographical":
        filteredOrganizations = organizations.filter(org => 
          org.region?.toLowerCase() === name.toLowerCase() ||
          (name === 'Non définie' && (!org.region || !['nord', 'sud', 'est', 'ouest', 'centre'].includes(org.region.toLowerCase())))
        )
        break
      case "district":
        filteredOrganizations = organizations.filter(org => 
          (org.district?.trim() || 'Non défini') === name
        )
        break
    }

    const zoneAppointments = allAppointments.filter(apt =>
      filteredOrganizations.some(org => org.id === apt.organizationId)
    )

    const zoneContracts = allContracts.filter(contract =>
      filteredOrganizations.some(org => org.id === contract.organizationId)
    )

    setSelectedZone({
      type,
      name,
      organizations: filteredOrganizations,
      stats: {
        organizationCount: filteredOrganizations.length,
        appointmentCount: zoneAppointments.length,
        contractCount: zoneContracts.length,
      }
    })
  }

  const getZoneIcon = (zone: string) => {
    switch (zone.toLowerCase()) {
      case 'nord': return '🧭'
      case 'sud': return '⬇️'
      case 'est': return '➡️'
      case 'ouest': return '⬅️'
      case 'centre': return '🎯'
      default: return '📍'
    }
  }

  const getZoneColor = (zone: string) => {
    switch (zone.toLowerCase()) {
      case 'nord': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sud': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'est': return 'bg-green-100 text-green-800 border-green-200'
      case 'ouest': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'centre': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800'
      case 'client':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement du dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Dashboard CRM Maurice</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble complète : organisations, rendez-vous, contrats et répartition géographique
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Organisations</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalOrganizations}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actives</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeOrganizations}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RDV Réalisés</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completedAppointments}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RDV Prévus</CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contrats Signés</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.signedContracts}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contrats Envoyés</CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.sentContracts}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.prospectOrganizations}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Chambres</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalRooms.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analyses avec onglets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analyses Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="zones" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zones">Zones Géographiques</TabsTrigger>
              <TabsTrigger value="districts">Districts</TabsTrigger>
            </TabsList>

            <TabsContent value="zones" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {geographicalGroups.map((group) => (
                  <div
                    key={group.zone}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleZoneClick("geographical", group.zone)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getZoneIcon(group.zone)}</span>
                          <h3 className="font-semibold text-lg">{group.zone}</h3>
                        </div>
                        <Badge className={getZoneColor(group.zone)} variant="secondary">
                          {group.count}
                        </Badge>
                      </div>
                      
                      <Progress value={group.percentage} className="w-full h-2" />
                      
                      <div className="text-sm text-muted-foreground">
                        {group.percentage}% ({group.count} organisations)
                      </div>

                      <div className="flex justify-around text-xs">
                        <div className="text-center">
                          <div className="font-bold text-green-600">{group.appointmentCount}</div>
                          <div className="text-muted-foreground">RDV</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{group.contractCount}</div>
                          <div className="text-muted-foreground">Contrats</div>
                        </div>
                      </div>
                      
                      {group.count > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600">Aperçu:</p>
                          {group.organizations.slice(0, 2).map((org) => (
                            <div key={org.id} className="text-xs text-gray-500 truncate">
                              • {org.name}
                            </div>
                          ))}
                          {group.organizations.length > 2 && (
                            <div className="text-xs text-gray-400">
                              ... et {group.organizations.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="districts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {districtGroups.slice(0, 16).map((group) => (
                  <div
                    key={group.district}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors border-l-4 border-l-cyan-500"
                    onClick={() => handleZoneClick("district", group.district)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate">{group.district}</h4>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {group.count}
                      </Badge>
                    </div>
                    
                    {group.zone && (
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{group.zone}</span>
                      </div>
                    )}

                    <div className="flex justify-around text-xs mb-2">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{group.appointmentCount}</div>
                        <div className="text-muted-foreground">RDV</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{group.contractCount}</div>
                        <div className="text-muted-foreground">Contrats</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {group.organizations.slice(0, 2).map((org) => (
                        <div key={org.id} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 truncate">{org.name}</span>
                          <Badge className={getStatusColor(org.status || "")} variant="secondary" size="sm">
                            {org.status}
                          </Badge>
                        </div>
                      ))}
                      {group.organizations.length > 2 && (
                        <div className="text-xs text-gray-400 mt-1">
                          +{group.organizations.length - 2} autres...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {districtGroups.length > 16 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Et {districtGroups.length - 16} autres districts...
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog pour les détails */}
      <Dialog open={!!selectedZone} onOpenChange={() => setSelectedZone(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Détails - {selectedZone?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedZone && (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedZone.stats.organizationCount}</div>
                  <div className="text-sm text-muted-foreground">Organisations</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedZone.stats.appointmentCount}</div>
                  <div className="text-sm text-muted-foreground">Rendez-vous</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedZone.stats.contractCount}</div>
                  <div className="text-sm text-muted-foreground">Contrats</div>
                </div>
              </div>

              {/* Organizations List */}
              <div>
                <h4 className="font-semibold mb-4">Organisations ({selectedZone.organizations.length}):</h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {selectedZone.organizations.map((org, index) => (
                    <div key={org.id || index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium">{org.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {org.district} - {org.region}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {org.nb_chambres && `${org.nb_chambres} chambres`}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <Badge className={getStatusColor(org.status || "")} variant="secondary">
                            {org.status}
                          </Badge>
                          {org.phone && <div className="text-muted-foreground mt-1">{org.phone}</div>}
                          {org.email && <div className="text-muted-foreground">{org.email}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
