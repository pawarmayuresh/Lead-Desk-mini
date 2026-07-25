import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { Toast } from '../../components/common/Toast'
import { useAuth } from '../../context/AuthContext'
import { login as loginApi } from '../../services/api'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginApi(data.email, data.password)
      // Cookie is set by server — we just update local auth state
      // Never store the token in JS — it lives in the HTTP-only cookie
      login(data.email)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid email or password'
      setToast({ message, type: 'error' })
    }
  }

  return (
    <div className="min-h-screen gradient-bg noise flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-400/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-blue-500/30"
          >
            <Zap className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your admin panel</p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-slate-200/60"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@digitalheroes.com"
              required
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`
                    w-full px-4 py-3 pr-11 text-sm border rounded-xl
                    bg-white/80 text-slate-900 placeholder-slate-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400
                    focus:bg-white focus:shadow-sm
                    ${errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'}
                  `}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                  role="alert"
                >
                  <span>✖</span> {errors.password.message}
                </motion.p>
              )}
            </div>

            <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-6">
          LeadDesk Mini Pro — Digital Heroes Assignment
        </motion.p>
      </motion.div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
