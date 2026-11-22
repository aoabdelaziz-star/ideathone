import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'purple';
}

const TONES = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  purple: 'var(--purple)',
} as const;

export function StatCard({ label, value, detail, icon, tone = 'primary' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="vms-card vms-card-hover relative overflow-hidden p-4"
    >
      <span
        aria-hidden="true"
        className="absolute inset-block-start-0 inset-inline-end-0 size-24 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: TONES[tone] }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="vms-label">{label}</div>
        {icon && (
          <span className="grid size-8 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${TONES[tone]} 12%, transparent)`, color: TONES[tone] }}>
            {icon}
          </span>
        )}
      </div>
      <div className="vms-num mt-3 text-2xl font-bold tracking-tight sm:text-[28px]">{value}</div>
      {detail && <div className="vms-muted mt-1 text-[11px]">{detail}</div>}
    </motion.div>
  );
}
