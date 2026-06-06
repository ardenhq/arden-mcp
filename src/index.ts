#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { provisionAgent } from './tools/provision.js'
import { listAgents } from './tools/list.js'
import { agentStatus } from './tools/status.js'
import { fundAgent } from './tools/fund.js'
import { updateAgent } from './tools/update.js'

const server = new McpServer({
  name: 'arden',
  version: '0.1.0',
})

server.tool(
  'arden_provision_agent',
  'Provision a new Arden AI agent with spend controls and vendor restrictions',
  {
    name: z.string().describe('Agent name: 3-50 chars, alphanumeric + hyphens only'),
    monthly_budget: z.number().optional().describe('Monthly spend budget in USD'),
    daily_budget: z.number().optional().describe('Daily spend budget in USD'),
    weekly_budget: z.number().optional().describe('Weekly spend budget in USD'),
    per_transaction_limit: z.number().optional().describe('Per-transaction spend limit in USD'),
    allowed_vendors: z
      .string()
      .describe('Comma-separated vendor domains, or "*" for all vendors'),
  },
  async (input) => {
    const text = await provisionAgent(input)
    return { content: [{ type: 'text', text }] }
  }
)

server.tool(
  'arden_list_agents',
  'List all Arden agents with their status and budget usage',
  {},
  async () => {
    const text = await listAgents()
    return { content: [{ type: 'text', text }] }
  }
)

server.tool(
  'arden_agent_status',
  'Get detailed status and budget breakdown for a specific Arden agent',
  {
    name: z.string().describe('Name of the agent to inspect'),
  },
  async ({ name }) => {
    const text = await agentStatus(name)
    return { content: [{ type: 'text', text }] }
  }
)

server.tool(
  'arden_fund_agent',
  'Get wallet address and funding instructions for an Arden agent',
  {
    name: z.string().describe('Name of the agent to fund'),
  },
  async ({ name }) => {
    const text = await fundAgent(name)
    return { content: [{ type: 'text', text }] }
  }
)

server.tool(
  'arden_update_agent',
  "Update an existing agent's budget limits, allowed vendors, or status",
  {
    name: z.string().describe('Name of the agent to update'),
    monthly_budget: z.number().optional().describe('New monthly budget in USD'),
    daily_budget: z.number().optional().describe('New daily budget in USD'),
    weekly_budget: z.number().optional().describe('New weekly budget in USD'),
    per_transaction_limit: z.number().optional().describe('New per-transaction limit in USD'),
    allowed_vendors: z.string().optional().describe('Comma-separated vendor domains, or "*" for all'),
    status: z.enum(['active', 'paused']).optional().describe('Set agent status to active or paused'),
  },
  async (input) => {
    const text = await updateAgent(input)
    return { content: [{ type: 'text', text }] }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
