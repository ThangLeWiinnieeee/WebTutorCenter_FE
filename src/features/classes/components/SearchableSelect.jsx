import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  ChevronDown,
  Search,
  X,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn, normalizeForSearch } from '@/lib/utils';

/** Large lists: show subset until user types (cheaper than mounting hundreds of controls). */
const OPEN_FULL_RENDER_MAX = 90;
const OPEN_SLICED_CAP = 72;
const SEARCH_MATCH_CAP = 200;

function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  allValue,
  allLabel,
  options,
  searchPlaceholder,
  emptyText,
  disabled = false,
  triggerClassName = '',
  contentClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);

  const updateCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (open) updateCoords();
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateCoords();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updateCoords]);

  const closePanel = useCallback(() => {
    setSearchKeyword('');
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      closePanel();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('mousedown', onDocPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const displayLabel = useMemo(() => {
    if (allLabel && String(value) === String(allValue)) return allLabel;
    const found = options.find((o) => String(o.value) === String(value));
    return found?.label ?? placeholder ?? '';
  }, [value, allValue, allLabel, options, placeholder]);

  const filteredOptions = useMemo(() => {
    const keyword = normalizeForSearch(searchKeyword);
    if (!keyword) return options;
    return options.filter((item) => normalizeForSearch(item.label).includes(keyword));
  }, [options, searchKeyword]);

  const { rowItems, listHint } = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (keyword) {
      if (filteredOptions.length <= SEARCH_MATCH_CAP) {
        return { rowItems: filteredOptions, listHint: null };
      }
      return {
        rowItems: filteredOptions.slice(0, SEARCH_MATCH_CAP),
        listHint: `Hiển thị ${SEARCH_MATCH_CAP} kết quả đầu. Thu hẹp từ khóa (${filteredOptions.length} mục).`,
      };
    }
    if (filteredOptions.length <= OPEN_FULL_RENDER_MAX) {
      return { rowItems: filteredOptions, listHint: null };
    }
    const sorted = [...filteredOptions].sort((a, b) =>
      a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }),
    );
    return {
      rowItems: sorted.slice(0, OPEN_SLICED_CAP),
      listHint: `Hiển thị ${OPEN_SLICED_CAP}/${filteredOptions.length}. Gõ để xem đầy đủ.`,
    };
  }, [filteredOptions, searchKeyword]);

  const pick = useCallback(
    (nextVal) => {
      setSearchKeyword('');
      onValueChange(nextVal);
      setOpen(false);
    },
    [onValueChange],
  );

  const handleClear = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange('');
    setSearchKeyword('');
  }, [onValueChange]);

  const hasValue = useMemo(() => {
    return value !== undefined && value !== null && value !== '' && (!allLabel || String(value) !== String(allValue));
  }, [value, allValue, allLabel]);

  const dropdown =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className={cn(
              'z-[200] flex max-h-[min(20rem,70vh)] flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-lg',
              contentClassName,
            )}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: Math.max(coords.width, 200),
            }}
          >
            <div className="shrink-0 border-b border-slate-100 bg-white p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 border-slate-200 pl-8 text-xs focus-visible:ring-emerald-200"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-1">
              {allLabel && (
                <button
                  type="button"
                  role="option"
                  aria-selected={String(value) === String(allValue)}
                  className={cn(
                    'flex w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none transition',
                    String(value) === String(allValue)
                      ? 'bg-emerald-50 font-medium text-emerald-900'
                      : 'text-slate-900 hover:bg-slate-100',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(String(allValue))}
                >
                  {allLabel}
                </button>
              )}
              {rowItems.map((item) => {
                const selected = String(value) === String(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cn(
                      'flex w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none transition',
                      selected ? 'bg-emerald-50 font-medium text-emerald-900' : 'text-slate-900 hover:bg-slate-100',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(String(item.value))}
                  >
                    {item.label}
                  </button>
                );
              })}
              {listHint && (
                <div className="border-t border-slate-100 px-2 py-1.5 text-[11px] leading-snug text-slate-500">
                  {listHint}
                </div>
              )}
              {filteredOptions.length === 0 && (
                <div className="px-2 py-2 text-xs text-slate-500">{emptyText}</div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (open) setSearchKeyword('');
          setOpen((prev) => !prev);
        }}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0 [&>span]:truncate',
          triggerClassName,
        )}
      >
        <span className={cn('text-left', !displayLabel && 'text-slate-500')}>
          {displayLabel || placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
        </div>
      </button>
      {dropdown}
    </div>
  );
}

export default memo(SearchableSelect);
