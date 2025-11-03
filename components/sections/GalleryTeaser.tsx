'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

import Container from '@/components/Container';
import {asRoute} from '@/lib/typedRoutes';

import galleryEn from '@/content/gallery.en.json';
import galleryUk from '@/content/gallery.uk.json';

import type {GalleryItem} from './GalleryGrid';
import GalleryModal from './GalleryModal';

const GALLERIES: Record<'en' | 'uk', GalleryItem[]> = {
  en: galleryEn as GalleryItem[],
  uk: galleryUk as GalleryItem[]
};

export default function GalleryTeaser() {
  const locale = useLocale();
  const t = useTranslations('gallery');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const localeKey = locale === 'uk' ? 'uk' : 'en';
  const items = useMemo(() => GALLERIES[localeKey] ?? [], [localeKey]);
  const teaserItems = items.slice(0, 6);

  const handleOpen = (item: GalleryItem) => setActiveItem(item);
  const handleClose = () => setActiveItem(null);

  return (
    <section className="section bg-white/40 backdrop-blur">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="h2">{t('title')}</h2>
            <p className="text-base text-slate-600">{t('teaser')}</p>
          </div>
          <Link
            href={asRoute(`/${locale}/gallery`)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
          >
            {t('viewAll')}
          </Link>
        </div>

        {teaserItems.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {teaserItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpen(item)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-800"
                aria-label={item.title}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-slate-900/60 px-3 py-2 text-left text-sm font-medium text-white shadow backdrop-blur">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-500">
            {t('empty')}
          </p>
        )}
      </Container>

      <GalleryModal item={activeItem} onClose={handleClose} />
    </section>
  );
}
