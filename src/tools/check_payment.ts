import axios from 'axios'
import { getAgentKey } from './provision.js'

const RUNTIME_BASE = process.env.ARDEN_RUNTIME_URL ?? 'https://api.arden.sh'

interface CheckPaymentInput {
  agent: string
  vendor: string
  amount: number
}

export async function checkPayment(input: CheckPaymentInput): Promise<string> {
  const { agent, vendor, amount } = input

  let agentKey = process.env.ARDEN_AGENT_KEY
  if (!agentKey) {
    agentKey = getAgentKey(agent)
  }
  if (!agentKey) {
    return `No agent key found for "${agent}". Either set ARDEN_AGENT_KEY or provision the agent via this MCP first.`
  }

  try {
    const { data } = await axios.post(
      `${RUNTIME_BASE}/payment/check`,
      { vendor, amount },
      { headers: { 'X-API-Key': agentKey, 'Content-Type': 'application/json' } }
    )

    if (data.decision === 'allow') {
      return [
        `Payment allowed.`,
        `Agent: ${agent}`,
        `Vendor: ${vendor}`,
        `Amount: $${amount} USDC`,
        ``,
        `Ready to pay. Call arden_pay to execute.`,
      ].join('\n')
    }

    const reason = data.reason ?? 'unknown'
    const messages: Record<string, string> = {
      agent_paused: `Blocked: agent "${agent}" is paused.`,
      vendor_not_allowed: `Blocked: "${vendor}" is not in the agent's allowlist.`,
      per_transaction_limit_exceeded: `Blocked: $${amount} exceeds the per-transaction limit of $${data.limit}.`,
      monthly_budget_exceeded: `Blocked: monthly budget exceeded. Remaining: $${data.remaining?.toFixed(2) ?? 0}.`,
      daily_budget_exceeded: `Blocked: daily budget exceeded. Remaining: $${data.remaining?.toFixed(2) ?? 0}.`,
      weekly_budget_exceeded: `Blocked: weekly budget exceeded. Remaining: $${data.remaining?.toFixed(2) ?? 0}.`,
    }
    return messages[reason] ?? `Blocked: ${reason}`
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return `Check failed: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`
    }
    return `Check failed: ${String(err)}`
  }
}
