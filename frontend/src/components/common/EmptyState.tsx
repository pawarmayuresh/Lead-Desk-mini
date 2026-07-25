import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title?: string
  description?: string
  onClear?: () => void
}

export const EmptyState = ({
  title = 'No Leads Found',
  description = 'Try adjusting your search',
  onClear,
}: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
    >
      <Inbox className="w-7 h-7 text-slate-400" />
    </motion.div>
    <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 mb-5">{description}</p>
    {onClear && (
      <Button variant="secondary" size="sm" onClick={onClear}>
        Clear Search
      </Button>
    )}
  </motion.div>
)
