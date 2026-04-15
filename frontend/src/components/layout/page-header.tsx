import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, meta }: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
        <h2 className="mt-2 max-w-4xl font-display text-4xl font-bold tracking-[-0.06em] text-slate-950 md:text-5xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {meta ? <div className="shrink-0">{meta}</div> : null}
    </section>
  );
}
