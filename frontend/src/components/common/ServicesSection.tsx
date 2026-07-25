import { useRef, type MouseEvent } from 'react'
import { motion, useInView } from 'framer-motion'
import { Rocket, ShoppingBag, Zap, CheckCircle, Code2, Shield, Clock } from 'lucide-react'

const services = [
  {
    icon: Rocket,
    title: 'Web Development',
    description: 'Full-stack applications built with modern frameworks, clean architecture, and production-ready engineering.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    glowColor: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: ShoppingBag,
    title: 'Shopify Development',
    description: 'Custom themes and apps to power your ecommerce store with blazing fast load times and exceptional UX.',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    glowColor: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: Code2,
    title: 'API Integration',
    description: 'Seamlessly connect payment gateways, CRMs, and internal systems with secure, maintainable REST APIs.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    glowColor: 'group-hover:shadow-amber-500/20',
  },
]

const benefits = [
  { icon: Shield, label: 'Secure by Default' },
  { icon: Zap, label: 'Fast Delivery' },
  { icon: Code2, label: 'Clean Code' },
  { icon: CheckCircle, label: 'Production Ready' },
  { icon: Rocket, label: 'Experienced Team' },
  { icon: Clock, label: '24h Response' },
]

// 3D tilt card
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateZ(4px)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const ServicesSection = () => {
  const servicesRef = useRef(null)
  const benefitsRef = useRef(null)
  const servicesInView = useInView(servicesRef, { once: true, margin: '-80px' })
  const benefitsInView = useInView(benefitsRef, { once: true, margin: '-80px' })

  return (
    <>
      {/* Services */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={servicesRef}
            initial="hidden"
            animate={servicesInView ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-100 mb-4">
                What We Do
              </span>
              <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Our Services</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
                End-to-end digital solutions tailored for startups and growing businesses.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <motion.div key={service.title} variants={itemVariants}>
                  <TiltCard>
                    <div
                      className={`group bg-white border border-slate-100 rounded-2xl p-7 h-full
                        shadow-sm hover:shadow-xl transition-all duration-300 cursor-default
                        ${service.glowColor}`}
                    >
                      <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center mb-5
                        group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`w-5 h-5 ${service.iconColor}`} />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">{service.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>

                      {/* Gradient accent bar on hover */}
                      <div className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${service.gradient}
                        transition-all duration-500 rounded-full`} />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={benefitsRef}
            initial="hidden"
            animate={benefitsInView ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Why Choose Us</h2>
              <p className="text-slate-500 text-lg">We deliver more than code — we deliver confidence.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
              {benefits.map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-full
                    px-5 py-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-default"
                >
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
