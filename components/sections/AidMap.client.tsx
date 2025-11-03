'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {MapContainer, TileLayer, CircleMarker, Popup} from 'react-leaflet';
import type {LatLngExpression} from 'leaflet';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';

import aidMapUk from '@/content/aid-map.uk.json';
import aidMapEn from '@/content/aid-map.en.json';
import reportsUk from '@/content/reports.uk.json';
import reportsEn from '@/content/reports.en.json';

type Locale = 'uk' | 'en';

type AidLocation = {
  id: string;
  city: string;
  region?: string;
  lat: number;
  lng: number;
  cases: number;
  summary?: string;
  reportId?: string;
};

type ReportEntry = { id: string; title: string; file?: string };

const DATA_BY_LOCALE = { uk: aidMapUk, en: aidMapEn } as Record<Locale, AidLocation[]>;
const REPORTS_BY_LOCALE = { uk: reportsUk, en: reportsEn } as Record<Locale, ReportEntry[]>;

const UA_CENTER: LatLngExpression = [49.0, 31.0];
const UA_ZOOM = 5;

function getCasesKey(count: number, locale: Locale) {
  if (locale === 'uk') {
    const mod10 = count % 10, mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'cases_one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'cases_few';
    return 'cases_many';
  }
  return count === 1 ? 'cases_one' : 'cases_many';
}

export default function AidMapClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home.map');

  const locations = useMemo(() => (DATA_BY_LOCALE[locale] ?? []) as AidLocation[], [locale]);
  const reportsMap = useMemo(() => {
    const m = new Map<string, ReportEntry>();
    (REPORTS_BY_LOCALE[locale] ?? []).forEach(r => m.set(r.id, r));
    return m;
  }, [locale]);

  const [selectedId, setSelectedId] = useState<string|null>(null);
  const selected = useMemo(() => locations.find(l => l.id === selectedId) ?? null, [locations, selectedId]);
  const dialogCloseRef = useRef<HTMLButtonElement|null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedId(null);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedId]);

  useEffect(() => {
    if (selected && dialogCloseRef.current) dialogCloseRef.current.focus();
  }, [selected]);

  return (
    <section className="section">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="max-w-3xl text-center md:text-left">
            <h2 className="h2">{t('title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('subtitle')}</p>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            {/* КАРТА */}
            <div className="lg:w-2/3">
              <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                {/* Тёплая подложка, чтобы карта гармонировала со стилем */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-yellow-50 via-amber-50/70 to-transparent pointer-events-none" />
                <MapContainer
                  center={UA_CENTER}
                  zoom={UA_ZOOM}
                  scrollWheelZoom={false}
                  className="h-[420px] md:h-[520px] w-full"
                  attributionControl
                  preferCanvas
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {locations.map(p => {
                    const label = t(getCasesKey(p.cases, locale), {count: p.cases});
                    return (
                      <CircleMarker
                        key={p.id}
                        center={[p.lat, p.lng]}
                        radius={8}
                        pathOptions={{ color: '#0057B8', weight: 2, fillColor: '#0057B8', fillOpacity: 0.9 }}
                        eventHandlers={{ click: () => setSelectedId(p.id) }}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {p.city}{p.region ? `, ${p.region}` : ''}
                            </p>
                            <p className="text-sm">{label}</p>
                            {p.summary && <p className="text-sm text-slate-600">{p.summary}</p>}
                            {p.reportId && reportsMap.get(p.reportId)?.file && (
                              <p className="text-sm">
                                <a
                                  className="underline"
                                  href={reportsMap.get(p.reportId)!.file!}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t('details')} →
                                </a>
                              </p>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* Правый список */}
            <div className="lg:w-1/3">
              <ul className="grid gap-4">
                {locations.slice(0, 8).map(p => {
                  const casesLabel = t(getCasesKey(p.cases, locale), {count: p.cases});
                  const report = p.reportId ? reportsMap.get(p.reportId) : null;

                  return (
                    <li
                      key={p.id}
                      className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                          <Icon name="map-pin" className="h-5 w-5" />
                        </span>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">{p.city}</p>
                              {p.region && <p className="text-xs text-slate-500">{p.region}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedId(p.id)}
                              className="text-sm font-semibold text-brand hover:text-brand/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                              aria-label={`${p.city} — ${casesLabel}`}
                            >
                              {t('details')}
                            </button>
                          </div>
                          <p className="text-sm font-medium text-slate-700">{casesLabel}</p>
                          {p.summary && <p className="text-sm leading-relaxed text-slate-600">{p.summary}</p>}
                          {report?.file && (
                            <a
                              href={report.file}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80"
                            >
                              {t('details')} →
                            </a>
                          )}
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
    </section>
  );
}
