'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import {asRoute} from '@/lib/typedRoutes';
import reportsUk from '@/content/reports.uk.json';
import reportsEn from '@/content/reports.en.json';

type Locale = 'uk' | 'en';

type ReportEntry = {
  id: string;
  title: string;
  period?: string;
  file?: string;
  updatedISO: string;
  summary?: string;
  amountUAH?: number;
};

const REPORTS_BY_LOCALE = {
  uk: reportsUk,
  en: reportsEn,
} satisfies Record<Locale, ReportEntry[]>;

const LOCALE_MAP: Record<Locale, string> = {
  uk: 'uk-UA',
  en: 'en-US',
};

function formatAmount(amount: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_MAP[locale], {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    currencyDisplay: 'narrowSymbol',
  }).format(amount);
}

export default function Reports() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home.reports');
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: 0.2}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const reports = useMemo(() => {
    const items = REPORTS_BY_LOCALE[locale] ?? [];
    return [...items].sort((a, b) => {
      return new Date(b.updatedISO).getTime() - new Date(a.updatedISO).getTime();
    });
  }, [locale]);

  return (
    <section className="section bg-gradient-to-b from-white via-white to-slate-50/60">
      <Container>
        <div
          ref={sectionRef}
          className={clsx(
            'flex flex-col gap-10 transition-all duration-700 ease-out motion-reduce:opacity-100 motion-reduce:transform-none',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="max-w-3xl text-center md:text-left">
            <h2 className="h2">{t('title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('subtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => {
              const formattedDate = new Intl.DateTimeFormat(LOCALE_MAP[locale], {
                dateStyle: 'long',
              }).format(new Date(report.updatedISO));
              const fileHref = report.file?.trim();
              const hasFile = Boolean(fileHref);
              const amountLabel =
                typeof report.amountUAH === 'number'
                  ? formatAmount(report.amountUAH, locale)
                  : null;

              return (
                <article
                  key={report.id}
                  className={clsx(
                    'group flex h-full flex-col gap-5 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  )}
                  style={{transitionDelay: `${index * 120}ms`}}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand" aria-hidden="true">
                    <Icon name="report" className="h-6 w-6" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {report.period ? (
                      <p className="text-sm font-semibold uppercase tracking-wide text-brand">{report.period}</p>
                    ) : null}
                    <h3 className="text-xl font-semibold text-slate-900">{report.title}</h3>
                    {report.summary ? (
                      <p className="text-sm leading-relaxed text-slate-600">{report.summary}</p>
                    ) : null}
                    {amountLabel ? (
                      <p className="text-sm font-medium text-slate-700">{amountLabel}</p>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-500">{t('updated')} {formattedDate}</p>

                  <div className="mt-auto pt-1">
                    {hasFile ? (
                      <a
                        href={fileHref}
                        download
                        className="btn"
                        aria-label={`${t('download')} ${report.title}`}
                      >
                        {t('download')}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="btn pointer-events-none cursor-not-allowed bg-slate-200 text-slate-500 hover:opacity-100"
                        disabled
                        aria-disabled={true}
                        aria-label={t('noFile')}
                        title={t('noFile')}
                      >
                        {t('noFile')}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-center md:justify-start">
            <Link href={asRoute(`/${locale}/about#reports`)} className="text-sm font-semibold text-slate-700 hover:text-brand">
              {t('seeAll')} →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
