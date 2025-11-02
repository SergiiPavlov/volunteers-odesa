'use client';

import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {useTranslations} from 'next-intl';

import Container from '@/components/Container';

export default function DonationTicker() {
  const t = useTranslations('home.donations.ticker');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
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
      {threshold: 0.25}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const placeholder = t('placeholder');

  return (
    <section className="section py-6 md:py-8 bg-slate-900 text-white">
      <Container>
        <div
          ref={containerRef}
          className={clsx(
            'flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          )}
        >
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              {t('title')}
            </p>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-full border border-white/20 bg-white/10">
            <div
              className="flex min-w-full items-center gap-8 whitespace-nowrap px-4 py-2 motion-safe:animate-marquee"
              aria-live="polite"
              role="text"
            >
              <span className="text-sm font-medium">{placeholder}</span>
              <span className="text-sm font-medium" aria-hidden="true">
                {placeholder}
              </span>
              <span className="text-sm font-medium" aria-hidden="true">
                {placeholder}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/70 text-center md:text-right">
            {t('marqueeHint')}
          </p>
        </div>
      </Container>
    </section>
  );
}
