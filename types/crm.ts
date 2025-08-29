export interface Organization {
  id: string // Changed to string to match Supabase UUID
  name: string
  industry?: string // Type d'établissement
  size?: "Small" | "Medium" | "Large"
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  region?: string // Region
  zone_geographique?: string // Zone geographique
  secteur?: string // Secteur
  nb_chambres?: number // Nb de chambres
  status?: "Active" | "Prospect" | "Inactive"
  notes?: string // Commentaires
  contact_principal?: string // Contact Principal
  contact_fonction?: string // Fonction du contact principal
  category?: string // Catégorie (etoiles)
  district?: string // District
  prospectStatus?:
    | "not_contacted"
    | "contacted"
    | "hot"
    | "cold"
    | "not_interested"
    | "to_contact"
    | "contract_obtained"
  priority?: "low" | "medium" | "high"
  lastContactDate?: Date | string
  nextFollowUpDate?: Date | string
  source?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Deal {
  id: string | number // Support flexible
  organizationId?: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string | Date
  expected_close_date?: string | Date // Support API snake_case
  source?: string
  owner?: string
  assigned_to?: string // Support API snake_case
  assignedTo?: string // Support camelCase
  createdDate?: Date | string
  created_at?: string // Support API
  updated_at?: string // Support API
  created_by?: string // Support API
}

export interface Activity {
  id: string | number // Support flexible
  organizationId?: string
  appointmentId?: string // Ajouté pour compatibilité
  contractId?: string // Ajouté pour compatibilité
  dealId?: string // Ajouté pour compatibilité
  userId?: string // Ajouté pour compatibilité
  type: "call" | "email" | "meeting" | "note" | "task" | "contract" | "deal" // Minuscules pour API
  title: string
  description?: string
  date?: Date | string
  completed?: boolean
  created_at?: string // Support API
  updated_at?: string // Support API
  created_by?: string // Support API
}

export interface Appointment {
  id: string
  organization_id?: string // Direct reference to organization
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
  id: string | number // Support flexible
  email: string
  name?: string
  full_name?: string // Support API snake_case
  role: "admin" | "manager" | "rep"
  avatar_url?: string // Support API
  created_at?: string // Support API
  updated_at?: string // Support API
}

export interface Contract {
  id: string
  organization_id?: string // Direct reference to organization
  title?: string
  description?: string
  value?: number
  currency?: string
  status?: "draft" | "sent" | "contrat_envoye" | "signed" | "cancelled" | "expired"
  signed_date?: string
  expiration_date?: string
  assigned_to?: string
  created_date?: string
  updated_date?: string
  documents?: string[]
  notes?: string
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
  prospectStatus?: string
  priority?: string
  hasAppointments?: boolean
  city?: string
  region?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

// Constantes étendues pour compatibilité complète
export const ACTIVITY_TYPES = [
  "Conseil",
  "Formation",
  "Développement",
  "Design",
  "Marketing",
  "Vente",
  "Support",
  "Santé",
  "Industrie",
  "Commerce",
  "Restauration",
  "Hôtellerie",
  "Immobilier",
  "Finance",
  "Assurance",
  "Transport",
  "Logistique",
  "Énergie",
  "Environnement",
  "Éducation",
  "Sport",
  "Culture",
  "Média",
  "Technologie",
  "Agriculture",
  "BTP",
  "Pharmacie",
  "Hôtel",
  "Maison de retraite",
  "Restaurant",
  "Commerce de détail",
  "Bureau",
  "Clinique",
  "École",
  "Banque",
  "Services",
  "Autre",
] as const

export const PROSPECT_STATUS_LABELS = {
  not_contacted: "Non contacté",
  contacted: "Contacté",
  hot: "Chaud",
  cold: "Froid",
  not_interested: "Pas intéressé",
  to_contact: "À contacter",
  contract_obtained: "Contrat obtenu",
} as const

export const CONTRACT_STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyé",
  contrat_envoye: "Contrat Envoyé", // Added new contract sent status
  signed: "Signé",
  cancelled: "Annulé",
  expired: "Expiré",
} as const

export const PRIORITY_LABELS = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
} as const

export const APPOINTMENT_TYPE_LABELS = {
  Meeting: "Réunion",
  Call: "Appel",
  Demo: "Démonstration",
  "Follow-up": "Suivi",
} as const

export const APPOINTMENT_STATUS_LABELS = {
  Scheduled: "Planifié",
  Completed: "Terminé",
  Cancelled: "Annulé",
  Rescheduled: "Reporté",
} as const

export const ORGANIZATION_SIZE_LABELS = {
  Small: "Petite (1-10 employés)",
  Medium: "Moyenne (11-100 employés)",
  Large: "Grande (100+ employés)",
} as const

export const ORGANIZATION_STATUS_LABELS = {
  Prospect: "Prospect",
  Active: "Actif",
  Inactive: "Inactif",
} as const

// Type guards
export function isValidProspectStatus(status: string): status is keyof typeof PROSPECT_STATUS_LABELS {
  return status in PROSPECT_STATUS_LABELS
}

export function isValidPriority(priority: string): priority is keyof typeof PRIORITY_LABELS {
  return priority in PRIORITY_LABELS
}

export function isValidContractStatus(status: string): status is keyof typeof CONTRACT_STATUS_LABELS {
  return status in CONTRACT_STATUS_LABELS
}

export function isValidAppointmentType(type: string): type is keyof typeof APPOINTMENT_TYPE_LABELS {
  return type in APPOINTMENT_TYPE_LABELS
}

export function isValidAppointmentStatus(status: string): status is keyof typeof APPOINTMENT_STATUS_LABELS {
  return status in APPOINTMENT_STATUS_LABELS
}

// Utility types
export type ProspectStatus = keyof typeof PROSPECT_STATUS_LABELS
export type Priority = keyof typeof PRIORITY_LABELS
export type ContractStatus = keyof typeof CONTRACT_STATUS_LABELS
export type AppointmentType = keyof typeof APPOINTMENT_TYPE_LABELS
export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_LABELS
export type OrganizationSize = keyof typeof ORGANIZATION_SIZE_LABELS
export type OrganizationStatus = keyof typeof ORGANIZATION_STATUS_LABELS

// Form data types
export type CreateOrganizationData = Omit<Organization, "id" | "created_at" | "updated_at">
export type UpdateOrganizationData = Partial<CreateOrganizationData>

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
