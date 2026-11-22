import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ar } from './locales/ar';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { zgh } from './locales/zgh';

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zgh', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', dir: 'ltr' },
] as const;

export const LANGUAGE_SETTINGS_KEY = 'vms.language';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_SETTINGS_KEY);
    if (saved && LANGUAGES.some((language) => language.code === saved)) return saved;
  } catch {
    /* ignore unavailable storage */
  }
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('ar')) return 'ar';
  if (browser.startsWith('fr')) return 'fr';
  if (browser.startsWith('zgh') || browser.startsWith('tzm')) return 'zgh';
  return 'en';
}

export function applyDocumentLanguage(language: string) {
  const config = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];
  document.documentElement.lang = config.code;
  document.documentElement.dir = config.dir;
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar }, zgh: { translation: zgh } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', (language) => {
  applyDocumentLanguage(language);
  try {
    localStorage.setItem(LANGUAGE_SETTINGS_KEY, language);
  } catch {
    /* ignore unavailable storage */
  }
});

export default i18n;
