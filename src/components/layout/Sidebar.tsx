import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BellRing,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { JIT_GRANTS, SCREENS } from '@/data/seed';
import { cn } from '@/lib/utils';

const ICONS = {
  overview: LayoutDashboard,
  forecast: ChartNoAxesCombined,
  alerts: BellRing,
  recommendations: Activity,
  insights: Users,
  admin: ShieldCheck,
} as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {open && <button type="button" aria-label={t('search.close')} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-block-0 start-0 z-50 flex w-[260px] flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <div>
            <div className="text-base font-extrabold text-white">VMS <span className="text-[var(--primary)]">Industrie</span></div>
            <div className="vms-label mt-0.5 text-[9px]">{t('common.tagline')}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden" aria-label={t('search.close')}>
            <X className="size-4" />
          </button>
        </div>

        <p className="vms-label px-6 pb-2 pt-4 text-[9px] text-white/40">{t('common.workspace')}</p>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label={t('common.workspace')}>
          {SCREENS.map((screen) => {
            const Icon = ICONS[screen.icon as keyof typeof ICONS];
            return (
              <NavLink
                key={screen.id}
                to={`/dashboard/${screen.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_35%,transparent),transparent)] text-white shadow-[inset_2px_0_0_var(--primary)]'
                      : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-white',
                  )
                }
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden="true" />
                <span>{t(screen.nameKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-[10px] leading-relaxed text-white/45">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.14)]" />
            {t('admin.jitTitle')} · {JIT_GRANTS.filter((grant) => grant.status === 'Active').length}
          </div>
          <div>Zero-trust · v4.2.1</div>
        </div>
      </aside>
    </>
  );
}
