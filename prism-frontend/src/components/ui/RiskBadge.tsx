type Props = { score: number };

export default function RiskBadge({ score }: Props) {
  const risk = score <= 30 ? { label: 'LOW RISK', cls: 'risk-low' } : score <= 70 ? { label: 'MED RISK', cls: 'risk-med' } : { label: 'HIGH RISK', cls: 'risk-high' };

  return (
    <div className={`risk-pill ${risk.cls}`}>
      <span>{risk.label}</span>
      <strong>{score}</strong>
    </div>
  );
}
