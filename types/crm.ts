export interface Organization {
  id: number
  name: string
  industry?: string  // Optionnel
  country: string
  city: string
  address?: string   // Optionnel
  postalCode?: string // Optionnel
  region?: string    // Optionnel pour filtres géographiques
  website?: string   // Optionnel
  size: "Small" | "Medium" | "Large"
  status: "Active" | "Prospect" | "Inactive"
  tags: string[]
  createdDate: Date | string
  activityType: string // Hotel, Pharmacie, Maison de retraite, etc.
}

export interface Contact {
  id: string | number
  organizationId: number
  firstName?: string        // Ajouté pour compatibilité
  lastName?: string         // Ajouté pour compatibilité
  fullName: string
  role?: string
  position?: string         // Alias pour role
  department?: string       // Ajouté pour compatibilité
  email: string
  phone: string
  mobilePhone?: string
  linkedinProfile?: string
  isPrimary?: boolean       // Ajouté pour compatibilité
  consentMarketing: boolean
  notes: string
  lastContactDate?: Date | string
  nextFollowUpDate?: Date | string
  appointmentHistory: (string | number)[] // Support flexible
  prospectStatus: "not_contacted" | "contacted" | "hot" | "cold" | "not_interested" | "to_contact" | "contract_obtained"
  priority: "low" | "medium" | "high"
  source: string
  city?: string             // Ajouté pour filtres géographiques
  region?: string           // Ajouté pour filtres géographiques
}

export interface Deal {
  id: string | number       // Support flexible
  organizationId?: number
  contactId?: number        // Ajouté pour compatibilité
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string | Date
  expected_close_date?: string | Date  // Support API snake_case
  source?: string
  owner?: string
  assigned_to?: string      // Support API snake_case
  assignedTo?: string       // Support camelCase
  createdDate?: Date | string
  created_at?: string       // Support API
  updated_at?: string       // Support API
  created_by?: string       // Support API
}

export interface Activity {
  id: string | number       // Support flexible
  organizationId?: number
  contactId?: string | number
  appointmentId?: string    // Ajouté pour compatibilité
  contractId?: string       // Ajouté pour compatibilité
  dealId?: string           // Ajouté pour compatibilité
  userId?: string           // Ajouté pour compatibilité
  type: "call" | "email" | "meeting" | "note" | "task" | "contract" | "deal" // Minuscules pour API
  title: string
  description?: string
  date?: Date | string
  completed?: boolean
  created_at?: string       // Support API
  updated_at?: string       // Support API
  created_by?: string       // Support API
}

export interface Appointment {
  id: string                // String comme dans supabase-db.ts
  organizationId?: number
  contactId?: number
  contact_id?: string | number    // Support API snake_case
  title: string
  description: string
  date?: Date | string                    // Support format flexible
  appointment_date?: string               // Support API snake_case
  appointmentDate?: string                // Support camelCase
  time?: string                           // Format flexible
  appointment_time?: string               // Support API snake_case  
  appointmentTime?: string                // Support camelCase
  duration: number
  location: string
  city?: string             // Géolocalisation
  region?: string           // Géolocalisation
  address?: string          // Géolocalisation
  type: "Meeting" | "Call" | "Demo" | "Follow-up"
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled"
  reminder: boolean
  createdDate?: Date | string
  created_at?: string       // Support API
  updated_at?: string       // Support API
}

export interface User {
  id: string | number       // Support flexible
  email: string
  name?: string
  full_name?: string        // Support API snake_case
  role: "admin" | "manager" | "rep"
  avatar_url?: string       // Support API
  created_at?: string       // Support API
  updated_at?: string       // Support API
}

export interface Contract {
  id: string
  organizationId: string
  contactId: string
  title: string
  description: string
  value: number
  currency: string
  status: "draft" | "sent" | "signed" | "cancelled" | "expired"
  signedDate?: Date | string
  signed_date?: string      // Support API snake_case
  expirationDate?: Date | string
  expiration_date?: string  // Support API snake_case
  assignedTo: string
  assigned_to?: string      // Support API snake_case
  createdDate: Date | string
  created_at?: string       // Support API
  updatedDate: Date | string
  updated_at?: string       // Support API
  documents: string[]
  notes: string
}

export interface DashboardStats {
  totalOrganizations: number
  totalContacts?: number          // Ajouté
  totalAppointments?: number      // Ajouté
  totalContracts?: number         // Ajouté
  activeDeals: number
  pipelineValue: number
  winRate: number
  appointmentsThisWeek?: number   // Ajouté
  contractsThisMonth?: number     // Ajouté
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
  "Autre"
] as const

export const PROSPECT_STATUS_LABELS = {
  not_contacted: "Non contacté",
  contacted: "Contacté",
  hot: "Chaud",
  cold: "Froid",
  not_interested: "Pas intéressé",
  to_contact: "À contacter",
  contract_obtained: "Contrat obtenu"
} as const

export const CONTRACT_STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyé",
  signed: "Signé",
  cancelled: "Annulé",
  expired: "Expiré"
} as const

// Ajout des constantes manquantes
export const PRIORITY_LABELS = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute"
} as const

export const APPOINTMENT_TYPE_LABELS = {
  Meeting: "Réunion",
  Call: "Appel",
  Demo: "Démonstration", 
  "Follow-up": "Suivi"
} as const

export const APPOINTMENT_STATUS_LABELS = {
  Scheduled: "Planifié",
  Completed: "Terminé",
  Cancelled: "Annulé",
  Rescheduled: "Reporté"
} as const

export const ORGANIZATION_SIZE_LABELS = {
  Small: "Petite (1-10 employés)",
  Medium: "Moyenne (11-100 employés)",
  Large: "Grande (100+ employés)"
} as const

export const ORGANIZATION_STATUS_LABELS = {
  Prospect: "Prospect",
  Active: "Actif",
  Inactive: "Inactif"
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
export type CreateOrganizationData = Omit<Organization, 'id' | 'createdDate'>
export type UpdateOrganizationData = Partial<CreateOrganizationData>

export type CreateContactData = Omit<Contact, 'id'>
export type UpdateContactData = Partial<CreateContactData>

export type CreateAppointmentData = Omit<Appointment, 'id' | 'createdDate' | 'created_at' | 'updated_at'>
export type UpdateAppointmentData = Partial<CreateAppointmentData>

export type CreateContractData = Omit<Contract, 'id' | 'createdDate' | 'updatedDate' | 'created_at' | 'updated_at'>
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
