export type ScreenId =
  | 'overview'
  | 'forecast'
  | 'alerts'
  | 'recommendations'
  | 'insights'
  | 'admin';

export type AgencyId = 'all' | 'toudja' | 'algiers' | 'oran' | 'constantine' | 'bouira';

export type ModelId = 'driver125' | 'xdv300' | 'vmax200' | 'joci125' | 'commercial';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Open' | 'In progress' | 'Resolved';
export type DecisionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Edited · pending';
export type Language = 'en' | 'fr' | 'ar' | 'zgh';

export interface Agency {
  id: AgencyId;
  name: string;
  nameKey: string;
  factor: number;
}

export interface BikeModel {
  id: ModelId;
  name: string;
  nameKey: string;
  motoPrice: number;
  avgPartPrice: number;
  baseUnits: number;
  keyPart: string;
}

export interface Alert {
  id: string;
  severity: Severity;
  status: AlertStatus;
  titleKey: string;
  titleParams?: Record<string, string>;
  metaKey: string;
  metaParams?: Record<string, string>;
  timeKey: string;
  recommendationId: string;
  targetTab: 'transfers' | 'imports';
}

export interface Recommendation {
  id: string;
  kind: 'transfer' | 'import';
  partKey: string;
  qty: number;
  benefit: number;
  cost: number;
  status: DecisionStatus;
  fromKey?: string;
  toKey?: string;
  monthKey?: string;
}

export interface SatisfactionPoint {
  labelKey: string;
  value: number;
  delta: string;
  direction: 'pos' | 'neg';
  series: number[];
}

export interface PartsFailure {
  nameKey: string;
  color: string;
  data: number[];
}

export interface UnmetRequest {
  requestKey: string;
  count: number;
  trend: string;
  partKey: string;
}

export interface JitGrant {
  roleKey: string;
  user: string;
  scopeKey: string;
  start: string;
  expiry: string;
  status: 'Active' | 'Expired';
}

export interface AuditEntry {
  ts: string;
  user: string;
  actionKey: string;
  target: string;
  detail: string;
}

export interface ModelVersion {
  version: string;
  date: string;
  accuracy: string;
  status: 'Production' | 'Shadow' | 'Archived';
  noteKey: string;
}

export interface DataSource {
  nameKey: string;
  status: 'Healthy' | 'Degraded';
  syncKey: string;
  records: string;
  latency: string;
}

export interface SearchItem {
  id: string;
  group: 'parts' | 'pages';
  title: string;
  subtitle: string;
  reference?: string;
  agency?: string;
  category?: string;
  page: ScreenId;
  focus?: string;
  tab?: 'transfers' | 'imports';
  keywords: string[];
}

export interface ForecastResult {
  base: number;
  demand: number;
  low: number;
  high: number;
  price: number;
  motoPrice: number;
  revenue: number;
  delta: number;
  keyPart: string;
  byAgency: Array<{
    id: AgencyId;
    name: string;
    demand: number;
    history: number[];
  }>;
}
