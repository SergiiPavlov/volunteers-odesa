'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';

import galleryEn from '@/content/gallery.en.json';
import galleryUk from '@/content/gallery.uk.json';

import GalleryModal from './GalleryModal';

export type GalleryItem = {
  id: string;
  title: string;
  src: string;
  w: number;
  h: number;
  alt: string;
};

const GALLERIES: Record<'en' | 'uk', GalleryItem[]> = {
  en: galleryEn as GalleryItem[],
  uk: galleryUk as GalleryItem[]
};

export default function GalleryGrid() {
  const locale = useLocale();
  const t = useTranslations('gallery');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const localeKey = locale === 'uk' ? 'uk' : 'en';
  const items = useMemo(() => GALLERIES[localeKey] ?? [], [localeKey]);

  const handleOpen = (item: GalleryItem) => setActiveItem(item);
  const handleClose = () => setActiveItem(null);

  if (items.length === 0) {
    return (
      <>
        <p className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-500">
          {t('empty')}
        </p>
        <GalleryModal item={null} onClose={handleClose} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {items.map((item) => (
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
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
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

      <GalleryModal item={activeItem} onClose={handleClose} />
    </>
  );
}
