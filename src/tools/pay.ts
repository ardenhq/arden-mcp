import axios from 'axios'
import { getAgentKey } from './provision.js'

const RUNTIME_BASE = process.env.ARDEN_RUNTIME_URL ?? 'https://api.arden.sh'

interface PayInput {
  agent: string
  vendor: string
  amount: number
  to: string
}

export async function pay(input: PayInput): Promise<string> {
  const { agent, vendor, amount, to } = input

  let agentKey = process.env.ARDEN_AGENT_KEY
  if (!agentKey) {
    agentKey = getAgentKey(agent)
  }
  if (!agentKey) {
    return `No agent key found for "${agent}". Either set ARDEN_AGENT_KEY or provision the agent via this MCP first.`
  }

  const headers = { 'X-API-Key': agentKey, 'Content-Type': 'application/json' }

  let checkResult: { decision: string; reason?: string; remaining?: number; limit?: number }
  try {
    const { data } = await axios.post(
      `${RUNTIME_BASE}/payment/check`,
      { vendor, amount },
      { headers }
    )
    checkResult = data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return `Payment check failed: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`
    }
    return `Payment check failed: ${String(err)}`
  }

  if (checkResult.decision === 'block') {
    const reason = checkResult.reason ?? 'unknown'
    const messages: Record<string, string> = {
      agent_paused: `Agent "${agent}" is paused. Resume it with arden_update_agent before paying.`,
      vendor_not_allowed: `Vendor "${vendor}" is not in the agent's allowlist.`,
      per_transaction_limit_exceeded: `Amount $${amount} exceeds the per-transaction limit of $${checkResult.limit}.`,
      monthly_budget_exceeded: `Monthly budget exceeded. Remaining: $${checkResult.remaining?.toFixed(2) ?? 0}.`,
      daily_budget_exceeded: `Daily budget exceeded. Remaining: $${checkResult.remaining?.toFixed(2) ?? 0}.`,
      weekly_budget_exceeded: `Weekly budget exceeded. Remaining: $${checkResult.remaining?.toFixed(2) ?? 0}.`,
    }
    return messages[reason] ?? `Payment blocked: ${reason}`
  }

  try {
    const { data } = await axios.post(
      `${RUNTIME_BASE}/payment/execute`,
      { to, amount, vendor },
      { headers }
    )
    return [
      `Payment successful.`,
      `Agent: ${agent}`,
      `Vendor: ${vendor}`,
      `Amount: $${amount} USDC`,
      `Transaction: ${data.tx_hash}`,
      ``,
      `View on Basescan: https://basescan.org/tx/${data.tx_hash}`,
    ].join('\n')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return `Payment execution failed: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`
    }
    return `Payment execution failed: ${String(err)}`
  }
}
