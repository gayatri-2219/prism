# Initia Deploy + Explorer Verification

## 1. Contract Deploy (`PrismTreasury`) on Initia EVM

From `prism/`:

```bash
forge build
forge script script/Deploy.s.sol:DeployPrismTreasury \
  --rpc-url "$INITIA_JSON_RPC_URL" \
  --broadcast
```

Required environment variables:
- `PRIVATE_KEY`
- `INITIA_JSON_RPC_URL`

The script writes `prism/deploy.json` with:
- `contractAddress`
- `deployTxHash` (settable via env `DEPLOY_TX_HASH`)
- `blockNumber`
- `timestamp`

## 2. Frontend/Backend Contract Wiring

Use deployed address in:
- `prism-frontend/.env` as `VITE_PRISM_TREASURY_CONTRACT` (or rename to router variable in your frontend integration)
- `backend/.env` as `IAE_CONTRACT_ADDRESS`

Restart both services after updating env values.

## 3. Verify Transactions on initia.scan

1. Execute deposit/withdraw/rebalance/autopilot actions from frontend or script.
2. Capture transaction hash from wallet confirmation/history.
3. Open initia.scan for your target network and search the hash.
4. Confirm emitted contract events:
   - `Deposited`
   - `Withdrawn`
   - `RiskScoreUpdated`

## 4. Backend Bring-up

From `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Health check:

```bash
curl http://localhost:3001/health
```

Main APIs:
- `GET /api/opportunities`
- `GET /api/opportunities/:id`
- `GET /api/positions/:address`
- `GET /api/portfolio/:address`
- `GET /api/leaderboard`
