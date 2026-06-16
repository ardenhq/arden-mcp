import axios from 'axios'
import Conf from 'conf'
import os from 'os'
import { getApiKey, API_BASE } from '../auth.js'

const agentKeyStore = new Conf({
  projectName: 'arden',
  cwd: os.homedir() + '/.arden',
  configName: 'agent-keys',
})

export function saveAgentKey(name: string, agentKey: string): void {
  agentKeyStore.set(name, agentKey)
}

export function getAgentKey(name: string): string | undefined {
  return agentKeyStore.get(name) as string | undefined
}

export const provisionAgentSchema = {
  name: { type: 'string' as const, description: 'Agent name: 3-50 chars, alphanumeric + hyphens only' },
  monthly_budget: { type: 'number' as const, description: 'Monthly spend budget in USD' },
  daily_budget: { type: 'number' as const, description: 'Daily spend budget in USD' },
  weekly_budget: { type: 'number' as const, description: 'Weekly spend budget in USD' },
  per_transaction_limit: { type: 'number' as const, description: 'Per-transaction spend limit in USD' },
  allowed_vendors: { type: 'string' as const, description: 'Comma-separated vendor domains, or "*" for all vendors' },
}

export const provisionAgentRequired = ['name', 'allowed_vendors'] as const

interface ProvisionInput {
  name: string
  monthly_budget?: number
  daily_budget?: number
  weekly_budget?: number
  per_transaction_limit?: number
  allowed_vendors: string
}

export async function provisionAgent(input: ProvisionInput): Promise<string> {
  const { name, monthly_budget, daily_budget, weekly_budget, per_transaction_limit, allowed_vendors } = input

  if (!/^[a-zA-Z0-9-]{3,50}$/.test(name)) {
    return 'Invalid agent name. Must be 3-50 characters, alphanumeric and hyphens only.'
  }

  if (!monthly_budget && !daily_budget && !weekly_budget) {
    return 'At least one budget field is required: monthly_budget, daily_budget, or weekly_budget.'
  }

  const apiKey = getApiKey()

  const body: Record<string, unknown> = { name, allowed_vendors }
  if (monthly_budget !== undefined) body.monthly_budget = monthly_budget
  if (daily_budget !== undefined) body.daily_budget = daily_budget
  if (weekly_budget !== undefined) body.weekly_budget = weekly_budget
  if (per_transaction_limit !== undefined) body.per_transaction_limit = per_transaction_limit

  try {
    const { data } = await axios.post(`${API_BASE}/agents`, body, {
      headers: { 'X-API-Key': apiKey },
    })

    const { wallet_address, agent_key } = data
    saveAgentKey(name, agent_key)
    return [
      `Agent "${name}" provisioned successfully.`,
      `Wallet address: ${wallet_address}`,
      `Agent API key: ${agent_key}`,
      '',
      'IMPORTANT: Save the agent API key — it will not be shown again.',
    ].join('\n')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message
      return `Failed to provision agent: ${body}`
    }
    return `Failed to provision agent: ${String(err)}`
  }
}
