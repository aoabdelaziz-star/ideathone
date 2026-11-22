import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LogoMotion } from '@/components/brand/LogoMotion';
import { VmsBackdrop } from '@/components/brand/VmsBackdrop';
import { VmsLogo } from '@/components/brand/VmsLogo';

/** Shown once per browser session, then fades into the app. */
export function SplashScreen({ onComplete, status }: { onComplete: () => void; status?: string }) {
  const { t } = useTranslation();
  const authStatus = status ?? sessionStorage.getItem('vms.splashAuthStatus');

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] isolate grid place-items-center bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--primary)_12%,var(--surface)),var(--background)_70%)] px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      role="status"
      aria-live="polite"
    >
      <VmsBackdrop />
      <div className="flex w-full max-w-lg flex-col items-center gap-10">
        <LogoMotion variant="splash">
          <VmsLogo size="lg" animated />
        </LogoMotion>

        <div className="w-full max-w-xs space-y-4 text-center">
          <p className="text-sm font-semibold tracking-wide">{t('splash.welcome')}</p>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="vms-muted text-xs">
            {authStatus === 'guest' ? t('splash.signedOut') : t('splash.loading')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
