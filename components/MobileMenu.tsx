'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import LanguageSwitch from '@/components/LanguageSwitch';
import type { Route } from 'next';

type Item = { href: string; label: string };
type Props = {
  /** Accept readonly arrays to be compatible with `as const` call sites */
  items: ReadonlyArray<Item>;
  donateHref: string;
  donateLabel: string;
  locale: 'uk'|'en';
};

export default function MobileMenu({items, donateHref, donateLabel, locale}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={btnRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:bg-slate-50"
      >
        {/* burger icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="sr-only">Menu</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          id="mobile-menu-panel"
          tabIndex={-1}
          ref={panelRef}
          className="fixed inset-0 z-[60]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Sheet */}
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-[420px] bg-white shadow-xl p-6 overflow-y-auto focus:outline-none">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Меню</div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl border hover:bg-slate-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href as Route}
                  className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-800"
                  onClick={() => setOpen(false)}
                >
                  {i.label}
                </Link>
              ))}
              <Link
                href={donateHref as Route}
                className="mt-2 inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-brand text-white hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                {donateLabel}
              </Link>
            </nav>

            <hr className="my-4" />
            <div className="flex">
              <LanguageSwitch locale={locale} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}