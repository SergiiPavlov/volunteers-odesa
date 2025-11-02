'use client';

import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {useTranslations} from 'next-intl';

export default function DonationTickerBar() {
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
      {threshold: 0.1}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const marqueeItem = `${t('anonymous')} • ${t('placeholder')}`;

  return (
    <div className="ua-flag-ribbon ua-flag-ribbon--ticker sticky top-[56px] md:top-[72px] z-40">
      <div className="container mx-auto px-4 py-2 md:py-3">
        <div
          ref={containerRef}
          className={clsx(
            'flex flex-col gap-3 text-white tracking-wide drop-shadow-sm md:flex-row md:items-center md:justify-between',
            'transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <div className="text-xs font-semibold uppercase text-white/80 tracking-[0.3em] md:tracking-[0.4em]">
            {t('title')}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div
              className="flex min-w-full items-center gap-8 whitespace-nowrap text-sm md:text-base motion-safe:animate-marquee motion-reduce:animate-none"
              aria-live="polite"
              role="text"
            >
              <span className="font-medium">{marqueeItem}</span>
              <span className="hidden font-medium motion-safe:inline" aria-hidden="true">
                {marqueeItem}
              </span>
              <span className="hidden font-medium motion-safe:inline" aria-hidden="true">
                {marqueeItem}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/80 text-center md:text-right">{t('marqueeHint')}</p>
        </div>
      </div>
    </div>
  );
}
