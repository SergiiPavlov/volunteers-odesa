'use client';

import {useEffect, useRef} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

import type {GalleryItem} from './GalleryGrid';

type GalleryModalProps = {
  item: GalleryItem | null;
  onClose: () => void;
};

export default function GalleryModal({item, onClose}: GalleryModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const t = useTranslations('gallery');
  const labelledById = item ? `gallery-item-${item.id}` : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleBackdropClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item) {
      if (!dialog.open) {
        dialog.showModal();
      }
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (dialog.open) {
      dialog.close();
    }
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledById}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-slate-900/70 backdrop:backdrop-blur-sm"
    >
      {item ? (
        <div className="flex min-h-full items-center justify-center p-4 md:p-6">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-3 shadow-xl md:p-4">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
            >
              {t('close')}
            </button>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 60vw, (min-width: 768px) 80vw, 90vw"
                className="object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="px-3 pb-1 pt-4 md:px-4">
              <h3 id={labelledById} className="text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
