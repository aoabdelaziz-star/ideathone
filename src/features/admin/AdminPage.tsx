import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ClipboardCheck, Download, RefreshCw, ShieldCheck, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { DATA_SOURCES, MODEL_VERSIONS } from '@/data/seed';
import { useDashboardState } from '@/features/dashboard-state/DashboardStateContext';
import { useFormat } from '@/i18n/format';
import { cn } from '@/lib/utils';
import type { JitGrant } from '@/types';

const ROLES = ['roles.tempAdmin', 'roles.dataSteward', 'roles.auditor'];
const SCOPES = ['scopes.forecast', 'scopes.imports', 'scopes.admin'];

export default function AdminPage() {
  const { t } = useTranslation();
  const notify = useToast();
  const { formatNumber, formatDate } = useFormat();
  const { audit, grants, addGrant, revokeGrant, recordEvent } = useDashboardState();
  const [grantOpen, setGrantOpen] = useState(false);
  const [user, setUser] = useState('');
  const [roleKey, setRoleKey] = useState(ROLES[0]);
  const [scopeKey, setScopeKey] = useState(SCOPES[0]);
  const [duration, setDuration] = useState(4);
  const [validation, setValidation] = useState('');

  const exportAudit = () => {
    const rows = [
      [t('admin.timestamp'), t('admin.actor'), t('admin.action'), t('admin.target'), t('admin.detail')],
      ...audit.map((entry) => [entry.ts, entry.user, t(entry.actionKey), entry.target, entry.detail]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `vms-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(t('admin.exportToast'));
  };

  const submitGrant = () => {
    if (!user.trim() || !scopeKey) {
      setValidation(t('admin.grantValidation'));
      return;
    }
    const start = new Date();
    const expiry = new Date(start.getTime() + duration * 60 * 60 * 1000);
    const grant: JitGrant = {
      roleKey,
      user: user.trim(),
      scopeKey,
      start: formatDate(start),
      expiry: formatDate(expiry),
      status: 'Active',
    };
    addGrant(grant);
    notify(t('admin.grantToast', { user: grant.user }));
    setGrantOpen(false);
    setUser('');
    setValidation('');
  };

  const rollback = (version: string) => {
    recordEvent('audit.rollback', version, t('admin.rollbackToast'));
    notify(t('admin.rollbackToast'));
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => notify(t('admin.refreshToast'))}>
              <RefreshCw className="size-4" />
              {t('common.actions.refresh')}
            </Button>
            <ShimmerButton
              background="var(--primary)"
              className="h-9 px-3 text-[11px] font-semibold"
              onClick={() => setGrantOpen(true)}
            >
              <UserPlus className="me-1.5 size-3.5" />
              {t('common.actions.grantAccess')}
            </ShimmerButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={<ShieldCheck className="size-4" />} label={t('common.activeGrants')} value={formatNumber(grants.filter((grant) => grant.status === 'Active').length)} />
        <MiniStat icon={<Activity className="size-4" />} label={t('admin.dataSources')} value={formatNumber(DATA_SOURCES.filter((source) => source.status === 'Healthy').length)} suffix={`/ ${DATA_SOURCES.length}`} />
        <MiniStat icon={<ClipboardCheck className="size-4" />} label={t('common.recordedEvents')} value={formatNumber(audit.length)} />
      </div>

      <SectionCard title={t('admin.jitTitle')} subtitle={t('admin.jitSubtitle')}>
        <div className="vms-scroll overflow-x-auto">
          <table className="vms-table min-w-[720px]">
            <thead>
              <tr>
                <th>{t('admin.roleUser')}</th>
                <th>{t('admin.scope')}</th>
                <th>{t('admin.since')}</th>
                <th>{t('admin.expires')}</th>
                <th>{t('alerts.status')}</th>
                <th>{t('admin.action')}</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant, index) => (
                <tr key={`${grant.user}-${index}`}>
                  <td>
                    <div className="text-xs font-semibold">{t(grant.roleKey)}</div>
                    <div className="vms-muted mt-0.5 text-[10.5px]">{grant.user}</div>
                  </td>
                  <td className="text-xs">{t(grant.scopeKey)}</td>
                  <td className="vms-muted whitespace-nowrap text-[11px]">{grant.start}</td>
                  <td className="vms-muted whitespace-nowrap text-[11px]">{grant.expiry}</td>
                  <td>
                    <Badge variant={grant.status === 'Active' ? 'default' : 'secondary'}>
                      {t(grant.status === 'Active' ? 'admin.active' : 'admin.expired')}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={grant.status !== 'Active'}
                      onClick={() => {
                        revokeGrant(index);
                        notify(t('admin.revokeToast', { user: grant.user }));
                      }}
                    >
                      {t('common.actions.revoke')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title={t('admin.dataSources')} subtitle={t('admin.dataSourcesSubtitle')} actions={<Badge variant="secondary">{t('admin.healthyBadge')}</Badge>}>
          <div className="space-y-2">
            {DATA_SOURCES.map((source) => (
              <div key={source.nameKey} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-soft p-3">
                <span className={cn('size-2 shrink-0 rounded-full', source.status === 'Healthy' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]')} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{t(source.nameKey)}</div>
                  <div className="vms-muted mt-0.5 text-[10.5px]">{t(source.syncKey)} · {source.records}</div>
                </div>
                <div className="vms-num text-[11px] text-muted-foreground">{source.latency}</div>
                <Badge variant={source.status === 'Healthy' ? 'default' : 'secondary'}>
                  {t(source.status === 'Healthy' ? 'common.sourceStatus.healthy' : 'common.sourceStatus.degraded')}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t('admin.versions')} subtitle={t('admin.versionsSubtitle')}>
          <div className="vms-scroll overflow-x-auto">
            <table className="vms-table min-w-[520px]">
              <thead>
                <tr>
                  <th>{t('admin.version')}</th>
                  <th>{t('admin.deployed')}</th>
                  <th>{t('admin.accuracy')}</th>
                  <th>{t('alerts.status')}</th>
                  <th>{t('admin.action')}</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_VERSIONS.map((version) => (
                  <tr key={version.version}>
                    <td>
                      <div className="text-xs font-semibold">{version.version}</div>
                      <div className="vms-muted mt-0.5 max-w-[200px] text-[10px]">{t(version.noteKey)}</div>
                    </td>
                    <td className="vms-num text-[11px]">{formatDate(version.date)}</td>
                    <td className="vms-num text-xs font-bold">{version.accuracy}</td>
                    <td>
                      <Badge variant={version.status === 'Production' ? 'default' : 'secondary'}>
                        {t(`common.versionStatus.${version.status.toLowerCase()}`)}
                      </Badge>
                    </td>
                    <td>
                      <Button size="xs" variant="ghost" onClick={() => rollback(version.version)}>
                        {t('common.actions.rollback')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title={t('admin.auditLog')}
        subtitle={t('admin.auditSubtitle')}
        actions={
          <Button size="sm" variant="outline" onClick={exportAudit}>
            <Download className="size-4" />
            {t('common.exportCsv')}
          </Button>
        }
      >
        <div className="vms-scroll max-h-[360px] overflow-auto">
          <table className="vms-table min-w-[760px]">
            <thead>
              <tr>
                <th>{t('admin.timestamp')}</th>
                <th>{t('admin.actor')}</th>
                <th>{t('admin.action')}</th>
                <th>{t('admin.target')}</th>
                <th>{t('admin.detail')}</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry, index) => (
                <tr key={`${entry.ts}-${entry.target}-${index}`}>
                  <td className="vms-num whitespace-nowrap text-[11px]">{formatDate(entry.ts)}</td>
                  <td className="text-xs font-semibold">{entry.user}</td>
                  <td className="text-xs">{t(entry.actionKey)}</td>
                  <td className="vms-muted text-xs">{entry.target}</td>
                  <td className="vms-muted max-w-[320px] text-[11px]">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.grantTitle')}</DialogTitle>
            <DialogDescription>{t('admin.grantNote')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="vms-label">{t('admin.role')}</span>
              <Select value={roleKey} onValueChange={setRoleKey}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((role) => <SelectItem key={role} value={role}>{t(role)}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="vms-label">{t('admin.scope')}</span>
              <Select value={scopeKey} onValueChange={setScopeKey}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{SCOPES.map((scope) => <SelectItem key={scope} value={scope}>{t(scope)}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="vms-label">{t('admin.user')}</span>
              <Input value={user} onChange={(event) => { setUser(event.target.value); setValidation(''); }} placeholder={t('admin.userPlaceholder')} />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="vms-label">{t('admin.duration')}</span>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={24} value={duration} onChange={(event) => setDuration(Number(event.target.value) || 1)} className="w-24" />
                <span className="text-xs text-muted-foreground">{t('admin.hoursSuffix')}</span>
              </div>
            </label>
          </div>
          {validation && <p className="text-xs text-destructive">{validation}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={submitGrant}>{t('common.actions.grantAccess')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="vms-card flex items-center gap-3 p-4">
      <span className="grid size-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">{icon}</span>
      <div>
        <div className="vms-label">{label}</div>
        <div className="vms-num mt-1 text-xl font-bold">
          {value} {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
