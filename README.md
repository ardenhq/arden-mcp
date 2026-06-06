# @arden/mcp

MCP server for managing [Arden](https://arden.xyz) AI agent spend controls. Lets Claude Desktop, Cursor, and other MCP-compatible AI clients provision and manage Arden agents via natural language.

## Tools

| Tool | Description |
|---|---|
| `arden_provision_agent` | Create a new agent with budget limits and vendor restrictions |
| `arden_list_agents` | List all agents with budget usage |
| `arden_agent_status` | Detailed status for a specific agent |
| `arden_fund_agent` | Get wallet address and USDC funding instructions |

## Usage with Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "arden": {
      "command": "npx",
      "args": ["-y", "@arden/mcp"],
      "env": {
        "ARDEN_API_KEY": "arden_live_..."
      }
    }
  }
}
```

`ARDEN_API_KEY` is optional if you have already run `arden login` on the same machine — the server will fall back to `~/.arden/config.json`.

## Usage with Cursor

Add the same block to your Cursor MCP settings under **Settings → MCP**.

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
