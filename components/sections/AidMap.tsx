'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import aidMapUk from '@/content/aid-map.uk.json';
import aidMapEn from '@/content/aid-map.en.json';
import reportsUk from '@/content/reports.uk.json';
import reportsEn from '@/content/reports.en.json';

const MAP_BOUNDS = {
  minLat: 44,
  maxLat: 52.5,
  minLng: 22,
  maxLng: 40.5,
};

type Locale = 'uk' | 'en';

type AidLocation = {
  id: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  cases: number;
  summary: string;
  reportId?: string;
};

type ReportEntry = {
  id: string;
  title: string;
  file?: string;
};

const MAP_DATA_BY_LOCALE = {
  uk: aidMapUk,
  en: aidMapEn,
} satisfies Record<Locale, AidLocation[]>;

const REPORTS_BY_LOCALE = {
  uk: reportsUk,
  en: reportsEn,
} satisfies Record<Locale, ReportEntry[]>;

function getCasesKey(count: number, locale: Locale) {
  if (locale === 'uk') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'cases_one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'cases_few';
    return 'cases_many';
  }

  return count === 1 ? 'cases_one' : 'cases_many';
}

function projectPoint(lat: number, lng: number) {
  const x = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
  const y = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);

  return {
    left: `${Math.min(Math.max(x, 0), 1) * 100}%`,
    top: `${Math.min(Math.max(y, 0), 1) * 100}%`,
  } as const;
}

export default function AidMap() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home.map');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const locations = useMemo(() => MAP_DATA_BY_LOCALE[locale] ?? [], [locale]);
  const reports = useMemo(() => {
    const map = new Map<string, ReportEntry>();
    (REPORTS_BY_LOCALE[locale] ?? []).forEach((report) => {
      map.set(report.id, report);
    });
    return map;
  }, [locale]);

  const latestLocations = useMemo(() => locations.slice(0, 8), [locations]);
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedId) ?? null,
    [locations, selectedId]
  );
  const selectedReport = selectedLocation?.reportId
    ? reports.get(selectedLocation.reportId) ?? null
    : null;

  useEffect(() => {
    if (!selectedId) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId]);

  useEffect(() => {
    if (selectedLocation && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedLocation]);

  return (
    <section className="section bg-gradient-to-b from-slate-50/80 to-white">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="max-w-3xl text-center md:text-left">
            <h2 className="h2">{t('title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('subtitle')}</p>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="lg:w-2/3">
              <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <div className="relative aspect-[800/520] w-full">
                  <Image
                    src="/maps/ukraine.svg"
                    alt={t('title')}
                    fill
                    sizes="(min-width: 1024px) 60vw, 90vw"
                    className="pointer-events-none select-none object-contain"
                  />
                </div>

                {locations.map((location) => {
                  const {left, top} = projectPoint(location.lat, location.lng);
                  const key = getCasesKey(location.cases, locale);
                  const casesLabel = t(key, {count: location.cases});
                  const isHovered = hoveredId === location.id;

                  return (
                    <div
                      key={location.id}
                      className="absolute"
                      style={{left, top, transform: 'translate(-50%, -50%)'}}
                      onMouseLeave={() => setHoveredId((current) => (current === location.id ? null : current))}
                    >
                      <button
                        type="button"
                        className="map-marker motion-safe:animate-pulse-soft motion-reduce:animate-none"
                        aria-label={`${location.city} — ${casesLabel}`}
                        onMouseEnter={() => setHoveredId(location.id)}
                        onFocus={() => setHoveredId(location.id)}
                        onBlur={() => setHoveredId((current) => (current === location.id ? null : current))}
                        onClick={() => setSelectedId(location.id)}
                      >
                        <span className="sr-only">{location.city}</span>
                      </button>

                      {isHovered ? (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-44 -translate-x-1/2 rounded-xl bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg backdrop-blur motion-reduce:transition-none"
                        >
                          <p className="font-semibold">{location.city}</p>
                          <p className="mt-1 text-[11px] text-slate-200">{casesLabel}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:w-1/3">
              <ul className="grid gap-4">
                {latestLocations.map((location) => {
                  const key = getCasesKey(location.cases, locale);
                  const casesLabel = t(key, {count: location.cases});
                  const report = location.reportId ? reports.get(location.reportId) : null;

                  return (
                    <li
                      key={location.id}
                      className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                          <Icon name="map-pin" className="h-5 w-5" />
                        </span>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">{location.city}</p>
                              <p className="text-xs text-slate-500">{location.region}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedId(location.id)}
                              className="text-sm font-semibold text-brand hover:text-brand/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                              aria-label={`${location.city} — ${casesLabel}`}
                            >
                              {t('details')}
                            </button>
                          </div>
                          <p className="text-sm font-medium text-slate-700">{casesLabel}</p>
                          <p className="text-sm leading-relaxed text-slate-600">{location.summary}</p>
                          {report && report.file ? (
                            <a
                              href={report.file}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80"
                            >
                              {t('details')} →
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {selectedLocation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`aid-map-dialog-title-${selectedLocation.id}`}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-brand">{selectedLocation.region}</p>
                <h3
                  id={`aid-map-dialog-title-${selectedLocation.id}`}
                  className="mt-2 text-2xl font-semibold text-slate-900"
                >
                  {selectedLocation.city}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                ref={closeButtonRef}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {t('close')}
              </button>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">
              {t(getCasesKey(selectedLocation.cases, locale), {count: selectedLocation.cases})}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{selectedLocation.summary}</p>

            {selectedReport && selectedReport.file ? (
              <a
                href={selectedReport.file}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/60"
              >
                {t('details')} →
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
