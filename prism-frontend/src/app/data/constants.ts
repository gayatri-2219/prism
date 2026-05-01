export const NAV_LINKS = ["Discover", "Dashboard", "AI", "Pricing"];

export const PORTFOLIO = {
  total: 47234.50,
  monthGain: 5234,
  monthPct: 12.4,
  assets: [
    { symbol: "ETH", value: 28340, pct: 5.2, bar: 75 },
    { symbol: "USDC", value: 12450, pct: 0.1, bar: 35 },
    { symbol: "BTC", value: 6444, pct: 3.8, bar: 20 },
  ],
};

export const ACTIONS = [
  { title: "Stake ETH on EigenLayer", risk: "Low", riskColor: "#22c55e", effort: "Easy", returns: "6.2% APY", time: "5 min", gradient: "linear-gradient(135deg,#1E2749,#2B8C96)", btn: "linear-gradient(135deg,#1E2749,#2B8C96)" },
  { title: "Farm USDC-ETH LP Tokens", risk: "Medium", riskColor: "#f59e0b", effort: "Moderate", returns: "18.5% APY", time: "10 min", gradient: "linear-gradient(135deg,#1E2749,#3BA5B0)", btn: "linear-gradient(135deg,#1E2749,#3BA5B0)" },
  { title: "Bridge to Initia for Airdrop", risk: "Low", riskColor: "#22c55e", effort: "Easy", returns: "$200–500", time: "3 min", gradient: "linear-gradient(135deg,#2B8C96,#1E2749)", btn: "linear-gradient(135deg,#2B8C96,#1E2749)" },
];

export const AIRDROPS = [
  { tag: "Trending", name: "Initia Genesis Campaign", range: "$200–500", diff: "Easy", progress: 60, steps: ["Connect Wallet", "Bridge to Initia", "Swap $50+ tokens", "Provide Liquidity", "Complete for 7 days"], done: 3, time: "15 min" },
  { tag: "Popular", name: "LayerZero Snapshot", range: "$100–300", diff: "Medium", progress: 40, steps: ["Bridge using LayerZero", "Complete 3 transactions", "Hold for 30 days", "Participate in governance"], done: 2, time: "25 min" },
  { tag: "Pro", name: "EigenLayer Points", range: "TBA", diff: "Hard", progress: 25, steps: ["Stake ETH on EigenLayer", "Opt-in to restaking", "Maintain position for 90 days", "Delegate to operator"], done: 1, time: "30 min" },
];

export const INSIGHTS = [
  { icon: "", text: "You have $2,400 in idle funds that could earn 12% APY", link: "View Strategy →", color: "#fef9c3" },
  { icon: "", text: "You qualify for 2 active airdrops worth $800 total", link: "Claim Now →", color: "#fce7f3" },
  { icon: "", text: "Market opportunity: ETH staking rates increased by 2.4%", link: "Learn More →", color: "#e0f2fe" },
];

export const OPP_FEED = [
  { type: "Airdrop", badge: "Hot", name: "Initia Genesis Campaign", range: "$200–500", diff: "Easy", progress: 60 },
  { type: "Yield", badge: "New", name: "High APY on USDC", range: "24% APY", diff: "Medium", progress: 0 },
  { type: "Token", badge: "Pro", name: "Early Access: $PRISM", range: "TBA", diff: "Hard", progress: 0 },
];

export const PLANS = [
  { name: "Free", price: "$0", period: "/forever", cta: "Get Started", ctaBg: "#e2e8f0", ctaColor: "#1e293b", features: ["Basic AI insights", "Limited opportunities (5/day)", "Portfolio tracking", "Community support"], highlight: false },
  { name: "Pro", price: "$29", period: "/per month", cta: "Upgrade to Pro", ctaBg: "linear-gradient(135deg,#1E2749,#2B8C96)", ctaColor: "#fff", features: ["Advanced AI recommendations", "Unlimited opportunities", "Early airdrop access", "Whale wallet tracking", "Real-time alerts", "Priority support", "Auto-execution", "Portfolio analytics"], highlight: true },
  { name: "Enterprise", price: "Custom", period: "/contact us", cta: "Contact Sales", ctaBg: "linear-gradient(135deg,#2B8C96,#1E2749)", ctaColor: "#fff", features: ["Everything in Pro", "Dedicated account manager", "Custom strategies", "API access", "White-label solution", "Advanced security"], highlight: false },
];
