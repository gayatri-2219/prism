# Workflow Guide (In-Depth)

## 1. Workflow Objectives

This guide defines how to move safely from local development to reproducible demos/releases for this repository.

Primary goals:
- Keep frontend and contract behavior aligned.
- Prevent config drift across appchain environments.
- Make execution and review repeatable for contributors.

## 2. Branch and Change Strategy

Recommended lightweight flow:
1. `main` stays demo-ready.
2. Create topic branch per change (`feat/...`, `fix/...`, `docs/...`).
3. Keep PR scope to one vertical slice (frontend UX, contract logic, or infra script).
4. Merge only after local verification checklist passes.

## 3. End-to-End Development Loop

### Step 1: Define the slice
- Identify target layer: UX (`prism-frontend`), Action (`prism`), or Infra (`*.exp` scripts).
- Write expected behavior in one sentence before coding.

### Step 2: Prepare local runtime
- Ensure appchain RPC, REST, and JSON-RPC endpoints are reachable.
- Ensure `VITE_*` values in `prism-frontend/.env` match deployed contract/network.

### Step 3: Implement change
- Update UI and interaction logic in `prism-frontend/src/*`.
- Update contract logic in `prism/src/PrismTreasury.sol` when needed.
- Keep ABI-dependent frontend logic synchronized if function signatures change.

### Step 4: Verify locally
Frontend checks:

```bash
cd prism-frontend
npm install
npm run build
```

Contract checks (if tests are enabled):

```bash
cd prism
forge test
```

Manual smoke flow:
1. Open app.
2. Connect wallet.
3. Deposit with a valid risk score (1-100).
4. Withdraw partial amount.
5. Update risk score.
6. Validate position refresh and status messaging.

### Step 5: Document behavior change
- Update `README.md` if startup/dependency behavior changed.
- Update docs in `docs/` for architecture/workflow impact.

## 4. Daily Contributor Workflow

### Frontend-only change
1. Edit `prism-frontend/src/*`.
2. Run `npm run dev` and validate relevant page routes.
3. Run `npm run build` for production bundle sanity.
4. Commit with a scope-first message: `feat(frontend): ...`.

### Contract-only change
1. Edit `prism/src/PrismTreasury.sol`.
2. Update/add Foundry tests.
3. Rebuild/deploy contract to target environment.
4. Update `VITE_PRISM_TREASURY_CONTRACT` in frontend env.
5. Retest frontend transaction paths.

### Cross-layer change
1. Start at contract interface change.
2. Update frontend ABI and call wiring.
3. Redeploy and rotate contract address in env.
4. Run full smoke test across Guide -> Execute -> status updates.

## 5. Environment Promotion Workflow

Define three environment classes:
- `local`: developer machine + local appchain endpoints.
- `shared-test`: team testnet deployment.
- `demo`: stable deployment for presentations/submission.

Promotion checklist:
1. Contract address confirmed for target environment.
2. `VITE_APPCHAIN_ID` matches target chain.
3. `VITE_JSON_RPC_URL` points to target endpoint.
4. Bridge defaults validated (`VITE_BRIDGE_SRC_CHAIN_ID`, `VITE_BRIDGE_SRC_DENOM`).
5. Build succeeds from clean install.
6. Smoke tx flow passes with a fresh wallet session.

## 6. Contract Deployment Workflow (Current Repo Reality)

Current artifacts indicate manual/CLI-driven deployment (`deploy.json`, `contract.bin`).

Recommended sequence:
1. Compile contract and produce bytecode artifact.
2. Deploy using Initia EVM tx path.
3. Capture tx hash and resulting contract address.
4. Persist address in frontend `.env`.
5. Validate read/write from UI.

Important: Do not keep stale binary/deploy artifacts if they no longer match active source.

## 7. Transaction and Error-Handling Workflow

UI transaction handlers in `PrismApp.jsx` follow this pattern:
1. Guard wallet connection.
2. Guard configured contract address.
3. Encode ABI calldata (`viem`).
4. Submit `requestTxBlock` with `/minievm.evm.v1.MsgCall`.
5. Refresh position data.
6. Surface success/failure in status message.

Contributor rule: preserve this sequence for any new onchain action to maintain UX consistency.

## 8. Autopilot Workflow (Prototype State)

Current flow:
1. User edits guardrails.
2. Settings persist to `localStorage`.
3. User enables or pauses preview.
4. UI projects hypothetical strategy behavior.

No real automation job currently executes these settings. Treat all autopilot behavior as UX simulation until backend/session keys are added.

## 9. Review Workflow

When reviewing changes, prioritize:
1. Behavioral regressions in transaction flow.
2. Contract/frontend ABI mismatches.
3. Wrong chain/env config assumptions.
4. Missing error states for disconnected wallet or unset contract.
5. Documentation drift.

## 10. Pre-Release Checklist

1. `prism-frontend` build passes.
2. Contract tests pass (after re-enabling `.t.sol` test files).
3. `README.md` and `docs/*` reflect actual behavior.
4. Demo flow tested on clean browser storage.
5. Submission metadata updated (`.initia/submission.json` commit SHA).
6. No accidental secrets or machine-local URLs committed.
