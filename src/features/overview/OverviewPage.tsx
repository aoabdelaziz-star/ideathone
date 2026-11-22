import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, BellRing, CheckCircle2, ClipboardList, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { StatCard } from '@/components/common/StatCard';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { DotPattern } from '@/components/ui/dot-pattern';
import { ALERTS, MODEL_VERSIONS, RECOMMENDATIONS, SATISFACTION } from '@/data/seed';
import { useDashboardState } from '@/features/dashboard-state/DashboardStateContext';
import { DemandChart } from '@/features/forecast/DemandChart';
import { forecast } from '@/features/forecast/forecastMath';
import { PriceImpactVisual } from '@/features/forecast/PriceImpactVisual';
import { useFormat } from '@/i18n/format';

const SEVERITY_COLOR = {
  Critical: 'var(--destructive)',
  High: 'var(--warning)',
  Medium: 'var(--primary)',
  Low: 'var(--muted-foreground)',
} as const;

export default function OverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatNumber, formatDate, formatPercent } = useFormat();
  const { model, price, statusOf, audit, grants } = useDashboardState();

  const result = forecast(model, 'all', 0, t);
  const openAlerts = ALERTS.filter((alert) => alert.status !== 'Resolved');
  const critical = openAlerts.filter((alert) => alert.severity === 'Critical').length;
  const pending = RECOMMENDATIONS.filter((item) => statusOf(item.id) === 'Pending').length;
  const activeGrants = grants.filter((grant) => grant.status === 'Active').length;

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title={t('overview.title')}
        subtitle={t('overview.subtitle')}
        actions={
          <Button asChild size="sm">
            <Link to="/dashboard/forecast">
              {t('common.openForecast')}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="vms-card relative overflow-hidden border-primary/20 bg-[linear-gradient(125deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface)_55%)] p-5 sm:p-7"
      >
        <BorderBeam size={140} duration={9} colorFrom="var(--primary)" colorTo="var(--purple)" />
        <DotPattern className="text-[var(--muted-foreground)]/25" cr={0.8} />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="min-w-0 space-y-4">
            <AnimatedGradientText className="text-[10px] font-bold uppercase tracking-[0.18em]" colorFrom="var(--primary)" colorTo="var(--purple)">
              {t('overview.liveEyebrow')}
            </AnimatedGradientText>
            <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{t('overview.heroTitle')}</h2>
            <p className="vms-muted max-w-xl text-sm">{t('overview.heroBody')}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/dashboard/forecast">
                  <Sparkles className="size-4" />
                  {t('common.openForecast')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/recommendations">
                  <ClipboardList className="size-4" />
                  {t('common.viewAudit')}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PriceImpactVisual price={price} className="max-w-sm border-border/60 bg-surface/40 shadow-sm" />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('overview.forecastBase')}
          value={formatNumber(result.base)}
          detail={t('common.nextQuarter')}
          icon={<Gauge className="size-4" />}
        />
        <StatCard
          label={t('overview.openAlerts')}
          value={formatNumber(openAlerts.length)}
          detail={t('overview.criticalCount', { count: critical })}
          icon={<BellRing className="size-4" />}
          tone="warning"
        />
        <StatCard
          label={t('overview.pendingDecisions')}
          value={formatNumber(pending)}
          detail={t('common.needDecision')}
          icon={<ClipboardList className="size-4" />}
          tone="purple"
        />
        <StatCard
          label={t('overview.modelAccuracy')}
          value={formatPercent(Number.parseFloat(MODEL_VERSIONS[0].accuracy))}
          detail={t('overview.accuracyDelta')}
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <SectionCard
          title={t('overview.trendTitle')}
          subtitle={t('overview.trendSubtitle')}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/forecast">
                {t('common.openForecast')}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <DemandChart result={result} showAgencies={false} />
        </SectionCard>

        <SectionCard title={t('overview.attention')} subtitle={t('alerts.queueSubtitle')}>
          <div className="divide-y divide-border">
            {openAlerts.slice(0, 4).map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => navigate(`/dashboard/recommendations?focus=${alert.recommendationId}&tab=${alert.targetTab}`)}
                className="group flex w-full items-start gap-3 rounded-md px-1 py-2.5 text-start transition-colors hover:bg-surface-soft"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[alert.severity] }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold group-hover:text-primary">
                    {t(alert.titleKey, alert.titleParams ?? {})}
                  </span>
                  <span className="vms-muted mt-0.5 block truncate text-[10.5px]">{t(alert.timeKey)}</span>
                </span>
                <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/dashboard/insights')}
          className="vms-card vms-card-hover p-4 text-start"
        >
          <div className="vms-label">{t('overview.customerPulse')}</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-bold">{SATISFACTION[2].value}%</span>
            <span className="vms-muted pb-1 text-[11px]">{t('overview.satisfaction7')}</span>
          </div>
          <div className="mt-3 text-xs font-semibold text-primary">{t('common.viewInsights')} →</div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/dashboard/admin')}
          className="vms-card vms-card-hover p-4 text-start"
        >
          <div className="vms-label">{t('overview.auditTrail')}</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-bold">{formatNumber(audit.length)}</span>
            <span className="vms-muted pb-1 text-[11px]">{t('common.recordedEvents')}</span>
          </div>
          <div className="mt-3 text-xs font-semibold text-primary">{t('common.viewAudit')} →</div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/dashboard/admin')}
          className="vms-card vms-card-hover p-4 text-start"
        >
          <div className="vms-label">{t('overview.jitAccess')}</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-bold">{formatNumber(activeGrants)}</span>
            <span className="vms-muted pb-1 text-[11px]">{t('common.activeGrants')}</span>
          </div>
          <div className="mt-3 text-xs font-semibold text-primary">{t('common.manageRoles')} →</div>
        </motion.button>
      </div>

      <SectionCard title={t('admin.auditLog')} subtitle={t('admin.auditSubtitle')}>
        <div className="vms-scroll overflow-x-auto">
          <table className="vms-table min-w-[560px]">
            <thead>
              <tr>
                <th>{t('admin.timestamp')}</th>
                <th>{t('admin.actor')}</th>
                <th>{t('admin.action')}</th>
                <th>{t('admin.target')}</th>
              </tr>
            </thead>
            <tbody>
              {audit.slice(0, 4).map((entry, index) => (
                <tr key={`${entry.ts}-${entry.target}-${index}`}>
                  <td className="vms-num whitespace-nowrap">{formatDate(entry.ts)}</td>
                  <td className="font-medium">{entry.user}</td>
                  <td>{t(entry.actionKey)}</td>
                  <td className="vms-muted">{entry.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {t('login.securityNote')}
        </div>
      </SectionCard>
    </div>
  );
}
