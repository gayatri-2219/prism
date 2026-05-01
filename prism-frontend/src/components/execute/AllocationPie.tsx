type Slice = { color: string; value: number };

export default function AllocationPie({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let cursor = 0;

  const parts = slices.map((slice, idx) => {
    const from = (cursor / total) * 360;
    cursor += slice.value;
    const to = (cursor / total) * 360;
    return `${slice.color} ${from}deg ${to}deg`;
  });

  return <div className="allocation-pie" style={{ background: `conic-gradient(${parts.join(',')})` }} />;
}
