import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellRing, CheckCircle2, CircleAlert, Clock3, Info } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { StatCard } from '@/components/common/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALERTS } from '@/data/seed';
import { useFormat } from '@/i18n/format';
import type { AlertStatus, Severity } from '@/types';

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
const SEVERITY_KEY: Record<Severity, string> = {
  Critical: 'common.severity.critical',
  High: 'common.severity.high',
  Medium: 'common.severity.medium',
  Low: 'common.severity.low',
};
const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: 'var(--destructive)',
  High: 'var(--warning)',
  Medium: 'var(--primary)',
  Low: 'var(--muted-foreground)',
};
const STATUS_KEY: Record<AlertStatus, string> = {
  Open: 'common.status.open',
  'In progress': 'common.status.inProgress',
  Resolved: 'common.status.resolved',
};

type SeverityFilter = Severity | 'all';
type StatusFilter = AlertStatus | 'all';

export default function AlertsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatNumber } = useFormat();
  const [searchParams] = useSearchParams();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const focus = searchParams.get('focus');

  const alerts = useMemo(
    () => ALERTS.filter((alert) => (severityFilter === 'all' || alert.severity === severityFilter) && (statusFilter === 'all' || alert.status === statusFilter)),
    [severityFilter, statusFilter],
  );
  const open = ALERTS.filter((alert) => alert.status !== 'Resolved');

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader title={t('alerts.title')} subtitle={t('alerts.subtitle')} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {SEVERITIES.map((severity) => (
          <StatCard
            key={severity}
            label={t(SEVERITY_KEY[severity])}
            value={formatNumber(open.filter((alert) => alert.severity === severity).length)}
            detail={t('common.openAlerts')}
            icon={<CircleAlert className="size-4" />}
            tone={severity === 'Critical' ? 'warning' : severity === 'High' ? 'primary' : 'purple'}
          />
        ))}
        <StatCard
          label={t('common.status.resolved')}
          value={formatNumber(ALERTS.filter((alert) => alert.status === 'Resolved').length)}
          detail={t('alerts.alert')}
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
      </div>

      <SectionCard
        title={t('alerts.queue')}
        subtitle={t('alerts.queueSubtitle')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as SeverityFilter)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {SEVERITIES.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {t(SEVERITY_KEY[severity])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Open">{t('common.status.open')}</SelectItem>
                <SelectItem value="In progress">{t('common.status.inProgress')}</SelectItem>
                <SelectItem value="Resolved">{t('common.status.resolved')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <div className="vms-scroll overflow-x-auto">
          <table className="vms-table min-w-[720px]">
            <thead>
              <tr>
                <th>{t('alerts.alert')}</th>
                <th>{t('alerts.severity')}</th>
                <th>{t('alerts.status')}</th>
                <th>{t('alerts.context')}</th>
                <th>{t('alerts.raised')}</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  data-highlight={focus === alert.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/recommendations?focus=${alert.recommendationId}&tab=${alert.targetTab}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/dashboard/recommendations?focus=${alert.recommendationId}&tab=${alert.targetTab}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <td>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[alert.severity] }} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold">{t(alert.titleKey, alert.titleParams ?? {})}</div>
                        <div className="vms-muted mt-0.5 text-[10px] tabular-nums">{alert.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${SEVERITY_COLOR[alert.severity]} 14%, transparent)`, color: SEVERITY_COLOR[alert.severity] }}>
                      {t(SEVERITY_KEY[alert.severity])}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-xs">{t(STATUS_KEY[alert.status])}</td>
                  <td className="vms-muted max-w-[280px] text-[11px]">{t(alert.metaKey, alert.metaParams ?? {})}</td>
                  <td className="vms-muted flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                    <Clock3 className="size-3.5" />
                    {t(alert.timeKey)}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    {t('common.nothingHere')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-soft p-3 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {t('alerts.note')}
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <BellRing className="size-3.5" />
        {t('common.openAlerts')}: {formatNumber(open.length)}
      </div>
    </div>
  );
}
