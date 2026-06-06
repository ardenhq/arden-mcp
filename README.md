# @ardensh/mcp

Your AI agents can now pay for things — provision and manage them without leaving your AI assistant.

Arden gives each agent its own wallet and a budget. This MCP server lets you set that up via natural language in Claude Desktop, Cursor, Claude Code, or any MCP-compatible client. No CLI needed.

> "Provision a new agent called researcher with a $200 monthly budget, only allowed to call exa.ai and browserbase.io"

## Tools

| Tool | Description |
|---|---|
| `arden_provision_agent` | Create a new agent with a wallet, budget limits, and vendor restrictions |
| `arden_list_agents` | List all agents with spend and budget usage |
| `arden_agent_status` | Detailed status and budget breakdown for a specific agent |
| `arden_update_agent` | Adjust an agent's budgets, allowed vendors, or pause it |
| `arden_fund_agent` | Get wallet address and USDC funding instructions |

## Setup

### 1. Add to Claude Desktop

Add this to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "arden": {
      "command": "npx",
      "args": ["-y", "@ardensh/mcp"],
      "env": {
        "ARDEN_API_KEY": "arden_live_..."
      }
    }
  }
}
```

Get your `ARDEN_API_KEY` by running `arden login` (see below), or find it at [arden.sh](https://arden.sh).

### 2. Add to Claude Code

```bash
claude mcp add arden -e ARDEN_API_KEY=arden_live_... npx -y @ardensh/mcp
```

### 3. Add to Cursor

Add the same block as the Claude Desktop config above to **Settings → MCP**.

## Authentication

The server looks for credentials in this order:

1. `ARDEN_API_KEY` environment variable
2. `~/.arden/config.json` (written by `arden login`)

If you've already installed the Arden CLI and run `arden login`, no env var is needed.

```bash
npm install -g @ardensh/cli
arden login
```

## Development

```bash
npm install
npm run dev      # run with tsx (no build step)
npm run build    # compile to dist/
```
