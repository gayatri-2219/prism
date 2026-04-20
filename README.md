# Prism

## Initia Hackathon Submission

- **Project Name**: Prism

### Project Overview

Prism is an AI-assisted DeFi coordination app for Initia that helps users fund
their appchain wallet, deposit into strategy-linked treasury positions, and
bridge assets into the local rollup from the wider Interwoven ecosystem. The AI
portion should live offchain, while the appchain is used for balances,
preferences, transaction flows, and user-owned state.

### Implementation Detail

- **The Custom Implementation**: The starter contract tracks each user's
  treasury balance and a risk score that can be updated over time, which makes
  the onchain layer opinionated toward portfolio preference rather than being a
  generic vault clone.
- **The Native Feature**: The frontend is scaffolded around
  `interwoven-bridge` so users can move assets into the appchain without
  leaving the core product flow.

### How to Run Locally

1. Install the Initia tools and launch your local appchain by following the
   `Set Up Your Appchain` flow from the official docs.
2. Build and deploy the Solidity contract from [prism/src/PrismTreasury.sol](/Users/gayatrisondekar/Desktop/%20init/prism/src/PrismTreasury.sol),
   then copy the deployed address and chain values into
   [prism-frontend/.env.example](/Users/gayatrisondekar/Desktop/%20init/prism-frontend/.env.example)
   to create a real `.env`.
3. Install the frontend dependencies in `prism-frontend` with `npm install`.
4. Run `npm run dev` inside `prism-frontend` and connect your wallet to the
   local appchain.

## Workspace Status

This repository was reset to a clean Initia-oriented starter because the
previous project was a standalone Next.js prototype and did not match the
hackathon structure or required submission files.

Current structure:

```text
.
├── .initia/
│   └── submission.json
├── prism/
│   ├── foundry.toml
│   ├── src/
│   └── test/
└── prism-frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── src/
    └── vite.config.js
```

## Next Steps

1. Install the `initia-appchain-dev` skill from the official docs.
2. Run `weave init` and complete the local appchain setup.
3. Deploy the EVM contract in `prism/`.
4. Fill in `.initia/submission.json` with the real repo URL, commit SHA,
   rollup chain ID, deployed address, and demo video URL.

