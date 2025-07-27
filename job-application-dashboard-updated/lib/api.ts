const API_BASE_URL = "http://127.0.0.1:8005"

export interface TimeFrame {
  start_time: string
  end_time: string
}

export interface TopNRequest extends TimeFrame {
  n: number
}

export interface TotalsResponse {
  total_applications: number
  relevant_matches: number
  approved: number
}

export interface ReasonPercent {
  reason: string
  percent: string
}

export interface Router {
  name: string
}

export class ApiClient {
  private async request<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getTotals(timeFrame: TimeFrame): Promise<TotalsResponse> {
    return this.request<TotalsResponse>("/applications/totals/summary", timeFrame)
  }

  async getTopPros(request: TopNRequest): Promise<ReasonPercent[]> {
    return this.request<ReasonPercent[]>("/applications/totals/pros", request)
  }

  async getTopCons(request: TopNRequest): Promise<ReasonPercent[]> {
    return this.request<ReasonPercent[]>("/applications/totals/cons", request)
  }

  async getRouters(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/routers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch routers: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
