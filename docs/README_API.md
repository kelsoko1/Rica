# Rica API - Endpoints Overview

Base path: /api

## GET /api/threat-actors
Returns a list of threat actors proxied from OpenCTI GraphQL.
Query params:
- first (optional) - integer page size

## POST /api/simulate
Launches a BAS simulation (via OpenBAS/Camoufox).
Body:
{
  "org": "org-id",
  "name": "Simulation name",
  "target": { ... },
  "scenario": { ... }
}

Response: { result: <openbas response>, credits: <remaining> }

## POST /api/starry
Sends a prompt to Ollama (Starry copilot).
Body:
{
  "org": "org-id",
  "prompt": "Investigate phishing attempts against finance"
}

Response: { reply: <ollama response or fallback>, credits: <remaining> }

## GET /api/wallet
Query params:
- org (optional)

Returns wallet credits.

## POST /api/wallet/refill
Body: { org: "demo", amount: 100 }
