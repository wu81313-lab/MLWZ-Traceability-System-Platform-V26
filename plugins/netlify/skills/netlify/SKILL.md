---
name: netlify
description: Use Netlify's official MCP server to create, deploy, inspect, and manage Netlify projects from Codex.
---

# Netlify

Use this skill when the user wants to deploy a site to Netlify, inspect deploy status, manage environment variables, link a local project to a site, or troubleshoot Netlify delivery workflows.

## Workflow

1. Confirm the project type and likely publish directory.
2. Prefer the official Netlify MCP server configured in `../../.mcp.json`.
3. If the site is static and no build system is present, treat the repo root or the directory containing `index.html` as the publish directory.
4. If the project has a framework build, identify the real output folder before deploying.
5. Never commit a personal access token or other Netlify secret into the repository.

## Publish directory hints

- `dist/` for many Vite or bundler projects
- `build/` for some React or static build workflows
- `public/` for some static exports
- repo root when the project directly ships `index.html` and assets without a build step

## Good default tasks

- Create or link a Netlify site for this project
- Deploy the current workspace to Netlify
- Check the latest production or preview deploy
- Add or inspect Netlify environment variables
- Troubleshoot build or auth failures

## Safety

- Keep tokens out of committed files.
- If authentication is needed, prefer interactive login or local environment variables.
- Ask before changing production-facing configuration that could affect a live site.
