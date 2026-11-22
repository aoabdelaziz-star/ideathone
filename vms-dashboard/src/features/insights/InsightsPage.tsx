import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/button';
import { AGE_BANDS, PARTS_FAILURE, SATISFACTION, UNMET_REQUESTS } from '@/data/seed';
import { useThemeTokens } from '@/hooks/useTheme';
import { useFormat } from '@/i18n/format';

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatNumber } = useFormat();
  const tokens = useThemeTokens();

  const chartData = useMemo(
    () =>
      AGE_BANDS.map((band, index) => ({
        band,
        ...Object.fromEntries(PARTS_FAILURE.map((part) => [t(part.nameKey), part.data[index]])),
      })),
    [t],
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader title={t('insights.title')} subtitle={t('insights.subtitle')} />

      <SectionCard title={t('insights.satisfactionTitle')} subtitle={t('insights.satisfactionSubtitle')} actions={<BadgeNote>{t('insights.surveyCount')}</BadgeNote>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SATISFACTION.map((point) => {
            const positive = point.direction === 'pos';
            const color = positive ? 'var(--success)' : 'var(--destructive)';
            return (
              <div key={point.labelKey} className="vms-card vms-card-hover p-4">
                <div className="vms-label">{t(point.labelKey)}</div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <span className="text-2xl font-bold tabular-nums">{point.value}%</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color }}>
                    {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    {point.delta}
                  </span>
                </div>
                <Sparkline series={point.series} color={color} />
                <div className="vms-muted mt-2 text-[10px]">{t('insights.vsLast')}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={t('insights.failuresTitle')} subtitle={t('insights.failuresSubtitle')}>
        <div className="h-72 w-full" role="img" aria-label={t('insights.failuresTitle')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
              <CartesianGrid stroke={tokens.grid} vertical={false} />
              <XAxis dataKey="band" tick={{ fill: tokens.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} tickLine={false} axisLine={false} width={34} />
              <Tooltip
                contentStyle={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 12, color: tokens.foreground, fontSize: 12 }}
                cursor={{ fill: tokens.grid }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
              {PARTS_FAILURE.map((part) => (
                <Bar key={part.nameKey} dataKey={t(part.nameKey)} fill={part.color} radius={[4, 4, 0, 0]} maxBarSize={38} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard
        title={t('insights.unmetTitle')}
        subtitle={t('insights.unmetSubtitle')}
        actions={
          <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/forecast')}>
            {t('common.feedForecast')}
            <ArrowUpRight className="size-4" />
          </Button>
        }
      >
        <div className="vms-scroll overflow-x-auto">
          <table className="vms-table min-w-[640px]">
            <thead>
              <tr>
                <th>{t('insights.request')}</th>
                <th>{t('recommendations.part')}</th>
                <th className="vms-num">{t('insights.count')}</th>
                <th className="vms-num">{t('insights.trend')}</th>
              </tr>
            </thead>
            <tbody>
              {UNMET_REQUESTS.map((request) => (
                <tr key={request.requestKey}>
                  <td className="text-xs font-semibold">{t(request.requestKey)}</td>
                  <td className="vms-muted text-xs">{t(request.partKey)}</td>
                  <td className="vms-num text-xs font-bold">{formatNumber(request.count)}</td>
                  <td className="vms-num text-xs font-bold text-[var(--warning)]">{request.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="vms-card flex flex-wrap items-center gap-3 p-4 text-xs text-muted-foreground">
        <Users className="size-4 text-primary" />
        {t('insights.subtitle')}
      </div>
    </div>
  );
}

function BadgeNote({ children }: { children: string }) {
  return <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{children}</span>;
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const points = series
    .map((value, index) => `${(index / Math.max(1, series.length - 1)) * 100},${28 - ((value - min) / Math.max(1, max - min)) * 24}`)
    .join(' ');

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-3 h-8 w-full" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
