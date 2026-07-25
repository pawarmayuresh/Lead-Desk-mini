import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const isSuccess = type === 'success'

  return (
    <AnimatePresence>
      <motion.div
        role="alert"
        aria-live="polite"
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center gap-3
          px-4 py-3.5 rounded-2xl shadow-xl
          border backdrop-blur-sm
          max-w-sm
          ${isSuccess
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
            : 'bg-red-50/95 border-red-200 text-red-800'
          }
        `}
      >
        {isSuccess
          ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        }
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 p-1 rounded-lg hover:bg-black/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
