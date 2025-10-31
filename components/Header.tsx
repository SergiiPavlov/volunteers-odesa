import {Suspense} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import LanguageDropdown from '@/components/LanguageDropdown';
import MobileMenu from '@/components/MobileMenu';
import {appLocales} from '@/i18n';
import type {AppLocale} from '@/i18n';

type Props = { locale: AppLocale };

export default async function Header({locale}: Props) {
  const tMenu = await getTranslations({locale, namespace: 'menu'});
  const tHeader = await getTranslations({locale, namespace: 'components.header'});

  const items = [
    {href: `/${locale}`, label: tMenu('home')},
    {href: `/${locale}/about`, label: tMenu('about')},
    {href: `/${locale}/stories`, label: tMenu('stories')},
    {href: `/${locale}/news`, label: tMenu('news')},
    {href: `/${locale}/partners`, label: tMenu('partners')},
    {href: `/${locale}/announcements`, label: tMenu('announcements')},
    {href: `/${locale}/reviews`, label: tMenu('reviews')},
    {href: `/${locale}/contacts`, label: tMenu('contacts')},
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-semibold"
          aria-label={tHeader('homeLinkLabel')}
        >
          <Image
            src="/images/logo.png"
            alt={tHeader('logoAlt')}
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
          <span>{tHeader('logoText')}</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 lg:flex">
            {items.map((item) => (
              <Link key={item.href} href={item.href} prefetch>
                {item.label}
              </Link>
            ))}
            <Link href={`/${locale}/donate`} className="btn">
              {tMenu('donate')}
            </Link>
          </nav>

          <div className="hidden lg:block">
            <Suspense fallback={null}>
              <LanguageDropdown locale={locale} locales={appLocales} />
            </Suspense>
          </div>

          <MobileMenu
            items={items}
            donateHref={`/${locale}/donate`}
            donateLabel={tMenu('donate')}
            locale={locale}
            locales={appLocales}
          />
        </div>
      </div>
    </header>
  );
}
