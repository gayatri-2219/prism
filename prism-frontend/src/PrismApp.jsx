import React, { useEffect, useState } from "react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { AccAddress } from "@initia/initia.js";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";

const CHAIN_ID = import.meta.env.VITE_APPCHAIN_ID;
const DECIMALS = Number(import.meta.env.VITE_NATIVE_DECIMALS ?? 18);
const SYMBOL = import.meta.env.VITE_NATIVE_SYMBOL ?? "MIN";
const JSON_RPC_URL = import.meta.env.VITE_JSON_RPC_URL ?? "http://localhost:8545";
const CONTRACT_ADDRESS = import.meta.env.VITE_PRISM_TREASURY_CONTRACT;
const BRIDGE_SRC_CHAIN_ID =
  import.meta.env.VITE_BRIDGE_SRC_CHAIN_ID ?? "initiation-2";
const BRIDGE_SRC_DENOM = import.meta.env.VITE_BRIDGE_SRC_DENOM ?? "uinit";

const ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "riskScore", type: "uint8" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "updateRiskScore",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "riskScore", type: "uint8" }],
  },
  {
    name: "myPosition",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "balance", type: "uint256" },
      { name: "riskScore", type: "uint8" },
      { name: "lastUpdated", type: "uint64" },
    ],
  },
];

function decodePositionResult(hexValue) {
  if (!hexValue || hexValue === "0x") {
    return { balance: "0", riskScore: "0", lastUpdated: "0" };
  }

  const body = hexValue.replace(/^0x/, "");
  if (body.length < 192) {
    return { balance: "0", riskScore: "0", lastUpdated: "0" };
  }

  const chunks = body.match(/.{1,64}/g) ?? [];
  return {
    balance: BigInt(`0x${chunks[0]}`).toString(),
    riskScore: BigInt(`0x${chunks[1]}`).toString(),
    lastUpdated: BigInt(`0x${chunks[2]}`).toString(),
  };
}

export default function PrismApp() {
  const { initiaAddress, openBridge, openConnect, requestTxBlock } =
    useInterwovenKit();
  const [amount, setAmount] = useState("");
  const [riskScore, setRiskScore] = useState("50");
  const [position, setPosition] = useState({
    balance: "0",
    riskScore: "0",
    lastUpdated: "0",
  });
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function fetchPosition() {
    if (!initiaAddress || !CONTRACT_ADDRESS) {
      setPosition({ balance: "0", riskScore: "0", lastUpdated: "0" });
      return;
    }

    const hexAddress = AccAddress.toHex(initiaAddress);
    const from = (hexAddress.startsWith("0x") ? hexAddress : `0x${hexAddress}`).toLowerCase();
    const data = encodeFunctionData({
      abi: ABI,
      functionName: "myPosition",
    });

    const response = await fetch(JSON_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ from, to: CONTRACT_ADDRESS, data }, "latest"],
        id: 1,
      }),
    });

    const payload = await response.json();
    if (payload.error) {
      throw new Error(payload.error.message || "eth_call failed");
    }

    setPosition(decodePositionResult(payload.result));
  }

  useEffect(() => {
    fetchPosition().catch((error) => {
      setStatus(String(error.message || error));
    });
  }, [initiaAddress]);

  async function submitTransaction(functionName, args, value = "0") {
    if (!initiaAddress) {
      openConnect();
      return;
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.includes("00000000000000000000")) {
      setStatus("Set VITE_PRISM_TREASURY_CONTRACT in your .env before testing.");
      return;
    }

    setPending(true);
    setStatus(`Submitting ${functionName}...`);

    try {
      const input = encodeFunctionData({
        abi: ABI,
        functionName,
        args,
      });

      const tx = await requestTxBlock({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: {
              sender: initiaAddress.toLowerCase(),
              contractAddr: CONTRACT_ADDRESS,
              input,
              value,
              accessList: [],
              authList: [],
            },
          },
        ],
      });

      setStatus(`${functionName} confirmed: ${tx?.txhash ?? "submitted"}`);
      setAmount("");
      await fetchPosition();
    } catch (error) {
      setStatus(`${functionName} failed: ${String(error.message || error)}`);
    } finally {
      setPending(false);
    }
  }

  function handleDeposit() {
    if (!amount) return;
    submitTransaction(
      "deposit",
      [Number(riskScore)],
      parseUnits(amount, DECIMALS).toString(),
    );
  }

  function handleWithdraw() {
    if (!amount) return;
    submitTransaction("withdraw", [parseUnits(amount, DECIMALS)]);
  }

  function handleRiskUpdate() {
    submitTransaction("updateRiskScore", [Number(riskScore)]);
  }

  async function handleBridge() {
    if (!initiaAddress) {
      openConnect();
      return;
    }

    await openBridge({
      srcChainId: BRIDGE_SRC_CHAIN_ID,
      srcDenom: BRIDGE_SRC_DENOM,
    });
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">EVM Track</p>
          <h2>Risk-aware treasury starter</h2>
        </div>
        <button className="secondary-button" onClick={handleBridge} type="button">
          Bridge Funds
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span>Balance</span>
          <strong>{formatUnits(BigInt(position.balance), DECIMALS)} {SYMBOL}</strong>
        </div>
        <div className="stat">
          <span>Risk Score</span>
          <strong>{position.riskScore}</strong>
        </div>
        <div className="stat">
          <span>Last Updated</span>
          <strong>{position.lastUpdated === "0" ? "Not set" : position.lastUpdated}</strong>
        </div>
      </div>

      <div className="controls">
        <label>
          Amount
          <input
            min="0"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.0"
            step="any"
            type="number"
            value={amount}
          />
        </label>

        <label>
          Risk Score
          <input
            max="100"
            min="1"
            onChange={(event) => setRiskScore(event.target.value)}
            type="number"
            value={riskScore}
          />
        </label>
      </div>

      <div className="action-row">
        <button className="primary-button" disabled={pending} onClick={handleDeposit} type="button">
          Deposit
        </button>
        <button className="secondary-button" disabled={pending} onClick={handleWithdraw} type="button">
          Withdraw
        </button>
        <button className="secondary-button" disabled={pending} onClick={handleRiskUpdate} type="button">
          Update Risk
        </button>
      </div>

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
