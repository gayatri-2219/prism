import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { contractUrl } from '../utils/scan';

const CONTRACT = (import.meta.env.VITE_IAE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as string;

const LAYERS = [
  {
    title: 'UX Layer',
    stack: 'React + InterwovenKit',
    details: 'Guide, Feed, Execute, Autopilot, Leaderboard, Architecture pages + wallet integration and transaction bridge.',
  },
  {
    title: 'Intelligence Layer',
    stack: 'Node.js + AI Feed',
    details: 'Cron jobs sync yield sources and run risk scoring over APY, volatility, TVL, and compatibility.',
  },
  {
    title: 'Action Layer',
    stack: 'PrismTreasury.sol on Initia EVM',
    details: 'Contract functions: deposit, withdraw, updateRiskScore, and positionOf for live on-chain portfolio reads.',
  },
];

export default function ArchitecturePage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="architecture-page">
      <h1>How IAE Works</h1>
      <p>Three layers, one seamless experience.</p>

      <div className="layers-grid">
        {LAYERS.map((layer, idx) => (
          <button key={layer.title} className={`layer-card ${open === idx ? 'active' : ''}`} onClick={() => setOpen(idx)}>
            <h3>{layer.title}</h3>
            <span>{layer.stack}</span>
            {open === idx ? <p>{layer.details}</p> : null}
          </button>
        ))}
      </div>

      <GlassCard>
        <div className="contract-row">
          <div>
            <h3>Smart Contract</h3>
            <code>{CONTRACT}</code>
          </div>
          <div className="contract-actions">
            <button onClick={() => navigator.clipboard.writeText(CONTRACT)}><Copy size={14} /> Copy</button>
            <a href={contractUrl(CONTRACT)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View on initia.scan</a>
          </div>
        </div>
        <pre className="abi-preview">
{`function deposit(uint8 riskScore, Strategy[] strategies) payable
function withdraw(uint256 amount)
function updateRiskScore(uint8 newScore)
function positionOf(address user) view returns (uint256,uint8,uint64)`}
        </pre>
      </GlassCard>

      <GlassCard>
        <h3>Data Flow</h3>
        <div className="flow-diagram">
          {['User Wallet', 'IAE Frontend', 'Backend API', 'Smart Contract', 'Yield Protocols'].map((node, idx) => (
            <div key={node} className="flow-node">
              {node}
              {idx < 4 ? <span className="flow-arrow">→</span> : null}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
