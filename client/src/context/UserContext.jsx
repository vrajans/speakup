import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ streak: 0, total_sessions: 0, wins: 0, phase: 1 })
  const [loading, setLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('speakup_user')
    if (saved) {
      try {
        const { user: u, profile: p } = JSON.parse(saved)
        setUser(u)
        setProfile(p)
        if (u?.id) refreshStats(u.id)
      } catch (e) {}
    }
    setLoading(false)
  }, [])

  const refreshStats = async (userId) => {
    try {
      const uid = userId || user?.id
      if (!uid) return
      const r = await fetch(`/api/users/${uid}/stats`)
      const data = await r.json()
      const phase = data.total_sessions > 60 ? 3 : data.total_sessions > 30 ? 2 : 1
      setStats({ ...data, phase })
    } catch (e) {}
  }

  const login = async (userData, profileData) => {
    setUser(userData)
    setProfile(profileData)
    localStorage.setItem('speakup_user', JSON.stringify({ user: userData, profile: profileData }))
    await refreshStats(userData.id)
  }

  const updateProfile = (profileData) => {
    setProfile(profileData)
    if (user) {
      localStorage.setItem('speakup_user', JSON.stringify({ user, profile: profileData }))
    }
  }

  const logout = () => {
    setUser(null)
    setProfile(null)
    setStats({ streak: 0, total_sessions: 0, wins: 0, phase: 1 })
    localStorage.removeItem('speakup_user')
  }

  return (
    <UserContext.Provider value={{ user, profile, stats, loading, login, updateProfile, logout, refreshStats }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
