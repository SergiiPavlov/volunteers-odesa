'use client';

import {useEffect, useId, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {Route} from 'next';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import type {AppLocale} from '@/i18n';

export type LocaleOption = {code: AppLocale; label: string};

type Props = {
  locale: AppLocale;
  locales: ReadonlyArray<LocaleOption>;
  className?: string;
};

export default function LanguageDropdown({locale, locales, className}: Props) {
  const tDropdown = useTranslations('components.languageDropdown');
  const tLanguages = useTranslations('languages');
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);

  const currentIndex = useMemo(() => locales.findIndex((option) => option.code === locale), [locales, locale]);
  const [highlightedIndex, setHighlightedIndex] = useState(() => (currentIndex >= 0 ? currentIndex : 0));

  const listboxId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
    const indexToFocus = locales[highlightedIndex] ? highlightedIndex : fallbackIndex;

    if (!locales[highlightedIndex]) {
      setHighlightedIndex(fallbackIndex);
    }

    const timeout = window.setTimeout(() => {
      optionRefs.current[indexToFocus]?.focus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open, currentIndex, highlightedIndex, locales]);

  const localeCodes = useMemo(() => locales.map((option) => option.code), [locales]);

  function navigateTo(targetLocale: AppLocale) {
    if (targetLocale === locale) {
      setOpen(false);
      return;
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      segments.push(targetLocale);
    } else if (localeCodes.includes(segments[0] as AppLocale)) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }

    const search = searchParams?.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    let nextPath = `/${segments.join('/')}`;
    if (search) {
      nextPath += `?${search}`;
    }
    if (hash) {
      nextPath += hash;
    }

    setOpen(false);
    router.push(nextPath as Route);
  }

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!open) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const length = locales.length;
        if (length === 0) {
          return prev;
        }
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        return (prev + delta + length) % length;
      });
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(Math.max(0, locales.length - 1));
    }
  }

  useEffect(() => {
    if (open) {
      optionRefs.current[highlightedIndex]?.focus();
    }
  }, [open, highlightedIndex]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={tDropdown('ariaLabel', {language: tLanguages(locale)})}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const length = locales.length;
            if (length === 0) {
              return;
            }
            const baseIndex = currentIndex >= 0 ? currentIndex : 0;
            const delta = event.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = (baseIndex + delta + length) % length;
            setHighlightedIndex(nextIndex);
            setOpen(true);
          }
        }}
        className="inline-flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span aria-hidden="true">{locales[currentIndex]?.label ?? locale.toUpperCase()}</span>
        <span className="sr-only">{tDropdown('currentLanguage', {language: tLanguages(locale)})}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          id={listboxId}
          aria-activedescendant={`${listboxId}-${locales[highlightedIndex]?.code ?? ''}`}
          tabIndex={-1}
          className="absolute right-0 z-50 mt-2 w-36 rounded-xl border bg-white py-1 shadow-lg focus:outline-none"
          onKeyDown={handleListKeyDown}
        >
          {locales.map((option, index) => (
            <button
              key={option.code}
              type="button"
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              id={`${listboxId}-${option.code}`}
              role="option"
              aria-selected={option.code === locale}
              onClick={() => navigateTo(option.code)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigateTo(option.code);
                }
              }}
              className={`flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none ${
                highlightedIndex === index ? 'bg-slate-100' : ''
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span>{tDropdown('optionLabel', {label: option.label, language: tLanguages(option.code)})}</span>
              {option.code === locale ? (
                <span className="text-brand" aria-hidden="true">
                  •
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
