import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { StatusBadge } from '../common/StatusBadge'
import { Toast } from '../common/Toast'
import { updateLeadStatus } from '../../services/api'
import { LEAD_STATUSES, BUDGET_LABELS } from '../../constants'
import type { Lead, LeadStatus } from '../../types'

interface LeadsTableProps {
  leads: Lead[]
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.3 }
  }),
}

export const LeadsTable = ({ leads }: LeadsTableProps) => {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setToast({ message: 'Status updated', type: 'success' })
    },
    onError: () => setToast({ message: 'Failed to update status.', type: 'error' }),
  })

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {['Name', 'Email', 'Budget', 'Status', 'Date', 'Actions'].map((col) => (
                <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            <AnimatePresence>
              {leads.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="group hover:bg-blue-50/30 transition-colors duration-150"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs">{lead.email}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {BUDGET_LABELS[lead.budget]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs">
                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative inline-block">
                      <select
                        value={lead.status}
                        onChange={(e) => mutation.mutate({ id: lead.id, status: e.target.value as LeadStatus })}
                        disabled={mutation.isPending}
                        aria-label={`Change status for ${lead.name}`}
                        className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium
                          border border-slate-200 rounded-lg bg-white
                          hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                          transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            custom={i} variants={rowVariants} initial="hidden" animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.email}</p>
                </div>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-lg font-medium">{BUDGET_LABELS[lead.budget]}</span>
              <select
                value={lead.status}
                onChange={(e) => mutation.mutate({ id: lead.id, status: e.target.value as LeadStatus })}
                disabled={mutation.isPending}
                aria-label={`Change status for ${lead.name}`}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
