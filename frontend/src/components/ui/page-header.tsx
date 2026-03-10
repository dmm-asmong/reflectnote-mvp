import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <section className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent to-accent-strong p-5 text-accent-darker shadow-lg sm:p-6">
      <div className="pointer-events-none absolute" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-accent-dark">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-accent-darker/80 sm:text-base">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
