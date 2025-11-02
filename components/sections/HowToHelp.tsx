'use client';

import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import {asRoute} from '@/lib/typedRoutes';

type HelpCard = {
  key: 'donate' | 'volunteer' | 'partner';
  icon: string;
  action: 'donate' | 'contact';
  href: (locale: string) => string;
  variant: 'solid' | 'outline';
};

const CARDS: HelpCard[] = [
  {
    key: 'donate',
    icon: 'donate',
    action: 'donate',
    href: (locale) => `/${locale}/donate`,
    variant: 'solid',
  },
  {
    key: 'volunteer',
    icon: 'volunteer',
    action: 'contact',
    href: (locale) => `/${locale}/contacts`,
    variant: 'outline',
  },
  {
    key: 'partner',
    icon: 'partner',
    action: 'contact',
    href: (locale) => `/${locale}/contacts`,
    variant: 'outline',
  },
];

export default function HowToHelp() {
  const t = useTranslations('home.help');
  const tActions = useTranslations('home.help.actions');
  const locale = useLocale();
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
      {threshold: 0.25}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section bg-gradient-to-b from-white via-white to-slate-50/60">
      <Container>
        <div
          ref={sectionRef}
          className={clsx(
            'flex flex-col gap-10 transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="max-w-2xl">
            <h2 className="h2 text-center md:text-left">{t('title')}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CARDS.map((card, index) => {
              const title = t(`cards.${card.key}.title`);
              const description = t(`cards.${card.key}.text`);
              const actionLabel = tActions(card.action);

              return (
                <article
                  key={card.key}
                  className={clsx(
                    'group flex h-full flex-col gap-5 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm transition-all duration-500 ease-out focus-within:-translate-y-1 focus-within:shadow-lg hover:-translate-y-1 hover:shadow-lg',
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-6',
                    'motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100'
                  )}
                  style={{transitionDelay: `${index * 120}ms`}}
                >
                  <div
                    className={clsx(
                      'flex h-12 w-12 items-center justify-center rounded-2xl text-brand transition-colors duration-300',
                      card.variant === 'solid'
                        ? 'bg-brand/10'
                        : 'bg-slate-100 group-hover:bg-brand/10 group-hover:text-brand'
                    )}
                    aria-hidden="true"
                  >
                    <Icon name={card.icon} className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                  <div className="mt-auto pt-1">
                    <Link
                      href={asRoute(card.href(locale))}
                      className={clsx(
                        'no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                        card.variant === 'solid' ? 'btn' : 'btn-outline'
                      )}
                      aria-label={`${actionLabel} — ${title}`}
                    >
                      {actionLabel}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
