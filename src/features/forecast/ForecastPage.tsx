import { useTranslation } from 'react-i18next';
import { BadgeCheck, ChartNoAxesCombined, Disc3, Gauge, Percent, RotateCcw, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AGENCIES, MODELS } from '@/data/seed';
import { useDashboardState } from '@/features/dashboard-state/DashboardStateContext';
import { DemandChart } from './DemandChart';
import { forecast } from './forecastMath';
import { PriceImpactVisual } from './PriceImpactVisual';
import { useFormat } from '@/i18n/format';
import type { AgencyId, ModelId } from '@/types';

const DRIVER_ICONS = [Sparkles, Percent, Disc3, BadgeCheck];

export default function ForecastPage() {
  const { t } = useTranslation();
  const { formatNumber, formatMoney, formatPercent } = useFormat();
  const { agency, model, price, setAgency, setModel, setPrice } = useDashboardState();

  const result = forecast(model, agency, price, t);
  const showAgencies = agency === 'all';
  const drivers = [
    { label: t('forecast.seasonal'), detail: t('forecast.seasonalDetail'), tone: 'primary' as const },
    { label: t('forecast.elasticity'), detail: t('forecast.elasticityDetail'), tone: 'warning' as const },
    { label: t('forecast.wear'), detail: t('forecast.wearDetail'), tone: 'purple' as const },
    { label: t('forecast.confidence'), detail: t('forecast.confidenceDetail'), tone: 'success' as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title={t('forecast.title')}
        subtitle={t('forecast.subtitle')}
        actions={
          price !== 0 ? (
            <Button variant="outline" size="sm" onClick={() => setPrice(0)}>
              <RotateCcw className="size-4" />
              {t('common.baseCase')}
            </Button>
          ) : (
            <Badge variant="secondary">{t('common.baseCase')}</Badge>
          )
        }
      />

      <SectionCard
        title={t('forecast.filterTitle')}
        subtitle={showAgencies ? t('forecast.viewNarrowed') : t('common.agency')}
        actions={
          !showAgencies ? (
            <Button variant="ghost" size="sm" onClick={() => setAgency('all')}>
              {t('forecast.viewNarrowed')}
            </Button>
          ) : undefined
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="vms-label">{t('common.agency')}</span>
            <Select value={agency} onValueChange={(value) => setAgency(value as AgencyId)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENCIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {t(item.nameKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="vms-label">{t('common.bikeModel')}</span>
            <Select value={model} onValueChange={(value) => setModel(value as ModelId)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {t(item.nameKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('common.projectedDemand')}
          value={formatNumber(result.demand)}
          detail={`${formatPercent(Math.abs(result.delta))} ${t('common.vsBase')}`}
          icon={<ChartNoAxesCombined className="size-4" />}
        />
        <StatCard
          label={t('common.baseScenario')}
          value={formatNumber(result.base)}
          detail={t('common.nextQuarter')}
          icon={<Gauge className="size-4" />}
          tone="purple"
        />
        <StatCard
          label={t('common.confidence')}
          value={
            <>
              {formatNumber(result.low)}
              <span aria-hidden="true">–</span>
              {formatNumber(result.high)}
            </>
          }
          detail={t('forecast.quarterSubtitle')}
          icon={<BadgeCheck className="size-4" />}
          tone="success"
        />
        <StatCard
          label={t('common.projectedRevenue')}
          value={formatMoney(result.revenue)}
          detail={<>{t('common.avgPartPrice')} · {formatMoney(result.price)}</>}
          icon={<Percent className="size-4" />}
          tone="warning"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <SectionCard
          title={t('forecast.quarterTitle')}
          subtitle={t('forecast.quarterSubtitle')}
          actions={<Badge variant={price === 0 ? 'secondary' : 'default'}>{price === 0 ? t('common.baseCase') : t('common.scenarioActive')}</Badge>}
        >
          <DemandChart result={result} showAgencies={showAgencies} />
          <div className="mt-4 rounded-lg border border-border bg-surface-soft p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="vms-label">{t('common.whatIfPrice')}</span>
              <span className="text-xs font-bold tabular-nums text-primary">
                {price > 0 ? '+' : ''}
                {price}%
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              aria-label={t('common.whatIfPrice')}
              className="mt-3 w-full accent-[var(--primary)]"
            />
            <div className="vms-muted mt-1 flex justify-between text-[10px]">
              <span>{t('common.discount20')}</span>
              <span>{t('common.increase20')}</span>
            </div>
            <p className="vms-muted mt-2 text-[11px]">{t('forecast.sliderNote')}</p>
          </div>
        </SectionCard>

        <SectionCard
          title={t('forecast.scenarioTitle')}
          subtitle={t('forecast.scenarioSubtitle')}
          actions={<Badge variant="outline">{t('common.bikeRetailPrice')} · {formatMoney(result.motoPrice)}</Badge>}
        >
          <PriceImpactVisual price={price} className="border-border/60 bg-surface-soft/40" />
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-surface-soft p-3">
              <div className="vms-label">{t('common.low')}</div>
              <div className="vms-num mt-1 text-lg font-bold">{formatNumber(result.low)}</div>
            </div>
            <div className="rounded-lg bg-surface-soft p-3">
              <div className="vms-label">{t('common.high')}</div>
              <div className="vms-num mt-1 text-lg font-bold">{formatNumber(result.high)}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t('forecast.driversTitle')} subtitle={t('overview.heroBody')}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {drivers.map((driver, index) => {
            const Icon = DRIVER_ICONS[index];
            return (
              <div key={driver.label} className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg"
                  style={{ background: `color-mix(in srgb, var(--${driver.tone}) 12%, transparent)`, color: `var(--${driver.tone})` }}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold">{driver.label}</div>
                  <div className="vms-muted mt-0.5 text-[11px]">{driver.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
