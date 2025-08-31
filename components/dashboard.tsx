"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, DollarSign, Users, Trophy, Calendar, FileCheck, Send, CalendarClock, BarChart3, MapPin } from 'lucide-react'
import { SupabaseClientDB } from "@/lib/supabase-db"

interface DashboardStats {
  totalOrganizations: number
  completedAppointments: number
  signedContracts: number
  sentContracts: number
  upcomingAppointments: number
}

interface SectorStats {
  sector: string
  organizationCount: number
  appointmentCount: number
  contractCount: number
}

interface GeographicalStats {
  location: string
  organizationCount: number
  appointmentCount: number
  contractCount: number
}

interface CardinalZoneStats {
  zone: string
  organizationCount: number
  appointmentCount: number
  contractCount: number
  cities: string[]
}

interface ZoneDetails {
  type: "sector" | "geographical" | "cardinal"
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
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    completedAppointments: 0,
    signedContracts: 0,
    sentContracts: 0,
    upcomingAppointments: 0,
  })
  const [sectorStats, setSectorStats] = useState<SectorStats[]>([])
  const [geographicalStats, setGeographicalStats] = useState<GeographicalStats[]>([])
  const [cardinalZoneStats, setCardinalZoneStats] = useState<CardinalZoneStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<ZoneDetails | null>(null)
  const [allOrganizations, setAllOrganizations] = useState<any[]>([])
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [allContracts, setAllContracts] = useState<any[]>([])

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const organizations = await SupabaseClientDB.getOrganizations()
      const appointments = await SupabaseClientDB.getAppointments()
      const contracts = await SupabaseClientDB.getContracts()

      const completedAppointments = appointments.filter(
        (apt) => apt.status === "Completed" || apt.status === "completed",
      ).length

      const signedContracts = contracts.filter((contract) => contract.status === "signed").length

      const sentContracts = contracts.filter(
        (contract) => contract.status === "sent" || contract.status === "contrat_envoye",
      ).length

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingAppointments = appointments.filter((apt) => {
        const isScheduled = apt.status === "Scheduled" || apt.status === "scheduled"
        const appointmentDate = new Date(apt.date || apt.appointment_date)
        return isScheduled && appointmentDate >= today
      }).length

      setStats({
        totalOrganizations: organizations.length,
        completedAppointments,
        signedContracts,
        sentContracts,
        upcomingAppointments,
      })

      // Statistiques par secteur
      const sectorMap = new Map<string, SectorStats>()

      organizations.forEach((org) => {
        const sector = org.secteur || org.industry || "Non spécifié"
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, {
            sector,
            organizationCount: 0,
            appointmentCount: 0,
            contractCount: 0,
          })
        }
        sectorMap.get(sector)!.organizationCount++
      })

      appointments.forEach((apt) => {
        const org = organizations.find((o) => o.id === apt.organizationId)
        if (org) {
          const sector = org.secteur || org.industry || "Non spécifié"
          if (sectorMap.has(sector)) {
            sectorMap.get(sector)!.appointmentCount++
          }
        }
      })

      contracts.forEach((contract) => {
        const org = organizations.find((o) => o.id === contract.organizationId)
        if (org) {
          const sector = org.secteur || org.industry || "Non spécifié"
          if (sectorMap.has(sector)) {
            sectorMap.get(sector)!.contractCount++
          }
        }
      })

      setSectorStats(Array.from(sectorMap.values()).sort((a, b) => b.organizationCount - a.organizationCount))

      // Statistiques géographiques
      const geographicalMap = new Map<string, GeographicalStats>()
      const cardinalZoneMap = new Map<string, CardinalZoneStats>()

      organizations.forEach((org) => {
        const country = org.country || org.pays || "Non spécifié"
        const city = org.city || org.ville || ""
        const location = city ? `${city}, ${country}` : country

        if (!geographicalMap.has(location)) {
          geographicalMap.set(location, {
            location,
            organizationCount: 0,
            appointmentCount: 0,
            contractCount: 0,
          })
        }
        geographicalMap.get(location)!.organizationCount++

        // Zones cardinales pour Maurice seulement
        if (country.toLowerCase() === "maurice" && city) {
          const cardinalZone = getCardinalZoneFromCity(city)
          if (!cardinalZoneMap.has(cardinalZone)) {
            cardinalZoneMap.set(cardinalZone, {
              zone: cardinalZone,
              organizationCount: 0,
              appointmentCount: 0,
              contractCount: 0,
              cities: [],
            })
          }
          const zoneStats = cardinalZoneMap.get(cardinalZone)!
          zoneStats.organizationCount++
          if (!zoneStats.cities.includes(city)) {
            zoneStats.cities.push(city)
          }
        }
      })

      appointments.forEach((apt) => {
        const org = organizations.find((o) => o.id === apt.organizationId)
        if (org) {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          const location = city ? `${city}, ${country}` : country

          if (geographicalMap.has(location)) {
            geographicalMap.get(location)!.appointmentCount++
          }

          if (country.toLowerCase() === "maurice" && city) {
            const cardinalZone = getCardinalZoneFromCity(city)
            if (cardinalZoneMap.has(cardinalZone)) {
              cardinalZoneMap.get(cardinalZone)!.appointmentCount++
            }
          }
        }
      })

      contracts.forEach((contract) => {
        const org = organizations.find((o) => o.id === contract.organizationId)
        if (org) {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          const location = city ? `${city}, ${country}` : country

          if (geographicalMap.has(location)) {
            geographicalMap.get(location)!.contractCount++
          }

          if (country.toLowerCase() === "maurice" && city) {
            const cardinalZone = getCardinalZoneFromCity(city)
            if (cardinalZoneMap.has(cardinalZone)) {
              cardinalZoneMap.get(cardinalZone)!.contractCount++
            }
          }
        }
      })

      setGeographicalStats(
        Array.from(geographicalMap.values()).sort((a, b) => b.organizationCount - a.organizationCount),
      )

      setCardinalZoneStats(
        Array.from(cardinalZoneMap.values()).sort((a, b) => b.organizationCount - a.organizationCount),
      )

      setAllOrganizations(organizations)
      setAllAppointments(appointments)
      setAllContracts(contracts)
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleZoneClick = (type: ZoneDetails["type"], name: string, cities?: string[]) => {
    let filteredOrganizations: any[] = []

    switch (type) {
      case "sector":
        filteredOrganizations = allOrganizations.filter(
          (org) => (org.secteur || org.industry || "Non spécifié") === name,
        )
        break
      case "geographical":
        filteredOrganizations = allOrganizations.filter((org) => {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          const location = city ? `${city}, ${country}` : country
          return location === name
        })
        break
      case "cardinal":
        filteredOrganizations = allOrganizations.filter((org) => {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          return country.toLowerCase() === "maurice" && city && getCardinalZoneFromCity(city) === name
        })
        break
    }

    const zoneAppointments = allAppointments.filter((apt) =>
      filteredOrganizations.some((org) => org.id === apt.organizationId),
    )

    const zoneContracts = allContracts.filter((contract) =>
      filteredOrganizations.some((org) => org.id === contract.organizationId),
    )

    setSelectedZone({
      type,
      name,
      organizations: filteredOrganizations,
      stats: {
        organizationCount: filteredOrganizations.length,
        appointmentCount: zoneAppointments.length,
        contractCount: zoneContracts.length,
      },
      cities,
    })
  }

  const getCardinalZoneFromCity = (city: string): string => {
    const cityLower = city.toLowerCase()

    if (
      [
        "grand baie",
        "grand-baie",
        "grande gaube",
        "grand gaube",
        "pereybere",
        "cap malheureux",
        "pointe aux piments",
        "pointe aux canonniers",
        "pte aux canonniers",
        "triolet",
        "mont choisy",
        "trou aux biches",
        "balaclava",
        "terre rouge",
        "arsenal",
        "goodlands",
      ].some((northCity) => cityLower.includes(northCity))
    ) {
      return "Nord"
    }

    if (
      [
        "le morne",
        "bel ombre",
        "chamarel",
        "case noyale",
        "rivière noire",
        "tamarin",
        "flic en flac",
        "flic-en-flac",
        "wolmar",
        "albion",
        "la gaulette",
        "baie du cap",
        "souillac",
        "riambel",
        "st felix",
        "saint felix",
      ].some((southCity) => cityLower.includes(southCity))
    ) {
      return "Sud"
    }

    if (
      [
        "belle mare",
        "belle-mare",
        "trou d'eau douce",
        "ile aux cerfs",
        "poste lafayette",
        "centre de flacq",
        "pointe de flacq",
        "quatre cocos",
        "bras d'eau",
        "palmar",
        "roches noires",
        "poste de flacq",
        "flacq",
      ].some((eastCity) => cityLower.includes(eastCity))
    ) {
      return "Est"
    }

    if (
      [
        "port louis",
        "beau bassin",
        "rose hill",
        "quatre bornes",
        "vacoas",
        "phoenix",
        "floreal",
        "curepipe",
        "forest side",
        "midlands",
        "moka",
        "mont fleuri",
      ].some((westCity) => cityLower.includes(westCity))
    ) {
      return "Ouest"
    }

    return "Centre"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité commerciale</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">RDV Réalisés</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completedAppointments}</div>
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
            <div className="text-2xl font-bold text-blue-600">{stats.sentContracts}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RDV Prévus</CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
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
          <Tabs defaultValue="sectors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sectors">Par Secteur</TabsTrigger>
              <TabsTrigger value="geography">Géographie Générale</TabsTrigger>
              <TabsTrigger value="maurice">Zones Maurice</TabsTrigger>
            </TabsList>

            <TabsContent value="sectors" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {sectorStats.slice(0, 12).map((sector) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleZoneClick("sector", sector.sector)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">{sector.sector}</div>
                      <div className="text-xs text-muted-foreground">
                        {sector.organizationCount} structure{sector.organizationCount > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{sector.appointmentCount}</div>
                        <div className="text-xs text-muted-foreground">RDV</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{sector.contractCount}</div>
                        <div className="text-xs text-muted-foreground">Contrats</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="geography" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {geographicalStats.slice(0, 10).map((location) => (
                  <div
                    key={location.location}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleZoneClick("geographical", location.location)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{location.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.organizationCount} structure{location.organizationCount > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{location.appointmentCount}</div>
                        <div className="text-xs text-muted-foreground">RDV</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{location.contractCount}</div>
                        <div className="text-xs text-muted-foreground">Contrats</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="maurice" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cardinalZoneStats.map((zone) => (
                  <div
                    key={zone.zone}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleZoneClick("cardinal", zone.zone, zone.cities)}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary mb-2">{zone.zone}</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xl font-bold text-blue-600">{zone.organizationCount}</div>
                          <div className="text-xs text-muted-foreground">Structures</div>
                        </div>
                        <div className="flex justify-around text-xs">
                          <div>
                            <div className="font-bold text-green-600">{zone.appointmentCount}</div>
                            <div className="text-muted-foreground">RDV</div>
                          </div>
                          <div>
                            <div className="font-bold text-purple-600">{zone.contractCount}</div>
                            <div className="text-muted-foreground">Contrats</div>
                          </div>
                        </div>
                      </div>
                      {zone.cities.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                          {zone.cities.length} ville{zone.cities.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="text-sm text-muted-foreground">Structures</div>
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

              {/* Cities if available */}
              {selectedZone.cities && selectedZone.cities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Villes incluses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.cities.map((city, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations List */}
              <div>
                <h4 className="font-semibold mb-4">Structures ({selectedZone.organizations.length}):</h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {selectedZone.organizations.map((org, index) => (
                    <div key={org.id || index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium">{org.name || org.nom}</h5>
                          <p className="text-sm text-muted-foreground">
                            {org.secteur || org.industry || "Non spécifié"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {org.city || org.ville}, {org.country || org.pays}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          {org.phone && <div className="text-muted-foreground">{org.phone}</div>}
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
