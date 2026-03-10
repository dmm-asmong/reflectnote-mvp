type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface p-5 shadow-soft backdrop-blur">
      <p className="text-xs font-semibold tracking-widest text-ink-soft">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-ink-soft">{hint}</p> : null}
    </div>
  );
}
