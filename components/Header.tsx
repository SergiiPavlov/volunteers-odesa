import {Suspense} from 'react';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import Image from 'next/image';
import MobileMenu from '@/components/MobileMenu';
import LanguageSwitch from '@/components/LanguageSwitch';
import {asRoute} from '@/lib/typedRoutes';

type Props = { locale: 'uk'|'en' };

export default async function Header({locale}: Props) {
  const tMenu = await getTranslations({locale, namespace: 'menu'});
  const tTicker = await getTranslations({locale, namespace: 'home.donations.ticker'});

  function splitFirstWord(s: string) {
    const parts = s.trim().split(/\s+/);
    return [parts[0] ?? '', parts.slice(1).join(' ')];
  }

  const items = [
    { href: `/${locale}`, label: tMenu('home') },
    { href: `/${locale}/about`, label: tMenu('about') },
    { href: `/${locale}/stories`, label: tMenu('stories') },
    { href: `/${locale}/news`, label: tMenu('news') },
    { href: `/${locale}/partners`, label: tMenu('partners') },
    { href: `/${locale}/announcements`, label: tMenu('announcements') },
    { href: `/${locale}/reviews`, label: tMenu('reviews') },
    { href: `/${locale}/contacts`, label: tMenu('contacts') },
  ] as const;

  const title = tTicker('title');
  const [titleFirst, titleRest] = splitFirstWord(title);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="ua-header ua-animated text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 h-10 md:h-12">
          <Link href={asRoute(`/${locale}`)} className="mr-4 flex items-center gap-2 font-semibold lg:mr-6">
            <Image src="/images/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" priority />
            <span>Волонтери</span>
          </Link>

          <div className="flex items-center gap-3 lg:ml-6">
            {/* Desktop nav: visible only from >=1024px */}
            <nav className="hidden items-center gap-6 lg:flex">
              {items.map(i => (
                <Link key={i.href} href={asRoute(i.href)} prefetch>
                  {i.label}
                </Link>
              ))}
              <Link href={asRoute(`/${locale}/donate`)} className="btn text-white">
                {tMenu('donate')}
              </Link>
            </nav>

            {/* Desktop language switch */}
            <div className="block">
              <Suspense fallback={null}>
                <LanguageSwitch locale={locale} />
              </Suspense>
            </div>

            {/* Mobile burger (shown <1024px), includes language switch inside the sheet */}
            <MobileMenu
              items={items}
              donateHref={`/${locale}/donate`}
              donateLabel={tMenu('donate')}
              locale={locale}
            />
          </div>
        </div>
      </div>

      <div className="ua-flag-ribbon ua-flag-ribbon--ticker w-full -mt-px">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="flex h-full items-center gap-4 py-2 md:py-3">
            <p
              className="shrink-0 font-semibold uppercase tracking-[0.18em] md:tracking-[0.25em] text-white/90 text-[10px] md:text-xs leading-none"
            >
              <span>{titleFirst}</span>
              <br className="md:hidden" />
              <span className="hidden md:inline md:ml-1">{titleRest}</span>
              <span className="md:hidden block">{titleRest}</span>
            </p>
            <div className="relative flex-1 overflow-hidden h-full">
              <div
                className="whitespace-nowrap text-white/95 drop-shadow-sm motion-safe:animate-marquee motion-reduce:animate-none leading-none"
                aria-live="polite"
                role="text"
              >
                <span>{tTicker('placeholder')}</span>
                <span aria-hidden="true" className="ml-8">
                  {tTicker('placeholder')}
                </span>
                <span aria-hidden="true" className="ml-8">
                  {tTicker('placeholder')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}