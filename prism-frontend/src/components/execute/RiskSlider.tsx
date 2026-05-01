type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function RiskSlider({ value, onChange }: Props) {
  return (
    <div className="risk-slider-box">
      <div className="risk-slider-head">
        <span>Risk Score</span>
        <strong>{value}/100</strong>
      </div>
      <input type="range" min={1} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="risk-zones">
        <span>Conservative</span>
        <span>Balanced</span>
        <span>Aggressive</span>
      </div>
    </div>
  );
}
