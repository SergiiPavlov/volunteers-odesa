'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import type { Route } from 'next';

type LocaleOption = { code: string; label: string };

type Props = {
  locale: 'uk' | 'en';
  locales?: ReadonlyArray<LocaleOption>;
};

const FALLBACK_LOCALES: ReadonlyArray<LocaleOption> = [
  { code: 'uk', label: 'UA' },
  { code: 'en', label: 'EN' }
];

export default function LanguageDropdown({ locale, locales }: Props) {
  const options: ReadonlyArray<LocaleOption> =
    Array.isArray(locales) && locales.length > 0 ? locales : FALLBACK_LOCALES;

  const pathname = usePathname() || '/';
  const router = useRouter();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = useMemo(() => {
    for (let i = 0; i < options.length; i++) {
      if (options[i].code === locale) return i;
    }
    return 0;
  }, [options, locale]);

  useEffect(() => {
    setHighlightedIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        btnRef.current && !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  function toPath(target: string): Route {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      return ('/' + target + (search?.toString() ? '?' + search!.toString() : '')) as Route;
    }
    if (parts[0] === 'uk' || parts[0] === 'en') parts[0] = target;
    else parts.unshift(target);
    const base = '/' + parts.join('/');
    return (base + (search?.toString() ? '?' + search!.toString() : '')) as Route;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((highlightedIndex + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((highlightedIndex - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = options[highlightedIndex];
      if (target) {
        setOpen(false);
        router.push(toPath(target.code));
      }
    }
  }

  const current = options[currentIndex] || options[0];

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-2 rounded-xl border hover:bg-slate-50 text-sm inline-flex items-center gap-1"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="absolute right-0 mt-2 w-28 bg-white border rounded-xl shadow-lg p-1 z-[70]"
        >
          {options.map((opt, idx) => (
            <button
              key={opt.code}
              role="option"
              aria-selected={opt.code === locale}
              onClick={() => {
                setOpen(false);
                router.push(toPath(opt.code));
              }}
              className={"w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 " + (idx === highlightedIndex ? "bg-slate-100" : "")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}