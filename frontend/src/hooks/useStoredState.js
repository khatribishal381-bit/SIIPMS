import { useEffect, useState } from 'react'

// Temporary browser persistence until the authenticated API is connected.
// Never save passwords, access tokens, or confidential documents here.
export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved === null) return initialValue
      const parsed = JSON.parse(saved)
      return Array.isArray(initialValue) && !Array.isArray(parsed) ? initialValue : parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Keep the application usable in browsers where storage is unavailable.
    }
  }, [key, value])

  return [value, setValue]
}
