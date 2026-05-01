import type { LeaderboardEntry, Route } from '../types';
import PodiumDisplay from '../components/leaderboard/PodiumDisplay';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

type Props = {
  entries: LeaderboardEntry[];
  currentAddress?: string;
  navigate: (route: Route) => void;
  onCopy: (entry: LeaderboardEntry) => void;
};

export default function LeaderboardPage({ entries, currentAddress, navigate, onCopy }: Props) {
  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>
      <PodiumDisplay entries={entries} />
      <LeaderboardTable
        rows={entries}
        currentAddress={currentAddress}
        onCopy={(entry) => {
          onCopy(entry);
          navigate('execute');
        }}
      />
      <div className="pagination-row">
        <button>Prev</button>
        <span>1</span>
        <button>Next</button>
      </div>
    </div>
  );
}
