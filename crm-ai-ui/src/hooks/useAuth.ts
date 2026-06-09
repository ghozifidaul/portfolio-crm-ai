import { useState, useCallback } from 'react'
import { setToken, clearToken, isAuthenticated } from '../api/client'
import { login as loginApi } from '../api/requests'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await loginApi(username, password)
      setToken(res.token)
      return true
    } catch (err: any) {
      const msg = err.message === 'Unauthorized' ? 'Invalid username or password' : err.message
      setError(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
  }, [])

  return { login, logout, loading, error, isAuthenticated: isAuthenticated() }
}
