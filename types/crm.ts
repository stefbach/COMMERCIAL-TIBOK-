// Interface Organization - SEULEMENT les champs qui existent dans votre table Supabase
export interface Organization {
  id: string // UUID Supabase
  name: string // Obligatoire
  industry?: string // Type d'établissement
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  status?: string // "active" | "inactive" | "prospect" | "client"
  notes?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  category?: string // Catégorie (étoiles)
  district?: string
  contact_principal?: string
  region?: string
  zone_geographique?: string
  secteur?: string
  nb_chambres?: number

  // Champs temporaires pour compatibilité affichage (non stockés en DB)
  activityType?: string
}

export interface Deal {
  id: string
  organizationId?: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string | Date
  expected_close_date?: string | Date
  source?: string
  owner?: string
  assigned_to?: string
  assignedTo?: string
  createdDate?: Date | string
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface Activity {
  id: string
  organizationId?: string
  appointmentId?: string
  contractId?: string
  dealId?: string
  userId?: string
  type: "call" | "email" | "meeting" | "note" | "task" | "contract" | "deal"
  title: string
  description?: string
  date?: Date | string
  completed?: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface Appointment {
  id: string
  organization_id?: string
  title: string
  description?: string
  appointment_date?: string
  appointment_time?: string
  duration?: number
  location?: string
  type?: "Meeting" | "Call" | "Demo" | "Follow-up"
  status?: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled"
  reminder?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  role: "admin" | "manager" | "rep"
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// Interface Contract corrigée selon votre utilisation
export interface Contract {
  id: string
  organization_id?: string
  contact_id?: string | null
  title?: string
  description?: string
  value?: number
  currency?: string
  status: "envoye" | "signe" | "annule" // Statuts simplifiés utilisés dans votre code
  signed_date?: Date
  sent_date?: Date
  assigned_to?: string
  notes?: string
  documents?: Array<{
    name: string
    size: number
    type: string
    uploadDate?: Date
    data?: string
    url?: string
  }>
  // Champs temporaires pour compatibilité
  signedDate?: Date
  createdDate?: Date
  updatedDate?: Date
}

export interface DashboardStats {
  totalOrganizations: number
  totalAppointments?: number
  totalContracts?: number
  activeDeals: number
  pipelineValue: number
  winRate: number
  appointmentsThisWeek?: number
  contractsThisMonth?: number
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  duplicates: number
}

export interface SearchFilters {
  activityType?: string
  hasAppointments?: boolean
  city?: string
  region?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

// Constantes pour les types d'activités
export const ACTIVITY_TYPES = [
  "Hôtellerie",
  "Restauration",
  "Commerce",
  "Services",
  "Tourisme",
  "Immobilier",
  "Santé",
  "Éducation",
  "Finance",
  "Transport",
  "Agriculture",
  "Industrie",
  "Technologie",
  "Autre",
] as const

// Statuts de contrat utilisés dans votre application
export const CONTRACT_STATUS_LABELS = {
  "envoye": "Envoyé",
  "signe": "Signé",
  "annule": "Annulé"
} as const

// Statuts d'organisation
export const ORGANIZATION_STATUS_LABELS = {
  "prospect": "Prospect",
  "active": "Actif", 
  "inactive": "Inactif",
  "client": "Client"
} as const

// Types de rendez-vous
export const APPOINTMENT_TYPE_LABELS = {
  Meeting: "Réunion",
  Call: "Appel",
  Demo: "Démonstration",
  "Follow-up": "Suivi",
} as const

// Statuts de rendez-vous
export const APPOINTMENT_STATUS_LABELS = {
  Scheduled: "Planifié",
  Completed: "Terminé",
  Cancelled: "Annulé",
  Rescheduled: "Reporté",
} as const

// Régions de Maurice
export const MAURITIUS_REGIONS = [
  "Nord",
  "Sud", 
  "Est",
  "Ouest",
  "Centre"
] as const

// Catégories d'établissements
export const ESTABLISHMENT_CATEGORIES = [
  "1 étoile",
  "2 étoiles",
  "3 étoiles", 
  "4 étoiles",
  "5 étoiles"
] as const

// Type guards
export function isValidContractStatus(status: string): status is keyof typeof CONTRACT_STATUS_LABELS {
  return status in CONTRACT_STATUS_LABELS
}

export function isValidOrganizationStatus(status: string): status is keyof typeof ORGANIZATION_STATUS_LABELS {
  return status in ORGANIZATION_STATUS_LABELS
}

export function isValidAppointmentType(type: string): type is keyof typeof APPOINTMENT_TYPE_LABELS {
  return type in APPOINTMENT_TYPE_LABELS
}

export function isValidAppointmentStatus(status: string): status is keyof typeof APPOINTMENT_STATUS_LABELS {
  return status in APPOINTMENT_STATUS_LABELS
}

// Utility types
export type ContractStatus = keyof typeof CONTRACT_STATUS_LABELS
export type OrganizationStatus = keyof typeof ORGANIZATION_STATUS_LABELS
export type AppointmentType = keyof typeof APPOINTMENT_TYPE_LABELS
export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_LABELS
export type MauritiusRegion = typeof MAURITIUS_REGIONS[number]
export type EstablishmentCategory = typeof ESTABLISHMENT_CATEGORIES[number]

// Form data types
export type CreateOrganizationData = Omit<Organization, "id" | "created_at" | "updated_at" | "created_by">
export type UpdateOrganizationData = Partial<CreateOrganizationData>

export type CreateAppointmentData = Omit<Appointment, "id" | "created_at" | "updated_at" | "created_by">
export type UpdateAppointmentData = Partial<CreateAppointmentData>

export type CreateContractData = Omit<Contract, "id" | "createdDate" | "updatedDate">
export type UpdateContractData = Partial<CreateContractData>

// Interface Profile pour compatibilité avec supabase-db.ts
export interface Profile {
  id: string
  full_name?: string
  email?: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Types pour les données d'import CSV
export interface ImportOrganizationRow {
  name?: string
  nom?: string
  nom_etablissement?: string
  "Nom"?: string
  industry?: string
  type?: string
  activite?: string
  "Type"?: string
  category?: string
  categorie?: string
  "Categorie (etoiles)"?: string
  region?: string
  "Region"?: string
  zone_geographique?: string
  zone?: string
  "Zone geographique"?: string
  district?: string
  "District"?: string
  city?: string
  ville?: string
  "Ville"?: string
  address?: string
  adresse?: string
  adresse_precise?: string
  "Adresse precise"?: string
  secteur?: string
  "Secteur"?: string
  website?: string
  site_web?: string
  site_web_officiel?: string
  "Site web officiel"?: string
  nb_chambres?: string | number
  "Nb de chambres"?: string | number
  phone?: string
  telephone?: string
  "Téléphone"?: string
  email?: string
  "Email"?: string
  notes?: string
  commentaires?: string
  "Commentaires"?: string
  status?: string
  statut?: string
  contact_name?: string
  contact_nom?: string
  contact_principal?: string
}

// Helpers pour la validation des données
export const validateOrganization = (org: Partial<Organization>): string[] => {
  const errors: string[] = []
  
  if (!org.name || org.name.trim().length === 0) {
    errors.push("Le nom de l'organisation est obligatoire")
  }
  
  if (org.email && !org.email.includes('@')) {
    errors.push("L'adresse email n'est pas valide")
  }
  
  if (org.nb_chambres && (org.nb_chambres < 0 || org.nb_chambres > 10000)) {
    errors.push("Le nombre de chambres doit être entre 0 et 10000")
  }
  
  return errors
}

export const validateAppointment = (appointment: Partial<Appointment>): string[] => {
  const errors: string[] = []
  
  if (!appointment.title || appointment.title.trim().length === 0) {
    errors.push("Le titre du rendez-vous est obligatoire")
  }
  
  if (!appointment.appointment_date) {
    errors.push("La date du rendez-vous est obligatoire")
  }
  
  if (!appointment.appointment_time) {
    errors.push("L'heure du rendez-vous est obligatoire")
  }
  
  return errors
}

export const validateContract = (contract: Partial<Contract>): string[] => {
  const errors: string[] = []
  
  if (!contract.description || contract.description.trim().length === 0) {
    errors.push("La description du contrat est obligatoire")
  }
  
  if (!contract.status) {
    errors.push("Le statut du contrat est obligatoire")
  }
  
  return errors
}
