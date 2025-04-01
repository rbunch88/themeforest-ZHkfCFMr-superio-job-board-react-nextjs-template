# Error Log

## 2025-03-31 19:02 UTC-5

**Issue:** MCP Server Connection Failure - Unsupported Node.js Version

**Error Message Snippet:**
`npm warn EBADENGINE Unsupported engine { package: '@gregnr/postgres-meta@0.82.0-dev.2', required: { node: '>=20', npm: '>=9' }, current: { node: 'v18.20.5', npm: '10.8.2' } }`

**Context:** Attempting to connect to an MCP server (`@gregnr/postgres-meta`) failed due to the current Node.js version (v18.20.5) being lower than the required version (>=v20).

**Resolution:** Update Node.js to version 20 or later. Recommended method is using nvm:
1. `nvm install 20`
2. `nvm use 20`
3. `nvm alias default 20` (Optional)
4. Verify with `node -v`