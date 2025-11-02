'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';

type MetricDefinition = {
  key: 'volunteers' | 'families' | 'deliveries' | 'funds';
  icon: string;
  value: number;
  suffix?: string;
  type?: 'currency';
};

const METRICS: MetricDefinition[] = [
  {key: 'volunteers', icon: 'volunteers', value: 320, suffix: '+'},
  {key: 'families', icon: 'families', value: 1250, suffix: '+'},
  {key: 'deliveries', icon: 'deliveries', value: 980, suffix: '+'},
  {key: 'funds', icon: 'funds', value: 12000000, type: 'currency'},
];

const ANIMATION_DURATION = 1500;

export default function ImpactCounters() {
  const t = useTranslations('home.impact');
  const locale = useLocale();
  const resolvedLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(() =>
    METRICS.map(() => 0)
  );

  const metrics = useMemo(
    () =>
      METRICS.map((metric) => ({
        ...metric,
        label: t(`items.${metric.key}`),
      })),
    [t]
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(resolvedLocale),
    [resolvedLocale]
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency: 'UAH',
        maximumFractionDigits: 0,
      }),
    [resolvedLocale]
  );

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
      {threshold: 0.35}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || hasAnimated) {
      return;
    }

    setHasAnimated(true);

    const finalValues = METRICS.map((metric) => metric.value);
    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      setDisplayValues(finalValues);
      return;
    }

    const start = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValues(
        finalValues.map((value) => Math.round(value * eased))
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValues(finalValues);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [hasAnimated, isVisible]);

  return (
    <section className="section bg-slate-50/70">
      <Container>
        <div
          ref={sectionRef}
          className={clsx(
            'flex flex-col gap-8 transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="max-w-xl">
            <h2 className="h2 text-center md:text-left">
              {t('title')}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const currentValue = displayValues[index] ?? 0;
              const formattedValue =
                metric.type === 'currency'
                  ? currencyFormatter.format(currentValue)
                  : numberFormatter.format(currentValue);
              const displayValue = metric.suffix
                ? `${formattedValue}${metric.suffix}`
                : formattedValue;

              return (
                <article
                  key={metric.key}
                  className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur md:text-left"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand md:mx-0">
                    <Icon name={metric.icon} className="h-6 w-6" />
                  </div>
                  <p
                    className="text-3xl font-semibold text-slate-900"
                    aria-live={hasAnimated ? 'off' : 'polite'}
                  >
                    {displayValue}
                  </p>
                  <p className="text-sm text-slate-600">{metric.label}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
