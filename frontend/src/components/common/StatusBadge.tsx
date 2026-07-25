import { motion } from 'framer-motion'
import type { LeadStatus } from '../../types'

interface StatusBadgeProps {
  status: LeadStatus
}

const statusConfig: Record<LeadStatus, { label: string; classes: string; dot: string }> = {
  NEW: {
    label: 'New',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    dot: 'bg-blue-500',
  },
  CONTACTED: {
    label: 'Contacted',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    dot: 'bg-amber-500',
  },
  CLOSED: {
    label: 'Closed',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status]
  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'NEW' ? 'animate-pulse' : ''}`} />
      {config.label}
    </motion.span>
  )
}
