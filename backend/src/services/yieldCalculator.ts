/**
 * Yield Calculator Service
 * APY computation, return estimation, and risk scoring.
 */

// ─── APY Calculation ────────────────────────────────────────────────────────

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; // 31_557_600

/**
 * Calculate APY from a per-second interest rate.
 *
 * @param ratePerSecond - The interest rate per second as a bigint (scaled by 10^decimals)
 * @param decimals      - The decimal precision of the rate (e.g. 18 for wei-scale)
 * @returns APY as a percentage (e.g. 12.5 for 12.5%)
 */
export function calculateAPY(ratePerSecond: bigint, decimals: number): number {
  const rateFloat = Number(ratePerSecond) / Math.pow(10, decimals);

  // Compound interest: APY = (1 + r)^n - 1
  // Where r = rate per second, n = seconds per year
  const apy = (Math.pow(1 + rateFloat, SECONDS_PER_YEAR) - 1) * 100;

  // Clamp to prevent unreasonable values
  return Math.min(apy, 10_000); // cap at 10,000%
}

/**
 * Calculate simple APY from a rate with a given compounding period.
 * Useful for protocols that compound less frequently.
 *
 * @param ratePerPeriod   - Rate per compounding period (as a float, e.g. 0.001)
 * @param periodsPerYear  - Number of compounding periods per year
 * @returns APY as a percentage
 */
export function calculateAPYFromPeriodRate(
  ratePerPeriod: number,
  periodsPerYear: number
): number {
  const apy = (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100;
  return Math.min(apy, 10_000);
}

// ─── Return Estimation ──────────────────────────────────────────────────────

/**
 * Estimate the return on a deposit given an APY and time horizon.
 *
 * @param amount - Initial deposit amount
 * @param apy    - Annual percentage yield (e.g. 12.5 for 12.5%)
 * @param days   - Number of days to hold
 * @returns Estimated total value after the period
 */
export function estimateReturn(
  amount: number,
  apy: number,
  days: number
): number {
  const dailyRate = Math.pow(1 + apy / 100, 1 / 365.25) - 1;
  return amount * Math.pow(1 + dailyRate, days);
}

/**
 * Calculate the absolute profit from a deposit.
 */
export function estimateProfit(
  amount: number,
  apy: number,
  days: number
): number {
  return estimateReturn(amount, apy, days) - amount;
}

// ─── Risk Scoring ───────────────────────────────────────────────────────────

/**
 * Calculate a risk score from protocol metrics.
 * Lower score = lower risk (safer).
 *
 * Weighted formula:
 *   - TVL component:   0–40 points (higher TVL = lower risk)
 *   - Age component:   0–30 points (older = lower risk)
 *   - Audit component: 0–30 points (audited = lower risk)
 *
 * @param tvl         - Total value locked in USD
 * @param ageInDays   - Protocol age in days
 * @param auditScore  - Audit score 0–100 (100 = fully audited)
 * @returns Risk score 1–100 (1 = safest, 100 = riskiest)
 */
export function riskScoreFromMetrics(
  tvl: number,
  ageInDays: number,
  auditScore: number
): number {
  // TVL component (0–40): higher TVL = lower risk
  // $10M+ = 0 risk points, $0 = 40 risk points
  const tvlThreshold = 10_000_000;
  const tvlComponent = Math.max(0, 40 - (tvl / tvlThreshold) * 40);

  // Age component (0–30): older = lower risk
  // 365+ days = 0 risk points, 0 days = 30 risk points
  const ageThreshold = 365;
  const ageComponent = Math.max(0, 30 - (ageInDays / ageThreshold) * 30);

  // Audit component (0–30): higher audit score = lower risk
  // 100 audit = 0 risk points, 0 audit = 30 risk points
  const auditComponent = Math.max(0, 30 - (auditScore / 100) * 30);

  const rawScore = tvlComponent + ageComponent + auditComponent;

  // Clamp to 1–100
  return Math.max(1, Math.min(100, Math.round(rawScore)));
}

/**
 * Quick risk categorization from a numeric score.
 */
export function riskLabel(score: number): string {
  if (score <= 25) return "Low Risk";
  if (score <= 50) return "Moderate Risk";
  if (score <= 75) return "High Risk";
  return "Very High Risk";
}

/**
 * Calculate risk score specifically for DEX pool opportunities.
 * Uses APY volatility as a proxy for instability.
 *
 * @param apy          - Current APY
 * @param tvl          - TVL in USD
 * @param swapFeeRate  - Swap fee rate as a decimal (e.g. 0.003 for 0.3%)
 * @returns Risk score 1–100
 */
export function riskScoreFromDexPool(
  apy: number,
  tvl: number,
  swapFeeRate: number
): number {
  // Inverse APY component (0–30): very high APY is suspicious
  const apyComponent = apy > 100 ? 30 : (apy / 100) * 30;

  // TVL stability component (0–40): higher TVL = more stable
  const tvlThreshold = 5_000_000;
  const tvlComponent = Math.max(0, 40 - (tvl / tvlThreshold) * 40);

  // Fee component as proxy for protocol maturity (0–30)
  // Standard fees (0.3%) suggest established pool
  const feeComponent = swapFeeRate >= 0.003 ? 10 : 30;

  const rawScore = apyComponent + tvlComponent + feeComponent;
  return Math.max(1, Math.min(100, Math.round(rawScore)));
}
