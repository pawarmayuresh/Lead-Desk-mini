import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { Toast } from '../common/Toast'
import { submitLead } from '../../services/api'
import { BUDGET_RANGES } from '../../constants'

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  budget: z.enum(['LESS_THAN_50K', '50K_TO_1L', '1L_TO_5L', 'ABOVE_5L'], { message: 'Please select a budget range' }),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be under 1000 characters'),
})

type LeadFormData = z.infer<typeof leadSchema>

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const LeadForm = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const onSubmit = async (data: LeadFormData) => {
    try {
      await submitLead(data)
      setSubmitted(true)
      setToast({ message: '✔ Your inquiry has been submitted!', type: 'success' })
      reset()
      setTimeout(() => setSubmitted(false), 4000)
    } catch {
      setToast({ message: 'Submission failed. Please try again.', type: 'error' })
    }
  }

  const budgetOptions = BUDGET_RANGES.map((b) => ({ value: b.value, label: b.label }))

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="max-w-xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-100 mb-4">
              Get In Touch
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Tell Us About Your Project</h2>
            <p className="text-slate-500 text-lg">We'll get back to you within 24 hours.</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/60"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Inquiry Sent!</h3>
                  <p className="text-sm text-slate-500">We'll be in touch within 24 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  <Input label="Full Name" placeholder="John Doe" required error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" placeholder="john@example.com" required error={errors.email?.message} {...register('email')} />
                  <Select label="Budget Range" placeholder="Select your budget" required options={budgetOptions} error={errors.budget?.message} {...register('budget')} />
                  <Textarea label="Project Description" placeholder="Tell us about your project, goals, and timeline..." required error={errors.message?.message} {...register('message')} />

                  <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting} className="w-full mt-1">
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  )
}
