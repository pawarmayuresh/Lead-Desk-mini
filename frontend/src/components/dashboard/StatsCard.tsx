import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'amber' | 'slate'
}

const colorMap = {
  blue:  { bg: 'bg-blue-50',   iconBg: 'bg-blue-600',   icon: 'text-white', value: 'text-slate-900', border: 'border-blue-100',  glow: 'hover:shadow-blue-500/10' },
  green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', icon: 'text-white', value: 'text-slate-900', border: 'border-emerald-100', glow: 'hover:shadow-emerald-500/10' },
  amber: { bg: 'bg-amber-50',  iconBg: 'bg-amber-500',  icon: 'text-white', value: 'text-slate-900', border: 'border-amber-100',  glow: 'hover:shadow-amber-500/10' },
  slate: { bg: 'bg-slate-50',  iconBg: 'bg-slate-700',  icon: 'text-white', value: 'text-slate-900', border: 'border-slate-100',  glow: 'hover:shadow-slate-500/10' },
}

// Animated counter
const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setCount(value); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, inView])

  return <span ref={ref}>{count}</span>
}

export const StatsCard = ({ title, value, icon: Icon, color }: StatsCardProps) => {
  const colors = colorMap[color]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, rotateX: 2 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-6 shadow-sm
        hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</p>
          <p className={`text-3xl font-bold ${colors.value} tabular-nums`}>
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  )
}
