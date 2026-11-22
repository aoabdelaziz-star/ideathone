import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Package, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { buildSearchIndex, filterSearchIndex, Highlight } from './searchIndex';

export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 250);
  const index = useMemo(() => buildSearchIndex(t), [t]);
  const results = useMemo(() => filterSearchIndex(index, debounced), [index, debounced]);
  const active = Math.max(0, results.findIndex((item) => item.id === activeId));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  const select = (item: (typeof results)[number]) => {
    const params = new URLSearchParams();
    if (item.focus) params.set('focus', item.focus);
    if (item.tab) params.set('tab', item.tab);
    navigate(`/dashboard/${item.page}${params.size ? `?${params.toString()}` : ''}`);
    setQuery('');
    setActiveId(null);
    setOpen(false);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveId(results[Math.min(active + 1, results.length - 1)]?.id ?? null);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveId(results[Math.max(active - 1, 0)]?.id ?? null);
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      select(results[active]);
    }
  };

  const groups = [
    { key: 'parts', label: t('search.parts'), items: results.filter((item) => item.group === 'parts'), icon: Package },
    { key: 'pages', label: t('search.pages'), items: results.filter((item) => item.group === 'pages'), icon: FileText },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-soft px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveId(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder={t('header.searchPlaceholder')}
          aria-label={t('header.searchAria')}
          aria-expanded={open}
          aria-controls="vms-search-results"
          aria-activedescendant={results[active] ? `vms-search-option-${results[active].id}` : undefined}
          role="combobox"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button type="button" onClick={() => { setQuery(''); setActiveId(null); }} aria-label={t('search.close')} className="rounded p-0.5 hover:bg-muted">
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">⌘K</kbd>
        )}
      </div>

      {open && (query || debounced) && (
        <div
          id="vms-search-results"
          role="listbox"
          className="vms-card absolute start-0 top-[calc(100%+8px)] z-50 max-h-[min(420px,65vh)] w-full overflow-y-auto p-2 shadow-lg"
        >
          {results.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">{t('search.noResults', { query: debounced })}</p>
          ) : (
            groups.map((group) =>
              group.items.length ? (
                <div key={group.key} className="mb-1">
                  <p className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <group.icon className="size-3" aria-hidden="true" />
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const itemIndex = results.findIndex((result) => result.id === item.id);
                    return (
                      <button
                        key={item.id}
                        id={`vms-search-option-${item.id}`}
                        role="option"
                        aria-selected={itemIndex === active}
                        type="button"
                        onMouseEnter={() => setActiveId(item.id)}
                        onClick={() => { select(item); inputRef.current?.blur(); }}
                        className={cn(
                          'flex w-full items-start gap-2 rounded-md px-2 py-2 text-start transition-colors',
                          itemIndex === active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold">
                            <Highlight text={item.title} query={debounced} />
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            <Highlight text={item.subtitle} query={debounced} />
                          </div>
                        </div>
                        {item.reference && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">{item.reference}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : null,
            )
          )}
          <p className="border-t border-border px-2 pt-2 text-[10px] text-muted-foreground">{t('search.hint')}</p>
        </div>
      )}
    </div>
  );
}
