import { useMemo, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import type { Opportunity, PortfolioResponse, PositionResponse, StrategyAllocation } from '../types';
import AmountInput from '../components/execute/AmountInput';
import RiskSlider from '../components/execute/RiskSlider';
import StrategyBuilder from '../components/execute/StrategyBuilder';
import PositionCard from '../components/execute/PositionCard';
import PortfolioChart from '../components/execute/PortfolioChart';
import GlassCard from '../components/ui/GlassCard';
import TxLink from '../components/ui/TxLink';
import StrategyPill from '../components/ui/StrategyPill';
import ProtocolAvatar from '../components/ui/ProtocolAvatar';
import { useContract } from '../hooks/useContract';
import { formatAmount, relativeTime } from '../utils/format';

type Props = {
  initiaAddress?: string;
  opportunities: Opportunity[];
  position?: PositionResponse;
  portfolio?: PortfolioResponse;
  requestTxBlock: (payload: any) => Promise<{ txHash?: string }>;
  prefillId?: string;
  onTx: (hash: string) => void;
};

export default function ExecutePage({ initiaAddress, opportunities, position, portfolio, requestTxBlock, prefillId, onTx }: Props) {
  const [amount, setAmount] = useState('100');
  const [riskScore, setRiskScore] = useState(45);
  const [loading, setLoading] = useState(false);
  const [bannerTx, setBannerTx] = useState('');
  const [allocations, setAllocations] = useState<StrategyAllocation[]>([
    { id: crypto.randomUUID(), opportunityId: prefillId || opportunities[0]?.id || '', allocation: 50 },
    { id: crypto.randomUUID(), opportunityId: opportunities[1]?.id || opportunities[0]?.id || '', allocation: 50 },
  ]);

  const { submitDeposit } = useContract(requestTxBlock, initiaAddress);

  const totalAlloc = allocations.reduce((sum, row) => sum + row.allocation, 0);
  const fee = (Number(amount || 0) * 0.003).toFixed(2);

  const activeStrategies = useMemo(
    () =>
      allocations.map((row) => ({
        row,
        opp: opportunities.find((op) => op.id === row.opportunityId) ?? opportunities[0],
      })),
    [allocations, opportunities],
  );

  const handleSubmit = async () => {
    if (!submitDeposit || !initiaAddress || totalAlloc !== 100) return;
    setLoading(true);
    try {
      const res = await submitDeposit(amount, riskScore);
      if (res?.txHash) {
        setBannerTx(res.txHash);
        onTx(res.txHash);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="execute-grid">
      <div className="left-col">
        <h1>Deploy Capital</h1>
        <p className="page-desc">Allocate your idle assets into carefully selected yield strategies across the Initia ecosystem. Adjust risk parameters to suit your profile.</p>
        <GlassCard>
          <AmountInput value={amount} onChange={setAmount} onMax={() => setAmount('250')} usdValue={Number(amount || 0) * 1.86} />
          <RiskSlider value={riskScore} onChange={setRiskScore} />
          <StrategyBuilder rows={allocations} opportunities={opportunities} onChange={setAllocations} />
          <div className="fee-bar" data-tooltip="A flat 0.3% protocol fee is taken on deployment. No hidden spread."><CircleAlert size={14} /> Execution fee: 0.3% = {fee} INIT</div>
          <button className="deploy-btn" disabled={loading || totalAlloc !== 100 || !initiaAddress} onClick={handleSubmit}>
            {loading ? <span className="spinner" /> : 'Deploy Capital →'}
          </button>
          <p className="tx-note">Transaction will open in your wallet for signing</p>
          {bannerTx ? (
            <div className="success-banner">
              Transaction submitted · <TxLink hash={bannerTx} />
            </div>
          ) : null}
        </GlassCard>
      </div>

      <div className="right-col">
        <GlassCard glow glowColor="#a78bfa">
          <h3 data-tooltip="The current breakdown of your deployed capital in IAE.">Your Position</h3>
          <PositionCard data={position} />
        </GlassCard>

        <GlassCard>
          <PortfolioChart points={portfolio?.points ?? []} />
        </GlassCard>

        <GlassCard>
          <h4 data-tooltip="Strategies currently running with your allocated funds.">Active Strategies</h4>
          <div className="active-strategy-list">
            {activeStrategies.map(({ row, opp }) => (
              <div key={row.id}>
                <span><ProtocolAvatar name={opp?.protocolName ?? 'IAE'} size={20} /> {opp?.protocolName}</span>
                <span>{row.allocation}% · {formatAmount((portfolio?.currentValue ?? 0) * (row.allocation / 100), 2)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h4>Recent Transactions</h4>
          <div className="recent-tx-list">
            {(portfolio?.txHistory ?? []).slice(0, 3).map((tx) => (
              <div key={tx.hash}>
                <span><StrategyPill type={tx.type.toLowerCase()} compact /> {tx.amount}</span>
                <span>{relativeTime(tx.timestamp)} · <TxLink hash={tx.hash} /></span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
