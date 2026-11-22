import type {
  Agency,
  Alert,
  AuditEntry,
  BikeModel,
  DataSource,
  JitGrant,
  ModelVersion,
  PartsFailure,
  Recommendation,
  ScreenId,
  SatisfactionPoint,
  UnmetRequest,
} from '@/types';

export const SCREENS: Array<{
  id: ScreenId;
  nameKey: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
}> = [
  {
    id: 'overview',
    nameKey: 'nav.overview',
    titleKey: 'overview.title',
    subtitleKey: 'overview.subtitle',
    icon: 'overview',
  },
  {
    id: 'forecast',
    nameKey: 'nav.forecast',
    titleKey: 'forecast.title',
    subtitleKey: 'forecast.subtitle',
    icon: 'forecast',
  },
  {
    id: 'alerts',
    nameKey: 'nav.alerts',
    titleKey: 'alerts.title',
    subtitleKey: 'alerts.subtitle',
    icon: 'alerts',
  },
  {
    id: 'recommendations',
    nameKey: 'nav.recommendations',
    titleKey: 'recommendations.title',
    subtitleKey: 'recommendations.subtitle',
    icon: 'recommendations',
  },
  {
    id: 'insights',
    nameKey: 'nav.insights',
    titleKey: 'insights.title',
    subtitleKey: 'insights.subtitle',
    icon: 'insights',
  },
  {
    id: 'admin',
    nameKey: 'nav.admin',
    titleKey: 'admin.title',
    subtitleKey: 'admin.subtitle',
    icon: 'admin',
  },
];

export const AGENCIES: Agency[] = [
  { id: 'all', name: 'All agencies', nameKey: 'agencies.all', factor: 1 },
  { id: 'toudja', name: 'Toudja Central (Béjaïa)', nameKey: 'agencies.toudja', factor: 1.25 },
  { id: 'algiers', name: 'Algiers (El Harrach)', nameKey: 'agencies.algiers', factor: 1.35 },
  { id: 'oran', name: 'Oran Agency', nameKey: 'agencies.oran', factor: 1.15 },
  { id: 'constantine', name: 'Constantine Agency', nameKey: 'agencies.constantine', factor: 0.95 },
  { id: 'bouira', name: 'Bouira Plant', nameKey: 'agencies.bouira', factor: 0.85 },
];

export const MODELS: BikeModel[] = [
  {
    id: 'driver125',
    name: 'VMS Driver 125',
    nameKey: 'models.driver125',
    motoPrice: 380_000,
    avgPartPrice: 3_400,
    baseUnits: 14_200,
    keyPart: 'DRIV032',
  },
  {
    id: 'xdv300',
    name: 'VMS XDV 300',
    nameKey: 'models.xdv300',
    motoPrice: 894_000,
    avgPartPrice: 8_900,
    baseUnits: 6_800,
    keyPart: 'XDV3/001',
  },
  {
    id: 'vmax200',
    name: 'VMS Vmax 200',
    nameKey: 'models.vmax200',
    motoPrice: 517_000,
    avgPartPrice: 5_200,
    baseUnits: 9_400,
    keyPart: 'VMAX-REAR',
  },
  {
    id: 'joci125',
    name: 'VMS Joci 125',
    nameKey: 'models.joci125',
    motoPrice: 255_000,
    avgPartPrice: 2_600,
    baseUnits: 16_500,
    keyPart: 'DRIV067',
  },
  {
    id: 'commercial',
    name: 'VMS12 Commercial',
    nameKey: 'models.commercial',
    motoPrice: 365_000,
    avgPartPrice: 4_800,
    baseUnits: 5_100,
    keyPart: 'VMS12-AXLE',
  },
];

export const ALERTS: Alert[] = [
  {
    id: 'AL-201',
    severity: 'Critical',
    status: 'Open',
    titleKey: 'alerts.items.brakePads.title',
    titleParams: { ref: 'DRIV032' },
    metaKey: 'alerts.items.brakePads.meta',
    timeKey: 'times.min12',
    recommendationId: 'REC-104',
    targetTab: 'transfers',
  },
  {
    id: 'AL-202',
    severity: 'Critical',
    status: 'In progress',
    titleKey: 'alerts.items.ecu.title',
    titleParams: { ref: 'XDV3/153' },
    metaKey: 'alerts.items.ecu.meta',
    timeKey: 'times.min48',
    recommendationId: 'IMP-301',
    targetTab: 'imports',
  },
  {
    id: 'AL-203',
    severity: 'High',
    status: 'Open',
    titleKey: 'alerts.items.forkSeals.title',
    titleParams: { ref: 'DRIV042' },
    metaKey: 'alerts.items.forkSeals.meta',
    timeKey: 'times.hours2',
    recommendationId: 'IMP-303',
    targetTab: 'imports',
  },
  {
    id: 'AL-204',
    severity: 'High',
    status: 'Open',
    titleKey: 'alerts.items.fuelPump.title',
    titleParams: { ref: 'DRIV066' },
    metaKey: 'alerts.items.fuelPump.meta',
    timeKey: 'times.hours3',
    recommendationId: 'REC-107',
    targetTab: 'transfers',
  },
  {
    id: 'AL-205',
    severity: 'Medium',
    status: 'Open',
    titleKey: 'alerts.items.speedometer.title',
    titleParams: { ref: 'DRIV034/A' },
    metaKey: 'alerts.items.speedometer.meta',
    timeKey: 'times.hours5',
    recommendationId: 'REC-109',
    targetTab: 'transfers',
  },
  {
    id: 'AL-206',
    severity: 'Low',
    status: 'Resolved',
    titleKey: 'alerts.items.fuelFilter.title',
    titleParams: { ref: 'DRIV067' },
    metaKey: 'alerts.items.fuelFilter.meta',
    timeKey: 'times.yesterday',
    recommendationId: 'REC-101',
    targetTab: 'transfers',
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-104',
    kind: 'transfer',
    partKey: 'parts.brakePads',
    qty: 180,
    benefit: 540_000,
    cost: 45_000,
    status: 'Pending',
    fromKey: 'agencies.toudja',
    toKey: 'agencies.oran',
  },
  {
    id: 'REC-107',
    kind: 'transfer',
    partKey: 'parts.fuelPump',
    qty: 65,
    benefit: 487_500,
    cost: 38_000,
    status: 'Pending',
    fromKey: 'agencies.toudja',
    toKey: 'agencies.constantine',
  },
  {
    id: 'REC-109',
    kind: 'transfer',
    partKey: 'parts.ledSpeedometer',
    qty: 90,
    benefit: 612_000,
    cost: 32_000,
    status: 'Pending',
    fromKey: 'agencies.bouira',
    toKey: 'agencies.algiers',
  },
  {
    id: 'REC-101',
    kind: 'transfer',
    partKey: 'parts.fuelFilter',
    qty: 250,
    benefit: 175_000,
    cost: 22_000,
    status: 'Approved',
    fromKey: 'agencies.oran',
    toKey: 'agencies.toudja',
  },
  {
    id: 'IMP-301',
    kind: 'import',
    partKey: 'parts.ecuKit',
    qty: 240,
    benefit: 2_640_000,
    cost: 1_290_000,
    status: 'Pending',
    monthKey: 'months.m1',
  },
  {
    id: 'IMP-302',
    kind: 'import',
    partKey: 'parts.brakeKit',
    qty: 600,
    benefit: 1_920_000,
    cost: 840_000,
    status: 'Pending',
    monthKey: 'months.m2',
  },
  {
    id: 'IMP-303',
    kind: 'import',
    partKey: 'parts.forkSeals',
    qty: 950,
    benefit: 1_330_000,
    cost: 510_000,
    status: 'Pending',
    monthKey: 'months.m3',
  },
  {
    id: 'IMP-304',
    kind: 'import',
    partKey: 'parts.rearShock',
    qty: 400,
    benefit: 2_160_000,
    cost: 1_080_000,
    status: 'Pending',
    monthKey: 'months.m4to6',
  },
];

export const SATISFACTION: SatisfactionPoint[] = [
  { labelKey: 'insights.days7', value: 92, delta: '+2', direction: 'pos', series: [86, 88, 87, 90, 89, 92] },
  { labelKey: 'insights.months3', value: 88, delta: '+1', direction: 'pos', series: [82, 84, 83, 86, 87, 88] },
  { labelKey: 'insights.months7', value: 76, delta: '−3', direction: 'neg', series: [81, 80, 79, 78, 77, 76] },
  { labelKey: 'insights.year1', value: 68, delta: '−1', direction: 'neg', series: [74, 73, 71, 70, 69, 68] },
];

export const AGE_BANDS: string[] = ['< 1 yr', '1–2 yr', '2–4 yr', '4+ yr'];

export const PARTS_FAILURE: PartsFailure[] = [
  { nameKey: 'parts.brakePads', color: '#e31b23', data: [14, 42, 58, 74] },
  { nameKey: 'parts.forkSeals', color: '#0891b2', data: [6, 24, 41, 56] },
  { nameKey: 'parts.fuelPump', color: '#f59e0b', data: [5, 19, 36, 52] },
  { nameKey: 'parts.transmission', color: '#7c3aed', data: [11, 29, 39, 48] },
  { nameKey: 'parts.ecuDisplay', color: '#64748b', data: [15, 21, 18, 14] },
];

export const UNMET_REQUESTS: UnmetRequest[] = [
  { requestKey: 'unmet.brakePads', count: 438, trend: '+22%', partKey: 'categories.brakes' },
  { requestKey: 'unmet.forkSeals', count: 364, trend: '+15%', partKey: 'categories.suspension' },
  { requestKey: 'unmet.commodo', count: 279, trend: '+27%', partKey: 'categories.electrical' },
  { requestKey: 'unmet.fuelFilter', count: 215, trend: '+9%', partKey: 'categories.fuel' },
];

export const JIT_GRANTS: JitGrant[] = [
  {
    roleKey: 'roles.tempAdmin',
    user: 'A. Bensalem',
    scopeKey: 'scopes.forecast',
    start: 'Today 08:14',
    expiry: 'Today 18:00',
    status: 'Active',
  },
  {
    roleKey: 'roles.dataSteward',
    user: 'K. Meziane',
    scopeKey: 'scopes.imports',
    start: 'Today 09:02',
    expiry: 'Today 13:00',
    status: 'Active',
  },
  {
    roleKey: 'roles.auditor',
    user: 'S. Khelifi',
    scopeKey: 'scopes.admin',
    start: 'Yesterday 16:40',
    expiry: 'Today 16:40',
    status: 'Active',
  },
];

export const MODEL_VERSIONS: ModelVersion[] = [
  { version: 'v4.2.1', date: '2026-11-18', accuracy: '91.4%', status: 'Production', noteKey: 'versions.priceElasticity' },
  { version: 'v4.2.0', date: '2026-11-04', accuracy: '90.1%', status: 'Shadow', noteKey: 'versions.customerInsights' },
  { version: 'v4.1.3', date: '2026-10-21', accuracy: '88.7%', status: 'Archived', noteKey: 'versions.baseline' },
];

export const DATA_SOURCES: DataSource[] = [
  { nameKey: 'sources.orders', status: 'Healthy', syncKey: 'times.min2', records: '184K', latency: '115 ms' },
  { nameKey: 'sources.catalog', status: 'Healthy', syncKey: 'times.min5', records: '92K', latency: '180 ms' },
  { nameKey: 'sources.requests', status: 'Degraded', syncKey: 'times.min38', records: '41K', latency: '1.3 s' },
  { nameKey: 'sources.erp', status: 'Healthy', syncKey: 'times.min1', records: '620K', latency: '95 ms' },
];

export const AUDIT_SEED: AuditEntry[] = [
  {
    ts: '2026-11-21 09:42',
    user: 'A. Bensalem',
    actionKey: 'audit.approved',
    target: 'REC-098',
    detail: 'Stock transfer · Central → Coastal',
  },
  {
    ts: '2026-11-21 09:18',
    user: 'K. Meziane',
    actionKey: 'audit.edited',
    target: 'IMP-299',
    detail: 'Reason: "Adjusted lead time for port strike"',
  },
  {
    ts: '2026-11-21 08:55',
    user: 'A. Bensalem',
    actionKey: 'audit.granted',
    target: 'K. Meziane',
    detail: 'Data Steward · 4 hours',
  },
  {
    ts: '2026-11-20 17:30',
    user: 'System',
    actionKey: 'audit.deployed',
    target: 'v4.2.1',
    detail: 'Model version promoted to Production',
  },
];

/** Demo-only catalogue used by global search. */
export const PART_CATALOG = [
  { ref: 'DRIV032', nameKey: 'parts.brakePads', categoryKey: 'categories.brakes', agencyKey: 'agencies.all', modelKey: 'models.driver125' },
  { ref: 'DRIV042', nameKey: 'parts.forkSeals', categoryKey: 'categories.suspension', agencyKey: 'agencies.all', modelKey: 'models.driver125' },
  { ref: 'DRIV066', nameKey: 'parts.fuelPump', categoryKey: 'categories.fuel', agencyKey: 'agencies.toudja', modelKey: 'models.driver125' },
  { ref: 'DRIV034/A', nameKey: 'parts.ledSpeedometer', categoryKey: 'categories.electrical', agencyKey: 'agencies.algiers', modelKey: 'models.driver125' },
  { ref: 'XDV3/153', nameKey: 'parts.ecuBoard', categoryKey: 'categories.electrical', agencyKey: 'agencies.algiers', modelKey: 'models.xdv300' },
  { ref: 'XDV3/001', nameKey: 'parts.commodo', categoryKey: 'categories.electrical', agencyKey: 'agencies.oran', modelKey: 'models.xdv300' },
  { ref: 'DRIV067', nameKey: 'parts.fuelFilter', categoryKey: 'categories.fuel', agencyKey: 'agencies.toudja', modelKey: 'models.joci125' },
  { ref: 'DRIV020', nameKey: 'parts.brakeDisc', categoryKey: 'categories.brakes', agencyKey: 'agencies.all', modelKey: 'models.driver125' },
  { ref: 'VMAX-REAR', nameKey: 'parts.rearShock', categoryKey: 'categories.suspension', agencyKey: 'agencies.all', modelKey: 'models.vmax200' },
] as const;
