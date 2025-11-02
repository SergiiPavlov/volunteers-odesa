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

  return (
    <header className="border-b bg-transparent sticky top-0 z-50 w-screen h-14 md:h-[72px] ua-header ua-animated text-white">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link href={asRoute(`/${locale}`)} className="flex items-center gap-2 font-semibold mr-4 lg:mr-6">
          <Image src="/images/logo.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" priority />
          <span>Волонтери</span>
        </Link>

        <div className="flex items-center gap-3 lg:ml-6">
          {/* Desktop nav: visible only from >=1024px */}
          <nav className="hidden lg:flex items-center gap-6">
            {items.map(i => (
              <Link key={i.href} href={asRoute(i.href)} prefetch>{i.label}</Link>
            ))}
            <Link href={asRoute(`/${locale}/donate`)} className="btn text-white">{tMenu('donate')}</Link>
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
    </header>
  );
}