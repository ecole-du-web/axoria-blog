"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { SASessionInfo } from "@/lib/serverActions/session/sessionMethods"

const AuthContext = createContext(null)

export function AuthProvider({ children, initialAuth }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState({
    loading: false,
    isConnected: initialAuth.success,
    userId: initialAuth.userId,
  }) // null = en chargement

  // useEffect(() => {
  //   console.log("iciiiiiiiiiiiiiii");
    
  //   async function fetchAuthStatus() {
  //     const authStatus = await SASessionInfo()

  //     setIsAuthenticated({
  //       loading: false,
  //       isConnected: authStatus.success,
  //       userId: authStatus.userId,
  //     })
  //   }
  //   fetchAuthStatus()
  // }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
