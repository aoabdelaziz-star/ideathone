import { motion, type Transition } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useDashboardState } from '@/features/dashboard-state/DashboardStateContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFormat } from '@/i18n/format';
import { cn } from '@/lib/utils';
import { forecast } from './forecastMath';

const MIN = -20;
const MAX = 20;
const ARC = 'M 20 100 A 80 80 0 0 1 180 100';
const BAR_SHAPE = [0.42, 0.58, 0.5, 0.72, 0.62, 0.86, 0.7];
const TICK_VALUES = [-20, -10, 0, 10, 20];

function tickGeometry(value: number) {
  const ratio = (value - MIN) / (MAX - MIN);
  const angle = Math.PI * (1 - ratio);
  return {
    value,
    x1: 100 + 88 * Math.cos(angle),
    y1: 100 - 88 * Math.sin(angle),
    x2: 100 + 96 * Math.cos(angle),
    y2: 100 - 96 * Math.sin(angle),
  };
}

/**
 * VMS-styled gauge, needle and demand bars that animate whenever the
 * shared price scenario changes. Replaces the old 3D scene.
 */
export function PriceImpactVisual({ price, className }: { price: number; className?: string }) {
  const { t } = useTranslation();
  const { model } = useDashboardState();
  const reducedMotion = useReducedMotion();
  const { formatPercent } = useFormat();

  const clamped = Math.max(MIN, Math.min(MAX, price));
  const normalized = (clamped - MIN) / (MAX - MIN);
  const needleAngle = -90 + normalized * 180;
  const delta = forecast(model, 'all', clamped).delta;
  const demandScale = Math.max(0.55, Math.min(1.35, 1 + delta / 100));
  const tone = price > 0 ? 'var(--primary)' : price < 0 ? 'var(--success)' : 'var(--purple)';
  const transition: Transition = reducedMotion ? { duration: 0 } : { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

  const signedPrice = `${clamped > 0 ? '+' : ''}${clamped}%`;
  const signedDelta = `${delta > 0 ? '+' : ''}${formatPercent(delta)}`;

  return (
    <div
      className={cn(
        'price-impact relative h-64 w-full overflow-hidden rounded-xl border border-border/60 bg-surface-soft/40',
        className,
      )}
      role="img"
      aria-label={`${t('overview.liveEyebrow')} · ${signedPrice} · ${signedDelta} ${t('common.vsBase')}`}
    >
      <div className="price-impact-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--primary)_9%,transparent),transparent_68%)]" />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="vms-label truncate text-[10px] font-bold uppercase tracking-[0.16em]">{t('common.whatIfPrice')}</p>
            <p className="mt-0.5 text-xs font-bold">{price === 0 ? t('common.baseCase') : t('common.scenarioActive')}</p>
          </div>
          <span
            className="shrink-0 rounded-full border border-border bg-surface px-2 py-1 text-[11px] font-extrabold tabular-nums"
            style={{ color: tone }}
          >
            {signedPrice}
          </span>
        </div>

        <div className="relative mx-auto h-[124px] w-full max-w-[240px]">
          <svg viewBox="0 0 200 110" className="absolute inset-x-0 top-0 size-full overflow-visible" aria-hidden="true">
            <path d={ARC} fill="none" stroke="var(--border)" strokeWidth="9" strokeLinecap="round" />
            <motion.path
              d={ARC}
              pathLength={1}
              strokeDasharray={1}
              fill="none"
              stroke={tone}
              strokeWidth="9"
              strokeLinecap="round"
              initial={false}
              animate={{ strokeDashoffset: 1 - normalized }}
              transition={transition}
            />
            {TICK_VALUES.map((value) => {
              const tick = tickGeometry(value);
              return (
                <line
                  key={value}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="var(--muted-foreground)"
                  strokeOpacity={value === 0 ? 0.8 : 0.4}
                  strokeWidth={value === 0 ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}
            <motion.g
              initial={false}
              animate={{ rotate: needleAngle }}
              transition={transition}
              style={{ transformOrigin: '100px 100px', transformBox: 'view-box' }}
            >
              <line x1="100" y1="100" x2="100" y2="30" stroke={tone} strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="6" fill={tone} />
              <circle cx="100" cy="100" r="2.4" fill="var(--surface)" />
            </motion.g>
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <div className="text-2xl font-black tabular-nums" style={{ color: tone }}>{signedDelta}</div>
            <div className="vms-label text-[9px] uppercase tracking-wider">{t('common.vsBase')}</div>
          </div>
        </div>

        <div className="flex h-11 items-end gap-1.5" aria-hidden="true">
          {BAR_SHAPE.map((base, index) => (
            <motion.span
              key={index}
              className="flex-1 rounded-t-sm opacity-80"
              style={{ background: `linear-gradient(to top, color-mix(in srgb, ${tone} 22%, transparent), ${tone})` }}
              initial={false}
              animate={{ height: `${Math.round(Math.min(100, base * demandScale * 100))}%` }}
              transition={{ ...transition, delay: reducedMotion ? 0 : index * 0.035 }}
            />
          ))}
        </div>
      </div>
      <Sparkles className="pointer-events-none absolute bottom-3 end-3 size-3.5 text-muted-foreground/40" aria-hidden="true" />
    </div>
  );
}
