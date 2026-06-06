import axios from 'axios'
import { getApiKey, API_BASE } from '../auth.js'

interface AgentDetail {
  wallet_address?: string
  [key: string]: unknown
}

export async function fundAgent(name: string): Promise<string> {
  const apiKey = getApiKey()

  try {
    const { data } = await axios.get<AgentDetail>(`${API_BASE}/agents/${encodeURIComponent(name)}`, {
      headers: { 'X-API-Key': apiKey },
    })

    const wallet = data.wallet_address
    if (!wallet) {
      return `Agent "${name}" does not have a wallet address yet.`
    }

    return [
      `Funding instructions for agent "${name}":`,
      '',
      `Wallet address: ${wallet}`,
      '',
      'To fund this agent:',
      '  1. Send USDC to the wallet address above.',
      '  2. Network: Base mainnet (chain ID 8453).',
      '  3. Token: USDC (native USDC on Base, not bridged).',
      '',
      'The agent will use this wallet for x402 payments when making API calls on your behalf.',
      'Funds are available immediately after the transaction is confirmed on-chain.',
    ].join('\n')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message
      return `Failed to retrieve agent wallet: ${body}`
    }
    return `Failed to retrieve agent wallet: ${String(err)}`
  }
}
