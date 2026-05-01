import { formatUnits } from "viem";
import { NATIVE_DECIMALS, NATIVE_DENOM } from "./config";
import { ROUTES, type Route } from "./types";

export function parseRoute(hash: string): Route {
  const raw = (hash || "").replace(/^#\/?/, "").trim().toLowerCase();
  if ((ROUTES as string[]).includes(raw)) return raw as Route;
  return "guide";
}

export function shortAddr(value?: string): string {
  if (!value) return "";
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function strategyTypeCode(type: string): number {
  if (type === "lp") return 1;
  if (type === "lend") return 2;
  if (type === "stake") return 3;
  return 0;
}

export function fmtNumber(value: number | string | undefined, digits = 2): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}

export function pickNativeBalance(data: any): number {
  const balances = data?.balances ?? [];
  const row = balances.find((b: { denom: string; amount: string }) => b.denom === NATIVE_DENOM);
  if (!row?.amount) return 0;
  return Number(formatUnits(BigInt(row.amount), NATIVE_DECIMALS));
}

export function safePrefillOpportunityId(): string {
  try {
    const parsed = JSON.parse(localStorage.getItem("iae_prefill_strategy") ?? "{}");
    return parsed?.opportunityId ?? "";
  } catch {
    return "";
  }
}
