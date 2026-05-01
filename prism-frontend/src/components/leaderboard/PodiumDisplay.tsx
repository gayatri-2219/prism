import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { formatAPY } from '../../utils/format';
import UserAvatar from '../ui/UserAvatar';

export default function PodiumDisplay({ entries }: { entries: LeaderboardEntry[] }) {
  const top = entries.slice(0, 3);
  const order = [1, 0, 2].map((idx) => top[idx]).filter(Boolean);

  return (
    <div className="podium-grid">
      {order.map((entry) => (
        <div key={entry.rank} className={`podium-card rank-${entry.rank}`}>
          <div className="podium-rank">#{entry.rank}</div>
          {entry.rank === 1 ? <Crown size={16} className="crown" /> : null}
          <UserAvatar address={entry.wallet ?? `init${entry.rank}`} username={entry.username} size={52} />
          <div className="podium-name">{entry.username}</div>
          <div className="podium-return">{formatAPY(entry.totalReturn)}</div>
        </div>
      ))}
    </div>
  );
}
