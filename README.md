# QuantumNexus

> **Post-quantum cryptography migration inventory and readiness workbench.**

[![CI](https://github.com/shivang-jindal/QuantumNexus/actions/workflows/ci.yml/badge.svg)](https://github.com/shivang-jindal/QuantumNexus/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-lightgrey)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vite.dev/)

---

## What it is

QuantumNexus is a deterministic quantum-network twin you can browse, compare,
and stress-test. Every node is a pure function of its seed: key rate, fidelity,
QBER, reach, entanglement rate, and failover all derive from the same 32-bit
value. Share the seed and anyone reconstructs the same quantum network.

The repository is a complete open-source product:

- **Client** — React 18, Vite 6, TypeScript, Tailwind v4, React Router, TanStack Query
- **Server** — Express 4, Zod-validated API, structured logging, security middleware
- **Shared** — one Zod schema and constant catalogue for runtime and types
- **Engine** — pure functions, no database required, fully reproducible

## Quantum protocol studies

QuantumNexus supports exploratory quantum-network and protocol planning. Create a named study with a seed and explicit assumptions, run a link or security scenario using that seed, and retain/export its model report. The catalogue and outputs are illustrative simulations; they are not live device measurements, cryptographic security proofs, or deployment advice. Studies are stored in `.data/workspaces.json` (override with `WORKSPACE_FILE`) on the server installation. This file is single-installation storage, not accounts or cloud collaboration.

---

## Current implementation and limits

The Cryptographic Inventory records systems, owners, algorithms, protocols, sensitivity, long-lived-data flags, migration status, target standards, and dates in a local workspace. It stores metadata only: never enter keys, secrets, credentials, or private certificate material. The standards references cover NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, and FIPS 205 SLH-DSA. Inventory completion does not prove compliance, cryptographic safety, or migration readiness. The quantum network catalogue and scenario simulator remain illustrative and are not hardware measurements or security proofs.

Some sections below describe the original product vision and aspirational capabilities. They are not a claim that those functions are implemented. See [SPEC.md](SPEC.md) for the vision and this section for present behavior.

## Features

### Quantum atlas
1. **Node catalogue** — 14 QKD links, repeaters, satellites, sensors, QRNG beacons, processors, and PQC gateways.
2. **Search and filters** — by free text, category, region, and link state.
3. **Risk ranking** — deterministic risk score derived from state and seed.
4. **Node dossier** — summary, six link metrics, a 12-point history, and related nodes.
5. **Portfolio analytics** — totals by state and category, average risk, top five exposures.
6. **Shareable views** — encode the current node and filters into a URL-safe token.

### Deterministic photonics
7. **Seeded PRNG** — FNV-1a seed derivation plus Mulberry32, identical on every platform.
8. **Network archetypes** — fibre QKD, free-space satellite, repeater chains, sensors, entropy sources, processors, and gateways.
9. **Link-state model** — locked, drifting, and compromised nodes with distinct risk behaviour.
10. **History series** — a comparable 12-period fidelity trend per node.
11. **Related-node graph** — category neighbours plus cross-category discovery.
12. **Seed explanation** — the assistant describes exactly how the seed propagates.

### Simulation lab
13. **Six network scenarios** — link degradation, eavesdropper, repeater failure, satellite pass, entanglement purification, and key rotation.
14. **Intensity and horizon controls** — 0–1 intensity over 1–72 simulated hours.
15. **Impact scoring** — severity-weighted, bounded 0–100.
16. **Timeline projection** — availability, load, and risk at seven checkpoints.
17. **Cascade analysis** — affected nodes with per-node severity.
18. **Actionable recommendations** — three protocol-aware steps per scenario.

### Assistant and integrations
19. **Intent-aware quantum engineer** — focuses nodes, opens pages, and queues simulations from natural language.
20. **Structured API** — every capability is available headlessly under `/api/v1`.

---

## Quick start

Prerequisites: **Node 20.11+**, **npm 10+**.

```bash
git clone https://github.com/shivang-jindal/QuantumNexus.git
cd QuantumNexus
npm install
npm run dev
```

- Web: <http://localhost:5173>
- API: <http://localhost:4000/health>

Copy `.env.example` to `.env` to change ports, CORS origins, or logging.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + web with prefixed output |
| `npm run dev:server` | API only (tsx watch) |
| `npm run dev:client` | Vite dev server only |
| `npm run typecheck` | Shared build, then server and client type-checks |
| `npm run lint` | ESLint over the whole workspace |
| `npm test` | Vitest unit + integration suite |
| `npm run build` | Production build for shared, server, and client |
| `npm run verify` | The full gate: typecheck → lint → test → build |
| `npm run smoke` | Post-deployment smoke test against a running API |

---

## API

All endpoints are under `/api/v1` and validate input with Zod.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness/uptime probe |
| `GET` | `/api/v1/version` | Service name and API version |
| `GET` | `/api/v1/capabilities` | Categories, regions, metrics, actions |
| `GET` | `/api/v1/catalog` | Search and filter nodes |
| `GET` | `/api/v1/catalog/:id` | Detail with history and related nodes |
| `GET` | `/api/v1/analytics/summary` | Portfolio analytics |
| `POST` | `/api/v1/simulate` | Run a deterministic intervention |
| `POST` | `/api/v1/ai/chat` | Quantum-engineer reply plus actions |
| `POST` | `/api/v1/share-links` | Encode a shareable view |
| `GET` | `/api/v1/share-links/:token` | Decode a shareable view |

Validation failures return `400` with a machine-readable `issues` array.
Unknown routes return a structured `404`, and unexpected failures never leak
internals.

---

## Architecture

```
QuantumNexus/
├── client/                 # React 18 + Vite 6 + Tailwind v4
│   └── src/
│       ├── components/     # shell, quantum globe, sparkline, toasts
│       ├── pages/          # overview, atlas, simulator, engineer, settings
│       └── store/          # Zustand filters and selection
├── server/
│   └── src/
│       ├── domain/engine.ts  # deterministic link budget + simulation
│       ├── http/             # routes and middleware
│       └── app.ts            # testable Express factory
├── shared/                 # Zod schemas, catalogue, derived types
└── scripts/                # dev launcher, verify pipeline, smoke test
```

`createApp({ config, logger })` keeps the HTTP layer testable without binding a
port; the engine has no I/O and can be imported anywhere.

---

## Testing

The suite covers deterministic generation, filtering, pagination, risk scoring,
simulation bounds, share-link round-trips, assistant intents, validation, and
every public endpoint:

```bash
npm test
```

---

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and
the [Code of Conduct](CODE_OF_CONDUCT.md). Security reports go through
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Shivang Jindal
