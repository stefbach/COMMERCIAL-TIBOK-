"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar,
  FileText,
  Map,
  Navigation,
  BarChart3
} from "lucide-react"
import type { Organization } from "@/types/crm"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  prospectOrganizations: number
  totalRooms: number
}

interface GeographicalGroup {
  zone: string
  count: number
  organizations: Organization[]
  percentage: number
}

interface DistrictGroup {
  district: string
  count: number
  organizations: Organization[]
  zone?: string
}

export function Dashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    prospectOrganizations: 0,
    totalRooms: 0,
  })
  const [geographicalGroups, setGeographicalGroups] = useState<GeographicalGroup[]>([])
  const [districtGroups, setDistrictGroups] = useState<DistrictGroup[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log("[Dashboard] Loading data...")
      const orgs = await SupabaseClientDB.getOrganizations()
      console.log("[Dashboard] Organizations loaded:", orgs.length)
      
      setOrganizations(orgs)
      calculateStats(orgs)
      calculateGeographicalGroups(orgs)
      calculateDistrictGroups(orgs)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orgs: Organization[]) => {
    const totalOrganizations = orgs.length
    const activeOrganizations = orgs.filter(org => org.status?.toLowerCase() === 'active').length
    const prospectOrganizations = orgs.filter(org => org.status?.toLowerCase() === 'prospect').length
    const totalRooms = orgs.reduce((sum, org) => sum + (org.nb_chambres || 0), 0)

    setStats({
      totalOrganizations,
      activeOrganizations,
      prospectOrganizations,
      totalRooms,
    })
  }

  const calculateGeographicalGroups = (orgs: Organization[]) => {
    const zones = ['Nord', 'Sud', 'Est', 'Ouest', 'Centre']
    const groups: GeographicalGroup[] = []

    zones.forEach(zone => {
      const zoneOrgs = orgs.filter(org => org.region?.toLowerCase() === zone.toLowerCase())
      if (zoneOrgs.length > 0 || zone !== 'Centre') { // Toujours afficher les 4 zones principales
        groups.push({
          zone,
          count: zoneOrgs.length,
          organizations: zoneOrgs,
          percentage: orgs.length > 0 ? Math.round((zoneOrgs.length / orgs.length) * 100) : 0
        })
      }
    })

    // Ajouter les organisations sans zone définie
    const orgsWithoutZone = orgs.filter(org => 
      !org.region || !zones.map(z => z.toLowerCase()).includes(org.region.toLowerCase())
    )
    
    if (orgsWithoutZone.length > 0) {
      groups.push({
        zone: 'Non définie',
        count: orgsWithoutZone.length,
        organizations: orgsWithoutZone,
        percentage: orgs.length > 0 ? Math.round((orgsWithoutZone.length / orgs.length) * 100) : 0
      })
    }

    // Trier par nombre d'organisations (décroissant)
    groups.sort((a, b) => b.count - a.count)
    setGeographicalGroups(groups)
  }

  const calculateDistrictGroups = (orgs: Organization[]) => {
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
          zone: org.region
        })
      }
    })

    const groups = Array.from(districtMap.values())
    // Trier par nombre d'organisations (décroissant)
    groups.sort((a, b) => b.count - a.count)
    setDistrictGroups(groups)
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
        <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Organisations Maurice</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos organisations par zones géographiques et districts
        </p>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Organisations
            </CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalOrganizations}</div>
            <p className="text-xs text-gray-500 mt-1">
              Toutes les organisations enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Organisations Actives
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeOrganizations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalOrganizations > 0 ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Prospects
            </CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.prospectOrganizations}</div>
            <p className="text-xs text-gray-500 mt-1">
              Opportunités à développer
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Chambres
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalRooms.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Capacité d'hébergement totale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regroupement par zones géographiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              Répartition par Zones Géographiques
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution des organisations à travers les régions de Maurice
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geographicalGroups.map((group) => (
                <div key={group.zone} className="space-y-3">
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regroupement par districts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Répartition par Districts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Organisations regroupées par district administratif
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {districtGroups.slice(0, 12).map((group) => (
              <Card key={group.district} className="border-l-4 border-l-cyan-500">
                <CardContent className="p-4">
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
                  
                  <div className="space-y-1">
                    {group.organizations.slice(0, 3).map((org) => (
                      <div key={org.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 truncate">{org.name}</span>
                        <Badge className={getStatusColor(org.status || "")} variant="secondary" size="sm">
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                    {group.organizations.length > 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{group.organizations.length - 3} autres...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {districtGroups.length > 12 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Et {districtGroups.length - 12} autres districts...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-5 w-5" />
              Zone la plus active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geographicalGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getZoneIcon(geographicalGroups[0].zone)}</span>
                  <span className="font-bold text-blue-900">{geographicalGroups[0].zone}</span>
                </div>
                <p className="text-sm text-blue-700">
                  {geographicalGroups[0].count} organisations ({geographicalGroups[0].percentage}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MapPin className="h-5 w-5" />
              District principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {districtGroups.length > 0 && (
              <div>
                <p className="font-bold text-green-900">{districtGroups[0].district}</p>
                <p className="text-sm text-green-700">
                  {districtGroups[0].count} organisations
                </p>
                {districtGroups[0].zone && (
                  <p className="text-xs text-green-600 mt-1">Zone: {districtGroups[0].zone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <FileText className="h-5 w-5" />
              Couverture territoriale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="font-bold text-purple-900">{districtGroups.length}</p>
              <p className="text-sm text-purple-700">districts couverts</p>
              <p className="text-xs text-purple-600 mt-1">
                sur {geographicalGroups.filter(g => g.zone !== 'Non définie').length} zones géographiques
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
