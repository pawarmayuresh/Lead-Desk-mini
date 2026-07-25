import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export const SearchBar = ({ onSearch, placeholder = 'Search leads by name or email...' }: SearchBarProps) => {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), 300)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <motion.div
      animate={{ width: focused ? '100%' : '100%' }}
      className="relative w-full max-w-md"
    >
      <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200
        ${focused ? 'text-blue-500' : 'text-slate-400'}`}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Search leads"
        className={`
          w-full pl-10 pr-9 py-2.5 text-sm
          border rounded-xl
          bg-white/80 text-slate-900 placeholder-slate-400
          transition-all duration-200
          focus:outline-none focus:bg-white
          focus:shadow-sm focus:shadow-blue-500/10
          ${focused
            ? 'border-blue-400 ring-2 ring-blue-500/20'
            : 'border-slate-200 hover:border-slate-300'
          }
        `}
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </motion.button>
      )}
    </motion.div>
  )
}
