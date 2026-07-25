/**
 * AuthContext — Cookie-based authentication state.
 *
 * Security changes from localStorage approach:
 *   - Token is NEVER stored in JS memory or localStorage
 *   - Browser sends HTTP-only cookie automatically on every request
 *   - `isAuthenticated` is derived from a server /me check, not a token value
 *   - On app load, we call GET /auth/me to verify the cookie session is still valid
 *   - If /me returns 401, session expired → redirect to login
 *
 * Why this is safer:
 *   - XSS cannot steal the token (it's in an HTTP-only cookie)
 *   - No token in memory means no accidental console.log exposure
 *   - Server is the source of truth for auth state
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import apiClient from '../services/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean       // true while checking session on app load
  userEmail: string | null
  login: (email: string) => void   // called after successful login response
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  /**
   * On mount: verify existing cookie session with the server.
   * GET /auth/me sends the HTTP-only cookie automatically (withCredentials=true).
   * If valid → mark authenticated.
   * If 401 → session expired or no session → stay logged out.
   */
  const checkSession = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me')
      if (data.authenticated) {
        setIsAuthenticated(true)
        setUserEmail(data.email ?? null)
      }
    } catch {
      // 401 = no valid session — expected, not an error
      setIsAuthenticated(false)
      setUserEmail(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = (email: string) => {
    // Called after a successful POST /auth/login.
    // We don't store the token — the browser cookie is already set by the server.
    setIsAuthenticated(true)
    setUserEmail(email)
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Even if request fails, clear local state
    } finally {
      setIsAuthenticated(false)
      setUserEmail(null)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
