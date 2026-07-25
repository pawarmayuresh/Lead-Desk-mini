import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  onRetry?: () => void
  message?: string
}

export const ErrorState = ({ message = 'Something went wrong.', onRetry }: ErrorStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
      <AlertTriangle className="w-6 h-6 text-red-400" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700 mb-1">{message}</h3>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
        Try again
      </Button>
    )}
  </motion.div>
)
