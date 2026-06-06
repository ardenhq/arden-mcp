import Conf from 'conf'
import os from 'os'

const store = new Conf({ projectName: 'arden', cwd: os.homedir() + '/.arden' })

export function getApiKey(): string {
  const fromEnv = process.env.ARDEN_API_KEY
  if (fromEnv) return fromEnv
  const fromConfig = store.get('apiKey') as string | undefined
  if (fromConfig) return fromConfig
  throw new Error('Not authenticated. Set ARDEN_API_KEY or run `arden login`.')
}

export const API_BASE = 'https://ir7hdqp3ei.execute-api.us-east-1.amazonaws.com/prod'
