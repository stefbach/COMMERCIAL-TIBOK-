export interface Organization {
  id: number
  name: string
  industry: string
  country: string
  city: string
  address: string
  postalCode: string
  region: string // Adding region field for geographical filtering
  website: string
  size: "Small" | "Medium" | "Large"
  status: "Active" | "Prospect" | "Inactive"
  tags: string[]
  createdDate: Date
  activityType: string // Hotel, Pharmacie, Maison de retraite, etc.
}

export interface Contact {
  id: number
  organizationId: number
  fullName: string
  role: string
  email: string
  phone: string
  mobilePhone?: string
  linkedinProfile?: string
  consentMarketing: boolean
  notes: string
  lastContactDate?: Date
  nextFollowUpDate?: Date
  appointmentHistory: number[] // appointment IDs
  prospectStatus: "not_contacted" | "hot" | "cold" | "not_interested" | "to_contact" | "contract_obtained"
  priority: "low" | "medium" | "high"
  source: string // How we got this contact
}

export interface Deal {
  id: number
  organizationId: number
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate: string
  source: string
  owner: string
  createdDate: Date
}

export interface Activity {
  id: number
  organizationId?: number
  contactId?: number
  type: "Call" | "Email" | "Meeting" | "Note" | "Task"
  title: string
  description: string
  date: Date
  completed: boolean
}

export interface Appointment {
  id: number
  organizationId?: number
  contactId?: number
  title: string
  description: string
  date: Date
  time: string
  duration: number // in minutes
  location: string
  city?: string // Adding geographical fields for appointments
  region?: string // Adding geographical fields for appointments
  address?: string // Adding geographical fields for appointments
  type: "Meeting" | "Call" | "Demo" | "Follow-up"
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled"
  reminder: boolean
  createdDate: Date
}

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "rep"
}

export interface DashboardStats {
  totalOrganizations: number
  activeDeals: number
  pipelineValue: number
  winRate: number
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
  city?: string // Adding geographical filters
  region?: string // Adding geographical filters
  dateRange?: {
    start: Date
    end: Date
  }
}

export const ACTIVITY_TYPES = [
  "Hôtel",
  "Pharmacie",
  "Maison de retraite",
  "Restaurant",
  "Commerce de détail",
  "Bureau",
  "Clinique",
  "École",
  "Banque",
  "Assurance",
  "Immobilier",
  "Transport",
  "Industrie",
  "Services",
  "Autre",
] as const

export const PROSPECT_STATUS_LABELS = {
  not_contacted: "Pas contacté",
  hot: "Chaud",
  cold: "Froid",
  not_interested: "Pas intéressé",
  to_contact: "À contacter",
  contract_obtained: "Contrat obtenu",
} as const

export interface Contract {
  id: string
  organizationId: string
  contactId: string
  title: string
  description: string
  value: number
  currency: string
  status: "draft" | "sent" | "signed" | "cancelled" | "expired"
  signedDate?: Date
  expirationDate?: Date
  assignedTo: string // Commercial/Sales rep assigned to this contract
  createdDate: Date
  updatedDate: Date
  documents: string[] // URLs or file paths to contract documents
  notes: string
}

export const CONTRACT_STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyé",
  signed: "Signé",
  cancelled: "Annulé",
  expired: "Expiré",
} as const
