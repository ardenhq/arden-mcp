import axios from 'axios'
import { getApiKey, API_BASE } from '../auth.js'

interface Agent {
  name: string
  status: string
  monthly_budget?: number
  spent_this_month?: number
  wallet_address?: string
  [key: string]: unknown
}

export async function listAgents(): Promise<string> {
  const apiKey = getApiKey()

  try {
    const { data } = await axios.get<Agent[]>(`${API_BASE}/agents`, {
      headers: { 'X-API-Key': apiKey },
    })

    const agents: Agent[] = Array.isArray(data) ? data : (data as { agents?: Agent[] }).agents ?? []

    if (agents.length === 0) {
      return 'No agents found. Use arden_provision_agent to create one.'
    }

    const lines = agents.map((agent) => {
      const spent = agent.spent_this_month ?? 0
      const budget = agent.monthly_budget
      const remaining = budget !== undefined ? budget - spent : undefined
      const pct =
        budget !== undefined && budget > 0 ? ((spent / budget) * 100).toFixed(1) + '%' : 'N/A'

      return [
        `Name:            ${agent.name}`,
        `Status:          ${agent.status}`,
        `Monthly budget:  ${budget !== undefined ? '$' + budget : 'N/A'}`,
        `Spent this month: $${spent}`,
        `Remaining:       ${remaining !== undefined ? '$' + remaining : 'N/A'}`,
        `% Used:          ${pct}`,
        `Wallet:          ${agent.wallet_address ?? 'N/A'}`,
      ].join('\n')
    })

    return lines.join('\n\n---\n\n')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message
      return `Failed to list agents: ${body}`
    }
    return `Failed to list agents: ${String(err)}`
  }
}
