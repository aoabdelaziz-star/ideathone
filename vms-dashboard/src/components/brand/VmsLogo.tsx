import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import logoUrl from '@/assets/vms-logo.png';
import { cn } from '@/lib/utils';

interface VmsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const SIZES = { sm: 'h-8 w-16', md: 'h-10 w-20', lg: 'h-24 w-48 sm:h-28 sm:w-56' } as const;

export function VmsLogo({ size = 'md', showText = true, animated = false, className }: VmsLogoProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.img
        src={logoUrl}
        alt="VMS"
        draggable={false}
        initial={animated ? { opacity: 0, scale: 0.94 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn('shrink-0 object-contain', SIZES[size], animated && 'vms-logo-pulse')}
      />
      {showText && (
        <div className="min-w-0">
          <div className={cn('font-extrabold tracking-tight', size === 'lg' ? 'text-2xl' : 'text-[15px]')}>
            {t('common.appName')}
          </div>
          {size !== 'sm' && (
            <div className="vms-label truncate text-[9px] sm:text-[10px]">{t('common.tagline')}</div>
          )}
        </div>
      )}
    </div>
  );
}
