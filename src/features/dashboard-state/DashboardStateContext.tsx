/* eslint-disable react-refresh/only-export-components -- hook and provider are intentionally colocated */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { AUDIT_SEED, JIT_GRANTS, RECOMMENDATIONS } from '@/data/seed';
import { usePersistentState } from '@/hooks/usePersistentState';
import type { AgencyId, AuditEntry, DecisionStatus, JitGrant, ModelId } from '@/types';

export type RecommendationTab = 'transfers' | 'imports';
export type RecommendationView = 'table' | 'board';
export type DecisionAction = 'approve' | 'edit' | 'reject';

interface DashboardStateValue {
  agency: AgencyId;
  model: ModelId;
  tab: RecommendationTab;
  view: RecommendationView;
  price: number;
  recStatus: Record<string, DecisionStatus>;
  audit: AuditEntry[];
  grants: JitGrant[];
  setAgency: (value: AgencyId) => void;
  setModel: (value: ModelId) => void;
  setTab: (value: RecommendationTab) => void;
  setView: (value: RecommendationView) => void;
  setPrice: (value: number) => void;
  statusOf: (id: string) => DecisionStatus;
  decide: (id: string, action: DecisionAction, detail: string) => void;
  addGrant: (grant: JitGrant) => void;
  revokeGrant: (index: number) => void;
  recordEvent: (actionKey: string, target: string, detail: string) => void;
}

const DashboardStateContext = createContext<DashboardStateValue | null>(null);

const ACTION_KEYS: Record<DecisionAction, string> = {
  approve: 'audit.approved',
  edit: 'audit.edited',
  reject: 'audit.rejected',
};

const NEXT_STATUS: Record<DecisionAction, DecisionStatus> = {
  approve: 'Approved',
  edit: 'Edited · pending',
  reject: 'Rejected',
};

function timestamp() {
  return new Date().toISOString();
}

export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = usePersistentState<AgencyId>('vms.dashboard.agency', 'all');
  const [model, setModel] = usePersistentState<ModelId>('vms.dashboard.model', 'driver125');
  const [tab, setTab] = usePersistentState<RecommendationTab>('vms.dashboard.tab', 'transfers');
  const [view, setView] = usePersistentState<RecommendationView>('vms.dashboard.view', 'table');
  const [price, setPrice] = usePersistentState<number>('vms.dashboard.price', 0);
  const [recStatus, setRecStatus] = usePersistentState<Record<string, DecisionStatus>>('vms.dashboard.recStatus', {});
  const [audit, setAudit] = usePersistentState<AuditEntry[]>('vms.dashboard.audit', AUDIT_SEED);
  const [grants, setGrants] = usePersistentState<JitGrant[]>('vms.dashboard.grants', JIT_GRANTS);

  const recordEvent = useCallback(
    (actionKey: string, target: string, detail: string) => {
      setAudit((current) => [{ ts: timestamp(), user: 'omar nad', actionKey, target, detail }, ...current]);
    },
    [setAudit],
  );

  const statusOf = useCallback(
    (id: string) => recStatus[id] ?? RECOMMENDATIONS.find((item) => item.id === id)?.status ?? 'Pending',
    [recStatus],
  );

  const decide = useCallback(
    (id: string, action: DecisionAction, detail: string) => {
      setRecStatus((current) => ({ ...current, [id]: NEXT_STATUS[action] }));
      recordEvent(ACTION_KEYS[action], id, detail);
    },
    [recordEvent, setRecStatus],
  );

  const addGrant = useCallback(
    (grant: JitGrant) => {
      setGrants((current) => [grant, ...current]);
      recordEvent('audit.granted', grant.user, `${grant.roleKey} · ${grant.scopeKey}`);
    },
    [recordEvent, setGrants],
  );

  const revokeGrant = useCallback(
    (index: number) => {
      const grant = grants[index];
      if (!grant) return;
      setGrants((current) => current.filter((_, itemIndex) => itemIndex !== index));
      recordEvent('audit.revoked', grant.user, `${grant.roleKey} · ${grant.scopeKey}`);
    },
    [grants, recordEvent, setGrants],
  );

  const value = useMemo<DashboardStateValue>(
    () => ({
      agency,
      model,
      tab,
      view,
      price,
      recStatus,
      audit,
      grants,
      setAgency,
      setModel,
      setTab,
      setView,
      setPrice,
      statusOf,
      decide,
      addGrant,
      revokeGrant,
      recordEvent,
    }),
    [
      agency,
      model,
      tab,
      view,
      price,
      recStatus,
      audit,
      grants,
      setAgency,
      setModel,
      setTab,
      setView,
      setPrice,
      statusOf,
      decide,
      addGrant,
      revokeGrant,
      recordEvent,
    ],
  );

  return <DashboardStateContext.Provider value={value}>{children}</DashboardStateContext.Provider>;
}

export function useDashboardState() {
  const context = useContext(DashboardStateContext);
  if (!context) throw new Error('useDashboardState must be used inside DashboardStateProvider');
  return context;
}
