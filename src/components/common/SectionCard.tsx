import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, subtitle, actions, children, className = '', bodyClassName = '' }: SectionCardProps) {
  return (
    <section className={`vms-card min-w-0 overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="vms-muted mt-0.5 text-[11px]">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={`min-w-0 ${bodyClassName || 'p-4'}`}>{children}</div>
    </section>
  );
}
