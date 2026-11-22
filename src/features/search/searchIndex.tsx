/* eslint-disable react-refresh/only-export-components -- helper functions are intentionally colocated with Highlight */
import {
  ALERTS,
  MODELS,
  PART_CATALOG,
  RECOMMENDATIONS,
  SCREENS,
} from '@/data/seed';
import type { TFunction } from 'i18next';
import type { SearchItem } from '@/types';

type Translate = TFunction;

export function buildSearchIndex(t: Translate): SearchItem[] {
  const pages: SearchItem[] = SCREENS.map((screen) => {
    const name = t(screen.nameKey);
    return {
      id: `page-${screen.id}`,
      group: 'pages',
      title: name,
      subtitle: t(screen.subtitleKey),
      page: screen.id,
      keywords: [name, screen.id, t(screen.titleKey), 'page', 'screen'],
    };
  });

  const parts: SearchItem[] = PART_CATALOG.map((part) => {
    const name = t(part.nameKey);
    const category = t(part.categoryKey);
    const agency = t(part.agencyKey);
    const model = t(part.modelKey);
    const recommendation = RECOMMENDATIONS.find((item) => t(item.partKey).includes(part.ref));
    return {
      id: `part-${part.ref}`,
      group: 'parts',
      title: name,
      subtitle: `${category} · ${agency} · ${part.ref}`,
      reference: part.ref,
      category,
      agency,
      page: recommendation ? 'recommendations' : 'forecast',
      focus: recommendation?.id,
      tab: recommendation?.kind === 'import' ? 'imports' : 'transfers',
      keywords: [name, part.ref, category, agency, model, ...MODELS.map((item) => t(item.nameKey))],
    };
  });

  const linkedRecommendations: SearchItem[] = RECOMMENDATIONS.filter((item) => !parts.some((part) => part.focus === item.id)).map((item) => ({
    id: `rec-${item.id}`,
    group: 'parts',
    title: t(item.partKey),
    subtitle: `${item.id} · ${t(item.kind === 'import' ? 'recommendations.imports' : 'recommendations.transfers')}`,
    reference: item.id,
    category: t(item.kind === 'import' ? 'recommendations.imports' : 'recommendations.transfers'),
    page: 'recommendations',
    focus: item.id,
    tab: item.kind === 'import' ? 'imports' : 'transfers',
    keywords: [t(item.partKey), item.id, item.kind],
  }));

  const alertItems: SearchItem[] = ALERTS.map((alert) => ({
    id: `alert-${alert.id}`,
    group: 'parts',
    title: t(alert.titleKey, alert.titleParams ?? {}),
    subtitle: `${alert.id} · ${t(alert.metaKey, alert.metaParams ?? {})}`,
    reference: alert.id,
    page: 'alerts',
    focus: alert.id,
    keywords: [t(alert.titleKey, alert.titleParams ?? {}), alert.id, t(alert.severity === 'Critical' ? 'common.severity.critical' : 'common.severity.high')],
  }));

  return [...parts, ...linkedRecommendations, ...alertItems, ...pages];
}

export function filterSearchIndex(items: SearchItem[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return items
    .filter((item) => item.keywords.some((keyword) => keyword.toLocaleLowerCase().includes(needle)))
    .slice(0, 14);
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLocaleLowerCase() === needle.toLocaleLowerCase() ? (
          <mark key={index} className="hl">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
