import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Users, Zap } from 'lucide-react'
import { Button } from './Button'

const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D }))
)

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const stats = [
  { value: '50+', label: 'Projects', icon: Zap },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '200+', label: 'Happy Clients', icon: Users },
]

export const HeroSection = () => (
  <section
    id="home"
    className="relative min-h-screen pt-16 flex items-center overflow-hidden gradient-bg noise"
  >
    {/* Soft grid background */}
    <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

    {/* Glow blobs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* LEFT — Text */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit
              bg-white/70 backdrop-blur-sm border border-blue-100 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs font-semibold text-blue-700">Available for Projects</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight"
          >
            Build Better{' '}
            <span className="text-gradient">Digital</span>{' '}
            <br className="hidden sm:block" />
            Products
          </motion.h1>

          {/* Subheading */}
          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-lg text-slate-500 leading-relaxed max-w-md"
          >
            We help startups and agencies build scalable, secure software solutions — fast.
            From web apps to API integrations, delivered with precision.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Our Services
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="flex gap-6 pt-2"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 leading-none">{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — 3D Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden lg:block h-[520px] relative"
        >
          {/* Glow behind canvas */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-400/20 via-transparent to-transparent rounded-3xl" />

          <Suspense fallback={
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full animate-pulse" />
            </div>
          }>
            <HeroScene3D />
          </Suspense>

          {/* Floating glass cards overlaid on the 3D scene */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 right-4 glass rounded-2xl px-4 py-3 shadow-lg pointer-events-none"
          >
            <p className="text-xs font-semibold text-slate-700">✓ Lead Submitted</p>
            <p className="text-xs text-slate-400 mt-0.5">just now</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 left-4 glass rounded-2xl px-4 py-3 shadow-lg pointer-events-none"
          >
            <p className="text-xs font-semibold text-slate-700">📊 28 Active Leads</p>
            <p className="text-xs text-green-500 mt-0.5">↑ 12% this week</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
)
