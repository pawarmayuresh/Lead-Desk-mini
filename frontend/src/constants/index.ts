import type { BudgetRange, LeadStatus } from '../types'

export const BUDGET_RANGES: { value: BudgetRange; label: string }[] = [
  { value: 'LESS_THAN_50K', label: '₹10K–₹50K' },
  { value: '50K_TO_1L',     label: '₹50K–₹1L' },
  { value: '1L_TO_5L',      label: '₹1L–₹5L' },
  { value: 'ABOVE_5L',      label: '₹5L+' },
]

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  LESS_THAN_50K: '₹10K–₹50K',
  '50K_TO_1L':   '₹50K–₹1L',
  '1L_TO_5L':    '₹1L–₹5L',
  ABOVE_5L:      '₹5L+',
}

export const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'CLOSED']

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW:       'New',
  CONTACTED: 'Contacted',
  CLOSED:    'Closed',
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
