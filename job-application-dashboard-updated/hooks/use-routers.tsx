"use client"

import { useState, useEffect } from "react"
import { apiClient } from "../lib/api"

export function useRouters() {
  const [routers, setRouters] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRouters = async () => {
      try {
        setLoading(true)
        setError(null)
        const routersData = await apiClient.getRouters()
        setRouters(routersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch routers")
        console.error("Error fetching routers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRouters()
  }, [])

  return { routers, loading, error, refetch: () => window.location.reload() }
}
