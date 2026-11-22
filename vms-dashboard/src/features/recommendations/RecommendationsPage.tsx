import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Info, LayoutGrid, List, Pencil, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RECOMMENDATIONS } from '@/data/seed';
import { useToast } from '@/components/common/ToastProvider';
import { useDashboardState, type DecisionAction } from '@/features/dashboard-state/DashboardStateContext';
import { useFormat } from '@/i18n/format';
import { cn } from '@/lib/utils';
import type { DecisionStatus, Recommendation } from '@/types';
import { SlideToApprove } from './SlideToApprove';

type ReasonModal = { id: string; kind: 'edit' | 'reject' };

const STATUS_STYLES: Record<DecisionStatus, { key: string; className: string }> = {
  Pending: { key: 'common.decision.pending', className: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  Approved: { key: 'common.decision.approved', className: 'bg-[var(--success-soft)] text-[var(--success)]' },
  Rejected: { key: 'common.decision.rejected', className: 'bg-[var(--primary-soft)] text-[var(--primary)]' },
  'Edited · pending': { key: 'common.decision.edited', className: 'bg-[var(--purple-soft)] text-[var(--purple)]' },
};

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const notify = useToast();
  const { formatNumber, formatMoney } = useFormat();
  const { tab, view, setTab, setView, statusOf, decide } = useDashboardState();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get('focus');
  const [modal, setModal] = useState<ReasonModal | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const transfers = RECOMMENDATIONS.filter((item) => item.kind === 'transfer');
  const imports = RECOMMENDATIONS.filter((item) => item.kind === 'import');
  const items = useMemo(() => (tab === 'transfers' ? transfers : imports), [tab, transfers, imports]);

  useEffect(() => {
    if (!focus) return;
    const target = document.querySelector('[data-highlight="true"]');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focus, tab, view]);

  const approve = (id: string) => {
    decide(id, 'approve', t('audit.approved'));
    notify(t('recommendations.approvedToast', { id }));
  };

  const openReason = (kind: 'edit' | 'reject', id: string) => {
    setModal({ kind, id });
    setReason('');
    setReasonError('');
  };

  const submitReason = () => {
    if (!modal) return;
    if (!reason.trim()) {
      setReasonError(t('recommendations.reasonRequired'));
      return;
    }
    const action: DecisionAction = modal.kind === 'edit' ? 'edit' : 'reject';
    decide(modal.id, action, reason.trim());
    notify(t(modal.kind === 'edit' ? 'recommendations.editToast' : 'recommendations.rejectToast', { id: modal.id }));
    setModal(null);
    setReason('');
  };

  const renderActions = (item: Recommendation) => {
    const status = statusOf(item.id);
    if (status !== 'Pending') {
      return <DecisionBadge status={status} />;
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <SlideToApprove label={t('recommendations.slideToApprove')} onApprove={() => approve(item.id)} />
        <Button size="sm" variant="outline" onClick={() => openReason('edit', item.id)}>
          <Pencil className="size-3.5" />
          {t('common.actions.edit')}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => openReason('reject', item.id)}>
          <XCircle className="size-3.5" />
          {t('common.actions.reject')}
        </Button>
      </div>
    );
  };

  const routeLabel = (item: Recommendation) =>
    item.fromKey && item.toKey
      ? `${t(item.fromKey)} → ${t(item.toKey)}`
      : t(item.monthKey ?? 'months.m1');

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader title={t('recommendations.title')} subtitle={t('recommendations.subtitle')} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface-soft p-1">
          <TabButton active={tab === 'transfers'} label={t('recommendations.transfers')} count={transfers.filter((item) => statusOf(item.id) === 'Pending').length} onClick={() => setTab('transfers')} />
          <TabButton active={tab === 'imports'} label={t('recommendations.imports')} count={imports.filter((item) => statusOf(item.id) === 'Pending').length} onClick={() => setTab('imports')} />
        </div>
        <div className="flex gap-1.5 rounded-xl border border-border bg-surface-soft p-1" aria-label={t('recommendations.viewMode')}>
          <Button size="sm" variant={view === 'table' ? 'default' : 'ghost'} onClick={() => setView('table')}>
            <List className="size-3.5" />
            {t('recommendations.table')}
          </Button>
          <Button size="sm" variant={view === 'board' ? 'default' : 'ghost'} onClick={() => setView('board')}>
            <LayoutGrid className="size-3.5" />
            {t('recommendations.board')}
          </Button>
        </div>
      </div>

      <SectionCard title={tab === 'transfers' ? t('recommendations.transfers') : t('recommendations.imports')} subtitle={t('recommendations.viewMode')}>
        {view === 'table' ? (
          <div className="vms-scroll overflow-x-auto">
            <table className="vms-table min-w-[900px]">
              <thead>
                <tr>
                  <th>{tab === 'transfers' ? t('recommendations.transfer') : t('recommendations.window')}</th>
                  <th>{t('recommendations.part')}</th>
                  <th className="vms-num">{t('recommendations.quantity')}</th>
                  <th className="vms-num">{t('recommendations.benefit')}</th>
                  <th className="vms-num">{t('recommendations.cost')}</th>
                  <th className="vms-num">{t('recommendations.net')}</th>
                  <th>{t('recommendations.decision')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} data-highlight={focus === item.id}>
                    <td>
                      <div className="text-xs font-semibold">{item.id}</div>
                      <div className="vms-muted mt-0.5 max-w-[210px] text-[10.5px]">{routeLabel(item)}</div>
                    </td>
                    <td className="max-w-[220px] text-xs">{t(item.partKey)}</td>
                    <td className="vms-num text-xs">{formatNumber(item.qty)}</td>
                    <td className="vms-num text-xs text-[var(--success)]">{formatMoney(item.benefit)}</td>
                    <td className="vms-num text-xs text-muted-foreground">{formatMoney(item.cost)}</td>
                    <td className="vms-num text-xs font-bold">{formatMoney(item.benefit - item.cost)}</td>
                    <td>{renderActions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} data-highlight={focus === item.id} className="vms-card vms-card-hover p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold">{item.id}</div>
                    <div className="vms-muted mt-0.5 text-[10.5px]">{routeLabel(item)}</div>
                  </div>
                  <DecisionBadge status={statusOf(item.id)} />
                </div>
                <p className="mt-3 text-sm font-semibold">{t(item.partKey)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-surface-soft p-2">
                    <div className="vms-label text-[9px]">{t('recommendations.quantity')}</div>
                    <div className="vms-num mt-1 text-sm font-bold">{formatNumber(item.qty)}</div>
                  </div>
                  <div className="rounded-lg bg-surface-soft p-2">
                    <div className="vms-label text-[9px]">{t('recommendations.benefit')}</div>
                    <div className="vms-num mt-1 text-sm font-bold text-[var(--success)]">{formatMoney(item.benefit)}</div>
                  </div>
                  <div className="rounded-lg bg-surface-soft p-2">
                    <div className="vms-label text-[9px]">{t('recommendations.net')}</div>
                    <div className="vms-num mt-1 text-sm font-bold">{formatMoney(item.benefit - item.cost)}</div>
                  </div>
                </div>
                <div className="mt-4">{renderActions(item)}</div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-soft p-3 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {t('recommendations.note')}
        </div>
      </SectionCard>

      <Dialog open={Boolean(modal)} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal?.kind === 'edit' ? t('recommendations.editTitle', { id: modal?.id ?? '' }) : t('recommendations.rejectTitle', { id: modal?.id ?? '' })}</DialogTitle>
            <DialogDescription>{modal?.kind === 'edit' ? t('recommendations.editBody') : t('recommendations.rejectBody')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="reason" className="vms-label">{t('recommendations.reason')}</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
              rows={4}
              placeholder={modal?.kind === 'edit' ? t('recommendations.editPlaceholder') : t('recommendations.rejectPlaceholder')}
              className={cn('w-full rounded-lg border border-border bg-surface-soft p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15', reasonError && 'border-destructive')}
            />
            {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>{t('common.cancel')}</Button>
            <Button onClick={submitReason}>
              {modal?.kind === 'edit' ? t('recommendations.saveEdit') : t('recommendations.confirmRejection')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground',
      )}
    >
      {label}
      <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] tabular-nums', active ? 'bg-white/20' : 'bg-muted')}>{count}</span>
    </button>
  );
}

function DecisionBadge({ status }: { status: DecisionStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', style.className)}>
      {status === 'Approved' && <CheckCircle2 className="size-3" />}
      {status === 'Rejected' && <XCircle className="size-3" />}
      {t(style.key)}
    </span>
  );
}
