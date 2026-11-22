import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useThemeTokens } from '@/hooks/useTheme';
import type { ForecastResult } from '@/types';

const SERIES_COLORS = ['#e31b23', '#0891b2', '#f59e0b', '#7c3aed', '#16a34a'];

export function DemandChart({ result, showAgencies }: { result: ForecastResult; showAgencies: boolean }) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();

  const data = useMemo(() => {
    const history = result.byAgency[0]?.history ?? [0, 0, 0, 0, 0];
    const baseHistory = showAgencies
      ? Array.from({ length: 5 }, (_, index) => result.byAgency.reduce((sum, agency) => sum + agency.history[index], 0))
      : history;
    const rows = baseHistory.map((value, index) => ({
      label: `${t('forecast.history')} ${index + 1}`,
      ...(showAgencies
        ? Object.fromEntries(result.byAgency.map((agency) => [agency.name, agency.history[index]]))
        : { demand: value }),
    }));
    rows.push({
      label: t('forecast.history') + ' 6',
      ...(showAgencies
        ? Object.fromEntries(result.byAgency.map((agency) => [agency.name, Math.round(agency.demand / 0.58)]))
        : { demand: result.base }),
    });
    rows.push({
      label: t('forecast.projection'),
      ...(showAgencies
        ? Object.fromEntries(result.byAgency.map((agency) => [agency.name, agency.demand]))
        : { demand: result.demand, low: result.low, high: result.high }),
    });
    return rows;
  }, [result, showAgencies, t]);

  const tooltipStyle = {
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    borderRadius: 12,
    color: tokens.foreground,
    fontSize: 12,
  };

  return (
    <div className="h-64 w-full sm:h-72" role="img" aria-label={t('forecast.chartTitle')}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tokens.primary} stopOpacity={0.32} />
              <stop offset="100%" stopColor={tokens.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tokens.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: tokens.muted, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tick={{ fill: tokens.muted, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: tokens.border }} />
          {showAgencies ? (
            <>
              {result.byAgency.map((agency, index) => (
                <Line
                  key={agency.id}
                  type="monotone"
                  dataKey={agency.name}
                  stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: tokens.muted }} />
            </>
          ) : (
            <Area type="monotone" dataKey="demand" stroke={tokens.primary} strokeWidth={2.5} fill="url(#demandFill)" dot={{ r: 3, fill: tokens.surface, stroke: tokens.primary }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
