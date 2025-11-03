'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
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

type LatLngTuple = [number, number];

const UA_CENTER: LatLngTuple = [49.0, 31.0];
const UA_ZOOM = 5;

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

type LeafletMap = {
  remove: () => void;
};

type LeafletLayerGroup = {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => LeafletLayerGroup;
  addLayer: (layer: unknown) => LeafletLayerGroup;
  remove?: () => void;
};

type LeafletCircleMarker = {
  on: (type: string, handler: () => void) => LeafletCircleMarker;
  bindPopup: (html: string) => LeafletCircleMarker;
  addTo: (layer: LeafletLayerGroup | LeafletMap) => LeafletCircleMarker;
  openPopup?: () => void;
  closePopup?: () => void;
};

type LeafletModule = {
  map: (element: HTMLElement, options: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  circleMarker: (latlng: LatLngTuple, options: Record<string, unknown>) => LeafletCircleMarker;
  layerGroup: () => LeafletLayerGroup;
};

declare global {
  interface Window {
    L?: LeafletModule;
  }
}

let leafletPromise: Promise<LeafletModule> | null = null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, match => {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return match;
    }
  });
}

function ensureLeafletAssets(): Promise<LeafletModule> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet is only available in the browser.'));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  const existingStylesheet = document.querySelector<HTMLLinkElement>('link[data-leaflet-styles]');
  if (!existingStylesheet) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_URL;
    link.dataset.leafletStyles = 'true';
    document.head.appendChild(link);
  }

  leafletPromise = new Promise<LeafletModule>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet-script]');
    if (existingScript && window.L) {
      resolve(window.L);
      return;
    }

    const script = existingScript ?? document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.dataset.leafletScript = 'true';

    const handleLoad = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Leaflet failed to load.'));
      }
    };

    const handleError = () => {
      leafletPromise = null;
      reject(new Error('Unable to load Leaflet assets.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      document.body.appendChild(script);
    } else if (window.L) {
      resolve(window.L);
    }
  });

  return leafletPromise;
}

function buildPopupHtml({
  city,
  region,
  label,
  summary,
  reportFile,
  detailsLabel,
}: {
  city: string;
  region?: string;
  label: string;
  summary?: string;
  reportFile?: string;
  detailsLabel: string;
}) {
  const locationLine = escapeHtml(city) + (region ? `, ${escapeHtml(region)}` : '');
  const summaryBlock = summary ? `<p class="text-sm text-slate-600">${escapeHtml(summary)}</p>` : '';
  const reportBlock = reportFile
    ? `<p class="text-sm"><a class="underline" href="${reportFile}" target="_blank" rel="noreferrer">${escapeHtml(detailsLabel)} →</a></p>`
    : '';

  return `
    <div class="space-y-1">
      <p class="font-semibold">${locationLine}</p>
      <p class="text-sm">${escapeHtml(label)}</p>
      ${summaryBlock}
      ${reportBlock}
    </div>
  `;
}

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
  const mapContainerRef = useRef<HTMLDivElement|null>(null);
  const mapInstanceRef = useRef<LeafletMap|null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup|null>(null);
  const markersRef = useRef<Map<string, LeafletCircleMarker>>(new Map());

  useEffect(() => {
    if (!selectedId) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedId(null);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedId]);

  useEffect(() => {
    if (selected && dialogCloseRef.current) dialogCloseRef.current.focus();
  }, [selected]);

  useEffect(() => {
    let isMounted = true;

    if (!mapContainerRef.current) {
      return () => {
        isMounted = false;
      };
    }

    ensureLeafletAssets()
      .then(leaflet => {
        if (!isMounted || !mapContainerRef.current) {
          return;
        }

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = leaflet.map(mapContainerRef.current, {
            center: UA_CENTER,
            zoom: UA_ZOOM,
            scrollWheelZoom: false,
            attributionControl: true,
            preferCanvas: true,
          });

          leaflet
            .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            })
            .addTo(mapInstanceRef.current);

          markerLayerRef.current = leaflet.layerGroup().addTo(mapInstanceRef.current);
        }

        const markerLayer = markerLayerRef.current;
        if (!markerLayer) return;

        markerLayer.clearLayers();
        const nextMarkers = new Map<string, LeafletCircleMarker>();
        const detailsLabel = t('details');

        locations.forEach(p => {
          const label = t(getCasesKey(p.cases, locale), {count: p.cases});
          const reportFile = p.reportId ? reportsMap.get(p.reportId)?.file : undefined;
          const popupHtml = buildPopupHtml({
            city: p.city,
            region: p.region,
            label,
            summary: p.summary,
            reportFile,
            detailsLabel,
          });

          const marker = leaflet.circleMarker([p.lat, p.lng], {
            radius: 8,
            color: '#0057B8',
            weight: 2,
            fillColor: '#0057B8',
            fillOpacity: 0.9,
          });

          marker.on('click', () => setSelectedId(p.id));
          marker.bindPopup(popupHtml);
          marker.addTo(markerLayer);

          nextMarkers.set(p.id, marker);
        });

        markersRef.current = nextMarkers;
      })
      .catch(error => {
        console.error('Failed to initialize Leaflet map', error);
      });

    return () => {
      isMounted = false;
    };
  }, [locale, locations, reportsMap, t]);

  useEffect(() => {
    if (!selectedId) {
      markersRef.current.forEach(marker => marker.closePopup?.());
      return;
    }

    const marker = markersRef.current.get(selectedId);
    marker?.openPopup?.();
  }, [selectedId]);

  useEffect(() => () => {
    markersRef.current.clear();
    markerLayerRef.current?.remove?.();
    markerLayerRef.current = null;
    mapInstanceRef.current?.remove();
    mapInstanceRef.current = null;
  }, []);

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
                <div
                  ref={mapContainerRef}
                  className="leaflet-container h-[420px] md:h-[520px] w-full"
                  role="presentation"
                  aria-hidden="true"
                />
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
