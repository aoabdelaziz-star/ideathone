import { cn } from '@/lib/utils';

/**
 * VMS identity backdrop: charcoal + signature red/cyan glow, a technical
 * blueprint grid, diagonal guide lines and a faint VMS wordmark.
 * Purely decorative and pointer-event free.
 */
export function VmsBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('vms-backdrop', className)}>
      <div className="vms-backdrop-glow vms-backdrop-glow-primary" />
      <div className="vms-backdrop-glow vms-backdrop-glow-cyan" />
      <div className="vms-backdrop-grid" />
      <div className="vms-backdrop-lines" />
      <div className="vms-backdrop-wordmark">VMS</div>
      <div className="vms-backdrop-vignette" />
    </div>
  );
}
