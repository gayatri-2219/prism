type Props = {
  value: string;
  onChange: (v: string) => void;
  onMax: () => void;
  usdValue: number;
};

export default function AmountInput({ value, onChange, onMax, usdValue }: Props) {
  return (
    <div className="amount-box">
      <div className="amount-top">
        <span className="token-pill">INIT</span>
        <button className="max-btn" onClick={onMax}>MAX</button>
      </div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" type="number" />
      <p>≈ ${usdValue.toFixed(2)} USD</p>
    </div>
  );
}
