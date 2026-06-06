import axios from 'axios'
import { getApiKey, API_BASE } from '../auth.js'

interface Budget {
  limit?: number
  spent?: number
}

interface AgentDetail {
  name: string
  status: string
  wallet_address?: string
  allowed_vendors?: string
  monthly?: Budget
  daily?: Budget
  weekly?: Budget
  per_transaction_limit?: number
  [key: string]: unknown
}

function formatBudgetWindow(label: string, window?: Budget): string {
  if (!window) return `${label}: not set`
  const limit = window.limit !== undefined ? '$' + window.limit : 'N/A'
  const spent = window.spent !== undefined ? '$' + window.spent : '$0'
  const remaining =
    window.limit !== undefined && window.spent !== undefined
      ? '$' + (window.limit - window.spent)
      : 'N/A'
  const pct =
    window.limit !== undefined && window.limit > 0 && window.spent !== undefined
      ? ((window.spent / window.limit) * 100).toFixed(1) + '%'
      : 'N/A'
  return `${label}: limit=${limit}, spent=${spent}, remaining=${remaining}, used=${pct}`
}

export async function agentStatus(name: string): Promise<string> {
  const apiKey = getApiKey()

  try {
    const { data } = await axios.get<AgentDetail>(`${API_BASE}/agents/${encodeURIComponent(name)}`, {
      headers: { 'X-API-Key': apiKey },
    })

    return [
      `Agent: ${data.name}`,
      `Status: ${data.status}`,
      `Wallet: ${data.wallet_address ?? 'N/A'}`,
      `Allowed vendors: ${data.allowed_vendors ?? 'N/A'}`,
      '',
      'Budget windows:',
      '  ' + formatBudgetWindow('Monthly', data.monthly),
      '  ' + formatBudgetWindow('Daily', data.daily),
      '  ' + formatBudgetWindow('Weekly', data.weekly),
      `  Per-transaction limit: ${data.per_transaction_limit !== undefined ? '$' + data.per_transaction_limit : 'not set'}`,
    ].join('\n')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message
      return `Failed to get agent status: ${body}`
    }
    return `Failed to get agent status: ${String(err)}`
  }
}
