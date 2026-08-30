# Legacy Vite Client

This directory contains Chat Engine's original React, TypeScript, Vite, and Redux interface. It remains in the repository as a migration reference and as documentation of the backend contracts consumed by the first client.

New interface work belongs in [`../web`](../web). See the [root README](../README.md) and [`../docs/next-architecture.md`](../docs/next-architecture.md) for the current application architecture.

## Run the legacy client

Start the Express backend on port `5000`, then:

```bash
npm install
npm run dev
```

The client proxies API calls to `http://localhost:5000` as configured in `package.json`.
