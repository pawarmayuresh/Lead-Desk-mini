import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-xl
            bg-white/80 text-slate-900 placeholder-slate-400
            resize-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400
            focus:bg-white focus:shadow-sm focus:shadow-blue-500/10
            ${error
              ? 'border-red-300 bg-red-50/30 focus:ring-red-400/50 focus:border-red-400'
              : 'border-slate-200 hover:border-slate-300'
            }
            ${className}
          `}
          {...props}
        />
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-red-500 flex items-center gap-1"
              role="alert"
            >
              <span>✖</span> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
