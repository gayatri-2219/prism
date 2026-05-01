# PRISM

PRISM is an Initia-native DeFi assistant that helps users discover opportunities, execute on-chain actions, and track airdrop progress in one workflow.

## Live Demo

- Frontend: https://prism-frontend-ten.vercel.app

## Key Features

- Wallet connection via `@initia/interwovenkit-react`
- Discover page with live airdrop campaigns and step tracking
- Dashboard with wallet balance, contract position, risk score, and transactions
- Backend APIs for opportunities, portfolio, positions, and airdrops
- AI guidance mode with provider support and local fallback logic
- MiniEVM contract interaction flows (deposit/withdraw/risk updates)

## Tech Stack

- Frontend: Vite, React, TypeScript, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma
- Smart Contracts: Solidity + Foundry
- Chain: Initia testnet (InterwovenKit + Initia RPC/REST/Indexer)
- Deploy: Vercel

## Monorepo Structure

```text
.
├── prism-frontend/   # React frontend
├── backend/          # Express + Prisma APIs
├── prism/            # Solidity contracts + Foundry tests
└── docs/             # Product and architecture docs
```

## API Overview

- `GET /api/opportunities`
- `GET /api/portfolio/:address`
- `GET /api/positions/:address`
- `GET /api/airdrops`
- `GET /api/airdrops/:address`
- `POST /api/airdrops/step`
- `GET /api/insights/:address`

## Getting Started

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd prism-frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

Required:

- `DATABASE_URL`
- `INITIA_REST_URL`
- `INITIA_RPC_URL`
- `INITIA_JSON_RPC_URL`
- `IAE_CONTRACT_ADDRESS`

Optional:

- `ANTHROPIC_API_KEY`

### Frontend (`prism-frontend/.env`)

Required:

- `VITE_APPCHAIN_ID`
- `VITE_JSON_RPC_URL`
- `VITE_REST_URL`
- `VITE_RPC_URL`
- `VITE_INDEXER_URL`
- `VITE_IAE_CONTRACT_ADDRESS`
- `VITE_NATIVE_DENOM` (default `uinit`)
- `VITE_NATIVE_SYMBOL` (default `INIT`)
- `VITE_NATIVE_DECIMALS` (default `6`)

## Deployment

Deploy frontend:

```bash
cd prism-frontend
npx vercel --prod
```

Deploy backend:

```bash
cd backend
npx vercel --prod
```

## Current Status

- Live, deployable full-stack demo
- Initia wallet connection + bridge entry points
- Persistent campaign progress via backend API
- Contract interaction flows wired through UI

## Documentation

- `docs/PROJECT_GUIDE.md`
- `docs/WORKFLOW_GUIDE.md`
- `docs/SYSTEM_ARCHITECTURE.md`

