import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const INTL_LOCALES: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-DZ',
  ar: 'ar-DZ',
  zgh: 'fr-DZ-u-nu-latn',
};

export function useFormat() {
  const { i18n } = useTranslation();
  const locale = INTL_LOCALES[i18n.language] ?? INTL_LOCALES.en;

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value),
    [locale],
  );

  const formatMoney = useCallback(
    (value: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} DA`,
    [locale],
  );

  const formatDate = useCallback(
    (value: string | Date) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    },
    [locale],
  );

  const formatPercent = useCallback(
    (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value) + '%',
    [locale],
  );

  return { locale, formatNumber, formatMoney, formatDate, formatPercent };
}
