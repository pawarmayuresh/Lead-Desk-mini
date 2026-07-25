/**
 * ProtectedRoute — guards dashboard routes behind cookie session check.
 *
 * Why we check isLoading:
 *   On app load, AuthContext calls GET /auth/me to verify the cookie session.
 *   While that request is in flight, isAuthenticated=false (initial state).
 *   Without isLoading guard, the user would be briefly redirected to /login
 *   even with a valid session — a flash of incorrect content.
 *
 *   We show a spinner until the session check resolves.
 */

import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Still verifying cookie session — don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
