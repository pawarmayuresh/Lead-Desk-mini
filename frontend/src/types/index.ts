export type BudgetRange =
  | 'LESS_THAN_50K'
  | '50K_TO_1L'
  | '1L_TO_5L'
  | 'ABOVE_5L'

export type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

export interface Lead {
  id: string
  name: string
  email: string
  budget: BudgetRange
  message: string
  status: LeadStatus
  created_at: string
  updated_at: string
}

export interface LeadFormData {
  name: string
  email: string
  budget: BudgetRange
  message: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string   // returned in body for Swagger; frontend uses cookie
  token_type: string
  message: string
}

export interface DashboardStats {
  total: number
  new: number
  contacted: number
  closed: number
}
