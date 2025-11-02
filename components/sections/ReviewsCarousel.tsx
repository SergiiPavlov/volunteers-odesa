'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import {asRoute} from '@/lib/typedRoutes';

type ReviewItem = {
  id: string;
  authorName?: string | null;
  role: 'donor' | 'recipient';
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const AUTO_SCROLL_INTERVAL = 6000;

export default function ReviewsCarousel() {
  const t = useTranslations('home.reviews');
  const locale = (useLocale() as 'uk' | 'en') ?? 'uk';
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/api/reviews', {cache: 'no-store'});
        if (!res.ok) return;
        const data = await res.json();
        if (ignore) return;
        if (Array.isArray(data?.items)) {
          setItems(
            data.items.filter((item: ReviewItem) => item.status === 'approved')
          );
        } else {
          setItems([]);
        }
      } catch {
        if (!ignore) {
          setItems([]);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    setIsReducedMotion(query.matches);
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleChange);
      return () => {
        query.removeEventListener('change', handleChange);
      };
    }

    if (typeof query.addListener === 'function') {
      query.addListener(handleChange);
      return () => {
        query.removeListener(handleChange);
      };
    }

    return () => {};
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setItemsPerSlide(event.matches ? 2 : 1);
    };

    setItemsPerSlide(media.matches ? 2 : 1);
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => {
        media.removeEventListener('change', handleChange);
      };
    }

    if (typeof media.addListener === 'function') {
      media.addListener(handleChange);
      return () => {
        media.removeListener(handleChange);
      };
    }

    return () => {};
  }, []);

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

  const totalSlides = useMemo(() => {
    if (items.length === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(items.length / itemsPerSlide));
  }, [items.length, itemsPerSlide]);

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  useEffect(() => {
    if (
      isReducedMotion ||
      items.length === 0 ||
      totalSlides <= 1 ||
      !isVisible
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        return next >= totalSlides ? 0 : next;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [isReducedMotion, items.length, totalSlides, isVisible]);

  const resolvedLocale = useMemo(
    () => (locale === 'en' ? 'en-US' : 'uk-UA'),
    [locale]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    [resolvedLocale]
  );

  const handlePrev = () => {
    setCurrentSlide((prev) => {
      if (totalSlides <= 1) return 0;
      return prev === 0 ? totalSlides - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentSlide((prev) => {
      if (totalSlides <= 1) return 0;
      return prev + 1 >= totalSlides ? 0 : prev + 1;
    });
  };

  const baseSlideWidth = `${100 / itemsPerSlide}%`;
  const showNavigation = !isReducedMotion && items.length > 0 && totalSlides > 1;

  return (
    <section className="section bg-slate-50/70" aria-label={t('title')}>
      <Container>
        <div
          ref={sectionRef}
          className={clsx(
            'flex flex-col gap-6 transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="h2">{t('title')}</h2>
            {showNavigation && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
                  aria-label={t('navPrev')}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
                  aria-label={t('navNext')}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center shadow-sm">
              <p className="max-w-2xl text-base text-slate-600">{t('empty')}</p>
              <Link
                href={asRoute(`/${locale}/reviews`)}
                className="btn"
              >
                {t('ctaAdd')}
              </Link>
            </div>
          ) : isReducedMotion ? (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {items.map((item) => {
                const displayName = item.authorName?.trim();
                const formattedDate = dateFormatter.format(
                  new Date(item.createdAt)
                );

                return (
                  <article
                    key={item.id}
                    className="flex h-full flex-col gap-3 rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur"
                  >
                    <Icon name="quote" className="h-6 w-6 text-brand" />
                    <p className="text-slate-800">{item.text}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        {displayName || t('anonymous')}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {item.role === 'donor' ? t('donor') : t('recipient')}
                      </span>
                    </div>
                    <time className="text-xs text-slate-500">{formattedDate}</time>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
                  style={{transform: `translateX(-${currentSlide * 100}%)`}}
                >
                  {items.map((item) => {
                    const displayName = item.authorName?.trim();
                    const formattedDate = dateFormatter.format(
                      new Date(item.createdAt)
                    );

                    return (
                      <div
                        key={item.id}
                        className="w-full shrink-0 px-2 md:px-3"
                        style={{maxWidth: baseSlideWidth, flexBasis: baseSlideWidth}}
                      >
                        <article className="flex h-full flex-col gap-3 rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur">
                          <Icon
                            name="quote"
                            className="h-6 w-6 text-brand"
                          />
                          <p className="text-slate-800">{item.text}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">
                              {displayName || t('anonymous')}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {item.role === 'donor' ? t('donor') : t('recipient')}
                            </span>
                          </div>
                          <time className="text-xs text-slate-500">
                            {formattedDate}
                          </time>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalSlides > 1 && !isReducedMotion && (
                <div className="flex justify-center gap-2">
                  {Array.from({length: totalSlides}).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={clsx(
                        'h-2.5 w-2.5 rounded-full border border-brand/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2',
                        currentSlide === index
                          ? 'bg-brand'
                          : 'bg-transparent hover:bg-brand/20'
                      )}
                      aria-label={t('navDot', {index: index + 1})}
                      aria-current={currentSlide === index ? 'true' : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
