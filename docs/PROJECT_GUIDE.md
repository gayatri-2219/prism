# Project Guide (In-Depth)

## 1. Project Purpose

Initia Action Engine (IAE, branded in UI as Prism) is a full-stack prototype for turning idle balances into clear, guided DeFi actions on an Initia-compatible appchain.

The repository currently delivers:
- A production-track frontend (`prism-frontend/`) with page-based product UX.
- A treasury/action smart contract (`prism/src/PrismTreasury.sol`) for deposit, withdraw, and risk updates.
- Helper automation scripts for relayer and OPInit setup (`*.exp`).
- An additional exploratory frontend (`iae-frontend/`) that is currently scaffold-level.

## 2. Monorepo Layout

```text
.
├── README.md
├── .initia/
│   └── submission.json
├── prism/
│   ├── foundry.toml
│   ├── contract.bin
│   ├── deploy.json
│   ├── src/
│   │   └── PrismTreasury.sol
│   └── test/
│       └── PrismTreasury.t.sol.bak
├── prism-frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── PrismApp.jsx
│       ├── styles.css
│       └── assets/
├── iae-frontend/
│   └── ... (Vite + React scaffold app)
├── opinit_setup.exp
└── relayer_setup.exp
```

## 3. Product Surfaces and Responsibilities

### `prism-frontend/` (Primary User Product)

Core pages are defined in `src/App.jsx` and rendered through `src/PrismApp.jsx`:
- `Guide`: onboarding and problem framing.
- `Action Feed`: recommendation-style opportunity cards.
- `Execute`: contract interaction + bridge entry.
- `Autopilot`: local guardrail configuration and preview state.
- `Leaderboard`: social proof + copy strategy UX.
- `Architecture`: in-product technical explainer.

### `prism/` (Smart Contract Layer)

`PrismTreasury.sol` stores per-user position state:
- `balance` (`uint256`)
- `riskScore` (`uint8`, valid 1-100)
- `lastUpdated` (`uint64`)

Available external methods:
- `deposit(uint8 riskScore)` payable
- `withdraw(uint256 amount)`
- `updateRiskScore(uint8 riskScore)`
- `myPosition()`
- `positionOf(address user)`
- `receive()` payable fallback (uses existing score or defaults to 50)

## 4. Environment and Config Contract

`prism-frontend` is driven by Vite env variables (`VITE_*`) read in `src/PrismApp.jsx` and `src/main.jsx`.

Required/important variables:
- `VITE_APPCHAIN_ID`: target appchain id used in tx requests.
- `VITE_JSON_RPC_URL`: EVM JSON-RPC endpoint for `eth_call` reads.
- `VITE_PRISM_TREASURY_CONTRACT`: deployed contract address.
- `VITE_NATIVE_DENOM`: fee/staking denom for custom chain metadata.
- `VITE_NATIVE_SYMBOL`: display symbol for UI balances.
- `VITE_NATIVE_DECIMALS`: token decimals (default 18 in UI).
- `VITE_BRIDGE_SRC_CHAIN_ID`: source chain passed to `openBridge`.
- `VITE_BRIDGE_SRC_DENOM`: source denom passed to `openBridge`.

Suggested `.env` template for local dev (`prism-frontend/.env`):

```bash
VITE_APPCHAIN_ID=your-appchain-id
VITE_JSON_RPC_URL=https://json-rpc.testnet.initia.xyz
VITE_REST_URL=https://rest.testnet.initia.xyz
VITE_RPC_URL=https://rpc.testnet.initia.xyz
VITE_INDEXER_URL=https://indexer.testnet.initia.xyz
VITE_PRISM_TREASURY_CONTRACT=0xYourContractAddress
VITE_NATIVE_DENOM=uinit
VITE_NATIVE_SYMBOL=GAS
VITE_NATIVE_DECIMALS=18
VITE_BRIDGE_SRC_CHAIN_ID=initiation-2
VITE_BRIDGE_SRC_DENOM=uinit
```

## 5. Local Development Setup

### Prerequisites
- Node.js + npm
- Foundry (`forge`, `cast`, `anvil`) for contract workflow
- Initia-compatible runtime / appchain endpoints
- Wallet supported by InterwovenKit

### Run frontend

```bash
cd prism-frontend
npm install
npm run dev
```

### Build frontend

```bash
cd prism-frontend
npm run build
npm run preview
```

### Contract workspace

```bash
cd prism
# foundry.toml points to src/, test/, out/
```

Note: the existing test file is `PrismTreasury.t.sol.bak` (backup suffix), so it may not run until renamed to `.t.sol`.

## 6. Runtime Behavior (Current)

### Wallet integration
- `useInterwovenKit()` provides `initiaAddress`, `openConnect`, `openWallet`, `openBridge`, `requestTxBlock`, and optional `username`.
- Sidebar and feed show connected wallet label (username when available).

### Read path
- `fetchPosition()` in `PrismApp.jsx` builds ABI call data for `myPosition`.
- Sends direct JSON-RPC `eth_call` to `VITE_JSON_RPC_URL`.
- Polls every 8 seconds while app is mounted.

### Write path
- `submitTransaction()` uses `requestTxBlock` and `/minievm.evm.v1.MsgCall`.
- `sender` is bech32 `initiaAddress`.
- `contractAddr` is EVM hex address.
- Methods triggered by UI:
  - Deposit
  - Withdraw
  - Update risk score

### Autopilot behavior (prototype)
- Local-only settings state in browser `localStorage` under `iae-autopilot-settings`.
- Controls include max amount, min APY, risk level, duration.
- No backend or session-key executor is wired yet.

## 7. What Is Production-Like vs Prototype

Production-like today:
- Structured UX, navigation, and page model.
- Wallet connect + wallet drawer flows.
- Contract reads/writes from frontend.
- Bridge modal entry path.

Prototype/placeholder today:
- Recommendation feed data (currently static UI data).
- Leaderboard data (currently static UI data + local projection).
- Autopilot execution automation.
- End-to-end strategy router contract.

## 8. Operational Scripts

Two `expect` scripts automate setup prompts:
- `opinit_setup.exp`: scripted answers for `weave opinit init executor`.
- `relayer_setup.exp`: scripted answers for `weave relayer init`.

These are convenience bootstrapping scripts and should be verified for environment-specific endpoints before reuse.

## 9. Risks and Engineering Gaps

- Contract is minimal treasury primitive, not yet a multi-protocol router.
- No dedicated API/indexer service in repo for dynamic feed ranking.
- No CI pipelines/versioned release process in current repo.
- Test file naming indicates tests may be intentionally parked.
- `iae-frontend/` and `prism-frontend/` overlap in theme and should be unified or explicitly separated by purpose.

## 10. Suggested Next Milestones

1. Harden contract layer with complete Foundry test suite and threat-model tests.
2. Add backend recommendation service (yield/airdrop/market signal ingestion).
3. Integrate session-key based autopilot execution with explicit permissions.
4. Add API contracts and typed client layer between frontend and intelligence service.
5. Add CI gates (lint/build/test) and environment-specific deploy playbooks.
