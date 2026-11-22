import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vms.theme';

function readTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next = event.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      setThemeState(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setThemeState(next);
  }, []);

  return { theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}

/** Returns live CSS token values so charts and the 3D scene follow the theme. */
export function useThemeTokens() {
  const [tokens, setTokens] = useState(() => readTokens());

  useEffect(() => {
    const observer = new MutationObserver(() => setTokens(readTokens()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return tokens;
}

function readTokens() {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    foreground: token('--foreground', '#14161c'),
    muted: token('--muted-foreground', '#63666e'),
    border: token('--border', '#e3e5e8'),
    grid: token('--grid-line', '#eef2f7'),
    primary: token('--primary', '#e31b23'),
    surface: token('--surface', '#ffffff'),
    success: token('--success', '#16a34a'),
    warning: token('--warning', '#d97706'),
  };
}
