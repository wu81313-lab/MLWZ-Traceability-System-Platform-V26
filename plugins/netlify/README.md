# Netlify Plugin

This plugin connects Codex to Netlify using Netlify's official MCP server.

## What it includes

- A plugin manifest at `.codex-plugin/plugin.json`
- An MCP configuration at `.mcp.json`
- A reusable Netlify workflow skill under `skills/netlify/`

## Prerequisites

- Node.js 22 or higher
- A Netlify account
- Netlify authentication through the MCP server or Netlify CLI

## Notes

- The MCP configuration uses `npx -y @netlify/mcp`.
- Do not commit a `NETLIFY_PERSONAL_ACCESS_TOKEN` into this repository.
