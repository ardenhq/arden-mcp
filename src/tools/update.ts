import axios from 'axios'
import { getApiKey, API_BASE } from '../auth.js'

interface UpdateInput {
  name: string
  monthly_budget?: number
  daily_budget?: number
  weekly_budget?: number
  per_transaction_limit?: number
  allowed_vendors?: string
  status?: string
}

export async function updateAgent(input: UpdateInput): Promise<string> {
  const { name, monthly_budget, daily_budget, weekly_budget, per_transaction_limit, allowed_vendors, status } = input

  const body: Record<string, unknown> = {}
  if (monthly_budget !== undefined) body.monthly_budget = monthly_budget
  if (daily_budget !== undefined) body.daily_budget = daily_budget
  if (weekly_budget !== undefined) body.weekly_budget = weekly_budget
  if (per_transaction_limit !== undefined) body.per_transaction_limit = per_transaction_limit
  if (allowed_vendors !== undefined) body.allowed_vendors = allowed_vendors
  if (status !== undefined) body.status = status

  if (Object.keys(body).length === 0) {
    return 'Provide at least one field to update.'
  }

  const apiKey = getApiKey()

  try {
    await axios.patch(`${API_BASE}/agents/${encodeURIComponent(name)}`, body, {
      headers: { 'X-API-Key': apiKey },
    })

    const changed = Object.entries(body)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n')
    return `Agent "${name}" updated successfully:\n${changed}`
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const data = err.response?.data
      if (status === 404) return `Agent '${name}' not found.`
      if (status === 400) return `Bad request: ${typeof data === 'object' ? JSON.stringify(data) : data ?? err.message}`
      if (status === 401 || status === 403) return 'Not authenticated. Set ARDEN_API_KEY or run `arden login`.'
      return `Failed to update agent: ${typeof data === 'object' ? JSON.stringify(data) : data ?? err.message}`
    }
    return `Failed to update agent: ${String(err)}`
  }
}
