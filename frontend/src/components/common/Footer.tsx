import { motion } from 'framer-motion'
import { ExternalLink, Zap, Heart } from 'lucide-react'

export const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-12 relative overflow-hidden">
    {/* Subtle grid */}
    <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
    {/* Top border glow */}
    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 text-white font-semibold">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span>LeadDesk <span className="text-blue-400">Mini Pro</span></span>
        </div>

        {/* Credit */}
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          Built with <Heart className="w-3.5 h-3.5 text-red-400" /> by{' '}
          <span className="text-slate-300 font-medium">Mayuresh Pawar</span>
          <span className="text-slate-600 mx-1">·</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors duration-150"
          >
            Built for Digital Heroes Training Task
          </a>
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-2">
          {[
            { label: 'GitHub', href: 'https://github.com' },
            { label: 'LinkedIn', href: 'https://linkedin.com' },
          ].map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-150"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {label}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)
