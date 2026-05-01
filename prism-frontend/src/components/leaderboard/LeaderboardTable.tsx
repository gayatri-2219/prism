import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { formatAddress, formatAmount } from '../../utils/format';
import StrategyPill from '../ui/StrategyPill';
import UserAvatar from '../ui/UserAvatar';

type Props = {
  rows: LeaderboardEntry[];
  currentAddress?: string;
  onCopy: (entry: LeaderboardEntry) => void;
};

export default function LeaderboardTable({ rows, currentAddress, onCopy }: Props) {
  return (
    <div className="leaderboard-table">
      <div className="lb-head">
        <span>Rank</span>
        <span>Wallet</span>
        <span>Strategy</span>
        <span>APY</span>
        <span>Total Return</span>
        <span>Risk</span>
        <span>Copy</span>
      </div>

      {rows.map((entry) => {
        const isYou = currentAddress && entry.wallet?.toLowerCase() === currentAddress.toLowerCase();
        const positive = entry.totalReturn >= 0;
        const tokens = entry.strategy.toLowerCase().includes('lp') ? ['lp', 'lend'] : entry.strategy.toLowerCase().includes('stake') ? ['stake'] : ['swap'];

        return (
          <div className={`lb-row ${isYou ? 'you' : ''}`} key={`${entry.rank}-${entry.username}`}>
            <span>{entry.rank}</span>
            <span className="wallet-cell">
              <UserAvatar address={entry.wallet ?? String(entry.rank)} username={entry.username} size={28} />
              {entry.username.includes('.init') ? entry.username : formatAddress(entry.username)}
              {isYou ? <i>You</i> : null}
            </span>
            <span className="strat-cell">
              {tokens.map((token) => (
                <StrategyPill key={token} type={token} compact />
              ))}
            </span>
            <span className="mono-green">{(entry.totalReturn / 2 + 6).toFixed(1)}%</span>
            <span className={positive ? 'up' : 'down'}>
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {formatAmount(entry.totalReturn, 1)}%
            </span>
            <span>
              <b className={`risk-dot ${entry.riskScore <= 30 ? 'low' : entry.riskScore <= 70 ? 'med' : 'high'}`} />
              {entry.riskScore}
            </span>
            <span>
              <button className="copy-btn" onClick={() => onCopy(entry)}>Copy Strategy</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
