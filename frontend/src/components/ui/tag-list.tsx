type TagListProps = {
  items: string[];
  tone?: "default" | "accent";
};

export function TagList({ items, tone = "default" }: TagListProps) {
  const className =
    tone === "accent"
      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
      : "bg-[var(--surface-muted)] text-[var(--text-soft)]";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${className}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

