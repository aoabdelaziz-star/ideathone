import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import AnimatedButton from '@/components/ui/animated-button';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { AnimatedRays } from '@/components/ui/animated-rays';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { VmsBackdrop } from '@/components/brand/VmsBackdrop';
import { VmsLogo } from '@/components/brand/VmsLogo';
import { useTheme } from '@/hooks/useTheme';
import { LANGUAGES } from '@/i18n';
import { cn } from '@/lib/utils';
import { AuthError, loginSchema, type LoginValues } from './authService';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [values, setValues] = useState<LoginValues>({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginValues, string>>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof LoginValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginValues;
        next[field] = t(`login.${issue.message}`);
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signIn(parsed.data);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/dashboard/overview', { replace: true });
    } catch (error) {
      const code = error instanceof AuthError ? error.code : 'unknown';
      setFormError(t(`login.${code}`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      <VmsBackdrop />
      <AnimatedRays className="pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="absolute end-4 top-4 flex items-center gap-2">
        <select
          value={i18n.language}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
          aria-label={t('header.language')}
          className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs shadow-sm"
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>{language.label}</option>
          ))}
        </select>
        <button type="button" onClick={toggleTheme} className="rounded-md border border-border bg-surface p-2 shadow-sm" aria-label={t('header.themeToggle')}>
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      <HoverBorderGradient as="div" className="w-full rounded-2xl p-[1px]" containerClassName="w-full max-w-4xl rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid overflow-hidden rounded-2xl bg-surface shadow-xl md:grid-cols-2"
        >
          <div className="relative hidden flex-col justify-between bg-[linear-gradient(150deg,#17191f,#252932_55%,#3a1115)] p-10 text-white md:flex">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,var(--primary),transparent_45%)]" />
            <div className="relative">
              <VmsLogo size="md" />
            </div>
            <div className="relative space-y-4">
              <AnimatedGradientText className="text-xs font-bold uppercase tracking-[0.2em]">
                {t('login.eyebrow')}
              </AnimatedGradientText>
              <h2 className="text-3xl font-extrabold leading-tight">{t('login.title')}</h2>
              <p className="max-w-sm text-sm text-white/70">{t('login.subtitle')}</p>
            </div>
            <div className="relative flex items-center gap-2 text-xs text-white/60">
              <ShieldCheck className="size-4 text-emerald-400" />
              {t('login.securityNote')}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-7 md:hidden">
              <VmsLogo size="sm" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:hidden">{t('login.title')}</h1>
            <p className="vms-muted mb-7 mt-1 text-sm md:hidden">{t('login.subtitle')}</p>

            <form onSubmit={submit} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="username" className="vms-label">{t('login.username')}</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={values.username}
                    onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
                    placeholder={t('login.usernamePlaceholder')}
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    className={cn(
                      'h-11 w-full rounded-lg border border-border bg-surface-soft ps-10 pe-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
                      errors.username && 'border-destructive',
                    )}
                  />
                </div>
                {errors.username && <p id="username-error" className="text-xs text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="vms-label">{t('login.password')}</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={values.password}
                    onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                    placeholder={t('login.passwordPlaceholder')}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={cn(
                      'h-11 w-full rounded-lg border border-border bg-surface-soft ps-10 pe-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
                      errors.password && 'border-destructive',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={values.remember}
                  onChange={(event) => setValues((current) => ({ ...current, remember: event.target.checked }))}
                  className="size-4 rounded border-border accent-[var(--primary)]"
                />
                {t('login.remember')}
              </label>

              {formError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert" className="flex items-center gap-2 rounded-lg bg-[var(--primary-soft)] p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {formError}
                </motion.p>
              )}

              <AnimatedButton type="submit" disabled={loading} className="h-11 w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('login.submitting')}
                  </span>
                ) : t('login.submit')}
              </AnimatedButton>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-soft p-3 text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{t('login.demoTitle')}:</strong> omar nad / admin123
              <br />
              {t('login.demoNote')}
            </div>
          </div>
        </motion.div>
      </HoverBorderGradient>
    </div>
  );
}
