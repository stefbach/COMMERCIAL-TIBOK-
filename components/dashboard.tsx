"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, Calendar, FileCheck, CalendarClock, BarChart3, MapPin, Send } from "lucide-react"
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

interface HotelGeographicalStats {
  region: string
  hotelCount: number
  appointmentCount: number
  contractCount: number
  cities: string[]
}

interface CardinalZoneStats {
  zone: string
  organizationCount: number
  appointmentCount: number
  contractCount: number
  cities: string[]
}

interface ZoneDetails {
  type: "sector" | "geographical" | "hotel" | "cardinal"
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
  const [hotelGeographicalStats, setHotelGeographicalStats] = useState<HotelGeographicalStats[]>([])
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

      console.log("[v0] Processing", organizations.length, "organizations")

      const allSectors = new Set()
      organizations.forEach((org) => {
        const sector = org.secteur || org.industry || "Non spécifié"
        allSectors.add(sector)
      })
      console.log("[v0] All sectors found:", Array.from(allSectors))

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

      const geographicalMap = new Map<string, GeographicalStats>()
      const hotelGeographicalMap = new Map<string, HotelGeographicalStats>()
      const cardinalZoneMap = new Map<string, CardinalZoneStats>()

      let hotelCount = 0

      organizations.forEach((org) => {
        const country = org.country || org.pays || "Non spécifié"
        const city = org.city || org.ville || ""
        const region = getRegionFromCountry(country)
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

        const sector = (org.secteur || org.industry || "").toLowerCase()
        const name = (org.name || org.nom || "").toLowerCase()

        const isHotel =
          sector.includes("hôtel") ||
          sector.includes("hotel") ||
          sector.includes("hospitalité") ||
          sector.includes("hospitality") ||
          sector.includes("hébergement") ||
          sector.includes("accommodation") ||
          sector.includes("resort") ||
          sector.includes("auberge") ||
          sector.includes("inn") ||
          sector.includes("lodge") ||
          sector.includes("motel") ||
          sector.includes("guesthouse") ||
          sector.includes("pension") ||
          sector.includes("riad") ||
          sector.includes("palace") ||
          sector.includes("château") ||
          sector.includes("castle") ||
          sector.includes("spa") ||
          sector.includes("wellness") ||
          sector.includes("tourisme") ||
          sector.includes("tourism") ||
          name.includes("hotel") ||
          name.includes("hôtel") ||
          name.includes("resort") ||
          name.includes("inn") ||
          name.includes("lodge") ||
          name.includes("palace") ||
          name.includes("riad")

        if (isHotel) {
          hotelCount++
          if (!hotelGeographicalMap.has(region)) {
            hotelGeographicalMap.set(region, {
              region,
              hotelCount: 0,
              appointmentCount: 0,
              contractCount: 0,
              cities: [],
            })
          }
          const hotelStats = hotelGeographicalMap.get(region)!
          hotelStats.hotelCount++
          if (city && !hotelStats.cities.includes(city)) {
            hotelStats.cities.push(city)
          }
        }
      })

      console.log("[v0] Total hotels detected:", hotelCount)
      console.log("[v0] Hotels by region:", Array.from(hotelGeographicalMap.entries()))
      console.log("[v0] Geographical locations:", Array.from(geographicalMap.entries()).length)

      appointments.forEach((apt) => {
        const org = organizations.find((o) => o.id === apt.organizationId)
        if (org) {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          const region = getRegionFromCountry(country)
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

          const sector = (org.secteur || org.industry || "").toLowerCase()
          const name = (org.name || org.nom || "").toLowerCase()

          const isHotel =
            sector.includes("hôtel") ||
            sector.includes("hotel") ||
            sector.includes("hospitalité") ||
            sector.includes("hospitality") ||
            sector.includes("hébergement") ||
            sector.includes("accommodation") ||
            sector.includes("resort") ||
            sector.includes("auberge") ||
            sector.includes("inn") ||
            sector.includes("lodge") ||
            sector.includes("motel") ||
            sector.includes("guesthouse") ||
            sector.includes("pension") ||
            sector.includes("riad") ||
            sector.includes("palace") ||
            sector.includes("château") ||
            sector.includes("castle") ||
            sector.includes("spa") ||
            sector.includes("wellness") ||
            sector.includes("tourisme") ||
            sector.includes("tourism") ||
            name.includes("hotel") ||
            name.includes("hôtel") ||
            name.includes("resort") ||
            name.includes("inn") ||
            name.includes("lodge") ||
            name.includes("palace") ||
            name.includes("riad")

          if (isHotel && hotelGeographicalMap.has(region)) {
            hotelGeographicalMap.get(region)!.appointmentCount++
          }
        }
      })

      contracts.forEach((contract) => {
        const org = organizations.find((o) => o.id === contract.organizationId)
        if (org) {
          const country = org.country || org.pays || "Non spécifié"
          const city = org.city || org.ville || ""
          const region = getRegionFromCountry(country)
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

          const sector = (org.secteur || org.industry || "").toLowerCase()
          const name = (org.name || org.nom || "").toLowerCase()

          const isHotel =
            sector.includes("hôtel") ||
            sector.includes("hotel") ||
            sector.includes("hospitalité") ||
            sector.includes("hospitality") ||
            sector.includes("hébergement") ||
            sector.includes("accommodation") ||
            sector.includes("resort") ||
            sector.includes("auberge") ||
            sector.includes("inn") ||
            sector.includes("lodge") ||
            sector.includes("motel") ||
            sector.includes("guesthouse") ||
            sector.includes("pension") ||
            sector.includes("riad") ||
            sector.includes("palace") ||
            sector.includes("château") ||
            sector.includes("castle") ||
            sector.includes("spa") ||
            sector.includes("wellness") ||
            sector.includes("tourisme") ||
            sector.includes("tourism") ||
            name.includes("hotel") ||
            name.includes("hôtel") ||
            name.includes("resort") ||
            name.includes("inn") ||
            name.includes("lodge") ||
            name.includes("palace") ||
            name.includes("riad")

          if (isHotel && hotelGeographicalMap.has(region)) {
            hotelGeographicalMap.get(region)!.contractCount++
          }
        }
      })

      setGeographicalStats(
        Array.from(geographicalMap.values()).sort((a, b) => b.organizationCount - a.organizationCount),
      )

      setHotelGeographicalStats(Array.from(hotelGeographicalMap.values()).sort((a, b) => b.hotelCount - a.hotelCount))

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
      case "hotel":
        filteredOrganizations = allOrganizations.filter((org) => {
          const country = org.country || org.pays || "Non spécifié"
          const region = getRegionFromCountry(country)
          const sector = (org.secteur || org.industry || "").toLowerCase()
          const orgName = (org.name || org.nom || "").toLowerCase()

          const isHotel =
            sector.includes("hôtel") ||
            sector.includes("hotel") ||
            sector.includes("hospitalité") ||
            sector.includes("hospitality") ||
            sector.includes("hébergement") ||
            sector.includes("accommodation") ||
            sector.includes("resort") ||
            sector.includes("auberge") ||
            sector.includes("inn") ||
            sector.includes("lodge") ||
            sector.includes("motel") ||
            sector.includes("guesthouse") ||
            sector.includes("pension") ||
            sector.includes("riad") ||
            sector.includes("palace") ||
            sector.includes("château") ||
            sector.includes("castle") ||
            sector.includes("spa") ||
            sector.includes("wellness") ||
            sector.includes("tourisme") ||
            sector.includes("tourism") ||
            orgName.includes("hotel") ||
            orgName.includes("hôtel") ||
            orgName.includes("resort") ||
            orgName.includes("inn") ||
            orgName.includes("lodge") ||
            orgName.includes("palace") ||
            orgName.includes("riad")

          return isHotel && region === name
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

  const getRegionFromCountry = (country: string): string => {
    const countryLower = country.toLowerCase()

    if (
      [
        "france",
        "allemagne",
        "germany",
        "italie",
        "italy",
        "espagne",
        "spain",
        "portugal",
        "belgique",
        "belgium",
        "pays-bas",
        "netherlands",
        "suisse",
        "switzerland",
        "autriche",
        "austria",
        "royaume-uni",
        "uk",
        "united kingdom",
      ].includes(countryLower)
    ) {
      return "Europe"
    }

    if (["maroc", "morocco", "tunisie", "tunisia", "algérie", "algeria", "égypte", "egypt"].includes(countryLower)) {
      return "Afrique du Nord"
    }

    if (
      [
        "sénégal",
        "senegal",
        "côte d'ivoire",
        "ivory coast",
        "ghana",
        "nigeria",
        "mali",
        "burkina faso",
        "guinée",
        "guinea",
      ].includes(countryLower)
    ) {
      return "Afrique de l'Ouest"
    }

    if (
      [
        "cameroun",
        "cameroon",
        "gabon",
        "congo",
        "république centrafricaine",
        "central african republic",
        "tchad",
        "chad",
      ].includes(countryLower)
    ) {
      return "Afrique Centrale"
    }

    if (
      ["kenya", "tanzanie", "tanzania", "ouganda", "uganda", "éthiopie", "ethiopia", "rwanda", "burundi"].includes(
        countryLower,
      )
    ) {
      return "Afrique de l'Est"
    }

    if (["états-unis", "usa", "united states", "canada", "mexique", "mexico"].includes(countryLower)) {
      return "Amérique du Nord"
    }

    if (
      [
        "chine",
        "china",
        "japon",
        "japan",
        "corée du sud",
        "south korea",
        "inde",
        "india",
        "thaïlande",
        "thailand",
        "vietnam",
        "singapour",
        "singapore",
      ].includes(countryLower)
    ) {
      return "Asie"
    }

    if (
      [
        "émirats arabes unis",
        "uae",
        "arabie saoudite",
        "saudi arabia",
        "qatar",
        "koweït",
        "kuwait",
        "liban",
        "lebanon",
        "jordanie",
        "jordan",
      ].includes(countryLower)
    ) {
      return "Moyen-Orient"
    }

    return country || "Non spécifié"
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité commerciale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Répartition par Secteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorStats.slice(0, 6).map((sector, index) => (
                <div
                  key={sector.sector}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleZoneClick("sector", sector.sector)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{sector.sector}</div>
                    <div className="text-sm text-muted-foreground">
                      {sector.organizationCount} structure{sector.organizationCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
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
              {sectorStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Aucune donnée de secteur disponible</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Hôtels par Région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotelGeographicalStats.slice(0, 8).map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleZoneClick("hotel", region.region, region.cities)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{region.region}</div>
                    <div className="text-sm text-muted-foreground">
                      {region.hotelCount} hôtel{region.hotelCount > 1 ? "s" : ""} • {region.cities.length} ville
                      {region.cities.length > 1 ? "s" : ""}
                    </div>
                    {region.cities.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {region.cities.slice(0, 3).join(", ")}
                        {region.cities.length > 3 && ` +${region.cities.length - 3}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{region.appointmentCount}</div>
                      <div className="text-xs text-muted-foreground">RDV</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{region.contractCount}</div>
                      <div className="text-xs text-muted-foreground">Contrats</div>
                    </div>
                  </div>
                </div>
              ))}
              {hotelGeographicalStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Aucun hôtel trouvé</div>
              )}
              {hotelGeographicalStats.length > 0 && (
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                  Total: {hotelGeographicalStats.reduce((sum, region) => sum + region.hotelCount, 0)} hôtels détectés
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Zones Cardinales (Maurice)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cardinalZoneStats.map((zone, index) => (
                <div
                  key={zone.zone}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleZoneClick("cardinal", zone.zone, zone.cities)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{zone.zone}</div>
                    <div className="text-sm text-muted-foreground">
                      {zone.organizationCount} structure{zone.organizationCount > 1 ? "s" : ""} • {zone.cities.length}{" "}
                      ville{zone.cities.length > 1 ? "s" : ""}
                    </div>
                    {zone.cities.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {zone.cities.slice(0, 3).join(", ")}
                        {zone.cities.length > 3 && ` +${zone.cities.length - 3}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{zone.appointmentCount}</div>
                      <div className="text-xs text-muted-foreground">RDV</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{zone.contractCount}</div>
                      <div className="text-xs text-muted-foreground">Contrats</div>
                    </div>
                  </div>
                </div>
              ))}
              {cardinalZoneStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Aucune donnée de zone cardinale disponible</div>
              )}
              {cardinalZoneStats.length > 0 && (
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                  Total: {cardinalZoneStats.reduce((sum, zone) => sum + zone.organizationCount, 0)} structures dans{" "}
                  {cardinalZoneStats.length} zones
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Répartition Géographique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicalStats.map((location, index) => (
                <div
                  key={location.location}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
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
                      <div className="text-2xl font-bold text-green-600">{location.appointmentCount}</div>
                      <div className="text-sm text-muted-foreground">RDV</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{location.contractCount}</div>
                      <div className="text-sm text-muted-foreground">Contrats</div>
                    </div>
                  </div>
                </div>
              ))}
              {geographicalStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Aucune donnée géographique disponible</div>
              )}
              {geographicalStats.length > 0 && (
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                  Total: {geographicalStats.reduce((sum, location) => sum + location.organizationCount, 0)} structures
                  dans {geographicalStats.length} localisations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedZone.stats.contractCount}</div>
                  <div className="text-sm text-muted-foreground">Contrats Envoyés</div>
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
