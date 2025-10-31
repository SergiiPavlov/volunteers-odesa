import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import Icon from '@/components/Icon';
import Image from 'next/image';

type Props = { locale: 'uk'|'en' };

export default async function Header({locale}: Props) {
  const t = await getTranslations({locale, namespace: 'menu'});
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold">
          {/* Показ логотипа из /public/images/logo.png; без client-обработчиков */}
          <Image src="/images/logo.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" priority />
          <span className="sr-only">Волонтери</span>
          {/* Иконка-спрайт можно оставить как декоративную или удалить */}
          {/* <Icon name="logo" width={28} height={28} /> */}
          <span>Волонтери</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}`} prefetch>{t('home')}</Link>
          <Link href={`/${locale}/about`}>{t('about')}</Link>
          <Link href={`/${locale}/stories`}>{t('stories')}</Link>
          <Link href={`/${locale}/news`}>{t('news')}</Link>
          <Link href={`/${locale}/partners`}>{t('partners')}</Link>
          <Link href={`/${locale}/announcements`}>{t('announcements')}</Link>
          <Link href={`/${locale}/reviews`}>{t('reviews')}</Link>
          <Link href={`/${locale}/donate`} className="btn">{t('donate')}</Link>
          <Link href={`/${locale}/contacts`}>{t('contacts')}</Link>
        </nav>
      </div>
    </header>
  );
}
