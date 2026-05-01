# System Architecture (In-Depth)

## 1. Architecture Overview

The current implementation follows a layered architecture:

1. Intelligence Layer (currently UX-modeled, backend pending)
2. Action Layer (EVM smart contract + tx execution)
3. UX Layer (React app with page-oriented journey)

```text
+-------------------------------------------------------+
|                    UX LAYER                           |
|  prism-frontend (React + Vite + InterwovenKit)       |
|  - Guide / Feed / Execute / Autopilot / Leaderboard  |
+-----------------------------+-------------------------+
                              |
                              | requestTxBlock (MsgCall)
                              v
+-------------------------------------------------------+
|                   ACTION LAYER                        |
|  PrismTreasury.sol (Initia EVM-compatible contract)   |
|  - deposit / withdraw / updateRiskScore / position    |
+-----------------------------+-------------------------+
                              |
                              | JSON-RPC eth_call
                              v
+-------------------------------------------------------+
|           APPCHAIN RUNTIME + NODE ENDPOINTS           |
|  rpc:26657, rest:1317, indexer:8080, json-rpc:8545    |
+-------------------------------------------------------+

(Intelligence backend planned: yield/airdrop/signal ranking service)
```

## 2. Module-Level Breakdown

### 2.1 UX Layer Modules

`prism-frontend/src/main.jsx`
- Bootstraps providers in order:
  - `WagmiProvider`
  - `QueryClientProvider`
  - `InterwovenKitProvider`
- Defines `customChain` from env.
- Injects InterwovenKit styles.
- Provides browser polyfills (`Buffer`, `process`).

`prism-frontend/src/App.jsx`
- Owns page routing by URL hash (`#guide`, `#feed`, etc.).
- Defines navigation metadata and grouped sidebar.
- Owns high-level wallet controls (`openConnect`, `openWallet`).

`prism-frontend/src/PrismApp.jsx`
- Owns page rendering logic and interaction state.
- Owns contract read/write integration and status handling.
- Owns autopilot local persistence.

### 2.2 Action Layer Module

`prism/src/PrismTreasury.sol`
- Maintains `mapping(address => Position)`.
- Enforces non-zero amounts and risk score range 1..100.
- Emits key events:
  - `Deposited`
  - `Withdrawn`
  - `RiskScoreUpdated`
- Uses call-based transfer for withdraw.

### 2.3 Infra/Operations Helpers

`opinit_setup.exp`, `relayer_setup.exp`
- `expect` scripts for automating CLI prompt flows in Initia ops setup.

## 3. Runtime Data Flow

### 3.1 Read Flow (Position Sync)

```text
PrismApp.fetchPosition()
  -> encode myPosition() calldata (viem)
  -> POST eth_call to VITE_JSON_RPC_URL
  -> decode return values (balance, riskScore, lastUpdated)
  -> update React state
  -> UI refreshes portfolio/risk/timestamp cards
```

Properties:
- Poll interval: 8 seconds.
- Uses connected `initiaAddress` transformed to hex for `from` in `eth_call`.

### 3.2 Write Flow (Execution)

```text
UI intent (Deposit/Withdraw/Update Risk)
  -> input validation (amount/risk)
  -> encode function calldata (viem)
  -> requestTxBlock({ chainId, messages:[MsgCall] })
  -> chain processes transaction
  -> status update in UI
  -> fetchPosition() refresh
```

Message envelope (critical shape):
- `typeUrl: /minievm.evm.v1.MsgCall`
- `value.sender`: bech32 initia address
- `value.contractAddr`: hex EVM contract address
- `value.input`: ABI calldata
- `value.value`: amount for payable calls
- `accessList`/`authList`: empty arrays

### 3.3 Bridge Entry Flow

```text
Execute page -> handleBridge()
  -> openBridge({ srcChainId, srcDenom })
  -> InterwovenKit bridge UI
```

No backend mediation is required for opening bridge modal.

## 4. State Architecture

### 4.1 Local UI State (React)

Main state atoms in `PrismApp.jsx`:
- `amount`
- `riskScore`
- `position`
- `status`
- `pendingAction`
- `autopilot`
- `autopilotNotice`

### 4.2 Persistence Model

Persistent state:
- `autopilot` guardrails in `localStorage` key `iae-autopilot-settings`.

Non-persistent/session state:
- current transaction status
- pending action
- live wallet position cache

## 5. Contract Data Model

```solidity
struct Position {
  uint256 balance;
  uint8 riskScore;
  uint64 lastUpdated;
}
mapping(address => Position) private positions;
```

Interpretation:
- `balance`: principal held in contract bookkeeping for user.
- `riskScore`: user preference signal, used by UI and future strategy routing.
- `lastUpdated`: last mutate timestamp.

## 6. Security and Reliability Notes

Current safeguards:
- Input validation for zero amount and risk bounds.
- Balance checks before withdraw.
- Errors exposed to UI as status strings.

Current gaps:
- No reentrancy guard in withdraw path (state updates do happen before transfer, but dedicated guard may still be preferred).
- No pausing/emergency circuit breaker.
- No access-controlled admin controls (by design, minimal contract).
- No explicit slippage/protocol routing protections yet (router not implemented).

## 7. Performance Characteristics

Frontend:
- Lightweight single-page app.
- Polling interval of 8s for position reads.
- Static recommendation lists currently eliminate backend latency.

Contract:
- O(1) reads/writes per user position.
- No loops over user sets.

Potential bottlenecks for future versions:
- Recommendation ranking backend throughput.
- Indexing and caching of external signal sources.
- Tx confirmation latency in high-load network conditions.

## 8. Integration Contracts and Interfaces

### Frontend <-> Chain (read)
- JSON-RPC method: `eth_call`
- Endpoint: `VITE_JSON_RPC_URL`

### Frontend <-> Chain (write)
- InterwovenKit `requestTxBlock`
- Message type: `/minievm.evm.v1.MsgCall`

### Frontend <-> Bridge
- InterwovenKit `openBridge`
- Inputs: `srcChainId`, `srcDenom`

### Planned Frontend <-> Intelligence Service
Not yet implemented in repo. Expected future interface:
- Recommendation list endpoint
- Ranking explanation metadata
- Signal freshness timestamps
- Risk compatibility scoring

## 9. Architecture Decisions and Tradeoffs

Decision: Keep recommendation intelligence in UI first.
- Benefit: fast product iteration and demo speed.
- Tradeoff: no live personalized ranking yet.

Decision: Use hash-based page routing instead of full router package.
- Benefit: low complexity, easy embedding.
- Tradeoff: limited route ergonomics and deep-link handling.

Decision: Use direct JSON-RPC polling for position reads.
- Benefit: minimal backend requirements.
- Tradeoff: frontend-managed decode logic and periodic polling load.

## 10. Evolution Path (Target Architecture)

Phase 1 (current):
- UI journey + wallet + treasury primitive.

Phase 2:
- Add intelligence backend service and dynamic feed.
- Add typed API client and caching policy.

Phase 3:
- Replace treasury primitive with execution router contracts.
- Add session-key based autopilot executor with explicit permissions.

Phase 4:
- Introduce observability stack (tx analytics, failed-action tracing, strategy outcomes).
- Add release automation and environment promotion pipeline.
