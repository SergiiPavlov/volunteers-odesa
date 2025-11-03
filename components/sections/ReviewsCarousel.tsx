'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import {asRoute} from '@/lib/typedRoutes';

import reviewsEn from '@/content/reviews.en.json';
import reviewsUk from '@/content/reviews.uk.json';

type Review = {
  id: string;
  name: string;
  role: 'donor' | 'recipient';
  text: string;
  dateISO: string;
  approved: boolean;
};

type RoleLabelKey = 'donor' | 'recipient';

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

export default function ReviewsCarousel() {
  const t = useTranslations('home.reviews');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const reviews = useMemo(() => {
    const source = locale === 'uk' ? (reviewsUk as Review[]) : (reviewsEn as Review[]);

    return source
      .filter((review) => review.approved)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 9);
  }, [locale]);

  const totalSlides = useMemo(() => {
    return itemsPerView > 0 ? Math.max(1, Math.ceil(reviews.length / itemsPerView)) : 1;
  }, [itemsPerView, reviews.length]);

  const currentSlideReviews = useMemo(() => {
    const start = activeIndex * itemsPerView;
    return reviews.slice(start, start + itemsPerView);
  }, [activeIndex, itemsPerView, reviews]);

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
      {threshold: 0.2}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setItemsPerView(3);
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);

    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    if (activeIndex > totalSlides - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalSlides]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || totalSlides <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      handleNext();
    }, 7000);

    return () => window.clearInterval(interval);
  }, [handleNext, isPaused, prefersReducedMotion, totalSlides]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleFocus = () => setIsPaused(true);
  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  const formatDate = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [locale]);

  if (reviews.length === 0) {
    return null;
  }

  const activeOptionId = currentSlideReviews[0]?.id ?? 'reviews-empty';

  return (
    <section className="section bg-gradient-to-b from-white via-white to-slate-50/70">
      <Container>
        <div
          ref={containerRef}
          className={clsx(
            'flex flex-col gap-8 rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-sm transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{t('eyebrow')}</p>
              <h2 className="h2">{t('title')}</h2>
            </div>
            <Link
              href={asRoute(`/${locale}/reviews`)}
              className="btn btn-outline self-start whitespace-nowrap"
            >
              {t('ctaLeave')}
            </Link>
          </div>
          <div
            role="region"
            aria-labelledby="reviews-carousel-heading"
            className="flex flex-col gap-6"
          >
            <h3 id="reviews-carousel-heading" className="sr-only">
              {t('title')}
            </h3>
            <div
              className="group relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <ul
                role="listbox"
                aria-activedescendant={activeOptionId}
                aria-multiselectable="true"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {currentSlideReviews.map((review) => {
                  const roleKey: RoleLabelKey = review.role;
                  const formattedDate = formatDate.format(new Date(review.dateISO));

                  return (
                    <li
                      key={review.id}
                      id={review.id}
                      role="option"
                      aria-selected="true"
                    >
                      <article className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 text-slate-800 shadow-sm transition-all duration-500 ease-out motion-reduce:transition-none">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                              <Icon
                                name={review.role === 'donor' ? 'review-donor' : 'review-recipient'}
                                className="h-5 w-5"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{review.name}</p>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {t(roleKey)}
                              </p>
                            </div>
                          </div>
                          <time className="text-xs text-slate-500" dateTime={review.dateISO}>
                            {formattedDate}
                          </time>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">{review.text}</p>
                      </article>
                    </li>
                  );
                })}
              </ul>
              {reviews.length > itemsPerView ? (
                <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    onClick={handlePrev}
                    aria-label={t('prev')}
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      ‹
                    </span>
                  </button>
                  <div className="flex items-center gap-2" role="group" aria-label={t('pagination')}>
                    {Array.from({length: totalSlides}).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={clsx(
                          'h-2.5 w-2.5 rounded-full transition-colors',
                          index === activeIndex ? 'bg-brand' : 'bg-slate-300'
                        )}
                        aria-label={t('slide', {index: index + 1, total: totalSlides})}
                        aria-pressed={index === activeIndex}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    onClick={handleNext}
                    aria-label={t('next')}
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      ›
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
