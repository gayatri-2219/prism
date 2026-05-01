const ITEMS = [
  'INIT Staking 12.0% APY',
  'USDC Lending 8.2% APY',
  'INIT/USDC LP 18.5% APY',
  'Low Risk · High Yield',
  'Session Keys Live',
];

export default function FeedTicker() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {row.map((item, idx) => (
          <span key={`${item}-${idx}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
