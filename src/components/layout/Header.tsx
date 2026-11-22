import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Languages, LogOut, Menu, Moon, RefreshCw, Sun } from 'lucide-react';
import { LogoMotion } from '@/components/brand/LogoMotion';
import { VmsLogo } from '@/components/brand/VmsLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/skiper-ui/skiper101';
import { useAuth } from '@/features/auth/AuthContext';
import { LANGUAGES } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/common/ToastProvider';
import { GlobalSearch } from '@/features/search/GlobalSearch';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const initials = (user?.displayName ?? 'VMS')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="vms-glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-md p-2 hover:bg-muted lg:hidden" aria-label={t('common.workspace')}>
        <Menu className="size-5" />
      </button>

      <button type="button" onClick={() => navigate('/dashboard/overview')} className="hidden shrink-0 md:block" aria-label={t('common.appName')}>
        <LogoMotion variant="header">
          <VmsLogo size="sm" showText={false} />
        </LogoMotion>
      </button>

      <div className="min-w-0 flex-1">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('common.actions.refresh')} onClick={() => notify(t('admin.refreshToast'))}>
              <RefreshCw className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('common.actions.refresh')}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('header.language')}>
              <Languages className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuLabel>{t('header.language')}</DropdownMenuLabel>
            {LANGUAGES.map((language) => (
              <DropdownMenuItem key={language.code} onSelect={() => void i18n.changeLanguage(language.code)}>
                <span className="flex-1">{language.label}</span>
                {i18n.language === language.code && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t('header.themeToggle')}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('header.themeToggle')}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="ms-1 flex size-9 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white" aria-label={t('header.userMenu')}>
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel>
              <div className="text-sm font-semibold">{user?.displayName}</div>
              <div className="text-[11px] font-normal text-muted-foreground">{user?.username}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()} className="text-destructive focus:text-destructive">
              <LogOut className="me-2 size-4" />
              {t('common.actions.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
