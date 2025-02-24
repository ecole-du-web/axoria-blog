"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { SASessionInfo } from "@/lib/serverActions/session/sessionMethods"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState({
    loading: true,
    isConnected: false,
  }) // null = en chargement

  useEffect(() => {
    async function fetchAuthStatus() {
      const authStatus = await SASessionInfo()
      setIsAuthenticated({ loading: false, isConnected: authStatus.success })
    }
    fetchAuthStatus()
  }, [])


  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated}}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
