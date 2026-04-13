"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null

    const refreshToken = async (currentUser: User) => {
      try {
        // forceRefresh=false uses cache unless < 5 min left, fast call
        const idToken = await currentUser.getIdToken(false)
        setToken(idToken)
        localStorage.setItem("token", idToken)
        // Schedule next refresh in 50 minutes (tokens expire in 60 min)
        refreshTimer = setTimeout(() => refreshToken(currentUser), 50 * 60 * 1000)
      } catch (err) {
        console.error("Token refresh failed:", err)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (refreshTimer) clearTimeout(refreshTimer)
      setUser(currentUser)
      if (currentUser) {
        await refreshToken(currentUser)
      } else {
        setToken(null)
        localStorage.removeItem("token")
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
