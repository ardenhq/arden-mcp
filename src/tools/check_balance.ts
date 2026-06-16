import axios from 'axios'
import { getApiKey, API_BASE } from '../auth.js'

const USDC_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDC_TESTNET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

const RUNTIME_BASE = process.env.ARDEN_RUNTIME_URL ?? 'https://api.arden.sh'
const IS_TESTNET = RUNTIME_BASE.includes('test')

const USDC_ADDRESS = IS_TESTNET ? USDC_TESTNET : USDC_MAINNET
const RPC_URL = IS_TESTNET ? 'https://sepolia.base.org' : 'https://mainnet.base.org'
const BASESCAN_BASE = IS_TESTNET
  ? 'https://sepolia.basescan.org/address'
  : 'https://basescan.org/address'

function buildBalanceOfCall(walletAddress: string): string {
  const selector = '0x70a08231'
  const paddedAddress = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0')
  return selector + paddedAddress
}

function hexToUsdc(hex: string): number {
  return Number(BigInt(hex)) / 1_000_000
}

export async function checkBalance(agentName: string): Promise<string> {
  const apiKey = getApiKey()

  let walletAddress: string
  try {
    const { data } = await axios.get(`${API_BASE}/agents/${encodeURIComponent(agentName)}`, {
      headers: { 'X-API-Key': apiKey },
    })
    walletAddress = data.wallet_address
    if (!walletAddress || walletAddress.startsWith('0x_pending')) {
      return `Agent "${agentName}" does not have a wallet provisioned yet.`
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return `Agent "${agentName}" not found.`
    }
    return `Failed to fetch agent: ${String(err)}`
  }

  try {
    const { data } = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        { to: USDC_ADDRESS, data: buildBalanceOfCall(walletAddress) },
        'latest',
      ],
      id: 1,
    })

    if (data.error) {
      return `RPC error: ${JSON.stringify(data.error)}`
    }

    const balance = hexToUsdc(data.result)
    const network = IS_TESTNET ? 'Base Sepolia (testnet)' : 'Base mainnet'

    return [
      `Agent: ${agentName}`,
      `Wallet: ${walletAddress}`,
      `Balance: $${balance.toFixed(6)} USDC`,
      `Network: ${network}`,
      ``,
      `View on Basescan: ${BASESCAN_BASE}/${walletAddress}`,
    ].join('\n')
  } catch (err) {
    return `Failed to fetch balance: ${String(err)}`
  }
}
