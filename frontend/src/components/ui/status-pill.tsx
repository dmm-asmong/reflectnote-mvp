type StatusPillProps = {
  label: string;
  tone?: "default" | "good" | "warm";
};

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  default: "bg-surface-muted text-ink-soft",
  good: "bg-accent/20 text-accent-deep",
  warm: "bg-surface-dark text-white",
};

export function StatusPill({ label, tone = "default" }: StatusPillProps) {
  return <span className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold ${toneClasses[tone]}`}>{label}</span>;
}
