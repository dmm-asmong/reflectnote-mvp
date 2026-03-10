import type { PropsWithChildren, ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}>;

export function SectionCard({ title, eyebrow, action, children, className = "" }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-surface p-5 shadow-soft sm:p-6 flex flex-col ${className}`.trim()}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-semibold tracking-widest text-ink-soft">{eyebrow}</p> : null}
          <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
