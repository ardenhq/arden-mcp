# @ardensh/mcp

MCP server for managing [Arden](https://arden.sh) AI agent spend controls. Lets Claude Desktop, Cursor, Claude Code, and other MCP-compatible AI clients provision and manage Arden agents via natural language.

> npm package: `@ardensh/mcp`

## Tools

| Tool | Description |
|---|---|
| `arden_provision_agent` | Create a new agent with budget limits and vendor restrictions |
| `arden_list_agents` | List all agents with budget usage |
| `arden_agent_status` | Detailed status and budget breakdown for a specific agent |
| `arden_update_agent` | Update an agent's budgets, allowed vendors, or status |
| `arden_fund_agent` | Get wallet address and USDC funding instructions |

## Prerequisites

Install the Arden CLI and log in to generate your API key:

```bash
npm install -g @arden/cli
arden login
```

This writes your API key to `~/.arden/config.json`, which the MCP server reads automatically. You can skip the `ARDEN_API_KEY` env var if you've already done this.

## Usage with Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

`ARDEN_API_KEY` is optional if you have already run `arden login` on the same machine.

## Usage with Claude Code

```bash
claude mcp add arden npx -y @ardensh/mcp
```

If you haven't run `arden login`, pass your key via env:

```bash
claude mcp add arden -e ARDEN_API_KEY=arden_live_... npx -y @ardensh/mcp
```

## Usage with Cursor

Add the same block as the Claude Desktop config above to your Cursor MCP settings under **Settings → MCP**.

## Authentication

The server looks for credentials in this order:

1. `ARDEN_API_KEY` environment variable
2. `~/.arden/config.json` (written by `arden login`)

If neither is found, tool calls return a clear error message rather than crashing.

## Development

```bash
npm install
npm run dev      # run with tsx (no build step)
npm run build    # compile to dist/
```
