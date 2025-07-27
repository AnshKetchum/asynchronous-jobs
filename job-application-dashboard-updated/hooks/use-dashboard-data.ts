"use client"

import { useState, useEffect } from "react"
import { apiClient, type TotalsResponse, type ReasonPercent } from "../lib/api"

export function useDashboardData() {
  const [totals, setTotals] = useState<TotalsResponse | null>(null)
  const [pros, setPros] = useState<ReasonPercent[]>([])
  const [cons, setCons] = useState<ReasonPercent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get data for the last 30 days
        const endTime = new Date()
        const startTime = new Date()
        startTime.setDate(startTime.getDate() - 30)

        const timeFrame = {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        }

        const topNRequest = {
          ...timeFrame,
          n: 5,
        }

        // Fetch all data in parallel
        const [totalsData, prosData, consData] = await Promise.all([
          apiClient.getTotals(timeFrame),
          apiClient.getTopPros(topNRequest),
          apiClient.getTopCons(topNRequest),
        ])

        setTotals(totalsData)
        setPros(prosData)
        setCons(consData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { totals, pros, cons, loading, error, refetch: () => window.location.reload() }
}
